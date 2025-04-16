import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../context/store';
import { createLeave, resetCreationStatus } from '../context/leaveSlice';
import { Leave } from '../types/auth';

const LeaveApplication = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { creationStatus, creationError, lastCreatedLeave } = useSelector((state: RootState) => state.leaves);

  const [formData, setFormData] = useState({
    leaveType: '' as Leave['type'] | '',
    startDate: '',
    endDate: '',
    duration: 'full',
    reason: '',
    documents: null as File | null,
  });

  const leaveTypes: { id: Leave['type']; name: string }[] = [
    { id: 'PTO', name: 'Personal Time Off (PTO)' },
    { id: 'SICK', name: 'Sick Leave' },
    { id: 'COMPASSIONATE', name: 'Compassionate Leave' },
    { id: 'MATERNITY', name: 'Maternity Leave' },
    { id: 'UNPAID', name: 'Unpaid Leave' },
  ];

  useEffect(() => {
    dispatch(resetCreationStatus());
    return () => {
        dispatch(resetCreationStatus());
    };
  }, [dispatch]);

  useEffect(() => {
    if (creationStatus === 'succeeded') {
      navigate('/leave-history');
    }
  }, [creationStatus, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        documents: e.target.files![0]
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.leaveType) {
      console.error('User not logged in or leave type not selected');
      return;
    }

    // 1. Create the leave details object (excluding file and employeeId)
    const leaveDetails = {
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      type: formData.leaveType,
      // employeeId might be inferred by backend from token, 
      // or added here if needed by backend logic within leaveRequest part
      // employeeId: user.id 
    };

    // 2. Create FormData
    const submissionData = new FormData();

    // 3. Append JSON data as a Blob
    submissionData.append('leaveRequest', new Blob([JSON.stringify(leaveDetails)], {
      type: 'application/json'
    }));

    // 4. Append the file if it exists
    if (formData.documents) {
      submissionData.append('document', formData.documents, formData.documents.name);
    }

    // 5. Dispatch the thunk with FormData
    // The thunk and Axios will handle sending this correctly
    // The Axios interceptor will add the Authorization token
    dispatch(createLeave(submissionData));
  };

  return (
    <div className="container">
      <h2 className="mb-4">Apply for Leave</h2>
      
      {creationStatus === 'succeeded' && lastCreatedLeave && (
        <div className="alert alert-success" role="alert">
          Leave request created successfully! Redirecting...
        </div>
      )}

      {creationStatus === 'failed' && creationError && (
        <div className="alert alert-danger" role="alert">
          Error creating leave: {creationError}
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <fieldset disabled={creationStatus === 'loading'}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="leaveType" className="form-label">Leave Type</label>
                  <select
                    className="form-select"
                    id="leaveType"
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select leave type</option>
                    {leaveTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="startDate" className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="endDate" className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-12 mb-3">
                  <label htmlFor="reason" className="form-label">Reason</label>
                  <textarea
                    className="form-control"
                    id="reason"
                    name="reason"
                    rows={3}
                    value={formData.reason}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-12 mb-3">
                  <label htmlFor="documents" className="form-label">Supporting Document (Optional)</label>
                  <input
                    type="file"
                    className="form-control"
                    id="documents"
                    onChange={handleFileChange}
                  />
                  <small className="text-muted">Upload medical certificates or other supporting documents if required.</small>
                </div>

                <div className="col-12">
                  <button type="submit" className="btn btn-primary">
                    {creationStatus === 'loading' ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeaveApplication; 