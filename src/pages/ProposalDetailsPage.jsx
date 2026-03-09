import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { proposalAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, DollarSign, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '../lib/utils';

const ProposalDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showConfirmation, setShowConfirmation] = useState(null);

  // Fetch proposal details
  const { data: proposal, isLoading, error } = useQuery(
    ['proposal', id],
    () => proposalAPI.getProposalById(id),
    {
      select: (response) => response?.data?.data?.proposal,
    }
  );

  const acceptMutation = useMutation(
    () => proposalAPI.acceptProposal(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['proposal', id]);
        queryClient.invalidateQueries(['proposals']);
        alert('Proposal accepted successfully!');
      },
      onError: (error) => {
        alert(error.response?.data?.message || 'Failed to accept proposal');
      },
    }
  );

  const rejectMutation = useMutation(
    () => proposalAPI.rejectProposal(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['proposal', id]);
        queryClient.invalidateQueries(['proposals']);
        alert('Proposal rejected');
      },
      onError: (error) => {
        alert(error.response?.data?.message || 'Failed to reject proposal');
      },
    }
  );

  const withdrawMutation = useMutation(
    () => proposalAPI.withdrawProposal(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['proposal', id]);
        queryClient.invalidateQueries(['proposals']);
        alert('Proposal withdrawn');
      },
      onError: (error) => {
        alert(error.response?.data?.message || 'Failed to withdraw proposal');
      },
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading proposal details...</p>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate('/proposals')}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Proposals
          </button>
          <div className="card text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Proposal Not Found</h3>
            <p className="text-gray-600">The proposal you're looking for doesn't exist or you don't have permission to view it.</p>
          </div>
        </div>
      </div>
    );
  }

  const isClient = user?.role === 'client';
  const isFreelancer = user?.role === 'freelancer';
  const canAccept = isClient && proposal?.status === 'pending';
  const canReject = isClient && proposal?.status === 'pending';
  const canWithdraw = isFreelancer && proposal?.status === 'pending';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/proposals')}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Proposals
        </button>

        {/* Main Card */}
        <div className="card">
          {/* Header */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {proposal?.job?.title || 'Proposal'}
                </h1>
                {isClient && (
                  <p className="text-gray-600">
                    Submitted by {proposal?.freelancer?.firstName} {proposal?.freelancer?.lastName}
                  </p>
                )}
                {isFreelancer && (
                  <p className="text-gray-600">
                    For job by {proposal?.job?.client?.firstName} {proposal?.job?.client?.lastName}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Submitted {formatRelativeTime(proposal?.createdAt)}
                </p>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                  proposal?.status === 'accepted'
                    ? 'bg-green-100 text-green-700'
                    : proposal?.status === 'rejected'
                    ? 'bg-red-100 text-red-700'
                    : proposal?.status === 'withdrawn'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {proposal?.status ? proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1) : 'Pending'}
              </span>
            </div>
          </div>

          {/* Key Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-primary-600" />
                <p className="text-sm font-medium text-gray-600">Proposed Budget</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(proposal?.proposedBudget?.amount || 0)}
              </p>
              {proposal?.proposedBudget?.type && (
                <p className="text-xs text-gray-500 mt-1 capitalize">
                  {proposal.proposedBudget.type === 'hourly' ? 'Hourly Rate' : 'Fixed Price'}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-primary-600" />
                <p className="text-sm font-medium text-gray-600">Delivery Time</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {proposal?.deliveryTime?.value || 0} {proposal?.deliveryTime?.unit || 'days'}
              </p>
            </div>

            {proposal.qualityScore && (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-primary-600" />
                  <p className="text-sm font-medium text-gray-600">Quality Score</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {proposal.qualityScore}/100
                </p>
              </div>
            )}
          </div>

          {/* Cover Letter */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cover Letter</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {proposal?.coverLetter || 'No cover letter provided'}
              </p>
            </div>
          </div>

          {/* Milestones */}
          {proposal?.milestones && proposal.milestones.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Milestones</h2>
              <div className="space-y-3">
                {proposal?.milestones?.map((milestone, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{milestone.description || milestone.title}</p>
                      {milestone.dueDate && (
                        <p className="text-sm text-gray-600">
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <p className="text-lg font-bold text-primary-600">
                      {formatCurrency(milestone.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Freelancer Info (for clients) */}
          {isClient && proposal.freelancer && (
            <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Freelancer Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">
                    {proposal?.freelancer?.firstName} {proposal?.freelancer?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{proposal?.freelancer?.email}</p>
                </div>
                {proposal?.freelancer?.title && (
                  <div>
                    <p className="text-sm text-gray-600">Title</p>
                    <p className="font-semibold text-gray-900">{proposal?.freelancer?.title}</p>
                  </div>
                )}
                {proposal?.freelancer?.hourlyRate && (
                  <div>
                    <p className="text-sm text-gray-600">Hourly Rate</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(proposal?.freelancer?.hourlyRate)}/hour
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {(canAccept || canReject || canWithdraw) && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex gap-3 flex-wrap">
                {canAccept && (
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to accept this proposal?')) {
                        acceptMutation.mutate();
                      }
                    }}
                    disabled={acceptMutation.isLoading}
                    className="btn-primary flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {acceptMutation.isLoading ? 'Accepting...' : 'Accept Proposal'}
                  </button>
                )}
                {canReject && (
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to reject this proposal?')) {
                        rejectMutation.mutate();
                      }
                    }}
                    disabled={rejectMutation.isLoading}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    {rejectMutation.isLoading ? 'Rejecting...' : 'Reject'}
                  </button>
                )}
                {canWithdraw && (
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to withdraw this proposal?')) {
                        withdrawMutation.mutate();
                      }
                    }}
                    disabled={withdrawMutation.isLoading}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    {withdrawMutation.isLoading ? 'Withdrawing...' : 'Withdraw Proposal'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* View Job Link */}
        <div className="mt-6">
          <button
            onClick={() => navigate(`/jobs/${proposal?.job?._id}`)}
            className="btn-outline w-full"
          >
            View Full Job Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProposalDetailsPage;
