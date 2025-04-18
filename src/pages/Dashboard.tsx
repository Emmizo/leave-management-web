import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaUserFriends, FaCalendarAlt, FaPlus, FaUserClock, FaCheck, FaTimes, FaEye, FaFileAlt, FaDownload } from 'react-icons/fa';
import { Button, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../context/store';
import { fetchAllLeaveHistory, updateLeaveStatus, fetchLeaveBalances } from '../context/leaveSlice';
import { fetchHolidays, Holiday } from '../context/holidaySlice';
import RegisterEmployeeModal from '../components/dashboard/RegisterEmployeeModal';
import CreateHolidayModal from '../components/dashboard/CreateHolidayModal';

interface LeaveDetails {
  id: number;
  status: string;
  rejectionReason?: string;
  documentUrl?: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  leaveDuration: 'FULL_DAY' | 'HALF_DAY';
  numberOfDays: number;
  employee?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

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
  const [selectedLeaveDetails, setSelectedLeaveDetails] = useState<LeaveDetails | null>(null);

  useEffect(() => {
    dispatch(fetchAllLeaveHistory());
    dispatch(fetchLeaveBalances());
    dispatch(fetchHolidays());
  }, [dispatch]);

  const calculateDaysTaken = (startDate: string, endDate: string, duration: 'FULL_DAY' | 'HALF_DAY') => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // If dates are the same, return 1 for full day or 0.5 for half day
    if (start.toDateString() === end.toDateString()) {
      return duration === 'HALF_DAY' ? 0.5 : 1;
    }
    
    // Calculate the difference in days
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Add 1 to include both start and end dates
    
    // Apply half day calculation only if specifically requested
    return duration === 'HALF_DAY' ? 0.5 : diffDays;
  };

  const relevantLeaves = allHistory.filter(leave => {
    if (currentUser?.user.role === 'ADMIN' || currentUser?.user.role === 'HR_MANAGER') {
      // For admin/HR: show all leaves except rejected ones
      return leave.status !== 'REJECTED';
    } else {
      // For regular employees: show only their leaves
      return leave.employee?.id === currentUser?.id;
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

  const handleViewDetails = (leave: LeaveDetails) => {
    setSelectedLeaveDetails(leave);
  };

  const handleCloseDetails = () => {
    setSelectedLeaveDetails(null);
  };

  const handleDownloadDocument = async (documentUrl: string) => {
    try {
      window.open(documentUrl, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
    }
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
        <h2 style={{ color: '#184C55' }}>Dashboard</h2>
        {isAdminOrHR && (
          <div className="d-flex gap-2">
            <Button 
              onClick={openRegisterModal}
              style={{ backgroundColor: '#184C55', borderColor: '#184C55' }}
            >
              <FaPlus className="me-2" />
              Register Employee
            </Button>
            <Button 
              variant="success" 
              onClick={openHolidayModal}
            >
              <FaCalendarAlt className="me-2" />
              Add Holiday
            </Button>
          </div>
        )}
      </div>
      
      <div className="row mb-4">
        {fetchBalancesStatus === 'loading' ? (
          <div className="col-12 text-center">
            <Spinner animation="border" role="status" style={{ color: '#184C55' }}>
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
              <h5 className="mb-0" style={{ color: '#184C55' }}>{activityIcon}{activityTitle}</h5>
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
                        <th>Days</th>
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
                            <td>{calculateDaysTaken(leave.startDate, leave.endDate, leave.leaveDuration)}</td>
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
                                  size="sm"
                                  onClick={() => handleViewDetails(leave)}
                                  style={{ 
                                    color: '#184C55', 
                                    borderColor: '#184C55',
                                    backgroundColor: 'transparent'
                                  }}
                                >
                                  <FaEye />
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={isAdminOrHR ? 7 : 6} className="text-center text-muted">
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
              <h6 className="mb-0" style={{ color: '#184C55' }}><FaCalendarAlt className="me-2" />Upcoming Holidays</h6>
              <div className="d-flex gap-2">
                {isAdminOrHR && (
                  <Button variant="outline-success" size="sm" onClick={openHolidayModal} className="me-2">
                    {/* <FaPlus className="me-1" /> */}
                    Add
                  </Button>
                )}
                <Button 
                  size="sm"
                  onClick={() => navigate('/holidays')}
                  style={{ 
                    color: '#184C55', 
                    borderColor: '#184C55',
                    backgroundColor: 'transparent'
                  }}
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
        <Modal.Header closeButton style={{ backgroundColor: '#184C55', color: '#FFFFFF' }}>
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
          <Button variant="outline-secondary" onClick={() => setSelectedLeave(null)}>
            Cancel
          </Button>
          <Button
            variant={selectedLeave?.action === 'approve' ? 'success' : 'danger'}
            onClick={handleConfirmAction}
            disabled={selectedLeave?.action === 'reject' && !rejectionReason}
            style={{ backgroundColor: '#184C55', borderColor: '#184C55' }}
          >
            {selectedLeave?.action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Leave Details Modal */}
      <Modal show={!!selectedLeaveDetails} onHide={handleCloseDetails} centered size="lg">
        <Modal.Header closeButton style={{ backgroundColor: '#184C55', color: '#FFFFFF' }}>
          <Modal.Title>Leave Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLeaveDetails && (
            <div className="p-2">
              {isAdminOrHR && selectedLeaveDetails.employee && (
                <div className="mb-3">
                  <h6 className="text-muted">Employee</h6>
                  <p className="mb-0">{`${selectedLeaveDetails.employee.firstName} ${selectedLeaveDetails.employee.lastName}`}</p>
                </div>
              )}
              
              <div className="mb-3">
                <h6 className="text-muted">Leave Type</h6>
                <p className="mb-0">{selectedLeaveDetails.type}</p>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <h6 className="text-muted">Start Date</h6>
                  <p className="mb-0">{formatDate(selectedLeaveDetails.startDate)}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted">End Date</h6>
                  <p className="mb-0">{formatDate(selectedLeaveDetails.endDate)}</p>
                </div>
              </div>

              <div className="mb-3">
                <h6 className="text-muted">Reason</h6>
                <p className="mb-0">{selectedLeaveDetails.reason}</p>
              </div>

              <div className="mb-3">
                <h6 className="text-muted">Status</h6>
                <Badge bg={selectedLeaveDetails.status === 'APPROVED' ? 'success' : 
                         selectedLeaveDetails.status === 'PENDING' ? 'warning' : 'danger'}>
                  {selectedLeaveDetails.status}
                </Badge>
              </div>

              {selectedLeaveDetails.status === 'REJECTED' && selectedLeaveDetails.rejectionReason && (
                <div className="mb-3">
                  <h6 className="text-danger">Rejection Reason</h6>
                  <p className="mb-0">{selectedLeaveDetails.rejectionReason}</p>
                </div>
              )}

              {selectedLeaveDetails.documentUrl && (
                <div className="mb-3">
                  <h6 className="text-muted">Supporting Document</h6>
                  <Button
                    size="sm"
                    onClick={() => handleDownloadDocument(selectedLeaveDetails.documentUrl!)}
                    className="d-flex align-items-center gap-2"
                    style={{ 
                      color: '#184C55', 
                      borderColor: '#184C55',
                      backgroundColor: 'transparent'
                    }}
                  >
                    <FaFileAlt /> View Document <FaDownload className="ms-1" />
                  </Button>
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
    </div>
  );
};

export default Dashboard; 