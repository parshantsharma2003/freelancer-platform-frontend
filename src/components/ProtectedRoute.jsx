import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './ui/LoadingSpinner';

/**
 * ProtectedRoute - Guards routes that require authentication
 * 
 * CRITICAL: Always waits for isAuthResolved before making redirect decisions
 * NEVER reads from localStorage directly - only uses AuthContext state
 * 
 * @param {ReactNode} children - Protected content to render
 * @param {Array<string>} roles - Optional array of allowed roles
 */
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, isAuthResolved } = useAuth();
  const isAdminRoute = roles?.includes('super_admin');

  // CRITICAL: Wait for auth to be resolved before making ANY redirect decisions
  // This prevents redirect loops and ensures proper auth state
  if (!isAuthResolved) {
    return <PageLoader />;
  }

  // Not authenticated - redirect to appropriate login page
  if (!isAuthenticated) {
    return <Navigate to={isAdminRoute ? '/admin/login' : '/login'} replace />;
  }

  // Authenticated but wrong role - redirect to appropriate page
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to={isAdminRoute ? '/admin/login' : '/dashboard'} replace />;
  }

  // Authenticated and authorized - render protected content
  return children;
};

export default ProtectedRoute;
