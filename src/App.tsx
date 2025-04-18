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
import LeaveHistory from './pages/LeaveHistory';
import TeamCalendar from './pages/TeamCalendar';
import Profile from './pages/Profile';
import Unauthorized from './pages/Unauthorized'; // Import Unauthorized page
import Holidays from './pages/Holidays';
import MicrosoftCallback from './pages/MicrosoftCallback';

// Redux
import { RootState, AppDispatch } from './context/store';
import { fetchUserProfile, AuthState } from './context/authSlice';

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

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, status, user } = useSelector((state: RootState): AuthState => state.auth);

  // Fetch user profile only when authenticated but user data is missing
  useEffect(() => {
    // If we are marked as authenticated in the state, but don't have user data yet,
    // and we are not already in a loading state from a previous fetch attempt.
    if (isAuthenticated && !user && status !== 'loading') {
      dispatch(fetchUserProfile());
    }
    // NOTE: We don't need to check localStorage directly here anymore.
    // The loginUser action sets the token AND isAuthenticated=true.
    // If the user reloads, the initial state loads the token, 
    // then this effect runs when isAuthenticated becomes true after profile fetch.
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
          <Route path="leave-history" element={<LeaveHistory />} />
          <Route path="team-calendar" element={<TeamCalendar />} />
          <Route path="profile" element={<Profile />} />
          <Route path="holidays" element={<Holidays />} />
          {/* Add other nested routes here */}
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
