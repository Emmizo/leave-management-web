import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaHistory, FaUser, FaSignOutAlt, FaBars, FaTimes, FaKey, FaUsers, FaBell } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../context/authSlice';
import { AppDispatch, RootState } from '../../context/store';
import ChangePasswordModal from '../dashboard/ChangePasswordModal';
import { Dropdown } from 'react-bootstrap';
import './MainLayout.css';
import { setNotificationCallback } from '../../services/notificationService';

interface MenuItem {
  path: string;
  icon: React.ReactNode;
  label: string;
}

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setSidebarOpen(width >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Set up notification callback
    setNotificationCallback((count: number) => {
      setNotificationCount(count);
    });
  }, []);

  // Check if user is admin or HR
  const isAdminOrHR = user?.user?.role === 'ADMIN' || user?.user?.role === 'HR_MANAGER';

  // Base menu items that all users can see
  const baseMenuItems: MenuItem[] = [
    { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/leave-application', icon: <FaCalendarAlt />, label: 'Apply Leave' },
    { path: '/leave-history', icon: <FaHistory />, label: 'Leave History' },
    { path: '/team-calendar', icon: <FaCalendarAlt />, label: 'Team Calendar' },
    { path: '/leave-policies', icon: <FaCalendarAlt />, label: 'Leave Policies' },
    { path: '/profile', icon: <FaUser />, label: 'Profile' },
  ];

  // Admin/HR only menu items
  const adminMenuItems: MenuItem[] = [
    { path: '/manage-employees', icon: <FaUsers />, label: 'Manage Employees' },
  ];

  // Combine menu items based on user role
  const menuItems = isAdminOrHR 
    ? [...baseMenuItems, ...adminMenuItems]
    : baseMenuItems;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Handle sidebar toggle
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar on mobile when clicking a link
  const handleMobileLinkClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Handle notification click
  const handleNotificationClick = () => {
    // Here you can add logic to mark notifications as read
  };

  return (
    <div className="d-flex flex-column flex-md-row min-vh-100">
      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark"
          style={{ opacity: 0.5, zIndex: 1040 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
        style={{
          width: sidebarOpen ? (isMobile ? '280px' : '250px') : '0px',
          minHeight: isMobile ? '100%' : '100vh',
          transition: 'all 0.3s',
          backgroundColor: '#184C55',
          position: isMobile ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 1050,
          overflowY: 'auto',
          transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
        }}
      >
        <div className="p-3 d-flex justify-content-between align-items-center border-bottom border-light">
          {sidebarOpen && (
            <>
              <h5 className="mb-0 text-white">Africa HR</h5>
              {isMobile && (
                <button
                  className="btn btn-link text-white p-0"
                  onClick={() => setSidebarOpen(false)}
                >
                  <FaTimes size={24} />
                </button>
              )}
            </>
          )}
        </div>

        <ul className="nav flex-column flex-grow-1 py-3">
          {menuItems.map((item) => (
            <li className="nav-item px-3 mb-2" key={item.path}>
              <Link
                to={item.path}
                className={`nav-link d-flex align-items-center rounded py-2 px-3 ${
                  location.pathname === item.path ? 'active' : ''
                }`}
                style={{
                  color: '#FFFFFF',
                  backgroundColor: location.pathname === item.path 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'transparent',
                  whiteSpace: 'nowrap'
                }}
                onClick={handleMobileLinkClick}
              >
                <span className="me-3">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
          <li className="nav-item px-3 mt-auto">
            <button
              className="nav-link d-flex align-items-center w-100 border-0 rounded py-2 px-3"
              onClick={handleLogout}
              style={{
                color: '#FFFFFF',
                backgroundColor: 'transparent',
                whiteSpace: 'nowrap'
              }}
            >
              <span className="me-3"><FaSignOutAlt /></span>
              {sidebarOpen && <span>Logout</span>}
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 min-vh-100 d-flex flex-column">
        {/* Global Header */}
        <div className="bg-white border-bottom px-3 px-md-4 py-2 py-md-3 d-flex justify-content-between align-items-center sticky-top">
          <div className="d-flex align-items-center">
            <button
              className="btn btn-link text-dark d-flex p-1 me-2"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <FaBars size={24} />
            </button>
            <h2 className="mb-0 h3 h2-md" style={{ color: '#184C55' }}>
              {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="d-flex align-items-center">
            <div className="text-end me-2 me-md-3 d-none d-sm-block">
              <span className="fw-bold d-block">
                {`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
              </span>
              <small className="text-muted">{user?.position || 'Position'}</small>
            </div>
            <div className="position-relative me-3">
              <button
                className="btn btn-link text-dark p-0 position-relative"
                onClick={handleNotificationClick}
                style={{ fontSize: '1.25rem' }}
              >
                <FaBell />
                {notificationCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{ 
                      fontSize: '0.6rem',
                      border: '2px solid white',
                      padding: '4px 6px'
                    }}
                  >
                    {notificationCount}
                  </span>
                )}
              </button>
            </div>
            <Dropdown align="end">
              <Dropdown.Toggle 
                variant="link" 
                id="dropdown-profile" 
                className="p-0 border-0 shadow-none d-flex align-items-center no-caret position-relative"
              >
                {user?.profilePicture ? (
                  <div className="position-relative">
                    <img 
                      src={user.profilePicture} 
                      alt="Profile" 
                      className="rounded-circle" 
                      style={{ 
                        width: isMobile ? '35px' : '45px', 
                        height: isMobile ? '35px' : '45px', 
                        objectFit: 'cover', 
                        border: '2px solid #184C55',
                      }}
                    />
                  </div>
                ) : (
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center position-relative"
                    style={{ 
                      width: isMobile ? '35px' : '45px', 
                      height: isMobile ? '35px' : '45px', 
                      backgroundColor: '#184C55',
                      color: 'white'
                    }}
                  >
                    <FaUser size={isMobile ? 16 : 20} />
                  </div>
                )}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setShowChangePassword(true)}>
                  <FaKey className="me-2" /> Change Password
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" /> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-3 p-md-4 bg-light flex-grow-1">
          <Outlet />
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </div>
  );
};

export default MainLayout; 