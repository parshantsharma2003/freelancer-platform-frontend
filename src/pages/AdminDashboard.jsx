import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users, Briefcase, DollarSign, TrendingUp, Shield,
  Search, CheckCircle, XCircle, Eye, Ban, UserCheck,
  Filter, RefreshCw, ChevronLeft, ChevronRight,
  AlertTriangle, Flag, LayoutDashboard, Gavel, CreditCard, Scroll,
  Activity, Megaphone, FileText, AlertOctagon, Lock, Star, Settings, MessageSquare, Trash2,
  Plus, Edit, Save, X, Menu, LogOut, Database, Bell
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const { accessToken, isAuthResolved } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // User Management State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modal & Action State
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [creatingJob, setCreatingJob] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [editingProposal, setEditingProposal] = useState(null);
  const [flagJobId, setFlagJobId] = useState(null);
  const [flagReason, setFlagReason] = useState('');
  const [paymentOverrideId, setPaymentOverrideId] = useState(null);
  const [contractStatusId, setContractStatusId] = useState(null);
  const [disputeResolveId, setDisputeResolveId] = useState(null);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState({ title: '', message: '', type: 'system' });
  const [confirmAction, setConfirmAction] = useState(null); // { title, message, onConfirm, type: 'danger'|'warning' }
  const [notification, setNotification] = useState(null);
  
  // Form States
  const [userForm, setUserForm] = useState({ firstName: '', lastName: '', email: '', role: 'client', password: '' });
  const [jobForm, setJobForm] = useState({ title: '', description: '', category: '', budget: 0, status: 'open' });

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterRole]);

  // Notifications helper
  const notify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- QUERIES ---
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery(
    'admin-stats',
    () => adminAPI.getPlatformStats(),
    {
      enabled: isAuthResolved && !!accessToken,
      select: (response) => response?.data?.data?.stats || null,
      refetchInterval: activeTab === 'dashboard' ? 10000 : false
    }
  );

  const getRoleFilter = () => {
    if (activeTab === 'freelancers') return 'freelancer';
    if (activeTab === 'clients') return 'client';
    return filterRole !== 'all' ? filterRole : undefined;
  };

  const { data: usersData, isLoading: usersLoading } = useQuery(
    ['admin-users', page, filterRole, debouncedSearch, activeTab],
    () => adminAPI.getAllUsers({
      page,
      limit,
      role: getRoleFilter(),
      search: debouncedSearch || undefined
    }),
    {
      keepPreviousData: true,
      enabled: isAuthResolved && !!accessToken,
      select: (response) => response?.data?.data || { users: [], pagination: null },
      refetchInterval: ['users', 'freelancers', 'clients'].includes(activeTab) ? 10000 : false
    }
  );

  const { data: jobsData, isLoading: jobsLoading } = useQuery(
    'admin-jobs',
    () => adminAPI.getAllJobs({ limit: 50 }),
    {
      enabled: isAuthResolved && !!accessToken,
      select: (response) => response?.data?.data || { jobs: [], pagination: null },
      refetchInterval: activeTab === 'jobs' ? 10000 : false
    }
  );

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery(
    'admin-payments',
    () => adminAPI.getAllPayments({ limit: 20 }),
    {
      enabled: isAuthResolved && !!accessToken,
      select: (response) => response?.data?.data || { payments: [], pagination: null },
      refetchInterval: activeTab === 'payments' ? 10000 : false
    }
  );

  const { data: disputesData, isLoading: disputesLoading } = useQuery(
    'admin-disputes',
    () => adminAPI.getAllDisputes({ status: 'open' }),
    {
      enabled: isAuthResolved && !!accessToken,
      select: (response) => response?.data?.data || { disputes: [] },
      refetchInterval: activeTab === 'disputes' ? 10000 : false
    }
  );

  const { data: proposalsData, isLoading: proposalsLoading } = useQuery(
    'admin-proposals',
    () => adminAPI.getAllProposals ? adminAPI.getAllProposals({ limit: 50 }) : Promise.resolve({ data: { data: { proposals: [] } } }),
    {
      enabled: isAuthResolved && !!accessToken,
      select: (response) => response?.data?.data || { proposals: [] },
      refetchInterval: activeTab === 'proposals' ? 10000 : false
    }
  );

  const { data: contractsData, isLoading: contractsLoading } = useQuery(
    'admin-contracts',
    () => adminAPI.getAllContracts ? adminAPI.getAllContracts({ limit: 50 }) : Promise.resolve({ data: { data: { contracts: [] } } }),
    {
      enabled: isAuthResolved && !!accessToken,
      select: (response) => response?.data?.data || { contracts: [] },
      refetchInterval: activeTab === 'contracts' ? 10000 : false
    }
  );

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery(
    'admin-reviews',
    () => adminAPI.getAllReviews ? adminAPI.getAllReviews({ limit: 50 }) : Promise.resolve({ data: { data: { reviews: [] } } }),
    {
      enabled: isAuthResolved && !!accessToken,
      select: (response) => response?.data?.data || { reviews: [] },
      refetchInterval: activeTab === 'reviews' ? 10000 : false
    }
  );

  const { data: settingsData } = useQuery(
    'admin-settings',
    () => adminAPI.getPlatformSettings ? adminAPI.getPlatformSettings() : Promise.resolve({ data: { data: {} } }),
    {
      enabled: isAuthResolved && !!accessToken,
      select: (response) => response?.data?.data || {}
    }
  );

  const { data: logsData, isLoading: logsLoading } = useQuery(
    'admin-logs',
    () => adminAPI.getAuditLogs ? adminAPI.getAuditLogs({ limit: 50 }) : Promise.resolve({ data: { data: { logs: [] } } }),
    {
      enabled: isAuthResolved && !!accessToken,
      select: (response) => response?.data?.data || { logs: [] },
      refetchInterval: activeTab === 'logs' ? 10000 : false
    }
  );

  // --- MUTATIONS ---
  
  // User Mutations
  const createUserMutation = useMutation(
    (data) => adminAPI.createUser(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users');
        queryClient.invalidateQueries('admin-stats');
        notify('success', 'User created successfully');
        setCreatingUser(false);
        setUserForm({ firstName: '', lastName: '', email: '', role: 'client', password: '' });
      },
      onError: () => notify('error', 'Failed to create user'),
    }
  );

  const updateUserMutation = useMutation(
    ({ userId, data }) => adminAPI.updateUser(userId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users');
        notify('success', 'User updated successfully');
        setEditingUser(null);
      },
      onError: () => notify('error', 'Failed to update user'),
    }
  );

  const updateStatusMutation = useMutation(
    ({ userId, updates }) => adminAPI.updateUserStatus(userId, updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users');
        queryClient.invalidateQueries('admin-stats');
        notify('success', 'User status updated successfully');
        setConfirmAction(null);
        if (selectedUser) setSelectedUser(prev => ({ ...prev, ...updates }));
      },
      onError: () => notify('error', 'Failed to update user status'),
    }
  );

  const deleteMutation = useMutation(
    (userId) => adminAPI.deleteUser(userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users');
        queryClient.invalidateQueries('admin-stats');
        notify('success', 'User deleted successfully');
        setConfirmAction(null);
        setSelectedUser(null);
      },
      onError: () => notify('error', 'Failed to delete user'),
    }
  );

  // Job Mutations
  const createJobMutation = useMutation(
    (data) => adminAPI.createJob(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-jobs');
        queryClient.invalidateQueries('admin-stats');
        notify('success', 'Job created successfully');
        setCreatingJob(false);
        setJobForm({ title: '', description: '', category: '', budget: 0, status: 'open' });
      },
      onError: () => notify('error', 'Failed to create job'),
    }
  );

  const updateJobMutation = useMutation(
    ({ jobId, data }) => adminAPI.updateJob(jobId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-jobs');
        notify('success', 'Job updated successfully');
        setEditingJob(null);
      },
      onError: () => notify('error', 'Failed to update job'),
    }
  );

  const deleteJobMutation = useMutation(
    (jobId) => adminAPI.deleteJob(jobId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-jobs');
        queryClient.invalidateQueries('admin-stats');
        notify('success', 'Job deleted successfully');
      },
      onError: () => notify('error', 'Failed to delete job'),
    }
  );

  const flagJobMutation = useMutation(
    ({ jobId, reason }) => adminAPI.flagJob(jobId, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-jobs');
        notify('success', 'Job flagged successfully');
        setFlagJobId(null);
        setFlagReason('');
      },
      onError: () => notify('error', 'Failed to flag job'),
    }
  );

  const toggleFeaturedMutation = useMutation(
    (freelancerId) => adminAPI.toggleFeatured(freelancerId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users');
        notify('success', 'Freelancer featured status updated');
      },
    }
  );

  // Proposal Mutations
  const updateProposalMutation = useMutation(
    ({ proposalId, data }) => adminAPI.updateProposal(proposalId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-proposals');
        notify('success', 'Proposal updated successfully');
        setEditingProposal(null);
      },
      onError: () => notify('error', 'Failed to update proposal'),
    }
  );

  const deleteProposalMutation = useMutation(
    (id) => adminAPI.deleteProposal(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-proposals');
        notify('success', 'Proposal deleted successfully');
      },
      onError: () => notify('error', 'Failed to delete proposal'),
    }
  );

  // Contract Mutations
  const updateContractMutation2 = useMutation(
    ({ contractId, data }) => adminAPI.updateContract(contractId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-contracts');
        notify('success', 'Contract updated successfully');
        setEditingContract(null);
      },
      onError: () => notify('error', 'Failed to update contract'),
    }
  );

  const deleteReviewMutation = useMutation(
    (id) => adminAPI.deleteReview(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-reviews');
        notify('success', 'Review deleted successfully');
      },
      onError: () => notify('error', 'Failed to delete review'),
    }
  );

  const updateContractMutation = useMutation(
    ({ id, status }) => adminAPI.updateContractStatus(id, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-contracts');
        notify('success', 'Contract status updated');
        setContractStatusId(null);
      },
      onError: () => notify('error', 'Failed to update contract'),
    }
  );

  const overridePaymentMutation = useMutation(
    ({ paymentId, status, reason }) => adminAPI.overridePaymentStatus(paymentId, { status, reason }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-payments');
        queryClient.invalidateQueries('admin-stats');
        notify('success', 'Payment status overridden successfully');
        setPaymentOverrideId(null);
      },
      onError: () => notify('error', 'Failed to override payment'),
    }
  );

  const resolveDisputeMutation = useMutation(
    ({ disputeId, resolution, notes }) => adminAPI.resolveDispute(disputeId, { resolution, notes }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-disputes');
        queryClient.invalidateQueries('admin-stats');
        notify('success', 'Dispute resolved successfully');
        setDisputeResolveId(null);
      },
      onError: () => notify('error', 'Failed to resolve dispute'),
    }
  );

  const broadcastMutation = useMutation(
    (data) => adminAPI.broadcastNotification(data),
    {
      onSuccess: () => {
        notify('success', 'System notification broadcasted');
        setBroadcastOpen(false);
        setBroadcastMsg({ title: '', message: '', type: 'system' });
      },
      onError: () => notify('error', 'Failed to broadcast notification'),
    }
  );

  // --- HANDLERS ---
  const handleStatusChange = (user, newStatus) => {
    setConfirmAction({
      title: 'Update User Status',
      message: `Are you sure you want to change ${user.firstName}'s status to ${newStatus}?`,
      type: 'warning',
      onConfirm: () => updateStatusMutation.mutate({ userId: user._id, updates: { accountStatus: newStatus } })
    });
  };

  const handleDeleteUser = (user) => {
    setConfirmAction({
      title: 'Delete User',
      message: `Are you sure you want to permanently delete ${user.firstName} ${user.lastName}? This action cannot be undone.`,
      type: 'danger',
      onConfirm: () => deleteMutation.mutate(user._id)
    });
  };

  // --- RENDER HELPERS ---
  const StatCard = ({ title, value, subValue, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest">{title}</p>
          <h3 className="text-4xl font-bold text-gray-900 mb-2">{value}</h3>
          {subValue && <p className="text-sm text-gray-600 font-medium">{subValue}</p>}
        </div>
        <div className={`p-5 rounded-xl ${color} shadow-lg transform group-hover:scale-110 transition-transform`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'freelancers', label: 'Freelancers', icon: UserCheck },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'proposals', label: 'Proposals', icon: FileText },
    { id: 'contracts', label: 'Contracts', icon: Scroll },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'disputes', label: 'Disputes', icon: Gavel },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'logs', label: 'Logs', icon: Activity },
  ];

  if (statsLoading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Default stats if not loaded
  const defaultStats = {
    users: { total: 0, active: 0, roles: { client: 0, freelancer: 0 } },
    jobs: { total: 0, open: 0 },
    payments: { totalRevenue: 0, totalPayments: 0 },
    contracts: { total: 0, active: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white transform transition-all duration-300 ease-in-out overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 shadow-2xl border-r border-gray-700`}
      >
        {/* Logo & Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-700 sticky top-0 bg-gray-900/95 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-red-500 to-red-700 rounded-lg shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">Super Admin</h1>
              <p className="text-xs text-gray-400">Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg p-1 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-gray-700">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Quick Actions</p>
          <div className="space-y-2">
            <button
              onClick={() => setCreatingUser(true)}
              className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all text-sm font-semibold text-white shadow-md hover:shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Create User
            </button>
            <button
              onClick={() => setCreatingJob(true)}
              className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg transition-all text-sm font-semibold text-white shadow-md hover:shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Create Job
            </button>
            <button
              onClick={() => setBroadcastOpen(true)}
              className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg transition-all text-sm font-semibold text-white shadow-md hover:shadow-lg active:scale-95"
            >
              <Megaphone className="w-4 h-4" />
              Broadcast
            </button>
            <button
              onClick={() => refetchStats()}
              className="w-full flex items-center justify-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all text-sm font-semibold text-white shadow-md hover:shadow-lg active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Navigation</p>
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-lg hover:bg-primary-700'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <tab.icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-900/50 backdrop-blur sticky bottom-0">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/admin/login';
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg transition-all text-sm font-semibold text-white shadow-md hover:shadow-lg active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="lg:ml-72 flex-1 w-full transition-all duration-300">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
          <div className="px-8 h-20 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                {activeTab === 'dashboard' ? '📊 Dashboard' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
              </h1>
            </div>
            <div className="flex items-center gap-5">
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              <div className="px-4 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Super Admin</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                SA
              </div>
            </div>
          </div>
        </header>

        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-20 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl text-white transform transition-all duration-300 flex items-center gap-3 ${
            notification.type === 'success' ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'
          }`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
            <p className="font-semibold">{notification.message}</p>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-auto bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <StatCard 
                title="Total Users" 
                value={stats?.users?.total || 0} 
                subValue={`${stats?.users?.active || 0} active recently`}
                icon={Users} 
                color="bg-gradient-to-br from-blue-600 to-blue-700" 
              />
              <StatCard 
                title="Total Jobs" 
                value={stats?.jobs?.total || 0} 
                subValue={`${stats?.jobs?.open || 0} open now`}
                icon={Briefcase} 
                color="bg-gradient-to-br from-emerald-600 to-emerald-700" 
              />
              <StatCard 
                title="Total Revenue" 
                value={formatCurrency(stats?.payments?.totalRevenue || 0)} 
                subValue={`${stats?.payments?.totalPayments || 0} transactions`}
                icon={DollarSign} 
                color="bg-gradient-to-br from-indigo-600 to-indigo-700" 
              />
              <StatCard 
                title="Active Contracts" 
                value={stats?.contracts?.active || 0} 
                subValue={`${stats?.contracts?.total || 0} all time`}
                icon={TrendingUp} 
                color="bg-gradient-to-br from-purple-600 to-purple-700" 
              />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></span>
                  User Distribution
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-xl border border-blue-100">
                    <span className="font-semibold text-gray-700">Freelancers</span>
                    <span className="font-bold text-blue-600 text-lg">{stats?.users?.roles?.freelancer || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-transparent rounded-xl border border-emerald-100">
                    <span className="font-semibold text-gray-700">Clients</span>
                    <span className="font-bold text-emerald-600 text-lg">{stats?.users?.roles?.client || 0}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-purple-600 to-purple-400 rounded-full"></span>
                    Recent Activity
                  </h3>
                  <button onClick={() => setActiveTab('jobs')} className="text-sm text-blue-600 hover:text-blue-700 font-bold transition-colors">View All</button>
                </div>
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Job</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Budget</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(jobsData?.jobs || []).slice(0, 5).map((job) => (
                        <tr key={job._id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900 truncate max-w-xs">{job.title}</div>
                            <div className="text-xs text-gray-500 mt-1">{job.category}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">
                            {formatCurrency(job.budget?.amount || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                              job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {job.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {(activeTab === 'users' || activeTab === 'freelancers' || activeTab === 'clients') && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Toolbar */}
              <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium"
                  />
                </div>
                <div className="flex items-center gap-3">
                  {activeTab === 'users' && (
                    <>
                      <Filter className="w-5 h-5 text-gray-500" />
                      <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="border-2 border-gray-300 rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-primary-500 outline-none bg-white font-medium"
                      >
                        <option value="all">All Roles</option>
                        <option value="freelancer">Freelancers</option>
                        <option value="client">Clients</option>
                      </select>
                    </>
                  )}
                  <button
                    onClick={() => setCreatingUser(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all font-bold shadow-md hover:shadow-lg whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Add User
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="admin-table">
                  <thead className="admin-table-header">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usersLoading ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          <div className="flex justify-center mb-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                          </div>
                          Loading users...
                        </td>
                      </tr>
                    ) : usersData?.users?.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          No users found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      usersData?.users?.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                              user.role === 'client' ? 'bg-blue-100 text-blue-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                              user.accountStatus === 'active' ? 'bg-green-100 text-green-800' :
                              user.accountStatus === 'suspended' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {user.accountStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => setSelectedUser(user)} className="text-gray-400 hover:text-primary-600 transition-colors" title="View Details">
                                <Eye className="w-5 h-5" />
                              </button>
                              <button onClick={() => setEditingUser(user)} className="text-gray-400 hover:text-blue-600 transition-colors" title="Edit User">
                                <Edit className="w-5 h-5" />
                              </button>
                              {user.accountStatus === 'active' ? (
                                <button onClick={() => handleStatusChange(user, 'suspended')} className="text-gray-400 hover:text-red-600 transition-colors" title="Suspend User">
                                  <Ban className="w-5 h-5" />
                                </button>
                              ) : (
                                <button onClick={() => handleStatusChange(user, 'active')} className="text-gray-400 hover:text-green-600 transition-colors" title="Activate User">
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                              )}
                              <button onClick={() => handleDeleteUser(user)} className="text-gray-400 hover:text-red-600 transition-colors" title="Delete User">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {usersData?.pagination && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{usersData.pagination.pages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setPage(p => (usersData.pagination.pages > p ? p + 1 : p))}
                          disabled={page >= usersData.pagination.pages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* JOBS TAB */}
        {activeTab === 'jobs' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setCreatingJob(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Job
              </button>
            </div>
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-bold text-gray-900">Job Oversight</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {jobsData?.jobs?.map((job) => (
                    <div key={job._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-lg font-bold text-gray-900">{job.title}</h4>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              job.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {job.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{job.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{job.category}</span>
                            <span>•</span>
                            <span className="font-medium text-gray-900">{formatCurrency(job.budget?.amount || 0)}</span>
                            <span>•</span>
                            <span>Posted {formatDate(job.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => setEditingJob(job)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Job"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setFlagJobId(job._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Flag as Inappropriate"
                          >
                            <Flag className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              if(confirm('Delete this job?')) deleteJobMutation.mutate(job._id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Job"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}

        {/* PROPOSALS TAB */}
        {activeTab === 'proposals' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">All Proposals</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Freelancer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bid</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {proposalsData?.proposals?.map((proposal) => (
                      <tr key={proposal._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{proposal.job?.title || 'Unknown Job'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proposal.freelancer?.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(proposal.proposedBudget)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            proposal.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {proposal.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => setEditingProposal(proposal)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit Proposal"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => {
                                if(confirm('Delete this proposal?')) deleteProposalMutation.mutate(proposal._id);
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Proposal"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CONTRACTS TAB */}
        {activeTab === 'contracts' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Active Contracts</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contract</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Freelancer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contractsData?.contracts?.map((contract) => (
                      <tr key={contract._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contract.job?.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.client?.firstName} {contract.client?.lastName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.freelancer?.firstName} {contract.freelancer?.lastName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(contract.budget?.amount || 0)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            contract.status === 'active' ? 'bg-green-100 text-green-800' : 
                            contract.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {contract.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => setEditingContract(contract)}
                              className="text-blue-600 hover:text-blue-900 p-2"
                              title="Edit Contract"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <div className="relative inline-block text-left">
                              <button 
                                onClick={() => setContractStatusId(contractStatusId === contract._id ? null : contract._id)}
                                className="text-primary-600 hover:text-primary-900 text-sm font-medium px-3 py-1 rounded-lg hover:bg-primary-50"
                              >
                                Update Status
                              </button>
                              {contractStatusId === contract._id && (
                                <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                                  <div className="py-1">
                                    {['active', 'completed', 'cancelled', 'disputed'].map(status => (
                                      <button
                                        key={status}
                                        onClick={() => updateContractMutation.mutate({ id: contract._id, status })}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 capitalize"
                                      >
                                        Mark {status}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" /> Financial Oversight
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Override</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paymentsData?.payments?.map((payment) => (
                      <tr key={payment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(payment.createdAt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{formatCurrency(payment.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{payment.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            payment.status === 'released' ? 'bg-green-100 text-green-800' :
                            payment.status === 'refunded' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button 
                            onClick={() => setPaymentOverrideId(payment._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center justify-end gap-1 ml-auto"
                          >
                            <Lock className="w-3 h-3" /> Override
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* DISPUTES TAB */}
        {activeTab === 'disputes' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Gavel className="w-5 h-5" /> Dispute Resolution Center
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {disputesData?.disputes?.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No open disputes requiring attention.</div>
                ) : (
                  disputesData?.disputes?.map((dispute) => (
                    <div key={dispute._id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">Dispute #{dispute._id.slice(-6)}</h4>
                          <p className="text-sm text-gray-500">Opened {formatDate(dispute.createdAt)}</p>
                        </div>
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium uppercase">
                          {dispute.status}
                        </span>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <p className="text-gray-700"><span className="font-semibold">Reason:</span> {dispute.reason}</p>
                        <p className="text-gray-600 mt-2 text-sm">{dispute.description}</p>
                      </div>
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => setDisputeResolveId(dispute._id)}
                          className="btn-primary flex items-center gap-2"
                        >
                          <Gavel className="w-4 h-4" /> Resolve Dispute
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Platform Reviews</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {reviewsData?.reviews?.map((review) => (
                  <div key={review._id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{review.rating}.0</span>
                        </div>
                        <p className="text-gray-700 mb-2">{review.comment}</p>
                        <p className="text-sm text-gray-500">
                          By {review.reviewer?.firstName} • {formatDate(review.createdAt)}
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          if(confirm('Delete this review?')) deleteReviewMutation.mutate(review._id);
                        }}
                        className="text-red-600 hover:text-red-900 p-2"
                        title="Delete Review"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Settings className="w-5 h-5" /> Platform Settings
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platform Fee (%)</label>
                  <input 
                    type="number" 
                    defaultValue={settingsData?.platformFeePercent || 10}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Controlled via environment variables.</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
                    <p className="text-sm text-gray-500">Disable platform access for non-admins</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-gray-200 cursor-not-allowed">
                    <span className="absolute left-0 inline-block w-6 h-6 bg-white border border-gray-200 rounded-full shadow transform transition-transform duration-200 ease-in-out translate-x-0"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVITY LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5" /> System Audit Logs
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logsData?.logs?.map((log) => (
                      <tr key={log._id} className="hover:bg-gray-50 text-sm">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {log.actor?.email || 'System'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            log.action.includes('DELETE') ? 'bg-red-100 text-red-800' :
                            log.action.includes('UPDATE') ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {log.targetType}
                        </td>
                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={log.summary}>
                          {log.summary}
                        </td>
                      </tr>
                    ))}
                    {(!logsData?.logs || logsData.logs.length === 0) && (
                      <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No audit logs found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- MODALS --- */}

      {/* Create User Modal */}
      {creatingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200">
            <div className="p-6 border-b-2 border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-6 h-6 text-blue-600" />
                Create New User
              </h3>
              <button onClick={() => setCreatingUser(false)} className="text-gray-500 hover:text-gray-700 hover:bg-white rounded-full p-1 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                <input 
                  type="text"
                  value={userForm.firstName}
                  onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                <input 
                  type="text"
                  value={userForm.lastName}
                  onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                  placeholder="Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                <input 
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                <input 
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Role</label>
                <select 
                  value={userForm.role}
                  onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium bg-white"
                >
                  <option value="client">Client</option>
                  <option value="freelancer">Freelancer</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t-2 border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button 
                onClick={() => setCreatingUser(false)}
                className="px-6 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg font-bold transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => createUserMutation.mutate(userForm)}
                disabled={!userForm.firstName || !userForm.email || !userForm.password}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Save className="w-4 h-4" />
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input 
                  type="text"
                  defaultValue={editingUser.firstName}
                  onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input 
                  type="text"
                  defaultValue={editingUser.lastName}
                  onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email"
                  defaultValue={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="client">Client</option>
                  <option value="freelancer">Freelancer</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => updateUserMutation.mutate({ userId: editingUser._id, data: editingUser })}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Job Modal */}
      {creatingJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Create New Job</h3>
              <button onClick={() => setCreatingJob(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input 
                  type="text"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Full Stack Developer needed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={jobForm.description}
                  onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none min-h-[100px]"
                  placeholder="Describe the job requirements..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input 
                  type="text"
                  value={jobForm.category}
                  onChange={(e) => setJobForm({...jobForm, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Web Development"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                <input 
                  type="number"
                  value={jobForm.budget}
                  onChange={(e) => setJobForm({...jobForm, budget: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={jobForm.status}
                  onChange={(e) => setJobForm({...jobForm, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="in-progress">In Progress</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setCreatingJob(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => createJobMutation.mutate(jobForm)}
                disabled={!jobForm.title || !jobForm.description}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Create Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Edit Job</h3>
              <button onClick={() => setEditingJob(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input 
                  type="text"
                  defaultValue={editingJob.title}
                  onChange={(e) => setEditingJob({...editingJob, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  defaultValue={editingJob.description}
                  onChange={(e) => setEditingJob({...editingJob, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none min-h-[100px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input 
                  type="text"
                  defaultValue={editingJob.category}
                  onChange={(e) => setEditingJob({...editingJob, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                <input 
                  type="number"
                  defaultValue={editingJob.budget?.amount || editingJob.budget}
                  onChange={(e) => setEditingJob({...editingJob, budget: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={editingJob.status}
                  onChange={(e) => setEditingJob({...editingJob, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="in-progress">In Progress</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setEditingJob(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => updateJobMutation.mutate({ jobId: editingJob._id, data: editingJob })}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Proposal Modal */}
      {editingProposal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Edit Proposal</h3>
              <button onClick={() => setEditingProposal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Budget ($)</label>
                <input 
                  type="number"
                  defaultValue={editingProposal.proposedBudget}
                  onChange={(e) => setEditingProposal({...editingProposal, proposedBudget: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={editingProposal.status}
                  onChange={(e) => setEditingProposal({...editingProposal, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setEditingProposal(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => updateProposalMutation.mutate({ proposalId: editingProposal._id, data: editingProposal })}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Contract Modal */}
      {editingContract && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Edit Contract</h3>
              <button onClick={() => setEditingContract(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                <input 
                  type="number"
                  defaultValue={editingContract.budget}
                  onChange={(e) => setEditingContract({...editingContract, budget: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={editingContract.status}
                  onChange={(e) => setEditingContract({...editingContract, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="disputed">Disputed</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setEditingContract(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => updateContractMutation2.mutate({ contractId: editingContract._id, data: editingContract })}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-900">User Profile</h3>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-2xl font-bold">
                  {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedUser.firstName} {selectedUser.lastName}</h4>
                  <p className="text-gray-500">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium uppercase text-gray-600">{selectedUser.role}</span>
                    {selectedUser.isVerified && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Verified</span>}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Account Status</p>
                  <p className={`font-medium capitalize ${selectedUser.accountStatus === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedUser.accountStatus}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Joined Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                </div>
              </div>

              {/* Role Specific Stats */}
              {selectedUser.role === 'freelancer' && selectedUser.freelancerProfile && (
                <div className="border-t border-gray-100 pt-6">
                  <h4 className="font-bold text-gray-900 mb-4">Freelancer Performance</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-500">Total Earned</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedUser.freelancerProfile.totalEarned || 0)}</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-500">Jobs Completed</p>
                      <p className="text-xl font-bold text-gray-900">{selectedUser.freelancerProfile.jobsCompleted || 0}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                     <button 
                        onClick={() => toggleFeaturedMutation.mutate(selectedUser._id)}
                        className="text-sm text-primary-600 hover:underline font-medium"
                     >
                        {selectedUser.isFeatured ? 'Remove from Featured' : 'Mark as Featured Freelancer'}
                     </button>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setSelectedUser(null)} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4 text-gray-900">
              <div className={`p-2 rounded-full ${confirmAction.type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">{confirmAction.title}</h3>
            </div>
            <p className="text-gray-600 mb-6">{confirmAction.message}</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmAction.onConfirm}
                className={`px-4 py-2 text-white rounded-lg font-medium shadow-sm transition-colors ${
                  confirmAction.type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flag Job Modal */}
      {flagJobId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Flag Job as Inappropriate</h3>
            <textarea
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="Please describe why this job should be flagged..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none min-h-[100px] mb-4"
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setFlagJobId(null); setFlagReason(''); }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => flagJobMutation.mutate({ jobId: flagJobId, reason: flagReason })}
                disabled={!flagReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium shadow-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Flag Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Override Modal */}
      {paymentOverrideId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border-2 border-red-100">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <AlertOctagon className="w-8 h-8" />
              <h3 className="text-xl font-bold">Override Payment Status</h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Warning: This is a destructive action. Forcing a payment status change bypasses normal escrow checks.
            </p>
            <div className="space-y-4">
              <select id="override-status" className="w-full p-2 border rounded-lg">
                <option value="released">Force Release (Pay Freelancer)</option>
                <option value="refunded">Force Refund (Return to Client)</option>
              </select>
              <textarea
                id="override-reason"
                placeholder="Required: Reason for override..."
                className="w-full p-3 border border-gray-300 rounded-lg min-h-[80px]"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setPaymentOverrideId(null)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button 
                onClick={() => {
                  const status = document.getElementById('override-status').value;
                  const reason = document.getElementById('override-reason').value;
                  if (reason) overridePaymentMutation.mutate({ paymentId: paymentOverrideId, status, reason });
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Confirm Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {broadcastOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center gap-3 mb-6 text-primary-600">
              <Megaphone className="w-6 h-6" />
              <h3 className="text-xl font-bold">System Broadcast</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  value={broadcastMsg.title}
                  onChange={e => setBroadcastMsg({...broadcastMsg, title: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., Scheduled Maintenance"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea 
                  value={broadcastMsg.message}
                  onChange={e => setBroadcastMsg({...broadcastMsg, message: e.target.value})}
                  className="w-full p-2 border rounded-lg h-24"
                  placeholder="Message to all users..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select 
                  value={broadcastMsg.type}
                  onChange={e => setBroadcastMsg({...broadcastMsg, type: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="system">System Info</option>
                  <option value="warning">Warning</option>
                  <option value="alert">Critical Alert</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setBroadcastOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button 
                onClick={() => broadcastMutation.mutate(broadcastMsg)}
                disabled={!broadcastMsg.title || !broadcastMsg.message}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50"
              >
                Send Broadcast
              </button>
            </div>
          </div>
        </div>
      )}

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
