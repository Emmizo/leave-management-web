import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../context/store';
import { createLeave } from '../context/leaveSlice';
import { Alert, Card, Form, Button, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';

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

  // Function to check if a date is a weekend
  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };

  // Function to validate date selection
  const validateDate = (date: string) => {
    if (!date) return true;
    const selectedDate = new Date(date);
    return !isWeekend(selectedDate);
  };

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      // Validate dates
      if (!validateDate(formData.startDate) || !validateDate(formData.endDate)) {
        toast.error('Please select valid dates (weekends are not allowed)');
        return;
      }

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
      endDate.setDate(endDate.getDate() + 90);
      
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
      endDate.setDate(endDate.getDate() + 90);
      
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
      
    } catch (err) {
      console.error('Failed to create leave:', err);
      toast.error('Failed to submit leave request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = status === 'loading' || isSubmitting;

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <h4 className="mb-4" style={{ color: '#184C55' }}>Apply for Leave</h4>
        
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <fieldset disabled={isLoading}>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label htmlFor="leaveType">Leave Type</Form.Label>
                <Form.Select
                  id="leaveType"
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select leave type</option>
                  <option value="PTO">Personal Time Off (PTO)</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="COMPASSIONATE">Compassionate Leave</option>
                  <option value="MATERNITY">Maternity Leave</option>
                  <option value="UNPAID">Unpaid Leave</option>
                </Form.Select>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label htmlFor="leaveDuration">Leave Duration</Form.Label>
                <Form.Select
                  id="leaveDuration"
                  name="leaveDuration"
                  value={formData.leaveDuration}
                  onChange={handleInputChange}
                  required
                >
                  <option value="FULL_DAY">Full Day</option>
                  <option value="HALF_DAY">Half Day</option>
                </Form.Select>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label htmlFor="startDate">Start Date</Form.Label>
                <Form.Control
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  onKeyDown={(e) => e.preventDefault()}
                />
                <Form.Text className="text-muted">
                  Weekends are not allowed
                </Form.Text>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label htmlFor="endDate">End Date</Form.Label>
                <Form.Control
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  onKeyDown={(e) => e.preventDefault()}
                />
                <Form.Text className="text-muted">
                  Weekends are not allowed
                </Form.Text>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Number of Days</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.numberOfDays}
                  disabled
                  className="bg-light"
                />
                <Form.Text className="text-muted">
                  {formData.leaveDuration === 'HALF_DAY' 
                    ? 'Half days are counted as 0.5 days'
                    : 'Full days are counted as 1 day each'}
                </Form.Text>
              </Col>

              <Col xs={12} className="mb-3">
                <Form.Label htmlFor="reason">Reason</Form.Label>
                <Form.Control
                  as="textarea"
                  id="reason"
                  name="reason"
                  rows={3}
                  value={formData.reason}
                  onChange={handleInputChange}
                  required
                />
              </Col>

              <Col xs={12} className="mb-3">
                <Form.Label htmlFor="documents">
                  Supporting Document <span className="text-muted">(Optional)</span>
                </Form.Label>
                <Form.Control
                  type="file"
                  id="documents"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  aria-describedby="documentHelp"
                />
                <Form.Text id="documentHelp" className="text-muted d-flex align-items-center mt-1">
                  <i className="fas fa-info-circle me-1"></i>
                  Optional: Upload medical certificates or other supporting documents.
                  <br />
                  Accepted formats: PDF, DOC, DOCX, JPG, PNG
                </Form.Text>
                {file && (
                  <div className="mt-2 d-flex align-items-center">
                    <span className="text-success me-2">
                      <i className="fas fa-check-circle"></i> File selected: {file.name}
                    </span>
                    <Button
                      variant="link"
                      className="p-0 text-danger"
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
              </Col>

              <Col xs={12}>
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={isLoading}
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
              </Col>
            </Row>
          </fieldset>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default LeaveApplication; 