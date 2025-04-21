import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaCalendarAlt, FaEdit, FaSave, FaTimes, FaCamera } from 'react-icons/fa';
import { RootState, AppDispatch } from '../context/store';
import { fetchLeaveBalances } from '../context/leaveSlice';
import { toast } from 'react-toastify';

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, status } = useSelector((state: RootState) => state.auth);
  const { balances, fetchBalancesStatus, fetchBalancesError } = useSelector((state: RootState) => state.leaves);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    profilePicture: '',
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '(Not Provided)',
        department: user.department || '',
        position: user.position || '',
        profilePicture: user.profilePicture || '',
      });
      setPreviewImage(user.profilePicture || null);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setFormData(prev => ({
          ...prev,
          profilePicture: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would dispatch an action to update the profile
    console.log('Profile update:', formData);
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '(Not Provided)',
        department: user.department || '',
        position: user.position || '',
        profilePicture: user.profilePicture || '',
      });
      setPreviewImage(user.profilePicture || null);
    }
    setIsEditing(true);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (status === 'loading' || !user) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border" style={{ color: '#184C55' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">

      <div className="row">
        <div className="col-md-4">
          <div className="card mb-4 shadow-sm">
            <div className="card-body text-center">
              <div className="mb-3 position-relative">
                {previewImage ? (
                  <div className="position-relative">
                    <img 
                      src={previewImage} 
                      alt="Profile" 
                      className="rounded-circle mx-auto" 
                      style={{ width: '120px', height: '120px', objectFit: 'cover', border: '3px solid #184C55' }}
                    />
                    {isEditing && (
                      <button 
                        className="btn btn-sm position-absolute" 
                        style={{ 
                          bottom: '0', 
                          right: '50%', 
                          transform: 'translateX(50%)',
                          backgroundColor: '#184C55',
                          color: 'white',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={triggerFileInput}
                      >
                        <FaCamera size={14} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto" 
                       style={{ width: '120px', height: '120px', backgroundColor: '#184C55', color: '#FFFFFF', border: '3px solid #184C55' }}>
                    <FaUser size={50} />
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageChange} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
              </div>
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="firstName" className="form-label fw-medium" style={{ color: '#184C55' }}>First Name</label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ backgroundColor: '#f8f9fa', borderColor: '#184C55' }}>
                        <FaUser style={{ color: '#184C55' }} />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="lastName" className="form-label fw-medium" style={{ color: '#184C55' }}>Last Name</label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ backgroundColor: '#f8f9fa', borderColor: '#184C55' }}>
                        <FaUser style={{ color: '#184C55' }} />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-medium" style={{ color: '#184C55' }}>Email</label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ backgroundColor: '#f8f9fa', borderColor: '#184C55' }}>
                        <FaEnvelope style={{ color: '#184C55' }} />
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label fw-medium" style={{ color: '#184C55' }}>Phone</label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ backgroundColor: '#f8f9fa', borderColor: '#184C55' }}>
                        <FaPhone style={{ color: '#184C55' }} />
                      </span>
                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="department" className="form-label fw-medium" style={{ color: '#184C55' }}>Department</label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ backgroundColor: '#f8f9fa', borderColor: '#184C55' }}>
                        <FaBuilding style={{ color: '#184C55' }} />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="position" className="form-label fw-medium" style={{ color: '#184C55' }}>Position</label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ backgroundColor: '#f8f9fa', borderColor: '#184C55' }}>
                        <FaUser style={{ color: '#184C55' }} />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="d-flex justify-content-center gap-2 mt-4">
                    <button type="submit" className="btn px-4" style={{ backgroundColor: '#184C55', color: '#FFFFFF' }}>
                      <FaSave className="me-1" /> Save
                    </button>
                    <button type="button" className="btn btn-secondary px-4" onClick={() => setIsEditing(false)}>
                      <FaTimes className="me-1" /> Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h4 className="mb-1">{`${formData.firstName} ${formData.lastName}`}</h4>
                  <p className="text-muted mb-3">{formData.position}</p>
                  <button 
                    className="btn px-4" 
                    onClick={handleEdit}
                    style={{ backgroundColor: '#184C55', color: '#FFFFFF' }}
                  >
                    <FaEdit className="me-1" /> Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3" style={{ color: '#184C55' }}>Contact Information</h5>
              <ul className="list-unstyled">
                <li className="mb-3 d-flex align-items-center">
                  <div className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                       style={{ width: '36px', height: '36px', backgroundColor: '#f8f9fa', color: '#184C55' }}>
                    <FaEnvelope />
                  </div>
                  <div>
                    <small className="text-muted d-block">Email</small>
                    <span>{formData.email}</span>
                  </div>
                </li>
                <li className="mb-3 d-flex align-items-center">
                  <div className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                       style={{ width: '36px', height: '36px', backgroundColor: '#f8f9fa', color: '#184C55' }}>
                    <FaPhone />
                  </div>
                  <div>
                    <small className="text-muted d-block">Phone</small>
                    <span>{formData.phone}</span>
                  </div>
                </li>
                <li className="mb-3 d-flex align-items-center">
                  <div className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                       style={{ width: '36px', height: '36px', backgroundColor: '#f8f9fa', color: '#184C55' }}>
                    <FaBuilding />
                  </div>
                  <div>
                    <small className="text-muted d-block">Department</small>
                    <span>{formData.department}</span>
                  </div>
                </li>
                <li className="d-flex align-items-center">
                  <div className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                       style={{ width: '36px', height: '36px', backgroundColor: '#f8f9fa', color: '#184C55' }}>
                    <FaCalendarAlt />
                  </div>
                  <div>
                    <small className="text-muted d-block">Joined</small>
                    <span>(Not Provided)</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card shadow-sm">
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