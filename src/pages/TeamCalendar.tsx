import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaFilter } from 'react-icons/fa';
import { AppDispatch, RootState } from '../context/store';
import { fetchEmployees } from '../context/leaveSlice';
import { Leave } from '../types/auth';

// Remove dummy data
/*
const teamMembers = [
  { id: 1, name: 'John Doe', department: 'IT', position: 'Senior Developer' },
  { id: 2, name: 'Jane Smith', department: 'HR', position: 'HR Manager' },
  { id: 3, name: 'Mike Johnson', department: 'Finance', position: 'Accountant' },
];
const leaveSchedule = [
  // ... dummy leaves ...
];
*/

const TeamCalendar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { employees, fetchEmployeesStatus, fetchEmployeesError } = useSelector((state: RootState) => state.leaves);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  // Month filter state removed for now
  // const [selectedMonth, setSelectedMonth] = useState<string>(''); 

  useEffect(() => {
    // Fetch employees only if user has the required role
    if (currentUser?.user.role === 'ADMIN' || currentUser?.user.role === 'HR_MANAGER') {
      dispatch(fetchEmployees());
    }
  }, [dispatch, currentUser]);

  // --- Data Processing ---
  const departments = ['all', ...new Set(employees.map(member => member.department).filter(Boolean))]; // Filter out potential undefined/null

  const allLeaves = employees.reduce((acc, employee) => {
    if (employee.leaves) {
      const leavesWithEmployee = employee.leaves.map(leave => ({
        ...leave,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        employeeDepartment: employee.department,
        employeePosition: employee.position, // Keep position if needed later
      }));
      acc.push(...leavesWithEmployee);
    }
    return acc;
  }, [] as (Leave & { employeeName: string; employeeDepartment: string; employeePosition: string })[]);

  const filteredLeaves = allLeaves.filter(leave => {
    return selectedDepartment === 'all' || leave.employeeDepartment === selectedDepartment;
    // Add month filtering logic here if selectedMonth state is used
  });

  // --- Render Logic ---

  // Handle role-based access first
  if (currentUser?.user.role !== 'ADMIN' && currentUser?.user.role !== 'HR_MANAGER') {
    return <div className="alert alert-warning">You do not have permission to view the team calendar.</div>;
  }

  // Handle loading state
  if (fetchEmployeesStatus === 'loading') {
    return <div>Loading team calendar...</div>;
  }

  // Handle error state
  if (fetchEmployeesError) {
    return <div className="alert alert-danger">Error loading employees: {fetchEmployeesError}</div>;
  }

  // Main component render
  return (
    <div className="container">
      <h2 className="mb-4">Team Calendar</h2>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="department" className="form-label">
                <FaFilter className="me-2" />
                Department
              </label>
              <select
                className="form-select"
                id="department"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            </div>
            {/* Month Filter Placeholder - Add back if implementing */}
            {/* <div className="col-md-6 mb-3">
              <label htmlFor="month" className="form-label">
                <FaCalendarAlt className="me-2" /> Month
              </label>
              <input type="month" className="form-control" id="month" ... />
            </div> */}
          </div>
        </div>
      </div>

      {/* Calendar View / Leave List Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  {/* <th>Position</th>  Optional column */}
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.length > 0 ? (
                  filteredLeaves.map((leave) => (
                    // Use a unique key, combination of employee and leave ID is good
                    <tr key={`${leave.employee?.id}-${leave.id}`}> 
                      <td>{leave.employeeName}</td>
                      <td>{leave.employeeDepartment}</td>
                      {/* <td>{leave.employeePosition}</td> */}
                      <td>{leave.type}</td>
                      <td>{leave.startDate}</td>
                      <td>{leave.endDate}</td>
                      <td>
                        <span className={`badge ${leave.status === 'APPROVED' ? 'bg-success' : leave.status === 'PENDING' ? 'bg-warning' : 'bg-danger'}`}>
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    {/* Adjust colspan based on number of visible columns */}
                    <td colSpan={6} className="text-center text-muted">No leave scheduled for the selected criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCalendar; 