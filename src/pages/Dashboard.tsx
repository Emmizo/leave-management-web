import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaUserFriends, FaCalendarAlt, FaPlus, FaUserClock } from 'react-icons/fa';
import { Button } from 'react-bootstrap';
import { AppDispatch, RootState } from '../context/store';
import { fetchAllLeaveHistory } from '../context/leaveSlice';
import RegisterEmployeeModal from '../components/dashboard/RegisterEmployeeModal';

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { allHistory, fetchHistoryStatus, fetchHistoryError } = useSelector((state: RootState) => state.leaves);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  useEffect(() => {
    if (fetchHistoryStatus === 'idle') {
        dispatch(fetchAllLeaveHistory());
    }
  }, [dispatch, fetchHistoryStatus]);

  const leaveBalance = {
    annual: currentUser?.annualLeaveBalance ?? 0,
    sick: 10,
    compassionate: 5,
    maternity: 90,
  };

  const relevantLeaves = allHistory.filter(leave => {
    const isActive = leave.status === 'PENDING' || leave.status === 'APPROVED';
    if (!isActive) return false;

    if (currentUser?.user.role === 'ADMIN' || currentUser?.user.role === 'HR_MANAGER') {
      return true;
    } else {
      return leave.employee?.id === currentUser?.id;
    }
  });

  const activityTitle = (currentUser?.user.role === 'ADMIN' || currentUser?.user.role === 'HR_MANAGER')
    ? "Team Leave Activity"
    : "My Leave Activity";
  const activityIcon = (currentUser?.user.role === 'ADMIN' || currentUser?.user.role === 'HR_MANAGER')
    ? <FaUserFriends className="me-2" />
    : <FaUserClock className="me-2" />;

  const publicHolidays = [
    { date: '2024-07-01', name: 'Independence Day' },
    { date: '2024-07-04', name: 'Liberation Day' },
  ];

  const openRegisterModal = () => setIsRegisterModalOpen(true);
  const closeRegisterModal = () => setIsRegisterModalOpen(false);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Dashboard</h2>
        {(currentUser?.user.role === 'ADMIN' || currentUser?.user.role === 'HR_MANAGER') && (
           <Button variant="primary" onClick={openRegisterModal}>
             <FaPlus className="me-2" />
             Register Employee
           </Button>
        )}
      </div>
      
      <div className="row mb-4">
        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card bg-primary text-white shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Annual Leave</h5>
              <h2 className="mb-0">{leaveBalance.annual} days</h2>
              <small>Remaining</small>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card bg-success text-white shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Sick Leave</h5>
              <h2 className="mb-0">{leaveBalance.sick} days</h2>
              <small>Available (Placeholder)</small>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card bg-info text-white shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Compassionate</h5>
              <h2 className="mb-0">{leaveBalance.compassionate} days</h2>
              <small>Available (Placeholder)</small>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card bg-warning text-dark shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Maternity</h5>
              <h2 className="mb-0">{leaveBalance.maternity} days</h2>
              <small>Available (Placeholder)</small>
            </div>
          </div>
        </div>
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
                        {(currentUser?.user.role === 'ADMIN' || currentUser?.user.role === 'HR_MANAGER') && <th>Employee</th>}
                        <th>Type</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relevantLeaves.length > 0 ? (
                        relevantLeaves.map((leave) => (
                          <tr key={leave.id}>
                            {(currentUser?.user.role === 'ADMIN' || currentUser?.user.role === 'HR_MANAGER') && 
                                <td>{leave.employee ? `${leave.employee.firstName} ${leave.employee.lastName}` : 'N/A'}</td>
                            }
                            <td>{leave.type}</td>
                            <td>{leave.startDate}</td>
                            <td>{leave.endDate}</td>
                            <td>
                              <span className={`badge bg-${leave.status === 'APPROVED' ? 'success' : leave.status === 'PENDING' ? 'warning' : 'danger'}`}>
                                {leave.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={(currentUser?.user.role === 'ADMIN' || currentUser?.user.role === 'HR_MANAGER') ? 5 : 4}
                              className="text-center text-muted">
                                No relevant leave activity found.
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
            <div className="card-header">
              <h5 className="mb-0"><FaCalendarAlt className="me-2" />Public Holidays</h5>
            </div>
            <div className="card-body">
              {publicHolidays.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {publicHolidays.map((holiday, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      {holiday.name}
                      <span className="badge bg-secondary rounded-pill">{holiday.date}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                 <p className="text-muted">No public holidays configured.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {(currentUser?.user.role === 'ADMIN' || currentUser?.user.role === 'HR_MANAGER') && (
        <RegisterEmployeeModal 
            isOpen={isRegisterModalOpen} 
            onClose={closeRegisterModal} 
        />
      )}
    </div>
  );
};

export default Dashboard; 