import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { freelancerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Star, DollarSign, Briefcase, Award, Mail, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

const FreelancerProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: freelancer, isLoading } = useQuery(
    ['freelancer', id],
    () => freelancerAPI.getFreelancerById(id)
  );

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

  if (!freelancer) {
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

  const profile = freelancer.freelancerProfile;
  const isOwnProfile = user?._id === freelancer._id;

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
                  <User className="w-12 h-12 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {freelancer.firstName} {freelancer.lastName}
                  </h1>
                  <p className="text-xl text-gray-700 mb-3">{profile?.title}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-semibold text-gray-900">
                        {profile?.rating?.toFixed(1) || '0.0'}
                      </span>
                      <span className="text-gray-600">({profile?.totalJobs || 0} reviews)</span>
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
                <div className="grid grid-cols-2 gap-4">
                  {profile.portfolio.map((item, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline text-sm mt-2 inline-block"
                        >
                          View Project →
                        </a>
                      )}
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
                  onClick={() => navigate('/post-job')}
                  className="btn-primary w-full mb-3"
                >
                  Hire Now
                </button>
                <button
                  onClick={() => navigate(`/messages?user=${freelancer._id}`)}
                  className="btn-outline w-full flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Contact
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
    </div>
  );
};

export default FreelancerProfilePage;
