import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../context/store';
import { registerEmployee, resetRegistrationStatus } from '../../context/leaveSlice';
import { RegisterEmployeePayload } from '../../types/employee';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterEmployeeModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { registrationStatus, registrationError } = useSelector((state: RootState) => state.leaves);

  const initialFormData: RegisterEmployeePayload = {
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    department: '',
    position: '',
    role: 'STAFF',
    gender: 'MALE'
  };
  const [formData, setFormData] = useState<RegisterEmployeePayload>(initialFormData);

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(registerEmployee(formData));
  };

  // Wrap handleClose in useCallback
  const handleClose = useCallback(() => {
    dispatch(resetRegistrationStatus()); // Reset status on close
    onClose();
  }, [dispatch, onClose]); // Add dependencies

  // --- Effects ---
  useEffect(() => {
    if (registrationStatus === 'succeeded') {
      const timer = setTimeout(() => {
         handleClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [registrationStatus, handleClose]); // useEffect dependency is now stable

  return (
    <Modal show={isOpen} onHide={handleClose} centered size="lg" className="employee-modal">
      <Modal.Header closeButton className="border-0 pb-0" style={{ backgroundColor: '#184C55', color: 'white', borderBottom: 'none' }}>
        <Modal.Title className="w-100">
          <h4 className="mb-0" style={{ color: '#ffffff' }}>Register New Employee</h4>
          <small className="text-muted"></small>
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="pt-4">
          {registrationStatus === 'failed' && registrationError && (
            <Alert variant="danger" className="mb-4">
              <i className="fas fa-exclamation-circle me-2"></i>
              {registrationError}
            </Alert>
          )}
          {registrationStatus === 'succeeded' && (
            <Alert variant="success" className="mb-4">
              <i className="fas fa-check-circle me-2"></i>
              Employee registered successfully!
            </Alert>
          )}

          <fieldset disabled={registrationStatus === 'loading'}>
            <div className="mb-4">
              <h6 className="mb-3" style={{ color: '#184C55' }}>Account Information</h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formUsername">
                    <Form.Label className="fw-medium" style={{ color: '#184C55' }}>
                      Username <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Enter username"
                      required
                      className="form-control-lg border-2"
                      style={{ borderColor: '#184C55' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label className="fw-medium" style={{ color: '#184C55' }}>
                      Email Address <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g., employee@africahr.com"
                      required
                      className="form-control-lg border-2"
                      style={{ borderColor: '#184C55' }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <div className="mb-4">
              <h6 className="mb-3" style={{ color: '#184C55' }}>Personal Information</h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formFirstName">
                    <Form.Label className="fw-medium" style={{ color: '#184C55' }}>
                      First Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                      required
                      className="form-control-lg border-2"
                      style={{ borderColor: '#184C55' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formLastName">
                    <Form.Label className="fw-medium" style={{ color: '#184C55' }}>
                      Last Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                      required
                      className="form-control-lg border-2"
                      style={{ borderColor: '#184C55' }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <div className="mb-4">
              <h6 className="mb-3" style={{ color: '#184C55' }}>Employment Details</h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formDepartment">
                    <Form.Label className="fw-medium" style={{ color: '#184C55' }}>
                      Department <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="e.g., Human Resources, IT"
                      required
                      className="form-control-lg border-2"
                      style={{ borderColor: '#184C55' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formPosition">
                    <Form.Label className="fw-medium" style={{ color: '#184C55' }}>
                      Position <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      placeholder="e.g., HR Manager, Software Developer"
                      required
                      className="form-control-lg border-2"
                      style={{ borderColor: '#184C55' }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formRole">
                    <Form.Label className="fw-medium" style={{ color: '#184C55' }}>
                      Role <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      className="form-select-lg border-2"
                      style={{ borderColor: '#184C55' }}
                    >
                      <option value="STAFF">Staff</option>
                      <option value="HR_MANAGER">HR Manager</option>
                      <option value="ADMIN">Admin</option>
                    </Form.Select>
                  </Form.Group>
                  </Col>
                  <Col md={6}>
                  <Form.Group className="mb-3" controlId="formGender">
                <Form.Label className="fw-medium" style={{ color: '#184C55' }}>
                  Gender <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="form-select-lg border-2"
                  style={{ borderColor: '#184C55' }}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </Form.Select>
              </Form.Group>
                </Col>
              </Row>
            </div>

            <small className="text-muted d-block mb-4">
              <i className="fas fa-info-circle me-1"></i>
              <span className="text-danger">*</span> Required fields
            </small>
          </fieldset>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button 
            variant="outline-secondary" 
            onClick={handleClose} 
            disabled={registrationStatus === 'loading'}
            className="px-4"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={registrationStatus === 'loading' || registrationStatus === 'succeeded'}
            className="px-4"
            style={{ 
              backgroundColor: '#184C55', 
              borderColor: '#184C55',
              minWidth: '160px'
            }}
          >
            {registrationStatus === 'loading' ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Registering...
              </>
            ) : (
              'Register Employee'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default RegisterEmployeeModal; 