/** @jsxImportSource react */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Button, Alert, Spinner, Table, Badge, Modal } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { AppDispatch, RootState } from '../context/store';
import { fetchHolidays, deleteHoliday, Holiday } from '../context/holidaySlice';
import CreateHolidayModal from '../components/dashboard/CreateHolidayModal';
import { toast } from 'react-toastify';

const Holidays: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { holidays = [], status: loading, error } = useSelector((state: RootState) => state.holidays);
  const { user } = useSelector((state: RootState) => state.auth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [holidayToEdit, setHolidayToEdit] = useState<Holiday | null>(null);
  const [holidayToDelete, setHolidayToDelete] = useState<number | null>(null);

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
    dispatch(fetchHolidays()); // Refresh list on success
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

  if (!isAdminOrHR) {
    return (
      <Container className="py-4">
        <Alert variant="danger">Access Denied: You do not have permission to manage holidays.</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 style={{ color: '#184C55' }}>Manage Holidays</h2>
        </Col>
        <Col xs="auto">
          <Button
            style={{ backgroundColor: '#184C55', borderColor: '#184C55' }}
            onClick={() => handleOpenModal()}
          >
            <FaPlus className="me-2" /> Add New Holiday
          </Button>
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
            <Button 
              style={{ backgroundColor: '#184C55', borderColor: '#184C55' }}
              onClick={() => handleOpenModal()}
            >
              <FaPlus className="me-2" /> Add Holiday
            </Button>
          </Card.Body>
        </Card>
      )}

      {loading === 'succeeded' && holidays.length > 0 && (
        <Card className="shadow-sm">
          <Card.Header as="h5" className="d-flex justify-content-between align-items-center" style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #184C55' }}>
            <span style={{ color: '#184C55' }}>Holiday List</span>
          </Card.Header>
          <Card.Body className="p-0"> {/* Remove Card body padding to let table fill */}
            <Table responsive className="align-middle mb-0"> {/* Removed table-hover, table-sm, border */}
              <thead style={{ borderBottom: '1px solid #dee2e6' }}>
                <tr>
                  <th className="py-3 px-3 fw-bold">Name</th>
                  <th className="py-3 px-3 fw-bold">Date</th>
                  <th className="py-3 px-3 fw-bold">Type</th>
                  <th className="py-3 px-3 fw-bold text-center">Actions</th>
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
                    <td className="py-3 px-3 text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="p-1 d-inline-flex align-items-center justify-content-center"
                          style={{ width: '30px', height: '30px' }}
                          onClick={() => handleOpenModal(holiday)} // Corrected: Pass holiday to edit
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
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      <CreateHolidayModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        holiday={holidayToEdit}
      />

      {/* Delete Confirmation Modal */}
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