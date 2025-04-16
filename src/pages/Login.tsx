import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMicrosoft } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../context/store';
import { loginUser } from '../context/authSlice';

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { status, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ username, password }));
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleMicrosoftLogin = () => {
    // TODO: Implement Microsoft Authenticator integration
    console.log('Microsoft login clicked');
    // Example: dispatch(loginWithMicrosoft());
  };

  return (
    <div>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={status === 'loading'}
            placeholder="Enter your username"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={status === 'loading'}
          />
        </div>
        <div className="d-grid gap-2">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Signing In...' : 'Sign In'}
          </button>
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={handleMicrosoftLogin}
            disabled={status === 'loading'}
          >
            <FaMicrosoft className="me-2" />
            Sign in with Microsoft
          </button>
        </div>
      </form>
      <div className="text-center mt-3">
        <a href="#" className="text-decoration-none">Forgot password?</a>
      </div>
    </div>
  );
};

export default Login; 