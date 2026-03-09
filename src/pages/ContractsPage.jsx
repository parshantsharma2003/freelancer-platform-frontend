import { useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { contractAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FileCheck, DollarSign, Clock, User, CheckCircle2, XCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';

const ContractsPage = () => {
  const { user, accessToken, isAuthResolved } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const { data: contracts = [], isLoading } = useQuery(
    ['contracts', filter],
    () => contractAPI.getMyContracts(filter !== 'all' ? { status: filter } : {}),
    {
      enabled: isAuthResolved && !!accessToken,
      select: (response) => response?.data?.data?.contracts || []
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contracts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileCheck className="w-8 h-8 text-primary-600" />
            My Contracts
          </h1>
          <p className="text-gray-600 mt-2">Manage your active and completed contracts</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          {['all', 'active', 'completed', 'disputed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Contracts List */}
        {!contracts || contracts.length === 0 ? (
          <div className="card text-center py-12">
            <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Contracts Found</h3>
            <p className="text-gray-600">You don't have any contracts yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contracts.map((contract) => (
              <div key={contract._id} className="card hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {contract.job?.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {user.role === 'client' 
                          ? `${contract.freelancer?.firstName} ${contract.freelancer?.lastName}`
                          : `${contract.client?.firstName} ${contract.client?.lastName}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Started {formatDate(contract.startDate)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      contract.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : contract.status === 'completed'
                        ? 'bg-blue-100 text-blue-700'
                        : contract.status === 'disputed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {contract.status}
                  </span>
                </div>

                {/* Contract Details */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                      <DollarSign className="w-4 h-4" />
                      Total Budget
                    </p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(contract.budget)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Paid</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(contract.totalPaid || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Milestones</p>
                    <p className="font-semibold text-gray-900">
                      {contract.milestones?.filter(m => m.status === 'completed').length || 0} / {contract.milestones?.length || 0}
                    </p>
                  </div>
                </div>

                {/* Milestones */}
                {contract.milestones && contract.milestones.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Milestones</h4>
                    <div className="space-y-2">
                      {contract.milestones.map((milestone, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3 flex-1">
                            {milestone.status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : milestone.status === 'in-progress' ? (
                              <Clock className="w-5 h-5 text-yellow-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-gray-400" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{milestone.description}</p>
                              <p className="text-sm text-gray-500">Due: {formatDate(milestone.dueDate)}</p>
                            </div>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(milestone.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => navigate(`/contracts/${contract._id}`)}
                    className="btn-primary"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => navigate(`/messages?contract=${contract._id}`)}
                    className="btn-outline"
                  >
                    Message {user.role === 'client' ? 'Freelancer' : 'Client'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractsPage;
