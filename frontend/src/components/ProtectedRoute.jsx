import { Navigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

function ProtectedRoute({ children }) {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
}

export default ProtectedRoute;