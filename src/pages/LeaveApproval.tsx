import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../context/store';
import { updateLeaveStatus, fetchAllLeaveHistory } from '../context/leaveSlice';
import { requestNotificationPermission, sendNotification } from '../services/notificationService';
import { toast } from 'react-toastify';
import { Table, Button, Badge } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';

const LeaveApproval = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { allHistory: leaveRequests } = useSelector((state: RootState) => state.leaves);
  const [notificationToken, setNotificationToken] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAllLeaveHistory());
    const requestPermission = async () => {
      const token = await requestNotificationPermission();
      setNotificationToken(token);
    };
    requestPermission();
  }, [dispatch]);

  const handleApprove = async (leaveId: number) => {
    try {
      await dispatch(updateLeaveStatus({ leaveId, status: 'APPROVED' })).unwrap();
      
      if (notificationToken) {
        await sendNotification(
          notificationToken,
          'Leave Request Approved',
          'Your leave request has been approved'
        );
      }

      toast.success('Leave request approved successfully!');
      dispatch(fetchAllLeaveHistory());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve leave request');
    }
  };

  const handleReject = async (leaveId: number) => {
    try {
      await dispatch(updateLeaveStatus({ leaveId, status: 'REJECTED' })).unwrap();
      
      if (notificationToken) {
        await sendNotification(
          notificationToken,
          'Leave Request Rejected',
          'Your leave request has been rejected'
        );
      }

      toast.success('Leave request rejected successfully!');
      dispatch(fetchAllLeaveHistory());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reject leave request');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container py-4">
      <h4 className="mb-4">Leave Requests</h4>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaveRequests
            .filter(request => request.status === 'PENDING')
            .map(request => (
              <tr key={request.id}>
                <td>{request.employee?.firstName} {request.employee?.lastName}</td>
                <td>{request.type}</td>
                <td>{formatDate(request.startDate)}</td>
                <td>{formatDate(request.endDate)}</td>
                <td>
                  <Badge bg="warning">{request.status}</Badge>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => handleApprove(request.id)}
                    >
                      <FaCheck /> Approve
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleReject(request.id)}
                    >
                      <FaTimes /> Reject
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
    </div>
  );
};

export default LeaveApproval; 