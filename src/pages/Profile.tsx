import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaCalendarAlt } from 'react-icons/fa';
import { RootState } from '../context/store';

const Profile = () => {
  const { user, status } = useSelector((state: RootState) => state.auth);

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

  const leaveStats = {
    annual: { total: 20, used: 20 - user.annualLeaveBalance, remaining: user.annualLeaveBalance },
    sick: { total: 10, used: 0, remaining: 10 },
    compassionate: { total: 5, used: 0, remaining: 5 },
    maternity: { total: 90, used: 0, remaining: 90 },
  };

  return (
    <div className="container">
      <h2 className="mb-4">Profile</h2>

      <div className="row">
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body text-center">
              <div className="mb-3">
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto" style={{ width: '100px', height: '100px' }}>
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
                  <button type="submit" className="btn btn-primary me-2" disabled>Save</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                </form>
              ) : (
                <>
                  <h4>{`${user.firstName} ${user.lastName}`}</h4>
                  <p className="text-muted">{user.position}</p>
                  <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
                </>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">Contact Information</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <FaEnvelope className="me-2 text-primary" />
                  {user.email}
                </li>
                <li className="mb-2">
                  <FaPhone className="me-2 text-primary" />
                  (Not Provided)
                </li>
                <li className="mb-2">
                  <FaBuilding className="me-2 text-primary" />
                  {user.department}
                </li>
                <li>
                  <FaCalendarAlt className="me-2 text-primary" />
                  Joined: (Not Provided)
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Leave Statistics</h5>
              <div className="row">
                {Object.entries(leaveStats).map(([type, stats]) => (
                  <div key={type} className="col-md-6 mb-4">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="card-title text-capitalize">{type} Leave</h6>
                        <div className="progress mb-2" style={{height: '10px'}}>
                          <div
                            className={`progress-bar ${stats.used > 0 ? 'bg-primary' : 'bg-success'}`}
                            role="progressbar"
                            style={{ width: `${(stats.used / (stats.total || 1)) * 100}%` }}
                            aria-valuenow={stats.used}
                            aria-valuemin={0}
                            aria-valuemax={stats.total}
                          />
                        </div>
                        <div className="d-flex justify-content-between">
                          <small>Used: {stats.used} days</small>
                          <small>Remaining: {stats.remaining} days</small>
                        </div>
                        <small className="text-muted">Total: {stats.total} days</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 