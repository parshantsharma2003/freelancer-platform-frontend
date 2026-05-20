import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { jobAPI } from '../services/api';
import { Briefcase, DollarSign, Clock, Award } from 'lucide-react';
import { showToast } from '../components/ui/Toast';

const PostJobPage = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const budgetType = watch('budgetType', 'fixed');

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError('');

      // Construct budget object based on type
      const budget = {
        type: data.budgetType
      };

      if (data.budgetType === 'fixed') {
        budget.amount = parseFloat(data.fixedAmount);
      } else {
        budget.minAmount = parseFloat(data.minAmount);
        budget.maxAmount = parseFloat(data.maxAmount);
      }

      const jobData = {
        ...data,
        skills: data.skills.split(',').map(s => s.trim()),
        budget
      };

      // Remove temporary fields
      delete jobData.budgetType;
      delete jobData.fixedAmount;
      delete jobData.minAmount;
      delete jobData.maxAmount;

      const response = await jobAPI.createJob(jobData);
      const createdJob = response?.data?.data?.job;
      
      // Show success message and refresh jobs list
      showToast.success('Job posted successfully!');
      queryClient.invalidateQueries('jobs');
      queryClient.invalidateQueries('myJobs');

      if (createdJob) {
        queryClient.setQueryData(['myJobs', 'all'], (prev) => {
          const previousItems = Array.isArray(prev) ? prev : [];
          return [createdJob, ...previousItems];
        });
        queryClient.setQueryData([
          'myJobs',
          createdJob.status || 'open'
        ], (prev) => {
          const previousItems = Array.isArray(prev) ? prev : [];
          return [createdJob, ...previousItems];
        });
      }
      
      // Navigate to my jobs page
      setTimeout(() => navigate('/my-jobs'), 500);
    } catch (err) {
      console.error('Job creation error:', err.response?.data || err);
      
      // Handle specific error cases
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 403) {
        setError('Only clients can post jobs. Please log in with a client account.');
      } else {
        // Handle validation errors
        if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
          const validationErrors = err.response.data.errors
            .map(e => `${e.field}: ${e.message}`)
            .join('; ');
          setError(`Validation Error - ${validationErrors}`);
        } else {
          const errorMsg = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to create job. Please check all required fields.';
          setError(errorMsg);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-primary-600" />
            Post a New Job
          </h1>
          <p className="text-gray-600 mt-2">Find the perfect freelancer for your project</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title *
            </label>
            <input
              {...register('title', { required: 'Job title is required' })}
              type="text"
              className="input"
              placeholder="e.g., Full Stack Developer Needed"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select {...register('category', { required: 'Category is required' })} className="input">
              <option value="">Select a category</option>
              <option value="development">Web Development</option>
              <option value="design">Design</option>
              <option value="writing">Writing & Content</option>
              <option value="marketing">Digital Marketing</option>
              <option value="video">Video & Animation</option>
              <option value="music">Music & Audio</option>
              <option value="business">Business</option>
              <option value="data">Data Science</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description *
            </label>
            <textarea
              {...register('description', { required: 'Description is required', minLength: 50 })}
              rows="6"
              className="input"
              placeholder="Describe your project in detail..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.type === 'minLength' 
                  ? 'Description must be at least 50 characters' 
                  : errors.description.message}
              </p>
            )}
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Skills * (comma-separated)
            </label>
            <input
              {...register('skills', { required: 'Skills are required' })}
              type="text"
              className="input"
              placeholder="e.g., React, Node.js, MongoDB"
            />
            {errors.skills && (
              <p className="mt-1 text-sm text-red-600">{errors.skills.message}</p>
            )}
          </div>

          {/* Budget Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Budget Type *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  {...register('budgetType')}
                  type="radio"
                  value="fixed"
                  className="mr-2"
                />
                Fixed Price
              </label>
              <label className="flex items-center">
                <input
                  {...register('budgetType')}
                  type="radio"
                  value="hourly"
                  className="mr-2"
                />
                Hourly Rate
              </label>
            </div>
          </div>

          {/* Budget Amount */}
          {budgetType === 'fixed' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fixed Budget (USD) *
              </label>
              <input
                {...register('fixedAmount', { required: 'Budget is required', min: 1 })}
                type="number"
                className="input"
                placeholder="e.g., 500"
              />
              {errors.fixedAmount && (
                <p className="mt-1 text-sm text-red-600">{errors.fixedAmount.message}</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Hourly Rate (USD) *
                </label>
                <input
                  {...register('minAmount', { required: 'Min rate is required', min: 1 })}
                  type="number"
                  className="input"
                  placeholder="e.g., 15"
                />
                {errors.minAmount && (
                  <p className="mt-1 text-sm text-red-600">{errors.minAmount.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Hourly Rate (USD) *
                </label>
                <input
                  {...register('maxAmount', { required: 'Max rate is required', min: 1 })}
                  type="number"
                  className="input"
                  placeholder="e.g., 30"
                />
                {errors.maxAmount && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxAmount.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Project Duration *
            </label>
            <select {...register('duration', { required: 'Duration is required' })} className="input">
              <option value="">Select duration</option>
              <option value="less-than-week">Less than a week</option>
              <option value="1-2-weeks">1-2 weeks</option>
              <option value="2-4-weeks">2-4 weeks</option>
              <option value="1-3-months">1-3 months</option>
              <option value="3-6-months">3-6 months</option>
              <option value="6+ months">6+ months</option>
            </select>
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
            )}
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Award className="w-4 h-4 inline mr-1" />
              Experience Level *
            </label>
            <select {...register('experienceLevel', { required: 'Experience level is required' })} className="input">
              <option value="">Select level</option>
              <option value="entry">Entry Level</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </select>
            {errors.experienceLevel && (
              <p className="mt-1 text-sm text-red-600">{errors.experienceLevel.message}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1"
            >
              {isSubmitting ? 'Posting...' : 'Post Job'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJobPage;
