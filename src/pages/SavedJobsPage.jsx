import { motion } from 'framer-motion';
import { Bookmark, Search, Filter, DollarSign, Clock, Briefcase, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { freelancerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { showToast } from '../components/ui/Toast';
import { formatCurrency, formatRelativeTime } from '../lib/utils';
import { getSavedJobsCache, removeSavedJobFromCache, setSavedJobsCache } from '../lib/savedJobsCache';

const SavedJobsPage = () => {
  const { isAuthResolved, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const [cachedSavedJobs, setCachedSavedJobs] = useState(() => getSavedJobsCache());

  // Fetch saved jobs
  const savedJobsQuery = useQuery(
    ['savedJobs', page, searchQuery, filterType],
    () => freelancerAPI.getSavedJobs({ 
      page, 
      limit: 20,
      search: searchQuery || undefined,
      category: filterType !== 'all' ? filterType : undefined
    }),
    {
      enabled: isAuthResolved && isAuthenticated,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      onError: (error) => {
        showToast.error(error.response?.data?.message || 'Failed to load saved jobs');
      }
    }
  );

  const apiSavedJobs = savedJobsQuery.data?.data?.jobs;
  const isLoading = savedJobsQuery.isLoading;
  const refetch = savedJobsQuery.refetch;

  useEffect(() => {
    if (!Array.isArray(apiSavedJobs)) {
      return;
    }

    if (apiSavedJobs.length > 0) {
      setSavedJobsCache(apiSavedJobs);
      setCachedSavedJobs((currentJobs) => {
        const currentIds = currentJobs.map((job) => job._id).join(',');
        const nextIds = apiSavedJobs.map((job) => job._id).join(',');

        return currentIds === nextIds ? currentJobs : apiSavedJobs;
      });
      return;
    }

    const cacheJobs = getSavedJobsCache();
    setCachedSavedJobs((currentJobs) => {
      const currentIds = currentJobs.map((job) => job._id).join(',');
      const nextIds = cacheJobs.map((job) => job._id).join(',');

      return currentIds === nextIds ? currentJobs : cacheJobs;
    });
  }, [apiSavedJobs]);

  // Unsave job mutation
  const unsaveMutation = useMutation(
    (jobId) => freelancerAPI.unsaveJob(jobId),
    {
      onSuccess: (_, jobId) => {
        removeSavedJobFromCache(jobId);
        queryClient.invalidateQueries('savedJobs');
        showToast.success('Job removed from saved list');
      },
      onError: (error) => {
        showToast.error(error.response?.data?.message || 'Failed to unsave job');
      }
    }
  );

  const handleUnsave = (e, jobId) => {
    e.preventDefault();
    e.stopPropagation();
    unsaveMutation.mutate(jobId);
  };

  useEffect(() => {
    const syncSavedJobs = () => {
      setCachedSavedJobs(getSavedJobsCache());
      refetch();
    };

    window.addEventListener('saved-jobs:changed', syncSavedJobs);

    return () => {
      window.removeEventListener('saved-jobs:changed', syncSavedJobs);
    };
  }, [refetch]);

  if (isLoading) {
    return <PageLoader message="Loading your saved jobs..." />;
  }

  const savedJobs = Array.isArray(apiSavedJobs) && apiSavedJobs.length > 0
    ? apiSavedJobs
    : cachedSavedJobs;

  const pagination = Array.isArray(apiSavedJobs) && apiSavedJobs.length > 0
    ? (savedJobsQuery.data?.data?.pagination || { total: 0, page: 1, pages: 0 })
    : { total: cachedSavedJobs.length, page, pages: cachedSavedJobs.length > 0 ? 1 : 0 };

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
                <Bookmark className="w-8 h-8 text-primary-600" />
                <span>Saved Jobs</span>
              </h1>
              <p className="mt-2 text-gray-600">
                {pagination.total > 0 
                  ? `${pagination.total} job${pagination.total !== 1 ? 's' : ''} bookmarked`
                  : 'No saved jobs yet'}
              </p>
            </div>
            <Link to="/browse-jobs">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-colors flex items-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>Find More Jobs</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 bg-white rounded-lg shadow-sm p-4"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search saved jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly</option>
              </select>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Empty State */}
        {savedJobs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-12 text-center"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bookmark className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No saved jobs yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start saving jobs that interest you to review them later
              </p>
              <Link to="/browse-jobs">
                <button className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-colors inline-flex items-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>Browse Available Jobs</span>
                </button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Job Cards (if there are saved jobs) */}
        {savedJobs.length > 0 && (
          <>
            <div className="grid gap-6">
              {savedJobs.map((job, index) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 relative group"
                >
                  {/* Unsave button */}
                  <button
                    onClick={(e) => handleUnsave(e, job._id)}
                    disabled={unsaveMutation.isLoading}
                    className="absolute top-4 right-4 p-2 rounded-full bg-red-50 text-red-600 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all disabled:opacity-50"
                    title="Remove from saved"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <Link to={`/jobs/${job._id}`} className="block">
                    <div className="flex items-start justify-between mb-4 pr-12">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {job.description}
                        </p>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills?.slice(0, 6).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills?.length > 6 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                          +{job.skills.length - 6} more
                        </span>
                      )}
                    </div>

                    {/* Job Meta */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <DollarSign size={16} />
                          <span className="font-semibold">
                            {job.budget?.type === 'fixed'
                              ? formatCurrency(job.budget.amount)
                              : `${formatCurrency(job.budget.minAmount || 0)}-${formatCurrency(job.budget.maxAmount || 0)}/hr`}
                          </span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock size={16} />
                          <span>{formatRelativeTime(job.createdAt)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Briefcase size={16} />
                          <span>{job.proposalsCount || 0} proposals</span>
                        </span>
                      </div>
                      {job.category && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {job.category}
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SavedJobsPage;
