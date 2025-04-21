import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../context/store';
import { createLeave } from '../context/leaveSlice';
import { Alert, Card, Form, Button, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface LeaveFormData {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  leaveDuration: 'FULL_DAY' | 'HALF_DAY';
  numberOfDays: number;
}

const initialFormData: LeaveFormData = {
  leaveType: '',
  startDate: '',
  endDate: '',
  reason: '',
  leaveDuration: 'FULL_DAY',
  numberOfDays: 0
};

const LeaveApplication = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status, error } = useSelector((state: RootState) => state.leaves);
  const { user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState<LeaveFormData>(initialFormData);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const calculateNumberOfDays = (startDate: string, endDate: string, duration: 'FULL_DAY' | 'HALF_DAY') => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // If dates are the same, return 1 for full day or 0.5 for half day
    if (start.toDateString() === end.toDateString()) {
      return duration === 'HALF_DAY' ? 0.5 : 1;
    }
    
    // Calculate the difference in days including both start and end dates
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Add 1 to include both start and end dates
    
    // Apply half day calculation only if specifically requested
    return duration === 'HALF_DAY' ? 0.5 : diffDays;
  };

  // Function to get minimum date based on leave type
  const getMinDate = (leaveType: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // For maternity leave, allow selecting today
    if (leaveType === 'MATERNITY') {
      return today;
    }
    
    // For sick leave and other types, allow selecting past dates (up to 30 days ago)
    if (leaveType === 'SICK' || leaveType === 'COMPASSIONATE') {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      return thirtyDaysAgo;
    }
    
    // For other leave types, default to today
    return today;
  };

  // Function to check if a date is a weekend
  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };

  // Function to filter out weekends from date picker
  const filterWeekends = (date: Date) => {
    // Allow today even if it's a weekend
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date.getTime() === today.getTime()) {
      return true;
    }
    
    // For other dates, filter out weekends
    return !isWeekend(date);
  };

  // Function to handle date changes
  const handleDateChange = (date: Date | null, field: 'startDate' | 'endDate') => {
    if (!date) return;
    
    // Format date as YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];
    
    // If start date is changed and leave type is MATERNITY, update end date
    if (field === 'startDate' && formData.leaveType === 'MATERNITY') {
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 89); // 89 days to make it exactly 90 days total
      
      setFormData(prev => ({
        ...prev,
        startDate: formattedDate,
        endDate: endDate.toISOString().split('T')[0]
      }));
      return;
    }
    
    // For all other cases, just update the changed field
    setFormData(prev => ({
      ...prev,
      [field]: formattedDate
    }));
  };

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const newNumberOfDays = calculateNumberOfDays(
        formData.startDate,
        formData.endDate,
        formData.leaveDuration
      );
      setFormData(prev => ({
        ...prev,
        numberOfDays: newNumberOfDays
      }));
    }
  }, [formData.startDate, formData.endDate, formData.leaveDuration]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // If leave type is changed to MATERNITY, automatically set end date to 90 days after start date
    if (name === 'leaveType' && value === 'MATERNITY' && formData.startDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 89); // 89 days to make it exactly 90 days total
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        endDate: endDate.toISOString().split('T')[0],
        leaveDuration: 'FULL_DAY' // Maternity leave is always full day
      }));
      return;
    }
    
    // If start date is changed and leave type is MATERNITY, update end date
    if (name === 'startDate' && formData.leaveType === 'MATERNITY' && value) {
      const startDate = new Date(value);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 89); // 89 days to make it exactly 90 days total
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        endDate: endDate.toISOString().split('T')[0]
      }));
      return;
    }
    
    // For all other cases, just update the changed field
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    // Clear any previous validation errors
    setValidationErrors({});

    try {
      setIsSubmitting(true);
      const formDataToSend = new FormData();
      
      // Create the leaveRequest object
      const leaveRequest = {
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        type: formData.leaveType,
        employeeId: user?.id || 0,
        leaveDuration: formData.leaveDuration,
        numberOfDays: formData.numberOfDays
      };

      // Append leaveRequest as a blob with application/json type
      formDataToSend.append('leaveRequest', new Blob([JSON.stringify(leaveRequest)], {
        type: 'application/json'
      }));

      // Append document if exists
      if (file) {
        formDataToSend.append('document', file);
      }

      await dispatch(createLeave(formDataToSend)).unwrap();
      
      // Show success message
      toast.success('Leave request submitted successfully!');
      
      // Reset form
      setFormData(initialFormData);
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('documents') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (err: unknown) {
      console.error('Failed to create leave:', err);
      
      // Handle validation errors from the backend
      if (err && typeof err === 'object' && 'validationErrors' in err) {
        const errorObj = err as { validationErrors: Record<string, string> };
        setValidationErrors(errorObj.validationErrors);
        toast.error('Please correct the validation errors below');
      } else if (err && typeof err === 'object' && 'message' in err) {
        const errorObj = err as { message: string };
        toast.error(errorObj.message || 'Failed to submit leave request. Please try again.');
      } else {
        toast.error('Failed to submit leave request. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to check if a field has a validation error
  const hasError = (fieldName: string) => {
    return validationErrors[fieldName] ? true : false;
  };

  // Function to get error message for a field
  const getErrorMessage = (fieldName: string) => {
    return validationErrors[fieldName] || '';
  };

  const isLoading = status === 'loading' || isSubmitting;

  return (
    <Card className="shadow-lg border-0 rounded-3">
      <Card.Header className="py-3" style={{ backgroundColor: '#184C55', color: 'white' }}>
        <h4 className="mb-0">Apply for Leave</h4>
      </Card.Header>
      <Card.Body className="p-4">
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit} className="leave-application-form">
          <fieldset disabled={isLoading}>
            <div className="mb-4">
              <h5 className="mb-3" style={{ color: '#184C55' }}>Leave Details</h5>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label htmlFor="leaveType" className="fw-medium" style={{ color: '#184C55' }}>Leave Type</Form.Label>
                  <Form.Select
                    id="leaveType"
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleInputChange}
                    required
                    isInvalid={hasError('type')}
                    className="form-select-lg border-2"
                    style={{ borderColor: hasError('type') ? 'var(--bs-danger)' : '#184C55' }}
                  >
                    <option value="">Select leave type</option>
                    <option value="PTO">Personal Time Off (PTO)</option>
                    <option value="SICK">Sick Leave</option>
                    <option value="COMPASSIONATE">Compassionate Leave</option>
                    <option value="MATERNITY">Maternity Leave</option>
                    <option value="UNPAID">Unpaid Leave</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {getErrorMessage('type')}
                  </Form.Control.Feedback>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label htmlFor="leaveDuration" className="fw-medium" style={{ color: '#184C55' }}>Leave Duration</Form.Label>
                  <Form.Select
                    id="leaveDuration"
                    name="leaveDuration"
                    value={formData.leaveDuration}
                    onChange={handleInputChange}
                    required
                    isInvalid={hasError('leaveDuration')}
                    className="form-select-lg border-2"
                    style={{ borderColor: hasError('leaveDuration') ? 'var(--bs-danger)' : '#184C55' }}
                  >
                    <option value="FULL_DAY">Full Day</option>
                    <option value="HALF_DAY">Half Day</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {getErrorMessage('leaveDuration')}
                  </Form.Control.Feedback>
                </Col>
              </Row>
            </div>

            <div className="mb-4">
              <h5 className="mb-3" style={{ color: '#184C55' }}>Date Selection</h5>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label htmlFor="startDate" className="fw-medium" style={{ color: '#184C55' }}>Start Date</Form.Label>
                  <div className={hasError('startDate') ? 'is-invalid' : ''}>
                    <DatePicker
                      selected={formData.startDate ? new Date(formData.startDate) : null}
                      onChange={(date) => handleDateChange(date, 'startDate')}
                      dateFormat="yyyy-MM-dd"
                      className={`form-control form-control-lg border-2 date-picker-input ${hasError('startDate') ? 'is-invalid' : ''}`}
                      placeholderText="Select start date"
                      minDate={getMinDate(formData.leaveType)}
                      filterDate={filterWeekends}
                      calendarClassName="custom-calendar"
                      wrapperClassName="w-100"
                    />
                  </div>
                  <Form.Control.Feedback type="invalid" style={{ display: hasError('startDate') ? 'block' : 'none' }}>
                    {getErrorMessage('startDate')}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    {formData.leaveType === 'SICK' || formData.leaveType === 'COMPASSIONATE' 
                      ? 'You can select past dates (up to 30 days ago) for retrospective applications'
                      : 'Weekends are not allowed (except today)'}
                  </Form.Text>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label htmlFor="endDate" className="fw-medium" style={{ color: '#184C55' }}>End Date</Form.Label>
                  <div className={hasError('endDate') ? 'is-invalid' : ''}>
                    <DatePicker
                      selected={formData.endDate ? new Date(formData.endDate) : null}
                      onChange={(date) => handleDateChange(date, 'endDate')}
                      dateFormat="yyyy-MM-dd"
                      className={`form-control form-control-lg border-2 date-picker-input ${hasError('endDate') ? 'is-invalid' : ''}`}
                      placeholderText="Select end date"
                      minDate={formData.startDate ? new Date(formData.startDate) : getMinDate(formData.leaveType)}
                      filterDate={filterWeekends}
                      calendarClassName="custom-calendar"
                      wrapperClassName="w-100"
                    />
                  </div>
                  <Form.Control.Feedback type="invalid" style={{ display: hasError('endDate') ? 'block' : 'none' }}>
                    {getErrorMessage('endDate')}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    {formData.leaveType === 'SICK' || formData.leaveType === 'COMPASSIONATE' 
                      ? 'You can select past dates (up to 30 days ago) for retrospective applications'
                      : 'Weekends are not allowed (except today)'}
                  </Form.Text>
                </Col>
              </Row>

              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label className="fw-medium" style={{ color: '#184C55' }}>Number of Days</Form.Label>
                  <div className="p-3 rounded border-2" style={{ borderColor: '#184C55', backgroundColor: 'rgba(24, 76, 85, 0.05)' }}>
                    <h3 className="mb-0 text-center" style={{ color: '#184C55' }}>{formData.numberOfDays}</h3>
                    <div className="text-center text-muted small">
                      {formData.leaveDuration === 'HALF_DAY' 
                        ? 'Half days are counted as 0.5 days'
                        : 'Full days are counted as 1 day each'}
                    </div>
                  </div>
                  {hasError('numberOfDays') && (
                    <div className="text-danger mt-1 small">{getErrorMessage('numberOfDays')}</div>
                  )}
                </Col>
              </Row>
            </div>

            <div className="mb-4">
              <h5 className="mb-3" style={{ color: '#184C55' }}>Reason for Leave</h5>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="reason" className="fw-medium" style={{ color: '#184C55' }}>Please provide details</Form.Label>
                <Form.Control
                  as="textarea"
                  id="reason"
                  name="reason"
                  rows={4}
                  value={formData.reason}
                  onChange={handleInputChange}
                  required
                  isInvalid={hasError('reason')}
                  placeholder="Please provide a detailed reason for your leave request..."
                  className="form-control-lg border-2"
                  style={{ borderColor: hasError('reason') ? 'var(--bs-danger)' : '#184C55' }}
                />
                <Form.Control.Feedback type="invalid">
                  {getErrorMessage('reason')}
                </Form.Control.Feedback>
              </Form.Group>
            </div>

            <div className="mb-4">
              <h5 className="mb-3" style={{ color: '#184C55' }}>Supporting Documents</h5>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="documents" className="fw-medium" style={{ color: '#184C55' }}>
                  Supporting Document <span className="text-muted">(Optional)</span>
                </Form.Label>
                <Form.Control
                  type="file"
                  id="documents"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  aria-describedby="documentHelp"
                  isInvalid={hasError('document')}
                  className="form-control-lg border-2"
                  style={{ borderColor: hasError('document') ? 'var(--bs-danger)' : '#184C55' }}
                />
                <Form.Control.Feedback type="invalid">
                  {getErrorMessage('document')}
                </Form.Control.Feedback>
                <Form.Text id="documentHelp" className="text-muted d-flex align-items-center mt-2">
                  <i className="fas fa-info-circle me-1"></i>
                  Optional: Upload medical certificates or other supporting documents.
                  <br />
                  Accepted formats: PDF, DOC, DOCX, JPG, PNG
                </Form.Text>
                {file && (
                  <div className="mt-2 d-flex align-items-center p-2 rounded border-2" style={{ borderColor: '#184C55', backgroundColor: 'rgba(24, 76, 85, 0.05)' }}>
                    <span className="text-success me-2">
                      <i className="fas fa-check-circle"></i> File selected: {file.name}
                    </span>
                    <Button
                      variant="link"
                      className="p-0 text-danger ms-auto"
                      onClick={() => {
                        setFile(null);
                        const fileInput = document.getElementById('documents') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </div>
                )}
              </Form.Group>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <Button 
                type="submit" 
                variant="primary"
                disabled={isLoading}
                size="lg"
                className="px-4"
                style={{
                  backgroundColor: '#184C55',
                  borderColor: '#184C55'
                }}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </div>
          </fieldset>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default LeaveApplication; 