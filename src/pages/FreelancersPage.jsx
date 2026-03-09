import { useQuery } from 'react-query';
import { freelancerAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { Star, AlertCircle } from 'lucide-react';

const FreelancersPage = () => {
  const { data, isLoading, error } = useQuery(
    'freelancers',
    () => freelancerAPI.getFreelancers({}),
    {
      retry: true,
      refetchOnWindowFocus: false,
      refetchInterval: 30000 // Poll every 30 seconds
    }
  );

  const freelancers = data?.data?.data?.freelancers || data?.data?.freelancers || [];
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Browse Freelancers</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">Failed to load freelancers. Please try again.</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-3 flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading freelancers...</p>
              </div>
            </div>
          ) : freelancers && freelancers.length > 0 ? (
            freelancers.map((freelancer) => (
              <Link
                key={freelancer._id}
                to={`/freelancers/${freelancer._id}`}
                className="card hover:shadow-lg transition-all text-center"
              >
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4">
                  {freelancer.user?.avatar ? (
                    <img
                      src={freelancer.user.avatar}
                      alt={`${freelancer.user?.firstName} ${freelancer.user?.lastName}`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-600">
                      {freelancer.user?.firstName?.[0] || '?'}
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-1">
                  {freelancer.user?.firstName} {freelancer.user?.lastName}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{freelancer.title || 'Freelancer'}</p>
                <div className="flex items-center justify-center space-x-1 text-yellow-500 mb-2">
                  <Star size={16} fill="currentColor" />
                  <span className="text-gray-900 font-semibold">
                    {(freelancer.rating || 0).toFixed(1)}
                  </span>
                </div>
                <p className="text-primary-600 font-semibold">
                  ${freelancer.hourlyRate || 0}/hr
                </p>
              </Link>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-500 text-lg">No freelancers found</p>
              <p className="text-gray-400 mt-2">Check back later or try a different search</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default FreelancersPage;
