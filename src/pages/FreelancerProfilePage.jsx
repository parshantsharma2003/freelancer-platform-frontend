import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { freelancerAPI, reviewAPI, jobAPI, inviteAPI, contractAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Star, DollarSign, Briefcase, Award, ArrowLeft, MessageCircle, Send, X } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

const FreelancerProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');

  const { data: profile, isLoading } = useQuery(
    ['freelancer', id],
    () => freelancerAPI.getFreelancerById(id),
    {
      select: (response) => response?.data?.data?.profile || null
    }
  );

  const freelancerUser = profile?.user;

  const { data: ratingsSummary } = useQuery(
    ['freelancer-ratings-summary', freelancerUser?._id],
    () => reviewAPI.getRatingsSummary(freelancerUser?._id),
    {
      enabled: !!freelancerUser?._id,
      select: (response) => response?.data?.data || null
    }
  );

  const { data: reviewsData } = useQuery(
    ['freelancer-reviews', freelancerUser?._id],
    () => reviewAPI.getUserReviews(freelancerUser?._id, { page: 1, limit: 6 }),
    {
      enabled: !!freelancerUser?._id,
      select: (response) => response?.data?.data || null
    }
  );

  const { data: clientJobsData } = useQuery(
    ['client-open-jobs'],
    () => jobAPI.getMyJobs({ status: 'open', limit: 100 }),
    {
      enabled: !!user && user?.role === 'client',
      select: (response) => response?.data?.data?.jobs || []
    }
  );

  // Check if there's an active contract with this freelancer
  const { data: contractsData } = useQuery(
    ['my-contracts', user?._id],
    () => contractAPI.getMyContracts({ status: 'active', limit: 100 }),
    {
      enabled: !!user && user?.role === 'client',
      select: (response) => response?.data?.data?.contracts || []
    }
  );

  const activeContractWithFreelancer = useMemo(() => {
    if (!contractsData || !freelancerUser?._id) return null;
    return contractsData.find(
      (contract) => contract.freelancer?._id === freelancerUser._id || contract.freelancer === freelancerUser._id
    );
  }, [contractsData, freelancerUser?._id]);

  const inviteMutation = useMutation(
    () => inviteAPI.sendJobInvite(selectedJobId, {
      freelancerId: freelancerUser?._id,
      message: inviteMessage.trim()
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['client-open-jobs']);
        setShowInviteModal(false);
        setSelectedJobId('');
        setInviteMessage('');
        alert('Offer sent successfully');
      }
    }
  );

  const openJobs = useMemo(() => clientJobsData || [], [clientJobsData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Freelancer not found</h2>
          <button onClick={() => navigate('/freelancers')} className="btn-primary mt-4">
            Browse Freelancers
          </button>
        </div>
      </div>
    );
  }

  const reviews = reviewsData?.reviews || [];
  const totalReviews = ratingsSummary?.totalReviews ?? profile?.totalJobs ?? 0;
  const averageRating = Number(ratingsSummary?.overallRating ?? profile?.rating ?? 0);
  const isOwnProfile = user?._id === freelancerUser?._id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/freelancers')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Freelancers
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="card">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {freelancerUser?.avatar ? (
                    <img
                      src={freelancerUser.avatar}
                      alt={`${freelancerUser?.firstName || ''} ${freelancerUser?.lastName || ''}`}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-primary-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {freelancerUser?.firstName} {freelancerUser?.lastName}
                  </h1>
                  <p className="text-xl text-gray-700 mb-3">{profile?.title}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-semibold text-gray-900">
                        {averageRating.toFixed(1)}
                      </span>
                      <span className="text-gray-600">({totalReviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      <span>{profile?.totalJobs || 0} jobs completed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {profile?.bio || 'No bio provided yet.'}
              </p>
            </div>

            {/* Skills */}
            {profile?.skills && profile.skills.length > 0 && (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-primary-600" />
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio */}
            {profile?.portfolio && profile.portfolio.length > 0 && (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Portfolio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.portfolio.map((item, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                      {item.imageUrl && (
                        <div className="h-40 bg-gray-100">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        {item.projectUrl || item.url ? (
                          <a
                            href={item.projectUrl || item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline text-sm mt-2 inline-block"
                          >
                            View Project →
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {profile?.experience && profile.experience.length > 0 && (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Experience</h2>
                <div className="space-y-4">
                  {profile.experience.map((exp, idx) => (
                    <div key={idx} className="border-l-4 border-primary-600 pl-4">
                      <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                      <p className="text-gray-700">{exp.company}</p>
                      <p className="text-sm text-gray-500">
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </p>
                      {exp.description && (
                        <p className="text-gray-600 mt-2">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                Reviews
              </h2>

              <div className="mb-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Overall Rating</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm text-gray-700">{totalReviews} reviews</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Completed Jobs</p>
                    <p className="text-xl font-semibold text-gray-900">{profile?.totalJobs || 0}</p>
                  </div>
                </div>
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {review?.reviewer?.firstName} {review?.reviewer?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {review?.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="font-semibold text-gray-900">
                            {Number(review?.rating?.overall || 0).toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No public reviews yet.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Hire Card */}
            {!isOwnProfile && user?.role === 'client' && (
              <div className="card">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-1 text-4xl font-bold text-gray-900 mb-2">
                    <DollarSign className="w-8 h-8" />
                    {profile?.hourlyRate || 0}
                    <span className="text-xl text-gray-600">/hr</span>
                  </div>
                  <p className="text-sm text-gray-600">Hourly Rate</p>
                </div>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="btn-primary w-full mb-3"
                >
                  Send Offer
                </button>
                <button
                  onClick={() => activeContractWithFreelancer && navigate(`/messages?contract=${activeContractWithFreelancer._id}`)}
                  disabled={!activeContractWithFreelancer}
                  title={activeContractWithFreelancer ? 'Open contract chat' : 'Messaging is only available after a contract has been successfully created'}
                  className="btn-outline w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </button>
              </div>
            )}

            {/* Stats Card */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Jobs Completed</span>
                  <span className="font-semibold text-gray-900">{profile?.totalJobs || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Hourly Rate</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(profile?.hourlyRate || 0)}/hr</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Rating</span>
                  <span className="font-semibold text-gray-900">{averageRating.toFixed(1)} ⭐</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Public Reviews</span>
                  <span className="font-semibold text-gray-900">{totalReviews}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Earned</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(profile?.totalEarnings || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-gray-900">
                    {profile?.successRate || 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Profile Complete</span>
                  <span className="font-semibold text-gray-900">
                    {profile?.completeness || 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Badges</h3>
              <div className="space-y-2">
                {profile?.isTopRated && (
                  <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-900">Top Rated</span>
                  </div>
                )}
                {profile?.isFeatured && (
                  <div className="flex items-center gap-2 p-2 bg-primary-50 rounded-lg">
                    <Award className="w-5 h-5 text-primary-600" />
                    <span className="text-sm font-medium text-primary-900">Featured</span>
                  </div>
                )}
                {!profile?.isTopRated && !profile?.isFeatured && (
                  <p className="text-sm text-gray-500">No badges yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showInviteModal && user?.role === 'client' && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Send Offer</h3>
                <p className="text-sm text-gray-600">Invite this freelancer to one of your open jobs.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select job</label>
                <select
                  value={selectedJobId}
                  onChange={(event) => setSelectedJobId(event.target.value)}
                  className="input w-full"
                >
                  <option value="">Choose one of your open jobs</option>
                  {openJobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.title}
                    </option>
                  ))}
                </select>
                {openJobs.length === 0 && (
                  <p className="mt-2 text-sm text-amber-600">
                    You need an open job before you can send an offer.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={inviteMessage}
                  onChange={(event) => setInviteMessage(event.target.value)}
                  rows="5"
                  className="input w-full"
                  placeholder="Introduce the project and why you want to hire this freelancer..."
                />
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => inviteMutation.mutate()}
                disabled={!selectedJobId || inviteMutation.isLoading || openJobs.length === 0}
                className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                {inviteMutation.isLoading ? 'Sending...' : 'Send Offer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerProfilePage;
