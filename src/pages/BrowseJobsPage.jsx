import { useQuery, useMutation, useQueryClient } from 'react-query';
import { jobAPI, freelancerAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { Search, DollarSign, Clock, Bookmark } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatCurrency, formatRelativeTime, truncateText } from '../lib/utils';
import { addSavedJobToCache, getSavedJobsCache, removeSavedJobFromCache } from '../lib/savedJobsCache';
import socketService from '../services/socketService';
import { showToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';

const BrowseJobsPage = () => {
  const queryClient = useQueryClient();
  const { user, isAuthResolved, isAuthenticated } = useAuth();
  const isFreelancer = user?.role === 'freelancer';

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    budgetType: '',
    experienceLevel: '',
  });

  const { data: jobs = [], isLoading, refetch } = useQuery(
    ['jobs', filters],
    () => jobAPI.getJobs(filters),
    {
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchInterval: 10000,
      select: (response) => response?.data?.data?.jobs || []
    }
  );

  const { data: savedJobsData } = useQuery(
    ['savedJobIds'],
    () => freelancerAPI.getSavedJobs({ page: 1, limit: 200 }),
    {
      enabled: isFreelancer && isAuthResolved && isAuthenticated,
      select: (response) => {
        const apiJobs = response?.data?.data?.jobs || [];
        return apiJobs.length > 0 ? apiJobs : getSavedJobsCache();
      }
    }
  );

  const savedJobIds = new Set((savedJobsData || []).map((job) => job._id));

  const saveJobMutation = useMutation(
    (jobId) => freelancerAPI.saveJob(jobId),
    {
      onSuccess: (_, jobId) => {
        const savedJob = jobs.find((job) => job._id === jobId);

        if (savedJob) {
          addSavedJobToCache(savedJob);
          queryClient.setQueryData(['savedJobIds'], getSavedJobsCache());
        }

        queryClient.invalidateQueries('savedJobIds');
        queryClient.invalidateQueries('savedJobs');
        window.dispatchEvent(new CustomEvent('saved-jobs:changed'));
        showToast.success('Job saved');
      },
      onError: (error) => {
        showToast.error(error?.response?.data?.message || 'Failed to save job');
      }
    }
  );

  const unsaveJobMutation = useMutation(
    (jobId) => freelancerAPI.unsaveJob(jobId),
    {
      onSuccess: (_, jobId) => {
        removeSavedJobFromCache(jobId);
        queryClient.setQueryData(['savedJobIds'], getSavedJobsCache());

        queryClient.invalidateQueries('savedJobIds');
        queryClient.invalidateQueries('savedJobs');
        window.dispatchEvent(new CustomEvent('saved-jobs:changed'));
        showToast.success('Job removed from saved');
      },
      onError: (error) => {
        showToast.error(error?.response?.data?.message || 'Failed to remove saved job');
      }
    }
  );

  const toggleSaveJob = (jobId, isSaved) => {
    if (isSaved) {
      unsaveJobMutation.mutate(jobId);
      return;
    }

    saveJobMutation.mutate(jobId);
  };

  // 📡 Listen for real-time job postings via Socket.io
  useEffect(() => {
    const setupSocket = async () => {
      // Ensure socket is connected
      const connected = await socketService.connect();
      
      if (connected) {
        // Listen for new job posted event
        socketService.on('job:new', (event) => {
          console.log('[BrowseJobs] New job posted:', event.data?.title);
          
          // Show notification
          showToast.info(`New job posted: ${event.data?.title}`);
          
          // Refetch jobs list to show the new job
          refetch();
        });
      } else {
        console.log('[BrowseJobs] Socket unavailable, relying on REST for updates');
        // Socket unavailable - REST API with polling/refetch handles it
      }
    };

    setupSocket();

    // Cleanup
    return () => {
      socketService.off('job:new');
    };
  }, [refetch]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Browse Jobs</h1>

        {/* Search Bar */}
        <div className="card mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search jobs..."
              className="input flex-1"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <button className="btn btn-primary">
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {isLoading ? (
            <p>Loading jobs...</p>
          ) : jobs.length > 0 ? (
            jobs.map((job) => (
              <article
                key={job._id}
                className="card border border-transparent transition-all hover:shadow-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                    <p className="mt-2 text-gray-600">
                      {truncateText(job.description || '', 180)}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <DollarSign size={16} />
                        <span>
                          {job.budget?.type === 'fixed'
                            ? formatCurrency(job.budget.amount)
                            : `${formatCurrency(job.budget.minAmount)} - ${formatCurrency(job.budget.maxAmount)}/hr`}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{formatRelativeTime(job.createdAt)}</span>
                      </span>
                      <span className="font-medium text-primary-700">{job.proposalsCount || 0} proposals</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    {isFreelancer && (
                      <button
                        type="button"
                        onClick={() => toggleSaveJob(job._id, savedJobIds.has(job._id))}
                        className={`btn ${savedJobIds.has(job._id) ? 'btn-secondary' : 'btn-outline'}`}
                        disabled={saveJobMutation.isLoading || unsaveJobMutation.isLoading}
                      >
                        <span className="inline-flex items-center gap-2">
                          <Bookmark size={16} />
                          {savedJobIds.has(job._id) ? 'Saved' : 'Save Job'}
                        </span>
                      </button>
                    )}
                    <Link to={`/jobs/${job._id}`} className="btn btn-primary">
                      View Details
                    </Link>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="text-center text-gray-500 py-12">No jobs found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseJobsPage;
