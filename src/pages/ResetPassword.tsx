import { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../context/store';
import { resetPassword } from '../context/passwordResetSlice';
import { FaLock } from 'react-icons/fa';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status, error } = useSelector((state: RootState) => state.passwordReset);

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (formData.newPassword.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (!token) {
      setValidationError('Invalid or expired reset token');
      return;
    }

    try {
      await dispatch(resetPassword({ token, newPassword: formData.newPassword })).unwrap();
      // Redirect to login after successful password reset
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Failed to reset password:', err);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Card className="shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-flex mb-3">
              <FaLock size={24} className="text-primary" />
            </div>
            <h4 className="fw-bold mb-1" style={{ color: '#184C55' }}>Reset Password</h4>
            <p className="text-muted">Enter your new password</p>
          </div>

          {status === 'failed' && error && (
            <Alert variant="danger" className="mb-4">
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
            </Alert>
          )}
          {validationError && (
            <Alert variant="danger" className="mb-4">
              <i className="fas fa-exclamation-circle me-2"></i>
              {validationError}
            </Alert>
          )}
          {status === 'succeeded' && (
            <Alert variant="success" className="mb-4">
              <i className="fas fa-check-circle me-2"></i>
              Password reset successful! Redirecting to login...
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="newPassword">
              <Form.Label className="fw-medium" style={{ color: '#184C55' }}>
                New Password <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
                required
                className="form-control-lg"
                style={{ borderColor: '#184C55' }}
              />
              <Form.Text className="text-muted">
                Password must be at least 8 characters long
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4" controlId="confirmPassword">
              <Form.Label className="fw-medium" style={{ color: '#184C55' }}>
                Confirm Password <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                required
                className="form-control-lg"
                style={{ borderColor: '#184C55' }}
              />
            </Form.Group>

            <Button
              type="submit"
              className="w-100 mb-3"
              size="lg"
              style={{ 
                backgroundColor: '#184C55', 
                borderColor: '#184C55' 
              }}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>

            <div className="text-center">
              <Link to="/login" className="text-decoration-none">
                <i className="fas fa-arrow-left me-2"></i>
                Back to Login
              </Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ResetPassword; 