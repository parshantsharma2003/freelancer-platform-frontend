import { useQuery } from 'react-query';
import { jobAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { Search, MapPin, DollarSign, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatCurrency, formatRelativeTime } from '../lib/utils';
import socketService from '../services/socketService';
import { showToast } from '../components/ui/Toast';

const BrowseJobsPage = () => {
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
              <Link
                key={job._id}
                to={`/jobs/${job._id}`}
                className="card hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{job.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.skills?.slice(0, 5).map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <DollarSign size={16} />
                      <span>
                        {job.budget?.type === 'fixed'
                          ? formatCurrency(job.budget.amount)
                          : `${formatCurrency(job.budget.minAmount)} - ${formatCurrency(job.budget.maxAmount)}/hr`}
                      </span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock size={16} />
                      <span>{formatRelativeTime(job.createdAt)}</span>
                    </span>
                  </div>
                  <span className="font-semibold text-primary-600">
                    {job.proposalsCount} proposals
                  </span>
                </div>
              </Link>
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
