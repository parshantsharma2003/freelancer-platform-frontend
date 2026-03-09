import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { Briefcase, Plus, Search, DollarSign, Clock, Edit2, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/ui/LoadingSpinner';
import Badge from '../components/ui/Badge';
import { formatCurrency, formatRelativeTime } from '../lib/utils';
import { showToast } from '../components/ui/Toast';

const MyJobsPage = () => {
  const { accessToken, isAuthResolved } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteJobId, setDeleteJobId] = useState(null);

  const { data: jobs = [], isLoading, isError } = useQuery(
    ['myJobs', status],
    () => jobAPI.getMyJobs({
      status: status === 'all' ? undefined : status,
      limit: 50
    }),
    {
      enabled: isAuthResolved && !!accessToken,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      select: (response) => response?.data?.data?.jobs || []
    }
  );

  // Update job status mutation
  const updateStatusMutation = useMutation(
    (data) => jobAPI.updateJobStatus(data.jobId, { status: data.newStatus }),
    {
      onSuccess: () => {
        showToast.success('Job status updated successfully');
        queryClient.invalidateQueries('myJobs');
        setShowStatusModal(false);
        setSelectedJobId(null);
      },
      onError: (error) => {
        showToast.error(error.response?.data?.message || 'Failed to update job status');
      }
    }
  );

  // Delete job mutation
  const deleteJobMutation = useMutation(
    (jobId) => jobAPI.deleteJob(jobId),
    {
      onSuccess: () => {
        showToast.success('Job deleted successfully');
        queryClient.invalidateQueries('myJobs');
        setShowDeleteModal(false);
        setDeleteJobId(null);
      },
      onError: (error) => {
        showToast.error(error.response?.data?.message || 'Failed to delete job');
      }
    }
  );

  const filteredJobs = useMemo(() => {
    if (!search.trim()) return jobs;
    const query = search.trim().toLowerCase();
    return jobs.filter((job) =>
      job.title?.toLowerCase().includes(query) ||
      job.description?.toLowerCase().includes(query)
    );
  }, [jobs, search]);

  const handleStatusChange = (jobId, newStatus) => {
    updateStatusMutation.mutate({ jobId, newStatus });
  };

  const handleDeleteJob = (jobId) => {
    setDeleteJobId(jobId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteJobId) {
      deleteJobMutation.mutate(deleteJobId);
    }
  };

  if (isLoading) {
    return <PageLoader message="Loading your jobs..." />;
  }

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
                <Briefcase className="w-8 h-8 text-primary-600" />
                <span>My Jobs</span>
              </h1>
              <p className="mt-2 text-gray-600">
                Manage all your posted jobs and track applications
              </p>
            </div>
            <Link to="/post-job">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Post New Job</span>
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
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search your jobs..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </motion.div>

        {isError ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-8 text-center"
          >
            <p className="text-gray-600">Unable to load your jobs. Please refresh.</p>
          </motion.div>
        ) : filteredJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-12 text-center"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No jobs posted yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start hiring talented freelancers by posting your first job
              </p>
              <Link to="/post-job">
                <button className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-colors inline-flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Post Your First Job</span>
                </button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <Link to={`/jobs/${job._id}`} className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 truncate">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-2">
                      {job.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {job.budget?.type === 'fixed'
                          ? formatCurrency(job.budget.amount)
                          : `${formatCurrency(job.budget.minAmount)} - ${formatCurrency(job.budget.maxAmount)}/hr`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatRelativeTime(job.createdAt)}
                      </span>
                    </div>
                  </Link>
                  <div className="flex flex-col items-end gap-3 ml-4">
                    <Badge
                      variant={
                        job.status === 'open'
                          ? 'success'
                          : job.status === 'in-progress'
                            ? 'info'
                            : job.status === 'completed'
                              ? 'primary'
                              : job.status === 'closed'
                                ? 'warning'
                                : job.status === 'cancelled'
                                  ? 'danger'
                                  : 'default'
                      }
                      size="sm"
                    >
                      {job.status}
                    </Badge>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {/* Edit Button */}
                      {job.status !== 'completed' && job.status !== 'closed' && (
                        <Link to={`/edit-job/${job._id}`}>
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit job">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </Link>
                      )}

                      {/* Status Dropdown */}
                      <div className="relative group">
                        <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" title="Change status">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          <div className="py-1">
                            {['open', 'in-progress', 'completed', 'closed', 'cancelled'].map((s) => (
                              <button
                                key={s}
                                onClick={() => handleStatusChange(job._id, s)}
                                disabled={job.status === s || updateStatusMutation.isLoading}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors capitalize"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        disabled={deleteJobMutation.isLoading}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-sm mx-4 p-6"
          >
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Delete Job?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete this job? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteJobMutation.isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteJobMutation.isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyJobsPage;
