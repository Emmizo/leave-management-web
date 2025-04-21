import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaHistory, FaUser, FaSignOutAlt, FaBars, FaUserCircle } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../context/authSlice';
import { AppDispatch, RootState } from '../../context/store';
import './MainLayout.css';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  // Check if user is admin or HR
  const isAdminOrHR = user?.user?.role === 'ADMIN' || user?.user?.role === 'HR_MANAGER';

  // Base menu items that all users can see
  const baseMenuItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/leave-application', icon: <FaCalendarAlt />, label: 'Apply Leave' },
    { path: '/leave-history', icon: <FaHistory />, label: 'Leave History' },
    { path: '/team-calendar', icon: <FaCalendarAlt />, label: 'Team Calendar' },
    { path: '/profile', icon: <FaUser />, label: 'Profile' },
  ];

  // Admin/HR only menu items
  const adminMenuItems = [
    { path: '/leave-policies', icon: <FaCalendarAlt />, label: 'Manage Leave Policies' },
  ];

  // Combine menu items based on user role
  const menuItems = isAdminOrHR 
    ? [...baseMenuItems, ...adminMenuItems] 
    : baseMenuItems;

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div 
        className={`text-white sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} 
        style={{ 
          width: sidebarOpen ? '250px' : '70px', 
          minHeight: '100vh', 
          transition: 'all 0.3s',
          backgroundColor: '#184C55'
        }}
      >
        <div className="p-3 d-flex justify-content-between align-items-center">
          {sidebarOpen && <h5 className="mb-0">Africa HR</h5>}
          <button 
            className="btn btn-link text-white" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ color: '#FFFFFF' }}
          >
            <FaBars />
          </button>
        </div>
        <ul className="nav flex-column flex-grow-1">
          {menuItems.map((item) => (
            <li className="nav-item" key={item.path}>
              <Link
                to={item.path}
                className={`nav-link d-flex align-items-center sidebar-link ${
                  location.pathname === item.path 
                    ? 'active' 
                    : ''
                }`}
                style={{
                  color: '#FFFFFF',
                  backgroundColor: location.pathname === item.path 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'transparent'
                }}
              >
                <span className="me-2">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
          <li className="nav-item mt-auto mb-3">
            <button
              className="nav-link d-flex align-items-center w-100 border-0 sidebar-link"
              onClick={handleLogout}
              style={{
                color: '#FFFFFF',
                backgroundColor: 'transparent'
              }}
            >
              <span className="me-2"><FaSignOutAlt /></span>
              {sidebarOpen && <span>Logout</span>}
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1">
        {/* Global Header */}
        <div className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center">
          <div>
            <h2 className="mb-0" style={{ color: '#184C55' }}>
              {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="d-flex align-items-center">
            <div className="text-end me-3">
              <span className="fw-bold d-block">
                {`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
              </span>
              <small className="text-muted">{user?.position || 'Position'}</small>
            </div>
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt="Profile" 
                className="rounded-circle" 
                style={{ width: '45px', height: '45px', objectFit: 'cover', border: '2px solid #184C55' }}
              />
            ) : (
              <FaUserCircle size={45} style={{ color: '#184C55' }} />
            )}
          </div>
        </div>
        <div className="p-4 bg-light" style={{minHeight: 'calc(100vh - 76px)'}}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout; 