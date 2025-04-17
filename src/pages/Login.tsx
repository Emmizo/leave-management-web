import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMicrosoft } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../context/store';
import { loginUser } from '../context/authSlice';

interface LoginFormData {
  username: string;
  password: string;
}

const initialFormData: LoginFormData = {
  username: '',
  password: ''
};

const Login = () => {
  // Hooks
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  // Redux state
  const { status, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Local state
  const [formData, setFormData] = useState<LoginFormData>(initialFormData);
  const { username, password } = formData;

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Event handlers
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    
    try {
      await dispatch(loginUser({ username, password })).unwrap();
    } catch (err) {
      // Error is handled by Redux state
      console.error('Login failed:', err);
    }
  };

  const handleMicrosoftLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/microsoft`;
  };

  const isLoading = status === 'loading';

  return (
    <div className="min-h-screen d-flex flex-column align-items-center justify-content-center bg-white">
     
      
      {/* Login Card */}
      <div className="card shadow-sm" style={{ width: '400px', border: '1px solid #eee' }}>
        <div className="card-body p-4">
          {/* Card Header */}
          <div className="text-center mb-4">
            <h2 className="fs-3 fw-bold text-dark">Welcome Back</h2>
            <p className="text-muted mb-0">Sign in to your account</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger py-2 d-flex align-items-center" role="alert">
              <i className="fas fa-exclamation-circle me-2"></i>
              <div>{error}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="mt-4">
            {/* Username Field */}
            <div className="mb-3">
              <label htmlFor="username" className="form-label text-dark">
                Username
              </label>
              <input
                type="text"
                className="form-control form-control-lg py-2"
                id="username"
                name="username"
                value={username}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                placeholder="Enter your username"
                style={{ borderRadius: '8px' }}
              />
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <label htmlFor="password" className="form-label text-dark">
                Password
              </label>
              <input
                type="password"
                className="form-control form-control-lg py-2"
                id="password"
                name="password"
                value={password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                placeholder="Enter your password"
                style={{ borderRadius: '8px' }}
              />
            </div>

            {/* Action Buttons */}
            <div className="d-grid gap-3">
              {/* Sign In Button */}
              <button
                type="submit"
                className="btn btn-lg py-2"
                disabled={isLoading}
                style={{ 
                  backgroundColor: '#184C55',
                  color: '#FFFFFF',
                  borderRadius: '8px'
                }}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Microsoft Login Button */}
              <button
                type="button"
                className="btn btn-lg btn-outline-secondary"
                onClick={handleMicrosoftLogin}
                disabled={isLoading}
                style={{ 
                  borderColor: '#184C55',
                  color: '#184C55',
                  borderRadius: '8px'
                }}
              >
                <FaMicrosoft className="me-2" />
                Sign in with Microsoft
              </button>
            </div>
          </form>

          {/* Forgot Password Link */}
          <div className="text-center mt-3">
            <a 
              href="#" 
              className="text-decoration-none" 
              style={{ color: '#184C55' }}
            >
              Forgot password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 