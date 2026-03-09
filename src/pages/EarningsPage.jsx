import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  Download,
  Calendar,
  CreditCard,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const EarningsPage = () => {
  const stats = [
    {
      label: 'Total Earnings',
      value: '$0',
      change: '+0%',
      icon: DollarSign,
      color: 'bg-green-500',
      trend: 'up'
    },
    {
      label: 'This Month',
      value: '$0',
      change: '+0%',
      icon: Calendar,
      color: 'bg-blue-500',
      trend: 'up'
    },
    {
      label: 'Pending',
      value: '$0',
      change: '0%',
      icon: Clock,
      color: 'bg-yellow-500',
      trend: 'neutral'
    },
    {
      label: 'Completed',
      value: '0',
      change: '+0%',
      icon: CheckCircle,
      color: 'bg-purple-500',
      trend: 'up'
    },
  ];

  const recentTransactions = [
    {
      type: 'No transactions yet',
      description: 'Complete projects to see your earnings',
      amount: '$0',
      date: 'Get started',
      status: 'pending'
    }
  ];

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <DollarSign className="w-8 h-8 text-primary-600" />
                <span>Earnings</span>
              </h1>
              <p className="mt-2 text-gray-600">
                Track your income and manage withdrawals
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Download Report</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === 'up' ? ArrowUpRight : stat.trend === 'down' ? ArrowDownRight : null;
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
                  {TrendIcon && (
                    <span className={`flex items-center text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 
                      stat.trend === 'down' ? 'text-red-600' : 
                      'text-gray-500'
                    }`}>
                      <TrendIcon className="w-4 h-4 mr-1" />
                      {stat.change}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-600">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Earnings Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Earnings Overview
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
              <p className="text-gray-500">No earnings data yet</p>
              <p className="text-sm text-gray-400 mt-1">Start working on projects to see your earnings grow</p>
            </div>
          </div>
        </motion.div>

        {/* Withdrawal Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Withdrawal Methods
            </h3>
            <button className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors text-sm">
              Add Method
            </button>
          </div>
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No withdrawal methods added</p>
            <p className="text-sm text-gray-500 mt-2">Add a payment method to withdraw your earnings</p>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Recent Transactions
          </h3>
          <div className="space-y-4">
            {recentTransactions.map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    transaction.status === 'completed' 
                      ? 'bg-green-100' 
                      : transaction.status === 'pending' 
                      ? 'bg-yellow-100' 
                      : 'bg-gray-100'
                  }`}>
                    {transaction.status === 'completed' ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : transaction.status === 'pending' ? (
                      <Clock className="w-6 h-6 text-yellow-600" />
                    ) : (
                      <DollarSign className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.type}</p>
                    <p className="text-sm text-gray-500">{transaction.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{transaction.amount}</p>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    transaction.status === 'completed' 
                      ? 'bg-green-100 text-green-700' 
                      : transaction.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EarningsPage;
