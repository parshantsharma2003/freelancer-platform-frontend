import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from 'react-query';
import { jobAPI, proposalAPI, contractAPI, paymentAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, FileText, DollarSign, TrendingUp, Clock, 
  Plus, Eye, MessageCircle, CheckCircle, AlertCircle,
  Calendar, ArrowRight
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import { StatCard, AreaChartComponent } from '../components/ui/Charts';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { showToast } from '../components/ui/Toast';
import socketService from '../services/socketService';
import { formatDistanceToNow } from 'date-fns';
import { formatCurrency } from '../lib/utils';

const DashboardPage = () => {
  const { user, isAuthenticated, isAuthResolved } = useAuth();
  const isFreelancer = user?.role === 'freelancer';
  const isClient = user?.role === 'client';
  const [recentActivity, setRecentActivity] = useState([]);

  // Fetch dashboard data based on role
  const { data: jobs = { data: { jobs: [] } }, isLoading: jobsLoading, refetch: refetchJobs } = useQuery(
    'myJobs',
    () => jobAPI.getMyJobs({ limit: 5 }),
    { 
      enabled: isClient && isAuthResolved && isAuthenticated,
      retry: false,
      refetchOnMount: 'stale',
      refetchOnWindowFocus: false,
      refetchInterval: 30000, // Poll every 30 seconds
      onError: (error) => {
        console.error('Error fetching jobs:', error);
      }
    }
  );

  const { data: proposals = { data: { proposals: [] } }, isLoading: proposalsLoading, refetch: refetchProposals } = useQuery(
    'myProposals',
    () => proposalAPI.getMyProposals({ limit: 5 }),
    { 
      enabled: isFreelancer && isAuthResolved && isAuthenticated,
      retry: false,
      refetchOnMount: 'stale',
      refetchOnWindowFocus: false,
      refetchInterval: 30000, // Poll every 30 seconds
      onError: (error) => {
        console.error('Error fetching proposals:', error);
      }
    }
  );

  const { data: contracts = { data: { contracts: [] } }, isLoading: contractsLoading, refetch: refetchContracts } = useQuery(
    'myContracts',
    () => contractAPI.getMyContracts({ limit: 5 }),
    {
      enabled: isAuthResolved && isAuthenticated,
      retry: false,
      refetchOnMount: 'stale',
      refetchOnWindowFocus: false,
      refetchInterval: 30000, // Poll every 30 seconds
      onError: (error) => {
        console.error('Error fetching contracts:', error);
      }
    }
  );

  const { data: paymentStats, refetch: refetchPaymentStats } = useQuery(
    'paymentStats',
    () => paymentAPI.getPaymentStats(),
    {
      enabled: isAuthResolved && isAuthenticated,
      retry: false,
      onError: (error) => {
        console.error('Error fetching payment stats:', error);
      }
    }
  );

  const { data: earningsData, refetch: refetchEarningsData } = useQuery(
    'earningsByMonth',
    () => paymentAPI.getEarningsByMonth(6),
    {
      enabled: isAuthResolved && isAuthenticated,
      retry: false,
      onError: (error) => {
        console.error('Error fetching earnings data:', error);
      }
    }
  );

  // Setup real-time listeners
  useEffect(() => {
    const setupListeners = async () => {
      const connected = await socketService.connect();
      if (!connected) return;

      // For clients: Listen for new proposals on their jobs
      if (isClient) {
        socketService.on('proposal:new', (event) => {
          const data = event.data || event;
          showToast.info(`New proposal from ${data.freelancerName}: "${data.jobTitle}"`);
          // Refetch proposals to show updated count
          refetchJobs();
        });
      }

      // For freelancers: Listen for dashboard-affecting events
      if (isFreelancer) {
        socketService.on('job:new', (event) => {
          const data = event.data || event;
          showToast.info(`New job: ${data.title}`);
        });

        socketService.on('proposal:accepted', (event) => {
          const data = event.data || event;
          showToast.success(`Your proposal was accepted for: ${data.jobTitle}`);
          refetchProposals();
          refetchContracts();
        });

        socketService.on('contract_created', () => {
          refetchContracts();
        });

        socketService.on('contract:updated', () => {
          refetchContracts();
        });

        socketService.on('payment_completed', () => {
          refetchPaymentStats();
          refetchEarningsData();
        });

        socketService.on('notification:new', (event) => {
          const notificationType = event?.data?.type;

          if (['proposal_accepted'].includes(notificationType)) {
            refetchProposals();
            refetchContracts();
          }

          if (['contract_created'].includes(notificationType)) {
            refetchContracts();
          }

          if (['payment_received'].includes(notificationType)) {
            refetchPaymentStats();
            refetchEarningsData();
          }
        });
      }
    };

    setupListeners();

    // Cleanup
    return () => {
      socketService.off('proposal:new');
      socketService.off('job:new');
      socketService.off('proposal:accepted');
      socketService.off('contract_created');
      socketService.off('contract:updated');
      socketService.off('payment_completed');
      socketService.off('notification:new');
    };
  }, [
    isClient,
    isFreelancer,
    refetchJobs,
    refetchProposals,
    refetchContracts,
    refetchPaymentStats,
    refetchEarningsData
  ]);

  if (jobsLoading || proposalsLoading || contractsLoading) {
    return <PageLoader message="Loading your dashboard..." />;
  }

  const stats = [
    { 
      title: isClient ? 'Active Jobs' : 'Active Proposals', 
      value: isClient 
        ? jobs?.data?.pagination?.total || 0 
        : proposals?.data?.pagination?.total || 0,
      description: isClient ? 'Currently hiring' : 'Pending responses',
      icon: <Briefcase className="h-6 w-6" />,
      color: 'primary'
    },
    { 
      title: 'Active Contracts', 
      value: (contracts?.data?.contracts || [])?.filter(c => c.status === 'active').length || 0,
      description: 'Ongoing work',
      icon: <FileText className="h-6 w-6" />,
      color: 'success'
    },
    { 
      title: isFreelancer ? 'Total Earnings' : 'Total Spent', 
      value: formatCurrency(paymentStats?.data?.total || 0),
      description: isFreelancer ? 'Earnings released' : 'Released payments',
      icon: <DollarSign className="h-6 w-6" />,
      color: 'info'
    },
    { 
      title: 'Success Rate', 
      value: `${paymentStats?.data?.successRate || 0}%`,
      description: 'Completed transactions',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'warning'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-display font-bold text-gray-900">
            Welcome back, {user?.firstName || 'there'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your account
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </motion.div>

        {/* Earnings Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <AreaChartComponent
            data={earningsData?.data?.earnings || []}
            dataKey="earnings"
            title={isFreelancer ? "Your Earnings (Last 6 Months)" : "Your Spending (Last 6 Months)"}
            height={250}
          />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Client: Posted Jobs */}
          {isClient && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <Card.Header>
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">My Posted Jobs</h2>
                    <Link to="/post-job">
                      <Button size="sm" icon={<Plus className="h-4 w-4" />}>
                        Post New
                      </Button>
                    </Link>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-3">
                    {jobs?.data?.jobs && jobs.data.jobs.length > 0 ? (
                      jobs.data.jobs.map((job, index) => (
                        <motion.div
                          key={job._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <Link
                            to={`/jobs/${job._id}`}
                            className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-gray-900 hover:text-primary-600">
                                {job.title}
                              </h3>
                              <Badge
                                variant={
                                  job.status === 'open' ? 'success' :
                                  job.status === 'in-progress' ? 'info' :
                                  'default'
                                }
                                size="sm"
                              >
                                {job.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                {job.proposalsCount || 0} proposals
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </Link>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-4">No jobs posted yet</p>
                        <Link to="/post-job">
                          <Button size="sm">Post Your First Job</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          )}

          {/* Freelancer: Submitted Proposals */}
          {isFreelancer && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <Card.Header>
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">My Proposals</h2>
                    <Link to="/browse-jobs">
                      <Button size="sm" icon={<Plus className="h-4 w-4" />}>
                        Browse Jobs
                      </Button>
                    </Link>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-3">
                    {proposals?.data?.proposals && proposals.data.proposals.length > 0 ? (
                      proposals.data.proposals.map((proposal, index) => (
                        <motion.div
                          key={proposal._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {proposal.job?.title || 'Job Title'}
                            </h3>
                            <Badge
                              variant={
                                proposal.status === 'accepted' ? 'success' :
                                proposal.status === 'pending' ? 'warning' :
                                'default'
                              }
                              size="sm"
                            >
                              {proposal.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1 font-medium text-primary-600">
                              <DollarSign className="h-4 w-4" />
                              ${proposal.proposedBudget?.amount}
                            </span>
                            <span>
                              {formatDistanceToNow(new Date(proposal.submittedAt || proposal.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-4">No proposals submitted yet</p>
                        <Link to="/browse-jobs">
                          <Button size="sm">Browse Jobs</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          )}

          {/* Active Contracts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <Card.Header>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Active Contracts</h2>
                  <Link to="/contracts">
                    <Button size="sm" variant="ghost" icon={<ArrowRight className="h-4 w-4" />}>
                      View All
                    </Button>
                  </Link>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="space-y-3">
                  {contracts?.data?.contracts && contracts.data.contracts.filter(c => c.status === 'active').length > 0 ? (
                    contracts.data.contracts.filter(c => c.status === 'active').slice(0, 5).map((contract, index) => (
                      <motion.div
                        key={contract._id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <Link
                          to={`/contracts/${contract._id}`}
                          className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
                        >
                          <h3 className="font-semibold text-gray-900 mb-2 hover:text-primary-600">
                            {contract.title || 'Contract'}
                          </h3>
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={isClient ? contract.freelancer?.avatar : contract.client?.avatar}
                              name={isClient ? contract.freelancer?.firstName : contract.client?.firstName}
                              size="sm"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-600 truncate">
                                {isClient 
                                  ? `Freelancer: ${contract.freelancer?.firstName || 'Unknown'}`
                                  : `Client: ${contract.client?.firstName || 'Unknown'}`
                                }
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="info" size="sm">
                                  ${contract.budget?.amount}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(contract.startDate || contract.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No active contracts</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            </Card.Header>
            <Card.Body>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {isClient && (
                  <>
                    <Link to="/post-job" className="block">
                      <Button variant="primary" fullWidth icon={<Plus className="h-5 w-5" />}>
                        Post a Job
                      </Button>
                    </Link>
                    <Link to="/freelancers" className="block">
                      <Button variant="outline" fullWidth icon={<Eye className="h-5 w-5" />}>
                        Find Freelancers
                      </Button>
                    </Link>
                  </>
                )}
                {isFreelancer && (
                  <>
                    <Link to="/browse-jobs" className="block">
                      <Button variant="primary" fullWidth icon={<Briefcase className="h-5 w-5" />}>
                        Browse Jobs
                      </Button>
                    </Link>
                    <Link to="/profile" className="block">
                      <Button variant="outline" fullWidth icon={<Eye className="h-5 w-5" />}>
                        Edit Profile
                      </Button>
                    </Link>
                  </>
                )}
                <Link to="/messages" className="block">
                  <Button variant="outline" fullWidth icon={<MessageCircle className="h-5 w-5" />}>
                    Messages
                  </Button>
                </Link>
                <Link to="/payments" className="block">
                  <Button variant="outline" fullWidth icon={<DollarSign className="h-5 w-5" />}>
                    Payments
                  </Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
