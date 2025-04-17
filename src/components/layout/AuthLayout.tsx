import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
           
                <Outlet />
             
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 