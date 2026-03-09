import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GuestNavbar from './GuestNavbar';
import ClientNavbar from './ClientNavbar';
import FreelancerNavbar from './FreelancerNavbar';
import SuperAdminNavbar from './SuperAdminNavbar';
import { AnimatePresence } from 'framer-motion';

/**
 * NavbarResolver - Intelligent navbar selection based on auth state and user role
 * 
 * Rules:
 * 1. Wait for auth resolution to prevent navbar flashing
 * 2. Render exactly ONE navbar component based on role
 * 3. Re-render instantly on login/logout via Context subscription
 * 4. SuperAdminNavbar only on /admin routes for super_admin role
 * 5. No mixed rendering or conditional fragments
 */
const NavbarResolver = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Subscribe to auth state via Context
  const {
    user,
    isAuthenticated,
    isAuthResolved,
    logout
  } = useAuth();

  const isAdminRoute = useMemo(
    () => location.pathname.startsWith('/admin'),
    [location.pathname]
  );

  // Logout handler with role-aware redirect
  const handleLogout = () => {
    const redirectPath = user?.role === 'super_admin' ? '/admin/login' : '/';
    logout();
    navigate(redirectPath);
  };

  // CRITICAL: Wait for auth resolution before rendering any navbar
  // This prevents the flash of wrong navbar on page refresh
  if (!isAuthResolved) {
    return null;
  }

  // Admin routes: Show SuperAdminNavbar ONLY for super_admin users
  if (isAdminRoute) {
    if (isAuthenticated && user?.role === 'super_admin') {
      return (
        <AnimatePresence mode="wait">
          <SuperAdminNavbar
            key="super_admin"
            user={user}
            onLogout={handleLogout}
          />
        </AnimatePresence>
      );
    }
    // Hide navbar for non-super-admins on admin routes
    return null;
  }

  // Non-admin routes: Role-based navbar selection
  
  // Guest users (not authenticated)
  if (!isAuthenticated) {
    return (
      <AnimatePresence mode="wait">
        <GuestNavbar key="guest" />
      </AnimatePresence>
    );
  }

  // Client users
  if (user?.role === 'client') {
    return (
      <AnimatePresence mode="wait">
        <ClientNavbar
          key="client"
          user={user}
          onLogout={handleLogout}
        />
      </AnimatePresence>
    );
  }

  // Freelancer users
  if (user?.role === 'freelancer') {
    return (
      <AnimatePresence mode="wait">
        <FreelancerNavbar
          key="freelancer"
          user={user}
          onLogout={handleLogout}
        />
      </AnimatePresence>
    );
  }

  // Fallback: If authenticated but role doesn't match (shouldn't happen)
  // Show guest navbar as safe default
  return (
    <AnimatePresence mode="wait">
      <GuestNavbar key="fallback" />
    </AnimatePresence>
  );
};

export default NavbarResolver;
