import React, { useEffect, useState, ChangeEvent } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Modal, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { LeavePolicy } from '../types/leavePolicy';
import {
  fetchLeavePolicies,
  createLeavePolicy,
  updateLeavePolicy,
  deleteLeavePolicy,
  selectAllLeavePolicies,
  selectLeavePolicyStatus,
  selectLeavePolicyError,
} from '../context/leavePolicySlice';
import { AppDispatch, RootState } from '../context/store';
import { FaEye, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const LeavePolicies: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const policies = useSelector(selectAllLeavePolicies);
  const status = useSelector(selectLeavePolicyStatus);
  const error = useSelector(selectLeavePolicyError);
  const { user } = useSelector((state: RootState) => state.auth);

  // Check if user is admin or HR
  const isAdminOrHR = user?.user?.role === 'ADMIN' || user?.user?.role === 'HR_MANAGER';

  // State hooks - moved to the top before any conditional returns
  const [selectedPolicy, setSelectedPolicy] = useState<LeavePolicy | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Omit<LeavePolicy, 'id'>>({
    name: '',
    description: '',
    daysPerYear: 0,
    carryForwardDays: 0,
    maxConsecutiveDays: 0,
    minNoticeDays: 0,
    requiresApproval: true,
    active: true
  });

  // Redirect non-admin/HR users to dashboard
  useEffect(() => {
    if (user && !isAdminOrHR) {
      toast.error('You do not have permission to access this page');
      navigate('/dashboard');
    }
  }, [user, isAdminOrHR, navigate]);

  useEffect(() => {
    if (isAdminOrHR) {
      dispatch(fetchLeavePolicies());
    }
  }, [dispatch, isAdminOrHR]);

  useEffect(() => {
    if (selectedPolicy) {
      setFormData({
        name: selectedPolicy.name,
        description: selectedPolicy.description,
        daysPerYear: selectedPolicy.daysPerYear,
        carryForwardDays: selectedPolicy.carryForwardDays,
        maxConsecutiveDays: selectedPolicy.maxConsecutiveDays,
        minNoticeDays: selectedPolicy.minNoticeDays,
        requiresApproval: selectedPolicy.requiresApproval,
        active: selectedPolicy.active
      });
    }
  }, [selectedPolicy]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (selectedPolicy) {
        await dispatch(updateLeavePolicy({
          id: selectedPolicy.id,
          ...formData
        })).unwrap();
        toast.success('Leave policy updated successfully');
      } else {
        await dispatch(createLeavePolicy(formData)).unwrap();
        toast.success('Leave policy created successfully');
      }
      resetForm();
      setShowFormModal(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this leave policy?')) {
      try {
        await dispatch(deleteLeavePolicy(id)).unwrap();
        toast.success('Leave policy deleted successfully');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'An error occurred');
      }
    }
  };

  const resetForm = () => {
    setSelectedPolicy(null);
    setFormData({
      name: '',
      description: '',
      daysPerYear: 0,
      carryForwardDays: 0,
      maxConsecutiveDays: 0,
      minNoticeDays: 0,
      requiresApproval: true,
      active: true
    });
  };

  const handleViewDetails = (policy: LeavePolicy) => {
    setSelectedPolicy(policy);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
  };

  const handleEdit = (policy: LeavePolicy) => {
    setSelectedPolicy(policy);
    setShowFormModal(true);
  };

  const handleAddNew = () => {
    resetForm();
    setShowFormModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Show loading state while checking authentication
  if (!user) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" role="status" style={{ color: '#184C55' }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading...</p>
        </div>
      </Container>
    );
  }

  // Show access denied message for non-admin/HR users
  if (!isAdminOrHR) {
    return (
      <Container className="py-4">
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <h4 className="text-danger mb-3">Access Denied</h4>
            <p className="text-muted">You do not have permission to access this page.</p>
            <Button 
              variant="outline-primary" 
              onClick={() => navigate('/dashboard')}
              style={{ borderColor: '#184C55', color: '#184C55' }}
            >
              Return to Dashboard
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (error) {
    toast.error(error);
  }

  return (
    <Container fluid className="py-3">
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center py-3" style={{ backgroundColor: '#184C55' }}>
              <h5 className="mb-0 text-white">Leave Policies</h5>
              <Button 
                variant="light" 
                size="sm" 
                onClick={handleAddNew}
                className="d-flex align-items-center"
              >
                <FaPlus className="me-2" /> Add New Policy
              </Button>
            </Card.Header>
            <Card.Body>
              {status ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" style={{ color: '#184C55' }}>
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p className="mt-2">Loading leave policies...</p>
                </div>
              ) : (
                <Table responsive className="table-sm">
                  <thead>
                    <tr>
                      <th className="py-3">Name</th>
                      <th className="py-3">Days/Year</th>
                      <th className="py-3">Carry Forward</th>
                      <th className="py-3">Max Days</th>
                      <th className="py-3">Notice Days</th>
                      <th className="py-3">Approval</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policies.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          No leave policies found
                        </td>
                      </tr>
                    ) : (
                      policies.map((policy: LeavePolicy) => (
                        <tr key={policy.id}>
                          <td className="py-3">{policy.name}</td>
                          <td className="py-3">{policy.daysPerYear}</td>
                          <td className="py-3">{policy.carryForwardDays}</td>
                          <td className="py-3">{policy.maxConsecutiveDays}</td>
                          <td className="py-3">{policy.minNoticeDays}</td>
                          <td className="py-3">
                            <span className={`badge bg-${policy.requiresApproval ? 'info' : 'warning'}`}>
                              {policy.requiresApproval ? 'Required' : 'Not Required'}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`badge bg-${policy.active ? 'success' : 'danger'}`}>
                              {policy.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => handleViewDetails(policy)}
                                title="View Details"
                                style={{ borderColor: '#184C55', color: '#184C55' }}
                              >
                                <FaEye />
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => handleEdit(policy)}
                                title="Edit Policy"
                                style={{ borderColor: '#184C55', color: '#184C55' }}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDelete(policy.id)}
                                title="Delete Policy"
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Policy Details Modal */}
      <Modal show={showDetailsModal} onHide={handleCloseDetails} centered>
        <Modal.Header closeButton>
          <Modal.Title>Leave Policy Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPolicy && (
            <div>
              <div className="mb-3">
                <h6 className="text-muted">Name</h6>
                <p>{selectedPolicy.name}</p>
              </div>
              <div className="mb-3">
                <h6 className="text-muted">Description</h6>
                <p>{selectedPolicy.description}</p>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <h6 className="text-muted">Days Per Year</h6>
                  <p>{selectedPolicy.daysPerYear}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted">Carry Forward Days</h6>
                  <p>{selectedPolicy.carryForwardDays}</p>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <h6 className="text-muted">Max Consecutive Days</h6>
                  <p>{selectedPolicy.maxConsecutiveDays}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted">Min Notice Days</h6>
                  <p>{selectedPolicy.minNoticeDays}</p>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <h6 className="text-muted">Approval Required</h6>
                  <p>
                    <span className={`badge bg-${selectedPolicy.requiresApproval ? 'info' : 'warning'}`}>
                      {selectedPolicy.requiresApproval ? 'Required' : 'Not Required'}
                    </span>
                  </p>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted">Status</h6>
                  <p>
                    <span className={`badge bg-${selectedPolicy.active ? 'success' : 'danger'}`}>
                      {selectedPolicy.active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
              {selectedPolicy.createdAt && (
                <div className="mb-3">
                  <h6 className="text-muted">Created At</h6>
                  <p>{formatDate(selectedPolicy.createdAt)}</p>
                </div>
              )}
              {selectedPolicy.updatedAt && (
                <div className="mb-3">
                  <h6 className="text-muted">Updated At</h6>
                  <p>{formatDate(selectedPolicy.updatedAt)}</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetails}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Policy Form Modal */}
      <Modal 
        show={showFormModal} 
        onHide={() => setShowFormModal(false)} 
        centered 
        size="lg"
        contentClassName="border-0 shadow"
      >
        <Modal.Header closeButton style={{ backgroundColor: '#184C55', color: 'white', borderBottom: 'none' }}>
          <Modal.Title>{selectedPolicy ? 'Edit Leave Policy' : 'Create Leave Policy'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <fieldset disabled={isSubmitting}>
              <div className="mb-4">
                <h5 className="mb-3" style={{ color: '#184C55' }}>Basic Information</h5>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-medium" style={{ color: '#184C55' }}>Leave Type</Form.Label>
                      <Form.Select
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="form-select-lg border-2"
                        style={{ borderColor: '#184C55' }}
                      >
                        <option value="">Select leave type</option>
                        <option value="PTO">Personal Time Off (PTO)</option>
                        <option value="SICK">Sick Leave</option>
                        <option value="COMPASSIONATE">Compassionate Leave</option>
                        <option value="MATERNITY">Maternity Leave</option>
                        <option value="UNPAID">Unpaid Leave</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-medium" style={{ color: '#184C55' }}>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter policy description..."
                        className="form-control-lg border-2"
                        style={{ borderColor: '#184C55' }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              <div className="mb-4">
                <h5 className="mb-3" style={{ color: '#184C55' }}>Duration Settings</h5>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-medium" style={{ color: '#184C55' }}>Days Per Year</Form.Label>
                      <Form.Control
                        type="number"
                        name="daysPerYear"
                        value={formData.daysPerYear}
                        onChange={handleInputChange}
                        required
                        min={0}
                        placeholder="0"
                        className="form-control-lg border-2"
                        style={{ borderColor: '#184C55' }}
                      />
                      <Form.Text className="text-muted">
                        Maximum number of days allowed per year
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-medium" style={{ color: '#184C55' }}>Carry Forward Days</Form.Label>
                      <Form.Control
                        type="number"
                        name="carryForwardDays"
                        value={formData.carryForwardDays}
                        onChange={handleInputChange}
                        required
                        min={0}
                        placeholder="0"
                        className="form-control-lg border-2"
                        style={{ borderColor: '#184C55' }}
                      />
                      <Form.Text className="text-muted">
                        Maximum days that can be carried forward to next year
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-medium" style={{ color: '#184C55' }}>Max Consecutive Days</Form.Label>
                      <Form.Control
                        type="number"
                        name="maxConsecutiveDays"
                        value={formData.maxConsecutiveDays}
                        onChange={handleInputChange}
                        required
                        min={0}
                        placeholder="0"
                        className="form-control-lg border-2"
                        style={{ borderColor: '#184C55' }}
                      />
                      <Form.Text className="text-muted">
                        Maximum consecutive days allowed per request
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-medium" style={{ color: '#184C55' }}>Min Notice Days</Form.Label>
                      <Form.Control
                        type="number"
                        name="minNoticeDays"
                        value={formData.minNoticeDays}
                        onChange={handleInputChange}
                        required
                        min={0}
                        placeholder="0"
                        className="form-control-lg border-2"
                        style={{ borderColor: '#184C55' }}
                      />
                      <Form.Text className="text-muted">
                        Minimum days of notice required before leave start date
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              <div className="mb-4">
                <h5 className="mb-3" style={{ color: '#184C55' }}>Policy Settings</h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="requiresApproval"
                        name="requiresApproval"
                        label={
                          <span className="fw-medium" style={{ color: '#184C55' }}>
                            Requires Approval
                          </span>
                        }
                        checked={formData.requiresApproval}
                        onChange={handleInputChange}
                        className="custom-switch"
                      />
                      <Form.Text className="text-muted">
                        Whether this leave type requires manager approval
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="active"
                        name="active"
                        label={
                          <span className="fw-medium" style={{ color: '#184C55' }}>
                            Active
                          </span>
                        }
                        checked={formData.active}
                        onChange={handleInputChange}
                        className="custom-switch"
                      />
                      <Form.Text className="text-muted">
                        Whether this leave policy is currently active
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setShowFormModal(false)}
                  disabled={isSubmitting}
                  className="px-4"
                  size="lg"
                  style={{ borderWidth: '2px' }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4"
                  size="lg"
                  style={{ backgroundColor: '#184C55', borderColor: '#184C55', borderWidth: '2px' }}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      {selectedPolicy ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    selectedPolicy ? 'Update Policy' : 'Create Policy'
                  )}
                </Button>
              </div>
            </fieldset>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default LeavePolicies; 