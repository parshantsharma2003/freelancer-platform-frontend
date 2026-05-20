import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, MessageCircle, PencilLine, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/ui/Toast';
import { contractAPI, freelancerAPI, reviewAPI } from '../services/api';
import { formatCurrency, formatDate } from '../lib/utils';

const ContractDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isClient = user?.role === 'client';
  const isFreelancer = user?.role === 'freelancer';
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioDescription, setPortfolioDescription] = useState('');
  const [portfolioProjectUrl, setPortfolioProjectUrl] = useState('');

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      terms: '',
      budgetAmount: '',
      budgetType: 'fixed',
      budgetCurrency: 'USD',
      startDate: ''
    }
  });

  const { data: contract, isLoading } = useQuery(
    ['contract', id],
    async () => {
      const res = await contractAPI.getContractById(id);
      return res.data.data.contract;
    },
    {
      enabled: !!id
    }
  );

  const { data: freelancerProfile } = useQuery(
    ['my-freelancer-profile'],
    async () => {
      const res = await freelancerAPI.getMyProfile();
      return res.data.data.profile;
    },
    {
      enabled: isFreelancer
    }
  );

  const updateMutation = useMutation(
    (payload) => contractAPI.updateContract(id, payload),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(['contract', id]);
        await queryClient.invalidateQueries(['contracts']);
      }
    }
  );

  const acceptMutation = useMutation(
    () => contractAPI.acceptContract(id),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(['contract', id]);
        await queryClient.invalidateQueries(['contracts']);
        await queryClient.invalidateQueries(['chats']);
      }
    }
  );

  const completeContractMutation = useMutation(
    () => contractAPI.updateContractStatus(id, { status: 'completed' }),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(['contract', id]);
        await queryClient.invalidateQueries(['contracts']);
        showToast.success('Contract marked as completed');
      },
      onError: (error) => {
        showToast.error(error?.response?.data?.message || 'Failed to mark contract as completed');
      }
    }
  );

  const reviewTargetId = useMemo(() => {
    if (!contract) return '';

    const target = isClient ? contract.freelancer : contract.client;
    if (!target) return '';
    return typeof target === 'string' ? target : (target._id || '');
  }, [contract, isClient]);

  const submitReviewMutation = useMutation(
    async () => {
      if (!reviewTargetId) {
        throw new Error('Review target user is missing');
      }

      await reviewAPI.createReview({
        contractId: id,
        revieweeId: reviewTargetId,
        rating: reviewRating,
        comment: reviewComment.trim()
      });

      return reviewAPI.submitReview(id, { revieweeId: reviewTargetId });
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(['contract', id]);
        showToast.success('Review submitted successfully');
      },
      onError: (error) => {
        const message = error?.response?.data?.message || error?.message || 'Failed to submit review';
        if (message.toLowerCase().includes('already submitted')) {
          showToast.info('Review already submitted for this contract');
          return;
        }
        showToast.error(message);
      }
    }
  );

  const addToPortfolioMutation = useMutation(
    async () => {
      const title = portfolioTitle.trim();
      const description = portfolioDescription.trim();

      if (!title || !description) {
        throw new Error('Portfolio title and description are required');
      }

      const nextPortfolioItem = {
        title,
        description,
        projectUrl: portfolioProjectUrl.trim()
      };

      const payload = {
        title: freelancerProfile?.title || 'Freelancer profile',
        description: freelancerProfile?.description || freelancerProfile?.bio || 'Complete your profile to start getting hired.',
        hourlyRate: Number(freelancerProfile?.hourlyRate || 0),
        experienceLevel: freelancerProfile?.experienceLevel || 'intermediate',
        skills: freelancerProfile?.skills || [],
        portfolio: [...(freelancerProfile?.portfolio || []), nextPortfolioItem]
      };

      return freelancerAPI.createOrUpdateProfile(payload);
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(['my-freelancer-profile']);
        await queryClient.invalidateQueries(['myProfile']);
        showToast.success('Work added to portfolio');
      },
      onError: (error) => {
        showToast.error(error?.response?.data?.message || error?.message || 'Failed to add work to portfolio');
      }
    }
  );

  useEffect(() => {
    if (!contract) return;

    reset({
      title: contract.title || '',
      description: contract.description || '',
      terms: contract.terms || '',
      budgetAmount: contract.budget?.amount ?? '',
      budgetType: contract.budget?.type || 'fixed',
      budgetCurrency: contract.budget?.currency || 'USD',
      startDate: contract.startDate ? new Date(contract.startDate).toISOString().slice(0, 10) : ''
    });
  }, [contract, reset]);

  useEffect(() => {
    if (!contract || !isFreelancer) return;
    if (!portfolioTitle) setPortfolioTitle(contract.title || '');
    if (!portfolioDescription) setPortfolioDescription(contract.description || '');
  }, [contract, isFreelancer, portfolioDescription, portfolioTitle]);

  const onSubmit = (data) => {
    updateMutation.mutate({
      title: data.title,
      description: data.description,
      terms: data.terms,
      budget: {
        amount: Number(data.budgetAmount),
        type: data.budgetType,
        currency: data.budgetCurrency
      },
      startDate: data.startDate ? new Date(data.startDate) : undefined
    });
  };

  if (isLoading) return <p className="p-6">Loading contract...</p>;
  if (!contract) return <p className="p-6">Contract not found.</p>;

  const isDraft = contract.status === 'draft';
  const canEditDraft = isClient && isDraft;
  const canAcceptDraft = isFreelancer && isDraft;
  const canMarkCompleted = isClient && contract.status === 'active';
  const canLeaveReview = (isClient || isFreelancer) && contract.status === 'completed';
  const canAddPortfolioItem = isFreelancer && contract.status === 'completed';

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-gray-500 mb-2">Contract</p>
          <h1 className="text-3xl font-bold text-gray-900">{contract.title}</h1>
          <p className="text-gray-600 mt-2">
            {contract.job?.title || 'Project contract'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            contract.status === 'active'
              ? 'bg-green-100 text-green-700'
              : contract.status === 'completed'
                ? 'bg-blue-100 text-blue-700'
              : contract.status === 'draft'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
          }`}>
            {contract.status}
          </span>
          <button
            type="button"
            onClick={() => navigate(`/messages/direct/${isClient ? contract.freelancer?._id : contract.client?._id}`)}
            className="btn-outline inline-flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contract Terms</h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {contract.description || 'No description provided.'}
            </p>
            {contract.terms && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Terms</h3>
                <p className="text-gray-700 whitespace-pre-line">{contract.terms}</p>
              </div>
            )}
          </div>

          {canEditDraft && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <PencilLine className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">Edit Draft Contract</h2>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input {...register('title')} className="input w-full" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea {...register('description')} rows="4" className="input w-full" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Terms</label>
                  <textarea {...register('terms')} rows="5" className="input w-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Budget</label>
                    <input {...register('budgetAmount')} type="number" min="0" step="0.01" className="input w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                    <select {...register('budgetType')} className="input w-full">
                      <option value="fixed">Fixed</option>
                      <option value="hourly">Hourly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select {...register('budgetCurrency')} className="input w-full">
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input {...register('startDate')} type="date" className="input w-full" />
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-end pt-2">
                  <button
                    type="submit"
                    disabled={!isDirty || updateMutation.isLoading}
                    className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
                  >
                    <Send className="w-4 h-4" />
                    {updateMutation.isLoading ? 'Saving...' : 'Save Contract'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {canAcceptDraft && (
            <div className="card border border-green-200 bg-green-50/60">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Accept Contract</h2>
                  <p className="text-gray-700">
                    Review the draft terms and accept to make this contract active.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => acceptMutation.mutate()}
                  disabled={acceptMutation.isLoading}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {acceptMutation.isLoading ? 'Accepting...' : 'Accept Contract'}
                </button>
              </div>
            </div>
          )}

          {canMarkCompleted && (
            <div className="card border border-blue-200 bg-blue-50/60">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Mark Contract Completed</h2>
                  <p className="text-gray-700">
                    Confirm all milestones and deliverables are done before completing this contract.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => completeContractMutation.mutate()}
                  disabled={completeContractMutation.isLoading}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {completeContractMutation.isLoading ? 'Completing...' : 'Complete Contract'}
                </button>
              </div>
            </div>
          )}

          {canLeaveReview && (
            <div className="card border border-amber-200 bg-amber-50/40">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Leave a Review</h2>
              <p className="text-gray-700 mb-4">
                Share your experience for this completed contract.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <select
                    value={reviewRating}
                    onChange={(event) => setReviewRating(Number(event.target.value))}
                    className="input w-full"
                  >
                    <option value={5}>5 - Excellent</option>
                    <option value={4}>4 - Good</option>
                    <option value={3}>3 - Average</option>
                    <option value={2}>2 - Needs improvement</option>
                    <option value={1}>1 - Poor</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                <textarea
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  rows="4"
                  className="input w-full"
                  placeholder="What went well, and what could have been better?"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!reviewComment.trim()) {
                    showToast.error('Review comment is required');
                    return;
                  }
                  submitReviewMutation.mutate();
                }}
                disabled={submitReviewMutation.isLoading}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {submitReviewMutation.isLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          )}

          {canAddPortfolioItem && (
            <div className="card border border-purple-200 bg-purple-50/30">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Add This Work to Portfolio</h2>
              <p className="text-gray-700 mb-4">
                Turn this completed contract into a visible portfolio project.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
                  <input
                    value={portfolioTitle}
                    onChange={(event) => setPortfolioTitle(event.target.value)}
                    className="input w-full"
                    placeholder="Project title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={portfolioDescription}
                    onChange={(event) => setPortfolioDescription(event.target.value)}
                    rows="4"
                    className="input w-full"
                    placeholder="Describe the work delivered"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project URL (optional)</label>
                  <input
                    value={portfolioProjectUrl}
                    onChange={(event) => setPortfolioProjectUrl(event.target.value)}
                    className="input w-full"
                    placeholder="https://example.com/project"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => addToPortfolioMutation.mutate()}
                    disabled={addToPortfolioMutation.isLoading}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {addToPortfolioMutation.isLoading ? 'Adding...' : 'Add to Portfolio'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Client</span>
                <span className="font-medium text-gray-900 text-right">{contract.client?.firstName} {contract.client?.lastName}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Freelancer</span>
                <span className="font-medium text-gray-900 text-right">{contract.freelancer?.firstName} {contract.freelancer?.lastName}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Payment Type</span>
                <span className="font-medium text-gray-900 text-right capitalize">{contract.budget?.type || 'fixed'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Total Budget</span>
                <span className="font-medium text-gray-900 text-right">
                  {formatCurrency(contract.budget?.amount || 0)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Started</span>
                <span className="font-medium text-gray-900 text-right">
                  {formatDate(contract.startDate)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Client Signed</span>
                <span className="font-medium text-gray-900 text-right">
                  {contract.agreementSigned?.client?.signed ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Freelancer Signed</span>
                <span className="font-medium text-gray-900 text-right">
                  {contract.agreementSigned?.freelancer?.signed ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Milestones</h3>
            {contract.milestones?.length > 0 ? (
              <div className="space-y-3">
                {contract.milestones.map((milestone, index) => (
                  <div key={index} className="rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-gray-900">{milestone.title}</p>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(milestone.amount || 0)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                    <p className="text-xs text-gray-500 mt-2">Due {formatDate(milestone.dueDate)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No milestones added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractDetails;
