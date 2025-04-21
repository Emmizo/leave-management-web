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
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

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
    if (currentUser?.user?.role === 'ADMIN' || currentUser?.user?.role === 'HR_MANAGER') {
      // For admin/HR: show all leaves except rejected ones
      return leave.status !== 'REJECTED';
    } else {
      // For regular employees: show only their leaves
      return leave.employee?.id === currentUser?.id;
    }
  });

  const activityTitle = (currentUser?.user?.role === 'ADMIN' || currentUser?.user?.role === 'HR_MANAGER')
    ? "Team Leave Activity"
    : "My Leave Activity";
  const activityIcon = (currentUser?.user?.role === 'ADMIN' || currentUser?.user?.role === 'HR_MANAGER')
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
    dispatch(fetchLeaveBalances());
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

  const isAdminOrHR = currentUser?.user?.role === 'ADMIN' || currentUser?.user?.role === 'HR_MANAGER';

  // Get color for leave type
  const getLeaveTypeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      'PTO': '#184C55',
      'SICK': '#dc3545',
      'COMPASSIONATE': '#6f42c1',
      'MATERNITY': '#fd7e14',
      'UNPAID': '#6c757d'
    };
    return colors[type] || '#184C55';
  };

  // Format date to display in a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check if the date is today or tomorrow
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    // For other dates, show the full format
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
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

  // Prepare data for leave type distribution chart
  const getLeaveTypeDistribution = () => {
    const typeCounts: Record<string, number> = {};
    
    relevantLeaves.forEach(leave => {
      typeCounts[leave.type] = (typeCounts[leave.type] || 0) + 1;
    });
    
    const labels = Object.keys(typeCounts);
    const data = Object.values(typeCounts);
    
    // Get colors from balances
    const backgroundColors = labels.map(type => {
      const balance = balances.find(b => b.leaveType === type);
      return balance ? balance.colorCode : '#184C55';
    });
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
          borderWidth: 1,
        },
      ],
    };
  };
  
  // Prepare data for monthly leave trend chart
  const getMonthlyLeaveTrend = () => {
    const monthlyData: Record<string, number> = {};
    
    // Initialize last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyData[monthYear] = 0;
    }
    
    // Count leaves per month
    relevantLeaves.forEach(leave => {
      const startDate = new Date(leave.startDate);
      const monthYear = startDate.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      if (monthlyData[monthYear] !== undefined) {
        monthlyData[monthYear] += calculateDaysTaken(leave.startDate, leave.endDate, leave.leaveDuration);
      }
    });
    
    return {
      labels: Object.keys(monthlyData),
      datasets: [
        {
          label: 'Days of Leave',
          data: Object.values(monthlyData),
          backgroundColor: '#184C55',
          borderColor: '#184C55',
          borderWidth: 1,
        },
      ],
    };
  };
  
  // Chart options
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Leave Type Distribution',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
  };
  
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Monthly Leave Trend',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Days of Leave',
        },
      },
    },
  };

  return (
    <div>
      {/* Existing Admin/HR buttons */}
      <div className="d-flex justify-content-end mb-4">
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
        ) : fetchBalancesError ? (
          <div className="col-12">
            <div className="alert alert-danger">
              Error loading leave balances: {fetchBalancesError}
            </div>
          </div>
        ) : (
          <div className="col-12">
            <div className="d-flex gap-3">
              {balances
                .filter(balance => balance.daysAvailable > 0)
                .map((balance) => (
                  <div key={balance.leaveType} className="flex-grow-1">
                    <div className="card shadow-sm h-100" style={{ 
                      backgroundColor: balance.colorCode, 
                      color: '#fff',
                      minHeight: '120px'
                    }}>
                      <div className="card-body d-flex flex-column justify-content-center p-3">
                        <h6 className="card-title mb-2">{balance.name}</h6>
                        <div className="text-center">
                          <h3 className="mb-0">{balance.daysAvailable}</h3>
                          <div className="small opacity-75">
                            of {balance.daysAllowed} days
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header py-2" style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #184C55' }}>
              <h6 className="mb-0 d-flex align-items-center" style={{ color: '#184C55' }}>
                {activityIcon}
                <span className="fw-bold">{activityTitle}</span>
                <span className="ms-2 badge rounded-pill" style={{ backgroundColor: '#184C55', fontSize: '0.65em' }}>
                  {relevantLeaves.length} Records
                </span>
              </h6>
            </div>
            <div className="card-body p-0">
              {fetchHistoryStatus === 'loading' && (
                <div className="text-center py-3">
                  <Spinner animation="border" role="status" style={{ color: '#184C55' }}>
                    <span className="visually-hidden">Loading leave data...</span>
                  </Spinner>
                </div>
              )}
              {fetchHistoryError && (
                <div className="alert alert-danger m-2">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  Error loading leave data: {fetchHistoryError}
                </div>
              )}
              {fetchHistoryStatus === 'succeeded' && (
                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0">
                    <thead style={{ borderBottom: '1px solid #dee2e6' }}>
                      <tr className="align-middle small">
                        {isAdminOrHR && (
                          <th className="px-2 py-2 fw-bold">
                            Employee
                          </th>
                        )}
                        <th className="px-2 py-2 fw-bold">
                          Type
                        </th>
                        <th className="px-2 py-2 fw-bold">
                          Start
                        </th>
                        <th className="px-2 py-2 fw-bold">
                          End
                        </th>
                        <th className="px-2 py-2 fw-bold">
                          Days
                        </th>
                        <th className="px-2 py-2 fw-bold">
                          Status
                        </th>
                        <th className="px-2 py-2 fw-bold text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {relevantLeaves.length > 0 ? (
                        relevantLeaves.map((leave) => (
                          <tr key={leave.id} className="align-middle small">
                            {isAdminOrHR && (
                              <td className="px-2 py-2 fw-medium">
                                {leave.employee ? `${leave.employee.firstName} ${leave.employee.lastName}` : 'N/A'}
                              </td>
                            )}
                            <td className="px-2 py-2">
                              <Badge
                                style={{
                                  backgroundColor: getLeaveTypeColor(leave.type),
                                  padding: '3px 6px',
                                  fontSize: '0.7em'
                                }}
                              >
                                {leave.type}
                              </Badge>
                            </td>
                            <td className="px-2 py-2 text-secondary">
                              {formatDate(leave.startDate)}
                            </td>
                            <td className="px-2 py-2 text-secondary">
                              {formatDate(leave.endDate)}
                            </td>
                            <td className="px-2 py-2">
                              <span className="fw-medium" style={{ color: '#184C55' }}>
                                {calculateDaysTaken(leave.startDate, leave.endDate, leave.leaveDuration)}
                              </span>
                            </td>
                            <td className="px-2 py-2">
                              <Badge 
                                bg={leave.status === 'APPROVED' ? 'success' : 
                                   leave.status === 'PENDING' ? 'warning' : 'danger'}
                                style={{ padding: '3px 6px', fontSize: '0.7em' }}
                              >
                                {leave.status}
                              </Badge>
                            </td>
                            <td className="px-2 py-2 text-center">
                              <div className="d-flex gap-1 justify-content-center">
                                {isAdminOrHR && leave.status === 'PENDING' ? (
                                  <>
                                    <Button
                                      variant="outline-success"
                                      size="sm"
                                      className="p-1 d-inline-flex align-items-center justify-content-center"
                                      style={{ width: '24px', height: '24px' }}
                                      onClick={() => handleApproveReject(leave.id, 'approve')}
                                      title="Approve"
                                    >
                                      <FaCheck size={10} />
                                    </Button>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      className="p-1 d-inline-flex align-items-center justify-content-center"
                                      style={{ width: '24px', height: '24px' }}
                                      onClick={() => handleApproveReject(leave.id, 'reject')}
                                      title="Reject"
                                    >
                                      <FaTimes size={10} />
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    variant="outline-info"
                                    size="sm"
                                    className="p-1 d-inline-flex align-items-center justify-content-center"
                                    style={{ width: '24px', height: '24px' }}
                                    onClick={() => handleViewDetails(leave)}
                                    title="View Details"
                                  >
                                    <FaEye size={10} />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={isAdminOrHR ? 7 : 6} className="text-center py-3 text-muted small">
                            <div className="d-flex flex-column align-items-center">
                              <FaCalendarAlt size={18} className="mb-1" style={{ color: '#184C55' }} />
                              <p className="mb-0">No leave requests found.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          
          {/* Monthly Leave Trend Chart */}
          <div className="card shadow-sm mb-4">
            <div className="card-header">
              <h5 className="mb-0" style={{ color: '#184C55' }}><FaCalendarAlt className="me-2" />Leave Analytics</h5>
            </div>
            <div className="card-body">
              {fetchHistoryStatus === 'loading' ? (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status" style={{ color: '#184C55' }}>
                    <span className="visually-hidden">Loading chart data...</span>
                  </Spinner>
                </div>
              ) : fetchHistoryError ? (
                <div className="alert alert-danger">Error loading chart data: {fetchHistoryError}</div>
              ) : (
                <div style={{ height: '300px' }}>
                  <Bar options={barOptions} data={getMonthlyLeaveTrend()} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0" style={{ color: '#184C55' }}><FaCalendarAlt className="me-2" />Upcoming Holidays</h6>
              <div className="d-flex gap-2">
                {isAdminOrHR && (
                  <Button variant="outline-success" size="sm" onClick={openHolidayModal} className="me-2">
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
          
          {/* Leave Type Distribution Chart */}
          <div className="card shadow-sm">
            <div className="card-header">
              <h6 className="mb-0" style={{ color: '#184C55' }}><FaUserFriends className="me-2" />Leave Distribution</h6>
            </div>
            <div className="card-body">
              {fetchHistoryStatus === 'loading' ? (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status" style={{ color: '#184C55' }}>
                    <span className="visually-hidden">Loading chart data...</span>
                  </Spinner>
                </div>
              ) : fetchHistoryError ? (
                <div className="alert alert-danger">Error loading chart data: {fetchHistoryError}</div>
              ) : (
                <div style={{ height: '300px' }}>
                  <Pie options={pieOptions} data={getLeaveTypeDistribution()} />
                </div>
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

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">Team Leave Activities</h5>
        <div>
          <Button
            variant="outline-primary"
            size="sm"
            className="me-2"
            onClick={() => navigate('/leave-policies')}
          >
            <i className="bi bi-gear me-1"></i>
            Manage Leave Policies
          </Button>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => navigate('/holidays')}
          >
            <i className="bi bi-calendar-event me-1"></i>
            Manage Holidays
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 