import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Spinner, Alert, Button, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { AppDispatch, RootState } from '../context/store';
import { fetchEmployees, toggleEmployeeStatus, selectAllEmployees, selectEmployeeStatus, selectEmployeeError, selectEmployeeUpdateStatus } from '../context/employeeSlice';
import { FaToggleOn, FaToggleOff } from 'react-icons/fa';

const ManageEmployees: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const employees = useSelector(selectAllEmployees);
  const fetchStatus = useSelector(selectEmployeeStatus);
  const fetchError = useSelector(selectEmployeeError);
  const updateStatus = useSelector(selectEmployeeUpdateStatus);
  const { user } = useSelector((state: RootState) => state.auth); // Get current user for role check

  // State to track which user's status is currently being updated
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  const isAdminOrHR = user?.user?.role === 'ADMIN' || user?.user?.role === 'HR_MANAGER';

  useEffect(() => {
    if (fetchStatus === 'idle') {
      dispatch(fetchEmployees());
    }
  }, [fetchStatus, dispatch]);

  useEffect(() => {
    // Show toast notification on successful status update
    if (updateStatus === 'succeeded' && updatingUserId !== null) {
      toast.success('Employee status updated successfully!');
      setUpdatingUserId(null); // Reset updating state
    } 
    // Optionally show error toast
    // else if (updateStatus === 'failed' && updatingUserId !== null) {
    //   toast.error('Failed to update employee status.');
    //   setUpdatingUserId(null);
    // }
  }, [updateStatus, updatingUserId]);

  const handleToggleStatus = (employeeId: number, userId: number, currentStatus: boolean) => {
    if (!isAdminOrHR) return; // Double check permissions

    setUpdatingUserId(employeeId);
    dispatch(toggleEmployeeStatus({ userId, isEnabled: !currentStatus }));
  };

  let content;

  if (fetchStatus === 'loading') {
    content = (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" style={{ color: '#184C55' }}>
          <span className="visually-hidden">Loading employees...</span>
        </Spinner>
        <p className="mt-2">Loading employees...</p>
      </div>
    );
  } else if (fetchStatus === 'succeeded') {
    content = (
      <Table responsive striped bordered hover className="table-sm align-middle">
        <thead style={{ backgroundColor: '#f8f9fa' }}>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Position</th>
            <th>Status</th>
            {isAdminOrHR && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {employees.length > 0 ? (
            employees.map((employee) => (
              <tr key={employee.id}>
                <td>{`${employee.firstName} ${employee.lastName}`}</td>
                <td>{employee.email}</td>
                <td>{employee.position}</td>
                <td>
                  <Badge bg={employee.user.enabled ? 'success' : 'danger'}>
                    {employee.user.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </td>
                {isAdminOrHR && (
                  <td>
                    <Button
                      variant={employee.user.enabled ? 'outline-danger' : 'outline-success'}
                      size="sm"
                      onClick={() => handleToggleStatus(employee.id, employee.user.id, employee.user.enabled)}
                      disabled={updateStatus === 'loading' && updatingUserId === employee.id}
                      title={employee.user.enabled ? 'Disable User' : 'Enable User'}
                      style={{ width: '80px' }} // Fixed width for consistency
                    >
                      {updateStatus === 'loading' && updatingUserId === employee.id ? (
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      ) : employee.user.enabled ? (
                        <><FaToggleOff className="me-1" /> Disable</>
                      ) : (
                        <><FaToggleOn className="me-1" /> Enable</>
                      )}
                    </Button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={isAdminOrHR ? 5 : 4} className="text-center py-4">
                No employees found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    );
  } else if (fetchStatus === 'failed') {
    content = (
      <Alert variant="danger" className="text-center">
        {fetchError || 'Failed to load employees. Please try again later.'}
      </Alert>
    );
  }

  return (
    <div className="container-fluid py-3">
       <h4 className="mb-3" style={{ color: '#184C55' }}>Manage Employees</h4>
       {content}
    </div>
  );
};

export default ManageEmployees; 