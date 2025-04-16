import React from 'react';
// import { Link } from 'react-router-dom'; // Commented out as not used yet

const Unauthorized: React.FC = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 text-center">
      <h1 className="display-1 fw-bold text-danger">403</h1>
      <h2>Access Denied / Forbidden</h2>
      <p className="lead">
        You do not have the necessary permissions to access this page.
      </p>
      <p>
        Please contact your administrator if you believe this is an error.
      </p>
      {/* Optional: Add a link back to login or a safe page */}
      {/* <Link to="/login" className="btn btn-primary mt-3">Go to Login</Link> */}
    </div>
  );
};

export default Unauthorized; 