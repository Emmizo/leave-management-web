import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaCalendarAlt } from 'react-icons/fa';
import { RootState, AppDispatch } from '../context/store';
import { fetchLeaveBalances } from '../context/leaveSlice';

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, status } = useSelector((state: RootState) => state.auth);
  const { balances, fetchBalancesStatus, fetchBalancesError } = useSelector((state: RootState) => state.leaves);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: '(Not Provided)',
      });
    }
  }, [user]);

  useEffect(() => {
    dispatch(fetchLeaveBalances());
  }, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Profile update:', formData);
    setIsEditing(false);
  };

  if (status === 'loading' || !user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="container">
      <h2 className="mb-4" style={{ color: '#184C55' }}>Profile</h2>

      <div className="row">
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body text-center">
              <div className="mb-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto" 
                     style={{ width: '100px', height: '100px', backgroundColor: '#184C55', color: '#FFFFFF' }}>
                  <FaUser size={40} />
                </div>
              </div>
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <button type="submit" className="btn me-2" style={{ backgroundColor: '#184C55', color: '#FFFFFF' }} disabled>Save</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                </form>
              ) : (
                <>
                  <h4>{`${user.firstName} ${user.lastName}`}</h4>
                  <p className="text-muted">{user.position}</p>
                  <button 
                    className="btn" 
                    onClick={() => setIsEditing(true)}
                    style={{ backgroundColor: '#184C55', color: '#FFFFFF' }}
                  >
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3" style={{ color: '#184C55' }}>Contact Information</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <FaEnvelope className="me-2" style={{ color: '#184C55' }} />
                  {user.email}
                </li>
                <li className="mb-2">
                  <FaPhone className="me-2" style={{ color: '#184C55' }} />
                  (Not Provided)
                </li>
                <li className="mb-2">
                  <FaBuilding className="me-2" style={{ color: '#184C55' }} />
                  {user.department}
                </li>
                <li>
                  <FaCalendarAlt className="me-2" style={{ color: '#184C55' }} />
                  Joined: (Not Provided)
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4" style={{ color: '#184C55' }}>Leave Statistics</h5>
              
              {fetchBalancesStatus === 'loading' && (
                <div className="text-center py-4">
                  <div className="spinner-border" style={{ color: '#184C55' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
              
              {fetchBalancesError && (
                <div className="alert alert-danger">
                  Error loading leave balances: {fetchBalancesError}
                </div>
              )}
              
              {fetchBalancesStatus === 'succeeded' && (
                <div className="row">
                  {balances.map((balance) => (
                    <div key={balance.leaveType} className="col-md-6 mb-4">
                      <div className="card" style={{ borderLeft: `4px solid ${balance.colorCode}` }}>
                        <div className="card-body">
                          <h6 className="card-title">{balance.name}</h6>
                          <div className="progress mb-2" style={{height: '10px'}}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{ 
                                width: `${((balance.daysAllowed - balance.daysAvailable) / balance.daysAllowed) * 100}%`,
                                backgroundColor: balance.colorCode
                              }}
                              aria-valuenow={balance.daysAllowed - balance.daysAvailable}
                              aria-valuemin={0}
                              aria-valuemax={balance.daysAllowed}
                            />
                          </div>
                          <div className="d-flex justify-content-between">
                            <small>Used: {balance.daysAllowed - balance.daysAvailable} days</small>
                            <small>Remaining: {balance.daysAvailable} days</small>
                          </div>
                          <small className="text-muted">Total: {balance.daysAllowed} days</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 