import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

// Layout Components
import { MainLayout, AuthLayout } from './components/layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LeaveApplication from './pages/LeaveApplication';
import LeaveApproval from './pages/LeaveApproval';
import LeaveHistory from './pages/LeaveHistory';
import TeamCalendar from './pages/TeamCalendar';
import Profile from './pages/Profile';
import Unauthorized from './pages/Unauthorized'; // Import Unauthorized page
import Holidays from './pages/Holidays';
import MicrosoftCallback from './pages/MicrosoftCallback';
import LeavePolicies from './pages/LeavePolicies';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ManageEmployees from './pages/ManageEmployees'; // Import the new page
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Redux
import { RootState, AppDispatch } from './context/store';
import { fetchUserProfile, AuthState } from './context/authSlice';

// Notification Service
import { initializeNotifications } from './services/notificationService';

// Helper component for protected routes - Now only checks authentication
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, status } = useSelector((state: RootState): AuthState => state.auth);

  // Still checking auth?
  if (status === 'loading' && !isAuthenticated && localStorage.getItem('authToken')) {
    return <div className="min-vh-100 d-flex justify-content-center align-items-center">Loading...</div>;
  }

  // Not authenticated?
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated (role check removed)
  return <>{children}</>;
};

// Helper component for Admin/HR protected routes
interface AdminHrProtectedRouteProps {
  children: React.ReactNode;
}

const AdminHrProtectedRoute: React.FC<AdminHrProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, status, user } = useSelector((state: RootState): AuthState => state.auth);

  // Still checking auth?
  if (status === 'loading' && !isAuthenticated && localStorage.getItem('authToken')) {
    return <div className="min-vh-100 d-flex justify-content-center align-items-center">Loading...</div>;
  }

  // Not authenticated?
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check for Admin or HR role
  const isAdminOrHR = user?.user?.role === 'ADMIN' || user?.user?.role === 'HR_MANAGER';
  if (!isAdminOrHR) {
    // Redirect to an unauthorized page or dashboard
    return <Navigate to="/unauthorized" replace />; 
  }

  // Authenticated and authorized
  return <>{children}</>;
};

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, status, user } = useSelector((state: RootState): AuthState => state.auth);

  // Initialize notifications
  useEffect(() => {
    initializeNotifications();
  }, []);

  // Fetch user profile only when authenticated but user data is missing
  useEffect(() => {
    if (isAuthenticated && !user && status !== 'loading') {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, isAuthenticated, user, status]);

  // Show loading indicator only during the initial auth check triggered by stored token
  // This condition might need refinement depending on exact loading UX desired
  if (status === 'loading' && !isAuthenticated && localStorage.getItem('authToken')) {
    return <div className="min-vh-100 d-flex justify-content-center align-items-center">Loading...</div>;
  }

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Routes>
        {/* Public Auth Route */}
        <Route element={<AuthLayout />}>
          {/* Redirect logged-in users away from login */}
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
          <Route path="/microsoft-callback" element={<MicrosoftCallback />} />
          <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
          <Route path="/reset-password" element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/dashboard" />} />
        </Route>

        {/* Unauthorized Page Route */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Application Routes */}
        <Route
          path="/*" // Match all routes intended for the main layout
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Nested routes within MainLayout */}
          {/* Default route (e.g., /) */}
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="leave-application" element={<LeaveApplication />} />
          <Route path="leave-approval" element={<LeaveApproval />} />
          <Route path="leave-history" element={<LeaveHistory />} />
          <Route path="team-calendar" element={<TeamCalendar />} />
          <Route path="profile" element={<Profile />} />
          <Route path="holidays" element={<Holidays />} />
          <Route 
            path="leave-policies" 
            element={
              // Assuming all authenticated users can see policies
              // If not, wrap with AdminHrProtectedRoute instead
              <ProtectedRoute>
                <LeavePolicies />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="manage-employees" 
            element={
              <AdminHrProtectedRoute>
                <ManageEmployees />
              </AdminHrProtectedRoute>
            } 
          />
          <Route path="settings" element={<Settings />} />
          {/* Add other nested routes here */}
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
