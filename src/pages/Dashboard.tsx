import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaUserFriends, FaCalendarAlt, FaPlus, FaUserClock, FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import { Button, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../context/store';
import { fetchAllLeaveHistory, updateLeaveStatus, fetchLeaveBalances } from '../context/leaveSlice';
import { fetchHolidays, Holiday } from '../context/holidaySlice';
import RegisterEmployeeModal from '../components/dashboard/RegisterEmployeeModal';
import CreateHolidayModal from '../components/dashboard/CreateHolidayModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { 
    allHistory, 
    fetchHistoryStatus, 
    fetchHistoryError,
    balances,
    fetchBalancesStatus,
    fetchBalancesError 
  } = useSelector((state: RootState) => state.leaves);
  const { holidays = [], status: holidayStatus, error: holidayError } = useSelector((state: RootState) => state.holidays);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [selectedHoliday] = useState<Holiday | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<{ id: number; action: 'approve' | 'reject' } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedLeaveDetails, setSelectedLeaveDetails] = useState<{ id: number; status: string; rejectionReason?: string } | null>(null);

  useEffect(() => {
    dispatch(fetchAllLeaveHistory());
    dispatch(fetchLeaveBalances());
    dispatch(fetchHolidays());
  }, [dispatch]);

  const relevantLeaves = allHistory.filter(leave => {
    if (currentUser?.user.role === 'ADMIN' || currentUser?.user.role === 'HR_MANAGER') {
      return true; // Show all leaves for admin/HR
    } else {
      return leave.employee?.id === currentUser?.id; // Show only user's leaves for regular employees
    }
  });

  const activityTitle = (currentUser?.user.role === 'ADMIN' || currentUser?.user.role === 'HR_MANAGER')
    ? "Team Leave Activity"
    : "My Leave Activity";
  const activityIcon = (currentUser?.user.role === 'ADMIN' || currentUser?.user.role === 'HR_MANAGER')
    ? <FaUserFriends className="me-2" />
    : <FaUserClock className="me-2" />;

  const openRegisterModal = () => setIsRegisterModalOpen(true);
  const closeRegisterModal = () => setIsRegisterModalOpen(false);
  const openHolidayModal = () => {
    setIsHolidayModalOpen(true);
  };
  const closeHolidayModal = () => setIsHolidayModalOpen(false);

  const handleHolidaySuccess = () => {
    dispatch(fetchHolidays());
  };

  const handleApproveReject = (id: number, action: 'approve' | 'reject') => {
    setSelectedLeave({ id, action });
  };

  const handleConfirmAction = async () => {
    if (!selectedLeave) return;

    const status = selectedLeave.action === 'approve' ? 'APPROVED' : 'REJECTED';
    await dispatch(updateLeaveStatus({
      leaveId: selectedLeave.id,
      status,
      ...(status === 'REJECTED' ? { rejectionReason } : {})
    }));
    setSelectedLeave(null);
    setRejectionReason('');
    dispatch(fetchAllLeaveHistory());
  };

  const handleViewDetails = (leave: { id: number; status: string; rejectionReason?: string }) => {
    setSelectedLeaveDetails(leave);
  };

  const handleCloseDetails = () => {
    setSelectedLeaveDetails(null);
  };

  const isAdminOrHR = currentUser?.user.role === 'ADMIN' || currentUser?.user.role === 'HR_MANAGER';

  // Format date to display in a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get upcoming holidays (current year, after today)
  const upcomingHolidays = holidays
    .filter(holiday => {
      const holidayDate = new Date(holiday.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate date comparison
      return holidayDate >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Dashboard</h2>
        {isAdminOrHR && (
          <div className="d-flex gap-2">
            <Button variant="primary" onClick={openRegisterModal}>
              <FaPlus className="me-2" />
              Register Employee
            </Button>
            <Button variant="success" onClick={openHolidayModal}>
              <FaCalendarAlt className="me-2" />
              Add Holiday
            </Button>
          </div>
        )}
      </div>
      
      <div className="row mb-4">
        {fetchBalancesStatus === 'loading' ? (
          <div className="col-12 text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading leave balances...</span>
            </Spinner>
          </div>
        ) : fetchBalancesStatus === 'failed' ? (
          <div className="col-12">
            <div className="alert alert-danger">
              Error loading leave balances: {fetchBalancesError}
            </div>
          </div>
        ) : (
          <>
            {balances
              .filter(balance => balance.daysAvailable > 0)
              .map((balance) => (
                <div key={balance.leaveType} className="col-md-4 col-lg-2 mb-3">
                  <div className="card shadow-sm h-100" style={{ backgroundColor: balance.colorCode, color: '#fff' }}>
                    <div className="card-body d-flex flex-column">
                      <h6 className="card-title mb-3">{balance.name}</h6>
                      <div className="mt-auto text-center">
                        <h3 className="mb-1">{balance.daysAvailable}</h3>
                        <div className="small mb-2">Available</div>
                        <div className="small opacity-75">
                          {balance.daysAvailable} of {balance.daysAllowed} days
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </>
        )}
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">{activityIcon}{activityTitle}</h5>
            </div>
            <div className="card-body">
              {fetchHistoryStatus === 'loading' && <div>Loading leave data...</div>}
              {fetchHistoryError && <div className="alert alert-danger">Error loading leave data: {fetchHistoryError}</div>}
              {fetchHistoryStatus === 'succeeded' && (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        {isAdminOrHR && <th>Employee</th>}
                        <th>Type</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relevantLeaves.length > 0 ? (
                        relevantLeaves.map((leave) => (
                          <tr key={leave.id}>
                            {isAdminOrHR && 
                              <td>{leave.employee ? `${leave.employee.firstName} ${leave.employee.lastName}` : 'N/A'}</td>
                            }
                            <td>{leave.type}</td>
                            <td>{formatDate(leave.startDate)}</td>
                            <td>{formatDate(leave.endDate)}</td>
                            <td>
                              <span className={`badge bg-${leave.status === 'APPROVED' ? 'success' : leave.status === 'PENDING' ? 'warning' : 'danger'}`}>
                                {leave.status}
                              </span>
                            </td>
                            <td>
                              {isAdminOrHR && leave.status === 'PENDING' ? (
                                <>
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    className="me-1"
                                    onClick={() => handleApproveReject(leave.id, 'approve')}
                                  >
                                    <FaCheck />
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    className="me-1"
                                    onClick={() => handleApproveReject(leave.id, 'reject')}
                                  >
                                    <FaTimes />
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleViewDetails(leave)}
                                >
                                  <FaEye />
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={isAdminOrHR ? 6 : 5} className="text-center text-muted">
                            No leave requests found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0"><FaCalendarAlt className="me-2" />Upcoming Holidays</h6>
              <div className="d-flex gap-2">
                {isAdminOrHR && (
                  <Button variant="outline-success" size="sm" onClick={openHolidayModal} className="me-2">
                    {/* <FaPlus className="me-1" /> */}
                    Add
                  </Button>
                )}
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => navigate('/holidays')}
                >
                  {/* <FaCalendarAlt className="me-1" /> */}
                  View All
                </Button>
              </div>
            </div>
            <div className="card-body">
              {holidayStatus === 'loading' && <div>Loading holidays...</div>}
              {holidayError && <div className="alert alert-danger">Error loading holidays: {holidayError}</div>}
              {holidayStatus === 'succeeded' && (
                <>
                  {upcomingHolidays.length > 0 ? (
                    <ul className="list-group list-group-flush">
                      {upcomingHolidays.map((holiday) => (
                        <li key={holiday.id} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-medium">{holiday.name}</div>
                            <small className="text-muted">{formatDate(holiday.date)}</small>
                          </div>
                          {holiday.recurring && (
                            <Badge bg="info">Recurring</Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted mb-0">No upcoming holidays in the next 30 days.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isAdminOrHR && (
        <>
          <RegisterEmployeeModal 
              isOpen={isRegisterModalOpen} 
              onClose={closeRegisterModal} 
          />
          <CreateHolidayModal
              isOpen={isHolidayModalOpen}
              onClose={closeHolidayModal}
              onSuccess={handleHolidaySuccess}
              holiday={selectedHoliday}
          />
        </>
      )}

      {/* Leave Status Update Modal */}
      <Modal show={!!selectedLeave} onHide={() => setSelectedLeave(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedLeave?.action === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLeave?.action === 'reject' && (
            <Form.Group className="mb-3">
              <Form.Label>Rejection Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection"
                required
              />
            </Form.Group>
          )}
          <p>
            Are you sure you want to {selectedLeave?.action} this leave request?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedLeave(null)}>
            Cancel
          </Button>
          <Button
            variant={selectedLeave?.action === 'approve' ? 'success' : 'danger'}
            onClick={handleConfirmAction}
            disabled={selectedLeave?.action === 'reject' && !rejectionReason}
          >
            {selectedLeave?.action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Leave Details Modal */}
      <Modal show={!!selectedLeaveDetails} onHide={handleCloseDetails} centered>
        <Modal.Header closeButton>
          <Modal.Title>Leave Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLeaveDetails?.status === 'REJECTED' && (
            <div className="mb-3">
              <h6 className="text-danger">Rejection Reason:</h6>
              <p className="mb-0">{selectedLeaveDetails.rejectionReason || 'No reason provided'}</p>
            </div>
          )}
          {selectedLeaveDetails?.status === 'APPROVED' && (
            <div className="mb-3">
              <h6 className="text-success">Leave Request Approved</h6>
              <p className="mb-0">Your leave request has been approved.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetails}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard; 