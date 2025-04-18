import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaFilter, FaCalendarAlt, FaList, FaCalendarWeek } from 'react-icons/fa';
import { AppDispatch, RootState } from '../context/store';
import { fetchEmployees } from '../context/leaveSlice';
import { Leave } from '../types/auth';
import { Card, Button, Badge, Spinner, Row, Col, Form } from 'react-bootstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// Add custom styles for calendar
const calendarStyles = `
  .calendar-tile-content {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    margin-top: 2px;
  }
  
  .leave-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }
  
  .react-calendar__tile--active {
    background-color: #e6f7ff !important;
  }
  
  .react-calendar__tile--now {
    background-color: #f0f8ff !important;
  }
`;

type ViewMode = 'calendar' | 'list';

interface CalendarTileProperties {
  date: Date;
  view: string;
}

const TeamCalendar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { employees, fetchEmployeesStatus, fetchEmployeesError } = useSelector((state: RootState) => state.leaves);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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
    // Filter by department if selected
    if (selectedDepartment !== 'all' && leave.employeeDepartment !== selectedDepartment) {
      return false;
    }
    // No need to filter by date here as we'll do that in getLeavesForDate
    return true;
  });

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

  const getStatusBadge = (status: string) => {
    const variants = {
      'APPROVED': 'success',
      'PENDING': 'warning',
      'REJECTED': 'danger'
    };
    return <Badge bg={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getLeavesForDate = (date: Date): Leave[] => {
    return filteredLeaves.filter(leave => {
      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);
      // Check if the selected date falls within the leave period (inclusive)
      return date >= leaveStart && date <= leaveEnd;
    });
  };

  const calendarTileContent = ({ date }: CalendarTileProperties) => {
    const leavesForDate = getLeavesForDate(date);
    if (leavesForDate.length === 0) return null;

    return (
      <div className="calendar-tile-content">
        {leavesForDate.map(leave => (
          <div
            key={leave.id}
            className="leave-indicator"
            style={{ backgroundColor: getLeaveTypeColor(leave.type) }}
            title={`${leave.employee?.firstName} ${leave.employee?.lastName} - ${leave.type} (${leave.status})`}
          />
        ))}
      </div>
    );
  };

  const handleDateChange: React.ComponentProps<typeof Calendar>['onChange'] = (value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  // --- Render Logic ---

  // Handle role-based access first
  if (currentUser?.user.role !== 'ADMIN' && currentUser?.user.role !== 'HR_MANAGER') {
    return (
      <Card className="shadow-sm">
        <Card.Body className="text-center py-5">
          <FaCalendarAlt className="text-warning mb-3" style={{ fontSize: '3rem' }} />
          <h4>Access Denied</h4>
          <p className="text-muted">You do not have permission to view the team calendar.</p>
        </Card.Body>
      </Card>
    );
  }

  // Handle loading state
  if (fetchEmployeesStatus === 'loading') {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status" style={{ color: '#184C55' }}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // Handle error state
  if (fetchEmployeesError) {
    return (
      <Card className="shadow-sm border-danger">
        <Card.Body className="text-center py-5">
          <FaCalendarAlt className="text-danger mb-3" style={{ fontSize: '3rem' }} />
          <h4>Error Loading Calendar</h4>
          <p className="text-danger">{fetchEmployeesError}</p>
        </Card.Body>
      </Card>
    );
  }

  // Main component render
  return (
    <div className="container py-4">
      <style>{calendarStyles}</style>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: '#184C55' }}>Team Calendar</h2>
        <div className="btn-group">
          <Button
            variant={viewMode === 'calendar' ? 'primary' : 'outline-primary'}
            onClick={() => setViewMode('calendar')}
            style={{ 
              backgroundColor: viewMode === 'calendar' ? '#184C55' : 'transparent',
              borderColor: '#184C55',
              color: viewMode === 'calendar' ? 'white' : '#184C55'
            }}
          >
            <FaCalendarWeek className="me-2" />
            Calendar View
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
            onClick={() => setViewMode('list')}
            style={{ 
              backgroundColor: viewMode === 'list' ? '#184C55' : 'transparent',
              borderColor: '#184C55',
              color: viewMode === 'list' ? 'white' : '#184C55'
            }}
          >
            <FaList className="me-2" />
            List View
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label htmlFor="department" className="form-label d-flex align-items-center">
                  <FaFilter className="me-2" style={{ color: '#184C55' }} />
                  Department
                </Form.Label>
                <Form.Select
                  id="department"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <div className="legend mt-4">
                <h6>Leave Types</h6>
                <div className="d-flex flex-wrap gap-2">
                  <Badge bg="success">Personal Time Off</Badge>
                  <Badge bg="danger">Sick Leave</Badge>
                  <Badge bg="info">Maternity Leave</Badge>
                  <Badge bg="purple">Compassionate Leave</Badge>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Calendar/List View */}
      <Card className="shadow-sm">
        <Card.Body>
          {viewMode === 'calendar' ? (
            <div className="row">
              <div className="col-md-8">
                <Calendar
                  onChange={handleDateChange}
                  value={selectedDate}
                  tileContent={calendarTileContent}
                  className="w-100 border-0"
                />
              </div>
              <div className="col-md-4">
                <h5 className="mb-3" style={{ color: '#184C55' }}>Leaves for Selected Date</h5>
                {getLeavesForDate(selectedDate).length > 0 ? (
                  <div className="list-group">
                    {getLeavesForDate(selectedDate).map((leave) => (
                      <div
                        key={`${leave.employee?.id}-${leave.id}`}
                        className="list-group-item list-group-item-action"
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">{`${leave.employee?.firstName} ${leave.employee?.lastName}`}</h6>
                            <small className="text-muted">{leave.employee?.department}</small>
                          </div>
                          <Badge
                            style={{
                              backgroundColor: getLeaveTypeColor(leave.type),
                              color: 'white'
                            }}
                          >
                            {leave.type}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          {getStatusBadge(leave.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No leaves scheduled for this date.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.length > 0 ? (
                    filteredLeaves.map((leave) => (
                      <tr key={`${leave.employee?.id}-${leave.id}`}>
                        <td>{leave.employeeName}</td>
                        <td>{leave.employeeDepartment}</td>
                        <td>
                          <Badge
                            style={{
                              backgroundColor: getLeaveTypeColor(leave.type),
                              color: 'white'
                            }}
                          >
                            {leave.type}
                          </Badge>
                        </td>
                        <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                        <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                        <td>{getStatusBadge(leave.status)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">
                        No leave scheduled for the selected criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default TeamCalendar; 