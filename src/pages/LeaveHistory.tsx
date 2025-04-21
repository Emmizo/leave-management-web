/** @jsxImportSource react */
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Table, Badge, Button, Modal } from 'react-bootstrap';
import { FaEye, FaTrash, FaFileExport } from 'react-icons/fa';
import { fetchAllLeaveHistory, deleteLeave } from '../context/leaveSlice';
import { RootState, AppDispatch } from '../context/store';
import { Leave } from '../types/auth';
import { toast } from 'react-toastify';
import { exportToCSV } from '../utils/exportUtils';

const LeaveHistory = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { allHistory: leaveHistory, fetchHistoryStatus: loading, fetchHistoryError: error } = useSelector((state: RootState) => state.leaves);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [leaveToDelete, setLeaveToDelete] = useState<number | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);

  const isAdminOrHR = currentUser?.user?.role === 'ADMIN' || currentUser?.user?.role === 'HR_MANAGER';

  useEffect(() => {
    dispatch(fetchAllLeaveHistory());
  }, [dispatch]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-warning';
      case 'APPROVED':
        return 'bg-success';
      case 'REJECTED':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteLeave(id)).unwrap();
      toast.success('Leave request deleted successfully');
      setLeaveToDelete(null);
    } catch (error) {
      toast.error('Failed to delete leave request'+error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const handleViewDetails = (leave: Leave) => {
    setSelectedLeave(leave);
  };

  const handleExport = () => {
    if (leaveHistory.length === 0) {
      toast.warning('No data to export');
      return;
    }
    
    const exportData = leaveHistory.map(leave => ({
      Employee: `${leave.employee?.firstName} ${leave.employee?.lastName}`,
      'Leave Type': leave.type,
      'Start Date': formatDate(leave.startDate),
      'End Date': formatDate(leave.endDate),
      'Duration (Days)': calculateDays(leave.startDate, leave.endDate),
      Status: leave.status,
      Reason: leave.reason
    }));
    
    exportToCSV(exportData, 'leave_history');
  };

  if (loading === 'loading') return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Leave History</h2>
        {isAdminOrHR && (
          <Button 
            variant="outline-primary" 
            onClick={handleExport}
            disabled={leaveHistory.length === 0}
            style={{ backgroundColor: '#184C55', color: 'white' }}
          >
            <FaFileExport className="me-2"  />
            Export to CSV
          </Button>
        )}
      </div>
      {leaveHistory.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">No leave history found</p>
        </div>
      ) : (
        <Table responsive className="align-middle">
          <thead style={{ borderBottom: '1px solid #dee2e6' }}>
            <tr>
              <th className="py-3 px-3 fw-bold">Employee</th>
              <th className="py-3 px-3 fw-bold">Leave Type</th>
              <th className="py-3 px-3 fw-bold">Start Date</th>
              <th className="py-3 px-3 fw-bold">End Date</th>
              <th className="py-3 px-3 fw-bold">Status</th>
              <th className="py-3 px-3 fw-bold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaveHistory.map((leave: Leave) => (
              <tr key={leave.id}>
                <td className="py-3 px-3">{leave.employee?.firstName} {leave.employee?.lastName}</td>
                <td className="py-3 px-3">{leave.type}</td>
                <td className="py-3 px-3">{formatDate(leave.startDate)}</td>
                <td className="py-3 px-3">{formatDate(leave.endDate)}</td>
                <td className="py-3 px-3">
                  <Badge className={getStatusBadgeClass(leave.status)} style={{ fontSize: '0.8em', padding: '0.4em 0.7em' }}>
                    {leave.status}
                  </Badge>
                </td>
                <td className="py-3 px-3 text-center">
                  <div className="d-flex gap-2 justify-content-center">
                    <Button
                      variant="outline-info"
                      size="sm"
                      className="p-1 d-inline-flex align-items-center justify-content-center"
                      style={{ width: '30px', height: '30px' }}
                      onClick={() => handleViewDetails(leave)}
                      title="View details"
                    >
                      <FaEye size={14} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="p-1 d-inline-flex align-items-center justify-content-center"
                      style={{ width: '30px', height: '30px' }}
                      onClick={() => setLeaveToDelete(leave.id)}
                      title="Delete leave request"
                    >
                      <FaTrash size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={!!leaveToDelete} onHide={() => setLeaveToDelete(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Leave Request</Modal.Title>
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

      {/* Leave Details Modal */}
      <Modal show={!!selectedLeave} onHide={() => setSelectedLeave(null)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Leave Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLeave && (
            <div className="leave-details">
              <div className="row mb-3">
                <div className="col-md-6">
                  <h6 className="text-muted">Employee</h6>
                  <p>{selectedLeave.employee?.firstName} {selectedLeave.employee?.lastName}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted">Leave Type</h6>
                  <p>{selectedLeave.type}</p>
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <h6 className="text-muted">Start Date</h6>
                  <p>{formatDate(selectedLeave.startDate)}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted">End Date</h6>
                  <p>{formatDate(selectedLeave.endDate)}</p>
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <h6 className="text-muted">Duration</h6>
                  <p>{calculateDays(selectedLeave.startDate, selectedLeave.endDate)} days</p>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted">Status</h6>
                  <Badge className={getStatusBadgeClass(selectedLeave.status)}>
                    {selectedLeave.status}
                  </Badge>
                </div>
              </div>
              
              <div className="mb-3">
                <h6 className="text-muted">Detail</h6>
                <p className="border rounded p-3 bg-light">{selectedLeave.reason}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedLeave(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default LeaveHistory; 