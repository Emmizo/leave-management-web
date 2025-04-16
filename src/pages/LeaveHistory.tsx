import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaEye, FaDownload } from 'react-icons/fa';
import { AppDispatch, RootState } from '../context/store';
import { fetchAllLeaveHistory } from '../context/leaveSlice';

const LeaveHistory = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { allHistory, fetchHistoryStatus, fetchHistoryError } = useSelector((state: RootState) => state.leaves);
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null);

  useEffect(() => {
    if (fetchHistoryStatus === 'idle') {
        dispatch(fetchAllLeaveHistory());
    }
  }, [dispatch, fetchHistoryStatus]);

  const selectedLeave = allHistory.find(leave => leave.id === selectedLeaveId);

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'rejected':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  if (fetchHistoryStatus === 'loading') {
    return <div>Loading leave history...</div>;
  }

  if (fetchHistoryError) {
    return <div className="alert alert-danger">Error loading leave history: {fetchHistoryError}</div>;
  }

  return (
    <div className="container">
      <h2 className="mb-4">Leave History</h2>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover table-striped">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allHistory.length > 0 ? (
                  allHistory.map((leave) => (
                    <tr key={leave.id}>
                      <td>{leave.employee ? `${leave.employee.firstName} ${leave.employee.lastName}` : 'N/A'}</td>
                      <td>{leave.type}</td>
                      <td>{leave.startDate}</td>
                      <td>{leave.endDate}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(leave.status)}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td>{leave.reason}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          title="View Details"
                          onClick={() => setSelectedLeaveId(leave.id)}
                        >
                          <FaEye />
                        </button>
                        <button className="btn btn-sm btn-outline-secondary" title="Download Document (Not Implemented)" disabled>
                           <FaDownload />
                        </button>
                      </td>
                    </tr>
                  ))
                 ) : (
                    <tr>
                       <td colSpan={7} className="text-center text-muted">No leave history found.</td>
                    </tr>
                 )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedLeave && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Leave Details (ID: {selectedLeave.id})</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedLeaveId(null)}
                />
              </div>
              <div className="modal-body">
                <p><strong>Employee:</strong> {selectedLeave.employee ? `${selectedLeave.employee.firstName} ${selectedLeave.employee.lastName}` : 'N/A'}</p>
                <p><strong>Type:</strong> {selectedLeave.type}</p>
                <p><strong>Start Date:</strong> {selectedLeave.startDate}</p>
                <p><strong>End Date:</strong> {selectedLeave.endDate}</p>
                <p><strong>Status:</strong> {selectedLeave.status}</p>
                <p><strong>Reason:</strong> {selectedLeave.reason}</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedLeaveId(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveHistory; 