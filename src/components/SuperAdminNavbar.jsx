import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  Briefcase,
  FileText,
  FileCheck,
  CreditCard,
  Scale,
  Star,
  Settings,
  FileSearch,
  Radio,
  Shield,
  LogOut,
  ChevronDown,
  Bell,
  Activity
} from 'lucide-react';

const SuperAdminNavbar = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Admin navigation sections
  const primaryLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/freelancers', label: 'Freelancers', icon: UserCheck },
    { to: '/admin/clients', label: 'Clients', icon: Building2 },
    { to: '/admin/jobs', label: 'Jobs', icon: Briefcase },
    { to: '/admin/proposals', label: 'Proposals', icon: FileText },
  ];

  const secondaryLinks = [
    { to: '/admin/contracts', label: 'Contracts', icon: FileCheck },
    { to: '/admin/payments', label: 'Payments', icon: CreditCard },
    { to: '/admin/disputes', label: 'Disputes', icon: Scale },
    { to: '/admin/reviews', label: 'Reviews', icon: Star },
  ];

  const systemLinks = [
    { to: '/admin/settings', label: 'Platform Settings', icon: Settings },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: FileSearch },
    { to: '/admin/broadcasts', label: 'Broadcasts', icon: Radio },
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
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-slate-900 shadow-lg'
            : 'bg-slate-900/95 backdrop-blur-sm border-b border-slate-700'
        }`}
      >
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/admin/dashboard" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-display font-bold text-white group-hover:text-orange-400 transition-colors">
                    FreelancePro
                  </span>
                  <span className="ml-2 px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-semibold rounded border border-orange-500/30">
                    ADMIN
                  </span>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden xl:flex items-center space-x-1">
              {primaryLinks.map((link) => {
                const Icon = link.icon;
                const isActive = isActiveLink(link.to);
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={`relative px-3 py-2 rounded-lg transition-all group ${
                      isActive 
                        ? 'bg-slate-800 text-orange-400' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{link.label}</span>
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="adminActiveTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden xl:flex items-center space-x-2">
              {/* System Health Indicator */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-slate-800 rounded-lg">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-xs font-medium text-slate-300">System Online</span>
              </div>

              {/* Notifications */}
              <Link to="/admin/notifications">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  aria-label="Admin Notifications"
                >
                  <Bell className="w-5 h-5" />
                </motion.button>
              </Link>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                  aria-expanded={isProfileDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <span className="text-sm font-medium text-white">Admin</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${
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
                      className="absolute right-0 mt-2 w-72 bg-slate-800 rounded-lg shadow-2xl border border-slate-700 py-2"
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-slate-700">
                        <p className="text-sm font-semibold text-white">
                          {user?.firstName && user?.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user?.email || 'Super Admin'}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="inline-flex items-center space-x-1 px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-semibold rounded border border-orange-500/30">
                            <Shield className="w-3 h-3" />
                            <span>SUPER ADMIN</span>
                          </span>
                        </div>
                      </div>

                      {/* Management Links */}
                      <div className="py-1">
                        <div className="px-3 py-2">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Management
                          </p>
                        </div>
                        {secondaryLinks.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.to}
                              to={item.to}
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                              onClick={() => setIsProfileDropdownOpen(false)}
                            >
                              <Icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>

                      {/* System Links */}
                      <div className="py-1 border-t border-slate-700">
                        <div className="px-3 py-2">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            System
                          </p>
                        </div>
                        {systemLinks.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.to}
                              to={item.to}
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                              onClick={() => setIsProfileDropdownOpen(false)}
                            >
                              <Icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                        
                      <div className="border-t border-slate-700 pt-1">
                        <button
                          onClick={onLogout}
                          className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
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
              className="xl:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 xl:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-16 right-0 bottom-0 w-full max-w-sm bg-slate-900 shadow-2xl z-40 xl:hidden overflow-y-auto border-l border-slate-700"
            >
              <div className="flex flex-col h-full">
                {/* Admin Info */}
                <div className="px-4 py-6 bg-gradient-to-r from-orange-600 to-red-700 text-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : 'Super Admin'}
                      </p>
                      <p className="text-sm text-orange-100">{user?.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-lg">
                    <Activity className="w-4 h-4" />
                    <span className="text-sm font-medium">System Online</span>
                  </div>
                </div>

                {/* Primary Navigation */}
                <div className="flex-1 px-4 py-4 space-y-1">
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">
                      Main Navigation
                    </p>
                  </div>
                  {primaryLinks.map((link, index) => {
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
                              ? 'bg-orange-500/20 text-orange-400 border-l-2 border-orange-500'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{link.label}</span>
                        </Link>
                      </motion.div>
                    );
                  })}

                  {/* Management Section */}
                  <div className="pt-4 mt-4 border-t border-slate-700">
                    <div className="mb-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">
                        Management
                      </p>
                    </div>
                    {secondaryLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive = isActiveLink(link.to);
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* System Section */}
                  <div className="pt-4 mt-4 border-t border-slate-700">
                    <div className="mb-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">
                        System
                      </p>
                    </div>
                    {systemLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive = isActiveLink(link.to);
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Logout */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="border-t border-slate-700 px-4 py-4"
                >
                  <button
                    onClick={onLogout}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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

export default SuperAdminNavbar;
