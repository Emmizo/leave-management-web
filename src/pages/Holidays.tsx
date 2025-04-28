/** @jsxImportSource react */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Button, Alert, Spinner, Table, Badge, Modal } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaCalendarWeek, FaList } from 'react-icons/fa';
import { AppDispatch, RootState } from '../context/store';
import { fetchHolidays, deleteHoliday, Holiday } from '../context/holidaySlice';
import CreateHolidayModal from '../components/dashboard/CreateHolidayModal';
import { toast } from 'react-toastify';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// Add custom styles for calendar
const calendarStyles = `
  .react-calendar {
    width: 100%;
    border: none;
    background: white;
    font-family: inherit;
  }

  .react-calendar__navigation {
    margin-bottom: 1rem;
  }

  .react-calendar__navigation button {
    min-width: 44px;
    background: none;
    font-size: 1.1rem;
    color: #184C55;
  }

  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: #f8f9fa;
  }

  .react-calendar__month-view__weekdays {
    text-align: center;
    text-transform: uppercase;
    font-weight: 600;
    font-size: 0.9rem;
    color: #184C55;
  }

  .react-calendar__month-view__weekdays__weekday {
    padding: 0.5rem;
  }

  .react-calendar__month-view__days__day {
    padding: 0.75rem;
  }

  .react-calendar__tile {
    max-width: 100%;
    padding: 0.75rem;
    background: none;
    text-align: center;
    line-height: 1;
  }

  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background-color: #f8f9fa;
  }

  .react-calendar__tile--active {
    background-color: #e6f7ff !important;
  }

  .react-calendar__tile--now {
    background-color: #f0f8ff !important;
  }

  .holiday-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    background-color: #184C55;
    margin-top: 4px;
  }

  .holiday-list {
    max-height: 400px;
    overflow-y: auto;
  }

  .holiday-item {
    transition: all 0.2s ease;
  }

  .holiday-item:hover {
    background-color: #f8f9fa;
  }
`;

type ViewMode = 'calendar' | 'list';

const Holidays: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { holidays = [], status: loading, error } = useSelector((state: RootState) => state.holidays);
  const { user } = useSelector((state: RootState) => state.auth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [holidayToEdit, setHolidayToEdit] = useState<Holiday | null>(null);
  const [holidayToDelete, setHolidayToDelete] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const isAdminOrHR = user?.user?.role === 'ADMIN' || user?.user?.role === 'HR_MANAGER';

  useEffect(() => {
    dispatch(fetchHolidays());
  }, [dispatch]);

  const handleOpenModal = (holiday: Holiday | null = null) => {
    setHolidayToEdit(holiday);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setHolidayToEdit(null);
  };

  const handleSuccess = () => {
    dispatch(fetchHolidays());
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteHoliday(id)).unwrap();
      toast.success('Holiday deleted successfully!');
      setHolidayToDelete(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete holiday';
      toast.error(errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getHolidaysForDate = (date: Date): Holiday[] => {
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      holidayDate.setHours(0, 0, 0, 0);
      return holidayDate.getTime() === compareDate.getTime();
    });
  };

  const calendarTileContent = ({ date }: { date: Date }) => {
    const holidaysForDate = getHolidaysForDate(date);
    if (holidaysForDate.length === 0) return null;

    return (
      <div className="d-flex justify-content-center">
        <div
          className="holiday-indicator"
          title={holidaysForDate.map(h => h.name).join(', ')}
        />
      </div>
    );
  };

  const handleDateChange: React.ComponentProps<typeof Calendar>['onChange'] = (value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  /* if (!isAdminOrHR) {
    return (
      <Container className="py-4">
        <Alert variant="danger">Access Denied: You do not have permission to manage holidays.</Alert>
      </Container>
    );
  } */

  return (
    <Container className="py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 style={{ color: '#184C55' }}>Manage Holidays</h2>
        </Col>
        <Col xs="auto">
          <div className="d-flex gap-2">
            {isAdminOrHR && (
            <Button
              style={{ backgroundColor: '#184C55', borderColor: '#184C55' }}
              onClick={() => handleOpenModal()}
            >
              <FaPlus className="me-2" /> Add New Holiday
            </Button>
            )}
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
        </Col>
      </Row>

      {loading === 'loading' && (
        <div className="text-center py-5">
          <Spinner animation="border" style={{ color: '#184C55' }} />
          <p className="mt-2 text-muted">Loading holidays...</p>
        </div>
      )}
      {error && <Alert variant="danger">Error loading holidays: {error}</Alert>}

      {loading === 'succeeded' && holidays.length === 0 && (
        
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <FaPlus className="text-muted mb-3" style={{ fontSize: '3rem' }}/>
            <h4>No Holidays Found</h4>
            <p className="text-muted">Get started by adding the first holiday.</p>
            {isAdminOrHR && (
            <Button 
              style={{ backgroundColor: '#184C55', borderColor: '#184C55' }}
              onClick={() => handleOpenModal()}
            >
              <FaPlus className="me-2" /> Add Holiday
            </Button>
            )}
          </Card.Body>
        </Card>
      )}

      {loading === 'succeeded' && holidays.length > 0 && (
        <Card className="shadow-sm">
          <Card.Body>
            {viewMode === 'calendar' ? (
              <Row>
                <Col md={8}>
                  <style>{calendarStyles}</style>
                  <Calendar
                    onChange={handleDateChange}
                    value={selectedDate}
                    tileContent={calendarTileContent}
                    className="w-100"
                  />
                </Col>
                <Col md={4}>
                  <div className="holidays-for-date">
                    <h5 className="mb-3" style={{ color: '#184C55' }}>
                      Holidays for {selectedDate.toLocaleDateString()}
                    </h5>
                    {getHolidaysForDate(selectedDate).length > 0 ? (
                      <div className="holiday-list">
                        {getHolidaysForDate(selectedDate).map((holiday) => (
                          <div key={holiday.id} className="holiday-item mb-3 p-3 border rounded">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <strong>{holiday.name}</strong>
                                <small className="text-muted d-block">
                                  {formatDate(holiday.date)}
                                </small>
                              </div>
                              {holiday.recurring && (
                                <Badge bg="info">Recurring</Badge>
                              )}
                            </div>
                            {holiday.description && (
                              <div className="mt-2">
                                <small className="text-muted">{holiday.description}</small>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <FaCalendarWeek className="mb-3" style={{ fontSize: '2rem', color: '#184C55' }} />
                        <p className="text-muted mb-0">No holidays scheduled for this date.</p>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            ) : (
              <Table responsive className="align-middle mb-0">
                <thead style={{ borderBottom: '1px solid #dee2e6' }}>
                  <tr>
                    <th className="py-3 px-3 fw-bold">Name</th>
                    <th className="py-3 px-3 fw-bold">Date</th>
                    <th className="py-3 px-3 fw-bold">Type</th>
                    {isAdminOrHR && (
                    <th className="py-3 px-3 fw-bold text-center">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {holidays.map((holiday) => (
                    <tr key={holiday.id}>
                      <td className="py-3 px-3">{holiday.name}</td>
                      <td className="py-3 px-3">{formatDate(holiday.date)}</td>
                      <td className="py-3 px-3">
                        <Badge bg={holiday.recurring ? 'info' : 'secondary'} style={{ fontSize: '0.8em', padding: '0.4em 0.7em' }}>
                          {holiday.recurring ? 'Recurring' : 'One-time'}
                        </Badge>
                      </td>
                      {isAdminOrHR && (
                      <td className="py-3 px-3 text-center">
                        <div className="d-flex gap-2 justify-content-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="p-1 d-inline-flex align-items-center justify-content-center"
                            style={{ width: '30px', height: '30px' }}
                            onClick={() => handleOpenModal(holiday)}
                            title="Edit Holiday"
                          >
                            <FaEdit size={14} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="p-1 d-inline-flex align-items-center justify-content-center"
                            style={{ width: '30px', height: '30px' }}
                            onClick={() => setHolidayToDelete(holiday.id)}
                            title="Delete Holiday"
                          >
                            <FaTrash size={14} />
                          </Button>
                        </div>
                      </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}

      <CreateHolidayModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        holiday={holidayToEdit}
      />

      <Modal show={!!holidayToDelete} onHide={() => setHolidayToDelete(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this holiday? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setHolidayToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => holidayToDelete && handleDelete(holidayToDelete)}>
            Delete Holiday
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Holidays; 