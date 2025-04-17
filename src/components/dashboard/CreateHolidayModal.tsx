import React, { useState, ChangeEvent, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../context/store';
import { createHoliday, updateHoliday, resetHolidayStatus } from '../../context/holidaySlice';
import { Holiday } from '../../context/holidaySlice';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  holiday?: Holiday | null;
}

interface HolidayFormData {
  name: string;
  date: string;
  description: string;
  recurring: boolean;
}

const CreateHolidayModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, holiday }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: RootState) => state.holidays);
  
  const [formData, setFormData] = useState<HolidayFormData>({
    name: '',
    date: '',
    description: '',
    recurring: false,
  });

  // Reset form when modal opens or holiday changes
  useEffect(() => {
    if (isOpen) {
      if (holiday) {
        setFormData({
          name: holiday.name,
          date: holiday.date,
          description: holiday.description,
          recurring: holiday.recurring,
        });
      } else {
        setFormData({
          name: '',
          date: '',
          description: '',
          recurring: false,
        });
      }
      dispatch(resetHolidayStatus());
    }
  }, [isOpen, holiday, dispatch]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let result;
      if (holiday) {
        result = await dispatch(updateHoliday({ id: holiday.id, holidayData: formData })).unwrap();
      } else {
        result = await dispatch(createHoliday(formData)).unwrap();
      }
      
      if (result) {
        onSuccess();
        // Reset form data
        setFormData({
          name: '',
          date: '',
          description: '',
          recurring: false,
        });
        // Reset status
        dispatch(resetHolidayStatus());
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to save holiday:', error);
    }
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{holiday ? 'Edit Holiday' : 'Create New Holiday'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {status === 'failed' && error && (
            <Alert variant="danger">Error: {error}</Alert>
          )}
          {status === 'succeeded' && (
            <Alert variant="success">Holiday {holiday ? 'updated' : 'created'} successfully!</Alert>
          )}

          <fieldset disabled={status === 'loading'}>
            <Form.Group className="mb-3" controlId="formHolidayName">
              <Form.Label>Holiday Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter holiday name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formHolidayDate">
              <Form.Label>Date <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formHolidayDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter holiday description"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formHolidayRecurring">
              <Form.Check
                type="checkbox"
                name="recurring"
                checked={formData.recurring}
                onChange={handleInputChange}
                label="Recurring yearly"
              />
            </Form.Group>
          </fieldset>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose} disabled={status === 'loading'}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                {holiday ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              holiday ? 'Update Holiday' : 'Create Holiday'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateHolidayModal; 