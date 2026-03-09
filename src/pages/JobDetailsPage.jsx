import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { jobAPI, proposalAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase, DollarSign, Clock, Award, MapPin, Calendar,
  Send, ArrowLeft, User
} from 'lucide-react';
import { formatCurrency, formatDate, formatRelativeTime } from '../lib/utils';

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showProposalForm, setShowProposalForm] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const { data: job, isLoading } = useQuery(
    ['job', id],
    () => jobAPI.getJobById(id),
    {
      enabled: !!id,
      select: (response) => response?.data?.data?.job || null
    }
  );

  const proposalMutation = useMutation(
    (proposalData) => proposalAPI.createProposal(proposalData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['job', id]);
        reset();
        setShowProposalForm(false);
        alert('Proposal submitted successfully!');
      },
    }
  );

  const onSubmitProposal = (data) => {
    const proposalData = {
      jobId: id,
      coverLetter: data.coverLetter,
      proposedBudget: {
        type: job?.budget?.type || 'fixed', // Match job's budget type
        amount: parseFloat(data.proposedBudget),
      },
      deliveryTime: parseInt(data.deliveryTime),
    };
    proposalMutation.mutate(proposalData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Job not found</h2>
          <button onClick={() => navigate('/browse-jobs')} className="btn-primary mt-4">
            Browse Jobs
          </button>
        </div>
      </div>
    );
  }

  const isFreelancer = user?.role === 'freelancer';
  const isClient = user?.role === 'client';
  const isOwner = job.client?._id === user?._id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/browse-jobs')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Jobs
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Posted {formatRelativeTime(job.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.client?.clientProfile?.location || 'Remote'}
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  {job.status}
                </span>
              </div>

              {/* Budget & Duration */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                    <DollarSign className="w-4 h-4" />
                    Budget
                  </p>
                  <p className="font-semibold text-gray-900">
                    {job.budget?.type === 'fixed'
                      ? formatCurrency(job.budget?.amount ?? 0)
                      : job.budget?.minAmount !== undefined && job.budget?.maxAmount !== undefined
                        ? `${formatCurrency(job.budget.minAmount)} - ${formatCurrency(job.budget.maxAmount)}/hr`
                        : 'Hourly budget'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                    <Clock className="w-4 h-4" />
                    Duration
                  </p>
                  <p className="font-semibold text-gray-900 capitalize">{job.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                    <Award className="w-4 h-4" />
                    Level
                  </p>
                  <p className="font-semibold text-gray-900 capitalize">{job.experienceLevel}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
              </div>

              {/* Skills */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Proposal Form */}
            {isFreelancer && !isOwner && showProposalForm && (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Your Proposal</h2>
                <form onSubmit={handleSubmit(onSubmitProposal)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Letter *
                    </label>
                    <textarea
                      {...register('coverLetter', {
                        required: 'Cover letter is required',
                        minLength: 100,
                      })}
                      rows="6"
                      className="input"
                      placeholder="Explain why you're the best fit for this job..."
                    />
                    {errors.coverLetter && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.coverLetter.type === 'minLength'
                          ? 'Cover letter must be at least 100 characters'
                          : errors.coverLetter.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Bid (USD) *
                      </label>
                      <input
                        {...register('proposedBudget', { required: 'Bid is required', min: 1 })}
                        type="number"
                        className="input"
                        placeholder="e.g., 500"
                      />
                      {errors.proposedBudget && (
                        <p className="mt-1 text-sm text-red-600">{errors.proposedBudget.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Time (days) *
                      </label>
                      <input
                        {...register('deliveryTime', { required: 'Delivery time is required', min: 1 })}
                        type="number"
                        className="input"
                        placeholder="e.g., 14"
                      />
                      {errors.deliveryTime && (
                        <p className="mt-1 text-sm text-red-600">{errors.deliveryTime.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={proposalMutation.isLoading}
                      className="btn-primary flex-1"
                    >
                      {proposalMutation.isLoading ? 'Submitting...' : 'Submit Proposal'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowProposalForm(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Info */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">About the Client</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {job.client?.firstName} {job.client?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {job.client?.clientProfile?.company || 'Individual Client'}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Jobs Posted</span>
                  <span className="font-semibold">{job.client?.clientProfile?.totalJobs || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Spent</span>
                  <span className="font-semibold">
                    {formatCurrency(job.client?.clientProfile?.totalSpent || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold">{formatDate(job.client?.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Action Card */}
            {isFreelancer && !isOwner && (
              <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Apply for this Job</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {job.proposalsCount || 0} proposals submitted
                </p>
                <button
                  onClick={() => setShowProposalForm(true)}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Proposal
                </button>
              </div>
            )}

            {isClient && isOwner && (
              <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Manage Job</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {job.proposalsCount || 0} proposals received
                </p>
                <button
                  onClick={() => navigate(`/proposals?job=${id}`)}
                  className="btn-primary w-full"
                >
                  View Proposals
                </button>
              </div>
            )}

            {/* Job Stats */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Job Activity</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Proposals</span>
                  <span className="font-semibold">{job.proposalsCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-semibold capitalize">{job.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Job ID</span>
                  <span className="font-mono text-xs">{job._id?.slice(-8)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
