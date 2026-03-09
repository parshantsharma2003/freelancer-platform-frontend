import { useState } from 'react';
import { useQuery } from 'react-query';
import { paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';

const PaymentsPage = () => {
  const { user, accessToken, isAuthResolved } = useAuth();
  const [filter, setFilter] = useState('all');

  const { data: payments = [], isLoading } = useQuery(
    ['payments', filter],
    () => paymentAPI.getMyPayments(filter !== 'all' ? { status: filter } : {}),
    { 
      enabled: isAuthResolved && !!accessToken,
      select: (response) => response?.data?.data?.payments || []
    }
  );

  const { data: stats } = useQuery('payment-stats', () => paymentAPI.getPaymentStats(), {
    enabled: isAuthResolved && !!accessToken
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-primary-600" />
            Payments
          </h1>
          <p className="text-gray-600 mt-2">Track your payment history and transactions</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total {user.role === 'client' ? 'Spent' : 'Earned'}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(stats.total || 0)}
                  </p>
                </div>
                {user.role === 'client' ? (
                  <TrendingDown className="w-12 h-12 text-red-600" />
                ) : (
                  <TrendingUp className="w-12 h-12 text-green-600" />
                )}
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.completed || 0}
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.pending || 0}
                  </p>
                </div>
                <Clock className="w-12 h-12 text-yellow-600" />
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          {['all', 'completed', 'held-in-escrow', 'pending', 'failed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Payments List */}
        {!payments || payments.length === 0 ? (
          <div className="card text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payments Found</h3>
            <p className="text-gray-600">You don't have any payment transactions yet</p>
          </div>
        ) : (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contract
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{payment.contract?.job?.title}</p>
                          <p className="text-gray-500 text-xs">
                            {user.role === 'client'
                              ? `To ${payment.freelancer?.firstName} ${payment.freelancer?.lastName}`
                              : `From ${payment.client?.firstName} ${payment.client?.lastName}`}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded capitalize">
                          {payment.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                        <span className={user.role === 'client' ? 'text-red-600' : 'text-green-600'}>
                          {user.role === 'client' ? '-' : '+'}{formatCurrency(payment.amount)}
                        </span>
                        {payment.fees?.totalFees > 0 && (
                          <p className="text-xs text-gray-500">Fee: {formatCurrency(payment.fees.totalFees)}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payment.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : payment.status === 'held-in-escrow'
                              ? 'bg-yellow-100 text-yellow-800'
                              : payment.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
