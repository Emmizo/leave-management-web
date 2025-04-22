import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../context/store';
import { changePassword } from '../../context/authSlice';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setValidationError('New passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.newPassword.length < 8) {
      setValidationError('New password must be at least 8 characters long');
      return;
    }

    try {
      const result = await dispatch(changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })).unwrap();
      
      if (result) {
        // Reset form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  return (
    <Modal 
      show={isOpen} 
      onHide={onClose} 
      centered
      contentClassName="border-0 shadow"
    >
      <Modal.Header closeButton className="border-0 pb-0" style={{ backgroundColor: '#184C55', color: 'white', borderBottom: 'none' }}>
        <Modal.Title className="w-100">
          <h4 className="mb-0" style={{ color: '#ffffff' }}>Change Password</h4>
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
          {validationError && (
            <Alert variant="danger" className="mb-4">
              <i className="fas fa-exclamation-circle me-2"></i>
              {validationError}
            </Alert>
          )}
          {status === 'succeeded' && (
            <Alert variant="success" className="mb-4">
              <i className="fas fa-check-circle me-2"></i>
              Password changed successfully!
            </Alert>
          )}

          <fieldset disabled={status === 'loading'}>
            <Form.Group className="mb-4" controlId="formCurrentPassword">
              <Form.Label className="fw-medium" style={{ color: '#184C55' }}>
                Current Password <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Enter current password"
                required
                className="form-control-lg border-2"
                style={{ borderColor: '#184C55' }}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formNewPassword">
              <Form.Label className="fw-medium" style={{ color: '#184C55' }}>
                New Password <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
                required
                className="form-control-lg border-2"
                style={{ borderColor: '#184C55' }}
              />
              <Form.Text className="text-muted">
                Password must be at least 8 characters long
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4" controlId="formConfirmPassword">
              <Form.Label className="fw-medium" style={{ color: '#184C55' }}>
                Confirm New Password <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                required
                className="form-control-lg border-2"
                style={{ borderColor: '#184C55' }}
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
                Changing...
              </>
            ) : (
              'Change Password'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal; 