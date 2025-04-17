import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Badge, Spinner } from 'react-bootstrap';
import { AppDispatch, RootState } from '../context/store';
import { fetchHolidays } from '../context/holidaySlice';

const Holidays = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { holidays = [], status, error } = useSelector((state: RootState) => state.holidays);

  useEffect(() => {
    dispatch(fetchHolidays());
  }, [dispatch]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">Holidays</h2>
      
      {status === 'loading' && (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          Error loading holidays: {error}
        </div>
      )}

      {status === 'succeeded' && (
        <div className="card">
          <div className="card-body">
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {holidays.length > 0 ? (
                  holidays.map((holiday) => (
                    <tr key={holiday.id}>
                      <td>{holiday.name}</td>
                      <td>{formatDate(holiday.date)}</td>
                      <td>
                        {holiday.recurring ? (
                          <Badge bg="info">Recurring</Badge>
                        ) : (
                          <Badge bg="secondary">One-time</Badge>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center text-muted">
                      No holidays found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Holidays; 