import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-white">
        <h4 className="mb-0">Page Not Found</h4>
      </Card.Header>
      <Card.Body>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">Go to Dashboard</Link>
      </Card.Body>
    </Card>
  );
};

export default NotFound; 