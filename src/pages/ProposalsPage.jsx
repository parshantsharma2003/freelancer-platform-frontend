import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { proposalAPI, contractAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FileText, DollarSign, Clock, CheckCircle, XCircle, Eye, MessageSquare } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '../lib/utils';

const ProposalsPage = () => {
  const { user, accessToken, isAuthResolved } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [filter, setFilter] = useState('all');
  const isClient = user?.role === 'client';
  const isFreelancer = user?.role === 'freelancer';

  // Fetch proposals based on role
  const { data: proposals = [], isLoading } = useQuery(
    ['proposals', filter],
    () => {
      if (isFreelancer) {
        return proposalAPI.getMyProposals();
      } else if (isClient) {
        return proposalAPI.getReceivedProposals();
      }
      return Promise.resolve({ data: { data: { proposals: [] } } });
    },
    { 
      enabled: !!user && isAuthResolved && !!accessToken,
      select: (response) => response?.data?.data?.proposals || []
    }
  );

  const { data: contracts = [] } = useQuery(
    ['proposal-chat-contracts'],
    () => contractAPI.getMyContracts({ limit: 200 }),
    {
      enabled: !!user && isAuthResolved && !!accessToken,
      select: (response) => response?.data?.data?.contracts || []
    }
  );

  const proposalToContractMap = contracts.reduce((acc, contract) => {
    if (contract?.proposal) {
      acc[contract.proposal.toString()] = contract._id;
    }
    return acc;
  }, {});

  const acceptMutation = useMutation(
    (proposalId) => proposalAPI.acceptProposal(proposalId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['proposals']);
        queryClient.invalidateQueries(['proposal-chat-contracts']);
        alert('Proposal accepted successfully!');
      },
    }
  );

  const rejectMutation = useMutation(
    (proposalId) => proposalAPI.rejectProposal(proposalId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['proposals']);
        queryClient.invalidateQueries(['proposal-chat-contracts']);
        alert('Proposal declined');
      },
    }
  );

  const withdrawMutation = useMutation(
    (proposalId) => proposalAPI.withdrawProposal(proposalId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['proposals']);
        alert('Proposal withdrawn');
      },
    }
  );

  const filteredProposals = proposals?.filter(proposal => {
    if (filter === 'all') return true;
    if (filter === 'declined') return ['declined', 'rejected'].includes(proposal.status);
    return proposal.status === filter;
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary-600" />
            {isFreelancer ? 'My Proposals' : 'Received Proposals'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isFreelancer 
              ? 'Manage your submitted proposals'
              : 'Review and manage proposals for your jobs'}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          {['all', 'pending', 'accepted', 'declined'].map(status => (
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

        {/* Proposals List */}
        {filteredProposals.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Proposals Found</h3>
            <p className="text-gray-600 mb-6">
              {isFreelancer 
                ? "You haven't submitted any proposals yet"
                : "No proposals have been received for this job"}
            </p>
            {isFreelancer && (
              <button
                onClick={() => navigate('/browse-jobs')}
                className="btn-primary"
              >
                Browse Jobs
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProposals.map((proposal) => (
              <div key={proposal._id} className="card hover:shadow-md transition">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {proposal.job?.title}
                    </h3>
                    {isClient && (
                      <p className="text-gray-600">
                        By {proposal.freelancer?.firstName} {proposal.freelancer?.lastName}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Submitted {formatRelativeTime(proposal.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      proposal.status === 'accepted'
                        ? 'bg-green-100 text-green-700'
                        : ['rejected', 'declined'].includes(proposal.status)
                        ? 'bg-red-100 text-red-700'
                        : proposal.status === 'withdrawn'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {proposal.status}
                  </span>
                </div>

                {/* Proposal Details */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Bid Amount</p>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(proposal.proposedBudget)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Delivery Time</p>
                      <p className="font-semibold text-gray-900">
                        {proposal.deliveryTime} days
                      </p>
                    </div>
                  </div>
                  {proposal.qualityScore && (
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Quality Score</p>
                        <p className="font-semibold text-gray-900">
                          {proposal.qualityScore}/100
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cover Letter */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Cover Letter</h4>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                    {proposal.coverLetter}
                  </p>
                </div>

                {/* Milestones */}
                {proposal.milestones && proposal.milestones.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Milestones</h4>
                    <div className="space-y-2">
                      {proposal.milestones.map((milestone, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">{milestone.description}</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(milestone.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 flex-wrap">
                  {isClient && proposal.status === 'pending' && (
                    <>
                      <button
                        onClick={() => acceptMutation.mutate(proposal._id)}
                        disabled={acceptMutation.isLoading}
                        className="btn-primary flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Accept Proposal
                      </button>
                      <button
                        onClick={() => rejectMutation.mutate(proposal._id)}
                        disabled={rejectMutation.isLoading}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                  {isClient && (() => {
                    const isAccepted = proposal.status === 'accepted';
                    const contractId = proposalToContractMap[proposal._id];
                    const canMessage = isAccepted && !!contractId;

                    return (
                      <button
                        onClick={() => canMessage && navigate(`/messages?contract=${contractId}`)}
                        disabled={!canMessage}
                        className="btn-outline flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={canMessage ? 'Open contract chat' : 'Messaging is enabled only after proposal acceptance and contract creation'}
                      >
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </button>
                    );
                  })()}
                  {isFreelancer && proposal.status === 'pending' && (
                    <button
                      onClick={() => withdrawMutation.mutate(proposal._id)}
                      disabled={withdrawMutation.isLoading}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Withdraw Proposal
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/jobs/${proposal.job?._id}`)}
                    className="btn-outline"
                  >
                    View Job
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

export default ProposalsPage;
