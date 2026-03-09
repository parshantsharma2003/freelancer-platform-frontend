import {
  Briefcase,
  Users,
  MessageSquare,
  Bell,
  FileText,
  Shield,
  Settings,
  Search,
  UserCircle
} from 'lucide-react';

const brand = {
  label: 'FreelancePro',
  to: '/'
};

const shared = {
  brand,
  animations: {
    dropdownDuration: 0.2
  }
};

export const NAV_CONFIGS = {
  guest: {
    ...shared,
    role: 'guest',
    primaryLinks: [
      { label: 'Find Work', to: '/browse-jobs', icon: Search },
      { label: 'Find Talent', to: '/freelancers', icon: Users }
    ],
    widgets: [],
    actions: [
      { label: 'Sign In', to: '/login', variant: 'ghost' },
      { label: 'Join Now', to: '/register', variant: 'primary' }
    ],
    userMenu: [],
    logoutRedirect: '/'
  },
  freelancer: {
    ...shared,
    role: 'freelancer',
    primaryLinks: [
      { label: 'Find Work', to: '/browse-jobs', icon: Search },
      { label: 'Proposals', to: '/proposals', icon: FileText },
      { label: 'Contracts', to: '/contracts', icon: FileText }
    ],
    widgets: [
      { type: 'messages', to: '/messages', icon: MessageSquare },
      { type: 'notifications', to: '/notifications', icon: Bell }
    ],
    actions: [
      { label: 'Browse Jobs', to: '/browse-jobs', variant: 'primary' }
    ],
    userMenu: [
      { label: 'Dashboard', to: '/dashboard', icon: Briefcase },
      { label: 'Profile', to: '/profile', icon: UserCircle },
      { label: 'Payments', to: '/payments', icon: FileText },
      { label: 'Settings', to: '/profile', icon: Settings }
    ],
    logoutRedirect: '/login'
  },
  client: {
    ...shared,
    role: 'client',
    primaryLinks: [
      { label: 'Find Talent', to: '/freelancers', icon: Users },
      { label: 'Jobs', to: '/dashboard', icon: Briefcase },
      { label: 'Contracts', to: '/contracts', icon: FileText }
    ],
    widgets: [
      { type: 'messages', to: '/messages', icon: MessageSquare },
      { type: 'notifications', to: '/notifications', icon: Bell }
    ],
    actions: [
      { label: 'Post a Job', to: '/post-job', variant: 'primary' }
    ],
    userMenu: [
      { label: 'Dashboard', to: '/dashboard', icon: Briefcase },
      { label: 'Profile', to: '/profile', icon: UserCircle },
      { label: 'Payments', to: '/payments', icon: FileText },
      { label: 'Settings', to: '/profile', icon: Settings }
    ],
    logoutRedirect: '/login'
  },
  super_admin: {
    ...shared,
    role: 'super_admin',
    primaryLinks: [
      { label: 'Admin Dashboard', to: '/admin/dashboard', icon: Shield },
      { label: 'Users', to: '/admin/dashboard', icon: Users },
      { label: 'System Logs', to: '/admin/dashboard', icon: FileText }
    ],
    widgets: [
      { type: 'notifications', to: '/admin/dashboard', icon: Bell }
    ],
    actions: [
      { label: 'Admin Panel', to: '/admin/dashboard', variant: 'primary' }
    ],
    userMenu: [
      { label: 'Admin Dashboard', to: '/admin/dashboard', icon: Shield },
      { label: 'Settings', to: '/admin/dashboard', icon: Settings }
    ],
    logoutRedirect: '/admin/login'
  }
};

export const resolveNavConfig = ({ isAuthenticated, role }) => {
  if (!isAuthenticated) {
    return NAV_CONFIGS.guest;
  }

  if (role && NAV_CONFIGS[role]) {
    return NAV_CONFIGS[role];
  }

  return NAV_CONFIGS.guest;
};
