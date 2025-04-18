import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaEye, FaDownload, FaTrash } from 'react-icons/fa';
import { AppDispatch, RootState } from '../context/store';
import { fetchAllLeaveHistory, deleteLeave } from '../context/leaveSlice';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';

const LeaveHistory = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { allHistory, fetchHistoryStatus, fetchHistoryError } = useSelector((state: RootState) => state.leaves);
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null);
  const [leaveToDelete, setLeaveToDelete] = useState<number | null>(null);

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

  const handleDelete = async (leaveId: number) => {
    try {
      await dispatch(deleteLeave(leaveId)).unwrap();
      toast.success('Leave request deleted successfully');
      setLeaveToDelete(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete leave request';
      toast.error(errorMessage);
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
                        <button 
                          className="btn btn-sm btn-outline-danger me-2"
                          title="Delete Leave"
                          onClick={() => setLeaveToDelete(leave.id)}
                        >
                          <FaTrash />
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

      {/* View Details Modal */}
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

      {/* Delete Confirmation Modal */}
      <Modal show={!!leaveToDelete} onHide={() => setLeaveToDelete(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this leave request? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setLeaveToDelete(null)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={() => leaveToDelete && handleDelete(leaveToDelete)}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LeaveHistory; 