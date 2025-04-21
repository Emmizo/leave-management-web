import React, { useState, ChangeEvent, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../context/store';
import { createHoliday, updateHoliday, resetHolidayStatus } from '../../context/holidaySlice';
import { Holiday } from '../../context/holidaySlice';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

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

  const handleDateChange = (date: Date | null) => {
    if (date) {
      // Format date as YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        date: formattedDate
      }));
    }
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
    <Modal 
      show={isOpen} 
      onHide={onClose} 
      centered 
      size="lg"
      contentClassName="border-0 shadow"
    >
      <Modal.Header closeButton className="border-0 pb-0"  style={{ backgroundColor: '#184C55', color: 'white', borderBottom: 'none' }}>
        <Modal.Title className="w-100">
          <h4 className="mb-0" style={{ color: '#ffffff' }}>
            {holiday ? 'Edit Holiday' : 'Create New Holiday'}
          </h4>
          <small className="text-muted"></small>
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {status === 'failed' && error && (
            <Alert variant="danger" className="mb-4">
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
            </Alert>
          )}
          {status === 'succeeded' && (
            <Alert variant="success" className="mb-4">
              <i className="fas fa-check-circle me-2"></i>
              Holiday {holiday ? 'updated' : 'created'} successfully!
            </Alert>
          )}

          <fieldset disabled={status === 'loading'}>
            <Form.Group className="mb-4" controlId="formHolidayName">
              <Form.Label className="fw-medium" style={{ color: '#184C55' }}>
                Holiday Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter holiday name"
                required
                className="form-control-lg border-2"
                style={{ borderColor: '#184C55' }}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formHolidayDate">
              <Form.Label className="fw-medium" style={{ color: '#184C55' }}>
                Date <span className="text-danger">*</span>
              </Form.Label>
              <div style={{ borderColor: '#184C55' }}>
                <DatePicker
                  selected={formData.date ? new Date(formData.date) : null}
                  onChange={handleDateChange}
                  dateFormat="yyyy-MM-dd"
                  className="form-control form-control-lg border-2 date-picker-input"
                  placeholderText="Select holiday date"
                  calendarClassName="custom-calendar"
                  wrapperClassName="w-100"
                />
              </div>
              <Form.Text className="text-muted">
                Select the date for this holiday
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4" controlId="formHolidayDescription">
              <Form.Label className="fw-medium" style={{ color: '#184C55' }}>
                Description
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter holiday description"
                className="form-control-lg border-2"
                style={{ borderColor: '#184C55' }}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formHolidayRecurring">
              <Form.Check
                type="checkbox"
                name="recurring"
                checked={formData.recurring}
                onChange={handleInputChange}
                label={
                  <span className="fw-medium" style={{ color: '#184C55' }}>
                    Recurring yearly
                  </span>
                }
                className="custom-checkbox"
              />
            </Form.Group>
          </fieldset>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button 
            variant="outline-secondary" 
            onClick={onClose} 
            disabled={status === 'loading'}
            className="px-4"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={status === 'loading'}
            className="px-4"
            style={{ 
              backgroundColor: '#184C55', 
              borderColor: '#184C55',
              minWidth: '140px'
            }}
          >
            {status === 'loading' ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
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