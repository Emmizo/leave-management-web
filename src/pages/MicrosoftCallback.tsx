import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../context/store';
import { loginSuccess } from '../context/authSlice';
import { toast } from 'react-toastify';
import api from '../services/api';
import { AxiosError } from 'axios';

const MicrosoftCallback = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleMicrosoftCallback = async () => {
      try {
        // 1. Get the authorization code from URL parameters
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        console.log('Microsoft callback params:', { code, error, errorDescription });

        // 2. Check if a 'code' exists
        if (code) {
          console.log('Sending code to backend:', code);

          // 3. Send the authorization code to backend
          const response = await api.post('/auth/microsoft/callback', { code });
          console.log('Backend callback response:', response.data);
          
          const { token } = response.data;
          
          // Store JWT token
          localStorage.setItem('authToken', token);
          
          // Update Redux state with token
          dispatch(loginSuccess({ token }));
          
          toast.success('Successfully logged in with Microsoft');
          navigate('/dashboard');
        } else if (error) {
          const errorMsg = errorDescription || 'Microsoft login failed';
          console.error('Microsoft OAuth error:', error, errorDescription);
          setErrorMessage(errorMsg);
          toast.error(errorMsg);
          setTimeout(() => navigate('/login'), 3000);
        } else {
          const errorMsg = 'Login failed: No authentication data received';
          console.error(errorMsg);
          setErrorMessage(errorMsg);
          toast.error(errorMsg);
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        const error = err as AxiosError<{ message: string }>;
        const errorMsg = error.response?.data?.message || 'Failed to complete login process';
        console.error('Backend login failed during callback:', error.response?.data || error);
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
        setTimeout(() => navigate('/login'), 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleMicrosoftCallback();
  }, [dispatch, location, navigate]);

  return (
    <div className="min-h-screen d-flex align-items-center justify-content-center">
      <div className="text-center">
        {isProcessing ? (
          <>
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4>Completing Microsoft Sign In...</h4>
            <p className="text-muted">Please wait while we process your login.</p>
          </>
        ) : errorMessage ? (
          <>
            <div className="text-danger mb-3">
              <i className="fas fa-exclamation-circle fa-3x"></i>
            </div>
            <h4 className="text-danger">Login Failed</h4>
            <p className="text-muted">{errorMessage}</p>
            <p className="text-muted">Redirecting to login page...</p>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default MicrosoftCallback; 