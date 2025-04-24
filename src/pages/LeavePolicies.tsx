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

const LeavePolicies: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const policies = useSelector(selectAllLeavePolicies) || [];
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
    daysPerMonth: 0,
    carryForwardDays: 0,
    maxConsecutiveDays: 0,
    minNoticeDays: 0,
    requiresApproval: false,
    active: true,
    exclusionYear: undefined
  });

  // Fetch policies for all users
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        await dispatch(fetchLeavePolicies()).unwrap();
      } catch (err) {
        console.error('Failed to fetch policies:', err);
      }
    };
    fetchPolicies();
  }, [dispatch]);

  useEffect(() => {
    if (selectedPolicy) {
      setFormData({
        name: selectedPolicy.name,
        description: selectedPolicy.description,
        daysPerMonth: selectedPolicy.daysPerMonth,
        carryForwardDays: selectedPolicy.carryForwardDays,
        maxConsecutiveDays: selectedPolicy.maxConsecutiveDays,
        minNoticeDays: selectedPolicy.minNoticeDays,
        requiresApproval: selectedPolicy.requiresApproval,
        active: selectedPolicy.active,
        exclusionYear: selectedPolicy.exclusionYear || undefined
      });
    }
  }, [selectedPolicy]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      let finalValue: string | number | boolean | undefined;
      if (name === 'exclusionYear') {
        if (value === '') {
          finalValue = undefined;
        } else {
          const num = parseInt(value, 10);
          finalValue = isNaN(num) ? undefined : num;
        }
      } else {
        finalValue = value;
      }

    setFormData(prev => ({
      ...prev,
        [name]: finalValue,
    }));
    }
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
      daysPerMonth: 0,
      carryForwardDays: 0,
      maxConsecutiveDays: 0,
      minNoticeDays: 0,
      requiresApproval: false,
      active: true,
      exclusionYear: undefined
    });
  };

  const handleViewDetails = (policy: LeavePolicy) => {
    console.log(policy);
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
              {isAdminOrHR && (
                <Button 
                  variant="light" 
                  size="sm" 
                  onClick={handleAddNew}
                  className="d-flex align-items-center"
                >
                  <FaPlus className="me-2" /> Add New Policy
                </Button>
              )}
            </Card.Header>
            <Card.Body>
              {status ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" style={{ color: '#184C55' }}>
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p className="mt-2">Loading leave policies...</p>
                </div>
              ) : Array.isArray(policies) && policies.length > 0 ? (
                <Table responsive className="table-sm">
                  <thead>
                    <tr>
                      <th className="py-3">Name</th>
                      <th className="py-3">Days/Month</th>
                      <th className="py-3">Carry Forward</th>
                      <th className="py-3">Max Consecutive Days</th>
                      <th className="py-3">Notice Days</th>
                      <th className="py-3">Approval</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Exclusion Year</th>
                      {isAdminOrHR && <th className="py-3">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {policies.map((policy: LeavePolicy) => (
                      <tr key={policy.id}>
                        <td className="py-3">{policy.name}</td>
                        <td className="py-3">
                          {policy.name === 'MATERNITY' ? (
                            <span style={{ backgroundColor: '#fff3cd', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                              {policy.daysPerMonth * 12} (per Year)
                            </span>
                          ) : (
                            policy.daysPerMonth
                          )}
                        </td>
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
                        <td className="py-3">{policy.exclusionYear === undefined ? '-' : policy.exclusionYear}</td>
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
                            {isAdminOrHR && (
                              <>
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
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-5">
                  <img 
                    src="/ist-logo.png" 
                    alt="No Policies" 
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      opacity: 0.5,
                      marginBottom: '1rem' 
                    }} 
                  />
                  <h4 style={{ color: '#184C55', marginBottom: '1rem' }}>No Leave Policies Found</h4>
                  <p className="text-muted mb-4">
                    There are currently no leave policies configured in the system.
                    {isAdminOrHR && " Click the 'Add New Policy' button to create one."}
                  </p>
                  {isAdminOrHR && (
                    <Button 
                      variant="primary" 
                      onClick={handleAddNew}
                      style={{ backgroundColor: '#184C55', borderColor: '#184C55' }}
                      className="d-inline-flex align-items-center"
                    >
                      <FaPlus className="me-2" /> Add New Policy
                    </Button>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Policy Details Modal */}
      <Modal show={showDetailsModal} onHide={handleCloseDetails} centered>
        <Modal.Header closeButton style={{ backgroundColor: '#184C55', color: 'white', borderBottom: 'none' }}>
          <Modal.Title className="text-white">Leave Policy Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedPolicy && (
            <div>
              <div className="mb-3">
                <h6 className="text-muted">Name</h6>
                <p className="fw-medium">{selectedPolicy.name}</p>
              </div>
              <div className="mb-3">
                <h6 className="text-muted">Description</h6>
                <p>{selectedPolicy.description}</p>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <h6 className="text-muted">Days Per Month</h6>
                  <p className="fw-medium">{selectedPolicy.daysPerMonth}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted">Carry Forward Days</h6>
                  <p className="fw-medium">{selectedPolicy.carryForwardDays}</p>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <h6 className="text-muted">Max Consecutive Days</h6>
                  <p className="fw-medium">{selectedPolicy.maxConsecutiveDays}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted">Min Notice Days</h6>
                  <p className="fw-medium">{selectedPolicy.minNoticeDays}</p>
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
              <div className="row mb-3">
                <div className="col-md-6">
                  <h6 className="text-muted">Exclusion Year</h6>
                  <p className="fw-medium">{selectedPolicy.exclusionYear === undefined ? 'Not Set' : selectedPolicy.exclusionYear}</p>
                </div>
              </div>
              {isAdminOrHR && selectedPolicy.createdAt && (
                <div className="mb-3">
                  <h6 className="text-muted">Created At</h6>
                  <p>{formatDate(selectedPolicy.createdAt)}</p>
                </div>
              )}
              {isAdminOrHR && selectedPolicy.updatedAt && (
                <div className="mb-3">
                  <h6 className="text-muted">Updated At</h6>
                  <p>{formatDate(selectedPolicy.updatedAt)}</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={handleCloseDetails}
            style={{ backgroundColor: '#184C55', borderColor: '#184C55' }}
          >
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
                        <option value="PATERNITY">Paternity Leave</option>
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
                      <Form.Label className="fw-medium" style={{ color: '#184C55' }}>
                        {formData.name === 'MATERNITY' ? 'Days Per Year' : 'Days Per Month'}
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="daysPerMonth"
                        value={formData.name === 'MATERNITY' ? formData.daysPerMonth * 12 : formData.daysPerMonth}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          setFormData(prev => ({
                            ...prev,
                            daysPerMonth: formData.name === 'MATERNITY' ? value / 12 : value
                          }));
                        }}
                        required
                        min={0}
                        step={formData.name === 'MATERNITY' ? "1" : "0.01"}
                        placeholder="0.00"
                        className="form-control-lg border-2"
                        style={{ borderColor: '#184C55' }}
                      />
                      <Form.Text className="text-muted">
                        {formData.name === 'MATERNITY' 
                          ? 'Total number of days allowed per year'
                          : 'Maximum number of days allowed per month (e.g., 1.66 for 20 days per year)'}
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
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium" style={{ color: '#184C55' }}>Exclusion Year</Form.Label>
                      <Form.Control
                        type="number"
                        name="exclusionYear"
                        value={formData.exclusionYear ?? ''}
                        onChange={handleInputChange}
                        min="1900"
                        placeholder="YYYY"
                        className="form-control-lg border-2"
                        style={{ borderColor: '#184C55' }}
                      />
                      <Form.Text className="text-muted">
                        Year the policy won't apply (optional)
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