import { Navigate, useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { clientAPI, freelancerAPI } from '../services/api';
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
  const location = useLocation();
  const isAdminRoute = roles?.includes('super_admin');
  const isClient = user?.role === 'client';
  const isFreelancer = user?.role === 'freelancer';
  const setupPath = isFreelancer ? '/profile/setup' : isClient ? '/client/profile/setup' : null;
  const isSetupRoute = setupPath ? location.pathname === setupPath : false;

  const { data: setupProfile, isLoading: isSetupProfileLoading } = useQuery(
    ['profile-setup-guard', user?._id, user?.role],
    async () => {
      if (isFreelancer) {
        try {
          const response = await freelancerAPI.getMyProfile();
          return response?.data?.data?.profile || null;
        } catch (error) {
          // Treat 400/404 as 'no profile yet' to avoid breaking the guard
          if (error?.response?.status === 404 || error?.response?.status === 400) {
            return null;
          }
          throw error;
        }
      }

      if (isClient) {
        try {
          const response = await clientAPI.getMyProfile();
          return response?.data?.data?.profile || null;
        } catch (error) {
          // Treat 400/404 as 'no profile yet' to avoid breaking the guard
          if (error?.response?.status === 404 || error?.response?.status === 400) {
            return null;
          }
          throw error;
        }
      }

      return null;
    },
    {
      enabled: isAuthResolved && isAuthenticated && (isClient || isFreelancer),
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const needsSetup = (() => {
    if (!setupProfile) {
      return isClient || isFreelancer;
    }

    if (isFreelancer) {
      return !(
        setupProfile.title &&
        setupProfile.description &&
        Number(setupProfile.hourlyRate) > 0 &&
        Array.isArray(setupProfile.skills) && setupProfile.skills.length > 0 &&
        Array.isArray(setupProfile.portfolio) && setupProfile.portfolio.length > 0 &&
        Array.isArray(setupProfile.education) && setupProfile.education.length > 0
      );
    }

    if (isClient) {
      return !(
        setupProfile.companyName &&
        setupProfile.companySize &&
        setupProfile.industry &&
        setupProfile.description
      );
    }

    return false;
  })();

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

  if ((isClient || isFreelancer) && !isSetupRoute) {
    if (isSetupProfileLoading) {
      return <PageLoader message="Checking your profile setup..." />;
    }

    if (needsSetup && setupPath) {
      return <Navigate to={setupPath} replace />;
    }
  }

  // Authenticated and authorized - render protected content
  return children;
};

export default ProtectedRoute;
