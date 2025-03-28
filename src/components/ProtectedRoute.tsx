
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode | ((user: User) => React.ReactNode);
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles = [] }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (typeof children === 'function') {
    return <>{children(user!)}</>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
