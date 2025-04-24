import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { RootState, AppDispatch } from '../context/store';
import { requestPasswordReset, resetState } from '../context/passwordResetSlice';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status, error, message } = useSelector((state: RootState) => state.passwordReset);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      dispatch(resetState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (status === 'succeeded' && message) {
      toast.success(message);
      navigate('/login');
    } else if (status === 'failed' && error) {
      toast.error(error);
    }
  }, [status, error, message, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);

    if (!email) {
      setEmailError('Please enter your email address');
      return;
    }

    if (!email.toLowerCase().endsWith('@ist.com')) {
      setEmailError('Please enter a valid IST email address @ist.com');
      return;
    }

    await dispatch(requestPasswordReset(email));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError(null);
    }
  };

  return (
    <div className="min-h-screen d-flex flex-column align-items-center justify-content-center bg-white">
      <div className="card shadow-sm" style={{ width: '400px', border: '1px solid #eee' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h2 className="fs-3 fw-bold" style={{ color: '#184C55' }}>Forgot Password</h2>
            <p className="text-muted">Enter your email to reset your password</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 d-flex align-items-center" role="alert">
              <i className="fas fa-exclamation-circle me-2"></i>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="email" className="form-label fw-medium" style={{ color: '#184C55' }}>
                Email address
              </label>
              <div className="input-group has-validation">
                <span className="input-group-text" style={{ backgroundColor: '#f8f9fa', borderColor: emailError ? 'var(--bs-danger)' : '#184C55' }}>
                  <FaEnvelope style={{ color: '#184C55' }} />
                </span>
                <input
                  type="email"
                  className={`form-control form-control-lg ${emailError ? 'is-invalid' : ''}`}
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email"
                  required
                  aria-describedby="emailHelp emailFeedback"
                  style={{ borderColor: emailError ? 'var(--bs-danger)' : '#184C55', borderRadius: '0 8px 8px 0' }}
                />
                {emailError && (
                  <div id="emailFeedback" className="invalid-feedback w-100">
                    {emailError}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-lg w-100 mb-3"
              disabled={status === 'loading'}
              style={{ 
                backgroundColor: '#184C55',
                color: '#FFFFFF',
                borderRadius: '8px'
              }}
            >
              {status === 'loading' ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>

            <div className="text-center">
              <Link 
                to="/login" 
                className="text-decoration-none d-inline-flex align-items-center"
                style={{ color: '#184C55' }}
              >
                <FaArrowLeft className="me-2" />
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 