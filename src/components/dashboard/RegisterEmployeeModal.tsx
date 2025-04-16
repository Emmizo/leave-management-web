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
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    department: '',
    position: '',
  };
  const [formData, setFormData] = useState<RegisterEmployeePayload>(initialFormData);

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <Modal show={isOpen} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Register New Employee</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {registrationStatus === 'failed' && registrationError && (
            <Alert variant="danger">Error: {registrationError}</Alert>
          )}
          {registrationStatus === 'succeeded' && (
            <Alert variant="success">Employee registered successfully!</Alert>
          )}

          <fieldset disabled={registrationStatus === 'loading'}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formUsername">
                  <Form.Label>Username <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter username"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter initial password"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email Address <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="e.g., employee@africahr.com"
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formFirstName">
                  <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formLastName">
                  <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formDepartment">
                  <Form.Label>Department <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="e.g., Human Resources, IT"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formPosition">
                  <Form.Label>Position <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="e.g., HR Manager, Software Developer"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <small className="text-muted"><span className="text-danger">*</span> Required fields</small>

          </fieldset>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose} disabled={registrationStatus === 'loading'}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={registrationStatus === 'loading' || registrationStatus === 'succeeded'}>
            {registrationStatus === 'loading' ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
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