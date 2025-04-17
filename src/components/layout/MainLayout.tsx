import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaHistory, FaUser, FaSignOutAlt, FaBars } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { logout } from '../../context/authSlice';
import { AppDispatch } from '../../context/store';
import './MainLayout.css';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const menuItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/leave-application', icon: <FaCalendarAlt />, label: 'Apply Leave' },
    { path: '/leave-history', icon: <FaHistory />, label: 'Leave History' },
    { path: '/team-calendar', icon: <FaCalendarAlt />, label: 'Team Calendar' },
    { path: '/profile', icon: <FaUser />, label: 'Profile' },
  ];

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
        <div className="p-4 bg-light" style={{minHeight: '100vh'}}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout; 