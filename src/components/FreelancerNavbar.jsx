import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  LayoutDashboard,
  Search,
  Bookmark,
  FileText,
  FileCheck,
  MessageSquare,
  DollarSign,
  BarChart3,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
  Circle
} from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';
import { useAvailabilityStore } from '../store/availabilityStore';

const FreelancerNavbar = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);
  
  const { unreadCount } = useNotificationStore();
  const { isAvailable, toggleAvailability } = useAvailabilityStore();

  // Freelancer-specific navigation links
  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/browse-jobs', label: 'Find Jobs', icon: Search },
    { to: '/saved-jobs', label: 'Saved Jobs', icon: Bookmark },
    { to: '/proposals', label: 'My Proposals', icon: FileText },
    { to: '/contracts', label: 'Active Contracts', icon: FileCheck },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
  ];

  // Secondary links for dropdown or mobile menu
  const secondaryLinks = [
    { to: '/earnings', label: 'Earnings', icon: DollarSign },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  // Profile dropdown menu items
  const profileMenuItems = [
    { to: '/profile', label: 'My Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsProfileDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isActiveLink = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white shadow-md'
            : 'bg-white/95 backdrop-blur-sm border-b border-gray-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <span className="text-xl font-display font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                  FreelancePro
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = isActiveLink(link.to);
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={`relative px-3 py-2 rounded-lg transition-colors group ${
                      isActive 
                        ? 'text-primary-600 bg-primary-50' 
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{link.label}</span>
                    </div>
                  </NavLink>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Earnings Link */}
              <Link to="/earnings">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-medium">Earnings</span>
                </motion.button>
              </Link>

              {/* Notifications */}
              <Link to="/notifications">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] text-center"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.span>
                  )}
                </motion.button>
              </Link>

              {/* Availability Toggle */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={toggleAvailability}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                  isAvailable
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isAvailable ? 'You are available for work' : 'You are busy'}
              >
                <Circle className={`w-3 h-3 ${isAvailable ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`} />
                <span className="text-sm font-medium">
                  {isAvailable ? 'Available' : 'Busy'}
                </span>
              </motion.button>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  aria-expanded={isProfileDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'F'}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${
                    isProfileDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.firstName && user?.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user?.email || 'Freelancer'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                            Freelancer
                          </span>
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded ${
                            isAvailable 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <Circle className={`w-2 h-2 ${isAvailable ? 'fill-green-500' : 'fill-gray-400'}`} />
                            <span>{isAvailable ? 'Available' : 'Busy'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        {profileMenuItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.to}
                              to={item.to}
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              onClick={() => setIsProfileDropdownOpen(false)}
                            >
                              <Icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}
                        
                        {/* Quick Links */}
                        {secondaryLinks.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.to}
                              to={item.to}
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              onClick={() => setIsProfileDropdownOpen(false)}
                            >
                              <Icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}
                        
                        <button
                          onClick={onLogout}
                          className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-16 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-40 lg:hidden overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                {/* User Info */}
                <div className="px-4 py-6 bg-gradient-to-r from-green-600 to-green-700 text-white">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'F'}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : 'Freelancer'}
                      </p>
                      <p className="text-sm text-green-100">{user?.email}</p>
                    </div>
                  </div>
                  
                  {/* Availability Toggle Mobile */}
                  <button
                    onClick={toggleAvailability}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                      isAvailable
                        ? 'bg-white/20 hover:bg-white/30'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <Circle className={`w-3 h-3 ${isAvailable ? 'fill-white text-white' : 'fill-white/50 text-white/50'}`} />
                      <span className="font-medium">
                        {isAvailable ? 'Available for Work' : 'Currently Busy'}
                      </span>
                    </span>
                    <span className="text-sm text-white/80">Tap to toggle</span>
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 px-4 py-4 space-y-1">
                  {navLinks.map((link, index) => {
                    const Icon = link.icon;
                    const isActive = isActiveLink(link.to);
                    return (
                      <motion.div
                        key={link.to}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={link.to}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-primary-50 text-primary-600'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{link.label}</span>
                        </Link>
                      </motion.div>
                    );
                  })}

                  {/* Secondary Links */}
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    {secondaryLinks.map((link, index) => {
                      const Icon = link.icon;
                      const isActive = isActiveLink(link.to);
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-primary-50 text-primary-600'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Notifications Link */}
                  <Link
                    to="/notifications"
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      isActiveLink('/notifications')
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5" />
                      <span className="font-medium">Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </div>

                {/* Mobile Profile Menu */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="border-t border-gray-200 px-4 py-4 space-y-2"
                >
                  {profileMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                  
                  <button
                    onClick={onLogout}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FreelancerNavbar;
