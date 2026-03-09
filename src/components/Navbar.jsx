import { Link, NavLink, useLocation } from 'react-router-dom';
import { useNotificationStore } from '../store/notificationStore';
import { Menu, X, ChevronDown, LogOut } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const variantsByType = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md',
  ghost: 'text-slate-700 hover:text-primary-600',
  subtle: 'bg-slate-100 text-slate-800 hover:bg-slate-200'
};

const Navbar = ({ config, user, onLogout }) => {
  const location = useLocation();
  const { unreadCount } = useNotificationStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const menuId = useMemo(() => `user-menu-${config.role}`, [config.role]);
  const brandId = useMemo(() => `brand-${config.role}`, [config.role]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setShowMobileMenu(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowUserMenu(false);
        setShowMobileMenu(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200'
          : 'bg-white border-b border-gray-200'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      exit={{ y: -60, opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      aria-label={`${config.role} navigation`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Link
              id={brandId}
              to={config.brand.to}
              className="text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent"
            >
              {config.brand.label}
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center space-x-7">
            {config.primaryLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  `relative text-sm font-semibold transition-colors group ${
                    isActive ? 'text-primary-700' : 'text-slate-700 hover:text-primary-600'
                  }`
                }
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all group-hover:w-full" />
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {config.widgets.map((widget) => (
              <motion.div key={widget.type} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to={widget.to}
                  className="text-slate-700 hover:text-primary-600 transition-colors relative"
                  aria-label={widget.type}
                >
                  <widget.icon size={20} />
                  {widget.type === 'notifications' && unreadCount > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>
            ))}

            {config.actions.map((action) => (
              <motion.div key={action.label} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to={action.to}
                  className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${
                    variantsByType[action.variant] || variantsByType.primary
                  }`}
                >
                  {action.label}
                </Link>
              </motion.div>
            ))}

            {config.userMenu.length > 0 && (
              <div className="relative">
                <motion.button
                  onClick={() => setShowUserMenu((prev) => !prev)}
                  className="flex items-center space-x-2 text-slate-700 hover:text-primary-600"
                  aria-haspopup="menu"
                  aria-expanded={showUserMenu}
                  aria-controls={menuId}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center ring-2 ring-primary-200 hover:ring-primary-300 transition-all overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-primary-700 text-sm font-bold">
                        {(user?.firstName || 'U').charAt(0)}
                      </span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <motion.div
                        className="fixed inset-0 z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowUserMenu(false)}
                      />
                      <motion.div
                        id={menuId}
                        role="menu"
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 border border-slate-200 z-50"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: config.animations.dropdownDuration }}
                      >
                        {config.userMenu.map((item) => (
                          <Link
                            key={item.label}
                            to={item.to}
                            role="menuitem"
                            className="flex items-center gap-2 px-4 py-2.5 text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition-colors font-medium"
                            onClick={() => setShowUserMenu(false)}
                          >
                            {item.icon && <item.icon className="w-4 h-4" />}
                            <span>{item.label}</span>
                          </Link>
                        ))}
                        <hr className="my-2 border-slate-200" />
                        <button
                          onClick={onLogout}
                          className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium transition-colors"
                          role="menuitem"
                        >
                          <LogOut size={16} />
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <motion.button
              className="text-slate-700 p-2"
              onClick={() => setShowMobileMenu((prev) => !prev)}
              aria-label="Toggle navigation"
              aria-expanded={showMobileMenu}
              whileTap={{ scale: 0.95 }}
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            className="md:hidden bg-white border-t border-slate-200 shadow-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-6 space-y-3">
              {config.primaryLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="block px-4 py-3 text-slate-700 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}

              {config.widgets.map((widget) => (
                <Link
                  key={widget.type}
                  to={widget.to}
                  className="block px-4 py-3 text-slate-700 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-colors font-medium flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <widget.icon className="w-4 h-4" />
                    {widget.type === 'messages' ? 'Messages' : 'Notifications'}
                  </span>
                  {widget.type === 'notifications' && unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              ))}

              {config.actions.map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className={`block px-4 py-3 rounded-xl transition-colors font-semibold text-center ${
                    variantsByType[action.variant] || variantsByType.primary
                  }`}
                >
                  {action.label}
                </Link>
              ))}

              {config.userMenu.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="block px-4 py-3 text-slate-700 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ))}

              {config.userMenu.length > 0 && (
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                >
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
