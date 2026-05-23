import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Briefcase,
  Eye,
  CheckCircle,
  Clock
} from 'lucide-react';
import { clientAPI } from '../services/api';
import socketService from '../services/socketService';
import { formatCurrency } from '../lib/utils';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState({
    jobsPosted: 0,
    totalSpent: 0,
    activeContracts: 0,
    proposalsReceived: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await clientAPI.getAnalytics();
      if (response.data && response.data.data && response.data.data.analytics) {
        setAnalytics(response.data.data.analytics);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchAnalytics();

    // Listen for real-time updates
    socketService.on('job_posted', () => {
      setAnalytics(prev => ({
        ...prev,
        jobsPosted: prev.jobsPosted + 1
      }));
    });

    socketService.on('job_updated', () => {
      fetchAnalytics();
    });

    socketService.on('proposal_received', () => {
      setAnalytics(prev => ({
        ...prev,
        proposalsReceived: prev.proposalsReceived + 1
      }));
    });

    socketService.on('contract_created', () => {
      fetchAnalytics();
    });

    socketService.on('contract_updated', () => {
      fetchAnalytics();
    });

    socketService.on('payment_completed', () => {
      fetchAnalytics();
    });

    return () => {
      socketService.offAll('job_posted');
      socketService.offAll('job_updated');
      socketService.offAll('proposal_received');
      socketService.offAll('contract_created');
      socketService.offAll('contract_updated');
      socketService.offAll('payment_completed');
    };
  }, []);

  const stats = [
    {
      label: 'Total Jobs Posted',
      value: analytics.jobsPosted.toString(),
      change: '+0%',
      icon: Briefcase,
      color: 'bg-blue-500',
      trend: 'up'
    },
    {
      label: 'Total Spent',
      value: formatCurrency(analytics.totalSpent),
      change: '+0%',
      icon: DollarSign,
      color: 'bg-green-500',
      trend: 'up'
    },
    {
      label: 'Active Contracts',
      value: analytics.activeContracts.toString(),
      change: '0%',
      icon: CheckCircle,
      color: 'bg-purple-500',
      trend: 'neutral'
    },
    {
      label: 'Proposals Received',
      value: analytics.proposalsReceived.toString(),
      change: '+0%',
      icon: Users,
      color: 'bg-orange-500',
      trend: 'up'
    },
  ];

  const recentActivity = [
    { type: 'No activity yet', time: 'Get started by posting a job' },
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-primary-600" />
            <span>Analytics & Insights</span>
          </h1>
          <p className="mt-2 text-gray-600">
            Track your hiring performance and spending
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 
                    stat.trend === 'down' ? 'text-red-600' : 
                    'text-gray-500'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {loading ? '...' : stat.value}
                </h3>
                <p className="text-sm text-gray-600">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Spending Chart Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Spending Overview
              </h3>
              <select className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
                <option>Last year</option>
              </select>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No spending data yet</p>
                <p className="text-sm text-gray-400 mt-1">Start hiring to see your analytics</p>
              </div>
            </div>
          </motion.div>

          {/* Job Performance Chart Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Job Performance
              </h3>
              <select className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
                <option>Last year</option>
              </select>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No job data yet</p>
                <p className="text-sm text-gray-400 mt-1">Post jobs to track performance</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{activity.type}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
