import { useState } from 'react';
import { Form } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface PasswordInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
}

const PasswordInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Form.Group className="mb-3">
      <Form.Label className="fw-medium" style={{ color: '#184C55' }}>
        {label} {required && <span className="text-danger">*</span>}
      </Form.Label>
      <div className="position-relative">
        <Form.Control
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="form-control-lg border-2 pe-5"
          style={{ borderColor: error ? 'var(--bs-danger)' : '#184C55' }}
        />
        <button
          type="button"
          className="position-absolute top-50 end-0 translate-middle-y me-3 border-0 bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          style={{ color: '#184C55' }}
        >
          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </button>
      </div>
      {error && (
        <Form.Control.Feedback type="invalid" className="d-block">
          {error}
        </Form.Control.Feedback>
      )}
      {helpText && (
        <Form.Text className="text-muted">
          {helpText}
        </Form.Text>
      )}
    </Form.Group>
  );
};

export default PasswordInput; 