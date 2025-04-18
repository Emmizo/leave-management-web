import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../context/store';
import { loginSuccess } from '../context/authSlice';
import { toast } from 'react-toastify';
import api from '../services/api';

const MicrosoftCallback = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Debug logs
    console.log('Full URL:', window.location.href);
    console.log('Location Hash:', location.hash);

    // Get tokens from URL fragment
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const idToken = hashParams.get('id_token');
    const error = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');

    if (idToken) {
      try {
        // Decode the JWT (id_token)
        const tokenParts = idToken.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        
        console.log('Microsoft user info:', payload); // Debug log
        
        // Extract relevant user information
        const microsoftUser = {
          email: payload.email,
          firstName: payload.given_name,
          lastName: payload.family_name,
          microsoftId: payload.oid, // Microsoft's unique user ID
          username: payload.preferred_username
        };

        // Send Microsoft user info to backend to get our JWT
        api.post('/auth/microsoft/login', microsoftUser)
          .then(response => {
            console.log('Backend response:', response.data); // Debug log
            const { token } = response.data;
            
            // Store your application's JWT
            localStorage.setItem('authToken', token);
            
            // Update Redux state
            dispatch(loginSuccess({ token }));
            
            toast.success('Successfully logged in with Microsoft');
            navigate('/dashboard');
          })
          .catch(error => {
            console.error('Backend login failed:', error);
            toast.error('Failed to complete login process');
            navigate('/login');
          });
      } catch (error) {
        console.error('Failed to process Microsoft login:', error);
        toast.error('Failed to process login information');
        navigate('/login');
      }
    } else if (error) {
      console.error('Microsoft OAuth error:', error, errorDescription);
      toast.error(errorDescription || 'Microsoft login failed');
      navigate('/login');
    } else {
      console.error('No ID token found in callback URL');
      toast.error('Login failed: No authentication data received');
      navigate('/login');
    }
  }, [dispatch, location, navigate]);

  return (
    <div className="min-h-screen d-flex align-items-center justify-content-center">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h4>Completing Microsoft Sign In...</h4>
        <p className="text-muted">Please wait while we process your login.</p>
      </div>
    </div>
  );
};

export default MicrosoftCallback; 