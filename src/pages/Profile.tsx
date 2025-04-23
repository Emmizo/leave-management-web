import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaCalendarAlt, FaEdit, FaSave, FaTimes, FaPencilAlt } from 'react-icons/fa';
import { RootState, AppDispatch } from '../context/store';
import { fetchLeaveBalances } from '../context/leaveSlice';
import { updateProfile, updateProfilePicture } from '../context/authSlice';
import { toast } from 'react-toastify';
import ImageCropperModal from '../components/profile/ImageCropperModal';

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, status } = useSelector((state: RootState) => state.auth);
  const { balances, fetchBalancesStatus, fetchBalancesError } = useSelector((state: RootState) => state.leaves);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  // State for cropper modal
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [showCropperModal, setShowCropperModal] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.user?.username || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '(Not Provided)',
        department: user.department || '',
        position: user.position || '',
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

  // Modified to open the cropper modal
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setShowCropperModal(true);
      };
      reader.readAsDataURL(file);
      // Reset the file input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; 
      }
    }
  };

  // Function to handle the cropped image blob
  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setIsUploadingPicture(true);
    try {
      const formData = new FormData();
      // Append the blob directly, giving it a filename
      formData.append('profilePicture', croppedImageBlob, 'profile_picture.jpg'); 

      await dispatch(updateProfilePicture(formData)).unwrap();
      toast.success('Profile picture updated successfully!');

      // Update preview with a temporary URL from the blob
      setPreviewImage(URL.createObjectURL(croppedImageBlob));
      
      // Close the modal (handled within the modal itself now)
      // setShowCropperModal(false);
      // setImageToCrop(null);

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile picture');
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile(formData)).unwrap();
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  const handleEdit = () => {
    if (user) {
      setFormData({
        username: user.user?.username || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '(Not Provided)',
        department: user.department || '',
        position: user.position || '',
      });
      setPreviewImage(user.profilePicture || null);
    }
    setIsEditing(true);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (status === 'loading' && !user) { // Added check for !user to avoid flicker
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
                    <div
                      className="position-absolute d-flex align-items-center justify-content-center"
                      style={{ 
                        bottom: '5px',  
                        right: '5px',   
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#184C55',
                        borderRadius: '50%',
                        color: 'white',
                        cursor: 'pointer',
                        zIndex: 10, 
                        border: '2px solid white'
                      }}
                      onClick={triggerFileInput}
                    >
                      {isUploadingPicture ? (
                        <div className="spinner-border spinner-border-sm text-light" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        <FaPencilAlt size={16} />
                      )}
                    </div>
                  </div>
                ) : (
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center mx-auto position-relative"
                    style={{ width: '120px', height: '120px', backgroundColor: '#184C55', color: '#FFFFFF', border: '3px solid #184C55' }}
                  >
                    <FaUser size={50} />
                    <div 
                      className="position-absolute d-flex align-items-center justify-content-center" 
                      style={{ 
                        bottom: '5px',  
                        right: '5px',   
                        width: '32px', 
                        height: '32px', 
                        backgroundColor: '#184C55', 
                        borderRadius: '50%', 
                        color: 'white',  
                        cursor: 'pointer',
                        zIndex: 10, 
                        border: '2px solid white' 
                      }}
                      onClick={triggerFileInput}
                    >
                      {isUploadingPicture ? ( // Show spinner here too if needed during upload
                        <div className="spinner-border spinner-border-sm text-light" role="status"> 
                          <span className="visually-hidden">Loading...</span>
                        </div>
                       ) : (
                        <FaPencilAlt size={16} />
                       )}
                    </div>
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
                    <label htmlFor="username" className="form-label fw-medium" style={{ color: '#184C55' }}>Username</label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ backgroundColor: '#f8f9fa', borderColor: '#184C55' }}>
                        <FaUser style={{ color: '#184C55' }} />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
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
                    <FaUser />
                  </div>
                  <div>
                    <small className="text-muted d-block">Username</small>
                    <span>{formData.username}</span>
                  </div>
                </li>
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

      {/* Render the Cropper Modal */}
      <ImageCropperModal
        isOpen={showCropperModal}
        onClose={() => {
          setShowCropperModal(false);
          setImageToCrop(null); // Clear the image source when closing
        }}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};

export default Profile; 