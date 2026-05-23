import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { jobAPI } from '../services/api';
import { Briefcase, DollarSign, Clock, Award, ArrowLeft } from 'lucide-react';
import { showToast } from '../components/ui/Toast';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';

const EditJobPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, watch, formState: { errors }, reset, control } = useForm();

  // Fetch job data
  const { data: jobData, isLoading, isError } = useQuery(
    ['job', jobId],
    () => jobAPI.getJobById(jobId),
    {
      select: (response) => response?.data?.data?.job,
      onSuccess: (job) => {
        // Pre-fill the form with job data
        reset({
          title: job.title,
          description: job.description,
          category: job.category,
          subCategory: job.subCategory,
          skills: job.skills?.join(', ') || '',
          budgetType: job.budget?.type || 'fixed',
          fixedAmount: job.budget?.type === 'fixed' ? job.budget?.amount : '',
          minAmount: job.budget?.type === 'hourly' ? job.budget?.minAmount : '',
          maxAmount: job.budget?.type === 'hourly' ? job.budget?.maxAmount : '',
          duration: job.duration,
          experienceLevel: job.experienceLevel,
          visibility: job.visibility || 'public',
          expiryDays: job.expiryDays || 30,
        });
      }
    }
  );

  const budgetType = watch('budgetType', jobData?.budget?.type || 'fixed');

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError('');

      // Validate budget
      if (data.budgetType === 'fixed') {
        if (!data.fixedAmount || parseFloat(data.fixedAmount) <= 0) {
          showToast.error('Please enter a valid fixed budget amount');
          return;
        }
      } else {
        if (!data.minAmount || !data.maxAmount || parseFloat(data.minAmount) <= 0 || parseFloat(data.maxAmount) <= 0) {
          showToast.error('Please enter valid budget range');
          return;
        }
        if (parseFloat(data.minAmount) > parseFloat(data.maxAmount)) {
          showToast.error('Minimum budget cannot be greater than maximum budget');
          return;
        }
      }

      // Construct budget object based on type
      const budget = {
        type: data.budgetType,
        currency: 'INR'
      };

      if (data.budgetType === 'fixed') {
        budget.amount = parseFloat(data.fixedAmount);
      } else {
        budget.minAmount = parseFloat(data.minAmount);
        budget.maxAmount = parseFloat(data.maxAmount);
      }

      const jobDataToUpdate = {
        ...data,
        skills: data.skills.split(',').map(s => s.trim()).filter(s => s),
        budget
      };

      // Remove temporary fields
      delete jobDataToUpdate.budgetType;
      delete jobDataToUpdate.fixedAmount;
      delete jobDataToUpdate.minAmount;
      delete jobDataToUpdate.maxAmount;

      const response = await jobAPI.updateJob(jobId, jobDataToUpdate);
      const updatedJob = response?.data?.data?.job;

      if (updatedJob) {
        showToast.success('Job updated successfully!');
        queryClient.invalidateQueries(['job', jobId]);
        queryClient.invalidateQueries('myJobs');
        setTimeout(() => {
          navigate('/my-jobs');
        }, 1500);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update job. Please try again.';
      setError(message);
      showToast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <PageLoader message="Loading job details..." />;
  }

  if (isError || !jobData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-red-600 mb-6">Unable to load job details.</p>
            <Link to="/my-jobs">
              <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                Back to My Jobs
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with back button */}
        <div className="mb-8">
          <Link to="/my-jobs" className="flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to My Jobs
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Briefcase className="w-8 h-8 text-primary-600" />
            <span>Edit Job</span>
          </h1>
          <p className="mt-2 text-gray-600">Update your job details</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                placeholder="e.g., Build a React Dashboard"
                {...register('title', {
                  required: 'Job title is required',
                  minLength: { value: 10, message: 'Title must be at least 10 characters' }
                })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                placeholder="Describe the project, requirements, and expectations..."
                rows="6"
                {...register('description', {
                  required: 'Job description is required',
                  minLength: { value: 20, message: 'Description must be at least 20 characters' }
                })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a category</option>
                  <option value="web-development">Web Development</option>
                  <option value="mobile-development">Mobile Development</option>
                  <option value="design">Design</option>
                  <option value="writing">Writing</option>
                  <option value="marketing">Marketing</option>
                  <option value="data-science">Data Science</option>
                  <option value="other">Other</option>
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sub Category
                </label>
                <input
                  type="text"
                  placeholder="e.g., React, Node.js"
                  {...register('subCategory')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Required Skills *
              </label>
              <input
                type="text"
                placeholder="e.g., React, JavaScript, Node.js (separate with commas)"
                {...register('skills', {
                  required: 'At least one skill is required'
                })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.skills ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.skills && <p className="mt-1 text-sm text-red-600">{errors.skills.message}</p>}
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                <DollarSign className="w-5 h-5 inline mr-2" />
                Budget *
              </label>

              <div className="mb-4">
                <label className="flex items-center space-x-4">
                  <input
                    type="radio"
                    value="fixed"
                    {...register('budgetType')}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-gray-700">Fixed Price</span>
                </label>
                <label className="flex items-center space-x-4 mt-2">
                  <input
                    type="radio"
                    value="hourly"
                    {...register('budgetType')}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-gray-700">Hourly Rate</span>
                </label>
              </div>

              {budgetType === 'fixed' ? (
                <input
                  type="number"
                  placeholder="Enter fixed budget amount"
                  step="0.01"
                  {...register('fixedAmount', {
                    required: 'Budget amount is required',
                    min: { value: 0.01, message: 'Budget must be greater than 0' }
                  })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.fixedAmount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Minimum hourly rate"
                    step="0.01"
                    {...register('minAmount', {
                      required: 'Minimum rate is required'
                    })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.minAmount ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <input
                    type="number"
                    placeholder="Maximum hourly rate"
                    step="0.01"
                    {...register('maxAmount', {
                      required: 'Maximum rate is required'
                    })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.maxAmount ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
              )}
            </div>

            {/* Duration & Experience Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="w-5 h-5 inline mr-2" />
                  Duration *
                </label>
                <select
                  {...register('duration', { required: 'Duration is required' })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.duration ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select duration</option>
                  <option value="less-than-week">Less than a week</option>
                  <option value="1-2-weeks">1-2 weeks</option>
                  <option value="2-4-weeks">2-4 weeks</option>
                  <option value="1-3-months">1-3 months</option>
                  <option value="3-6-months">3-6 months</option>
                  <option value="6+ months">6+ months</option>
                </select>
                {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Award className="w-5 h-5 inline mr-2" />
                  Experience Level *
                </label>
                <select
                  {...register('experienceLevel', { required: 'Experience level is required' })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.experienceLevel ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select experience level</option>
                  <option value="entry">Entry Level</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
                {errors.experienceLevel && (
                  <p className="mt-1 text-sm text-red-600">{errors.experienceLevel.message}</p>
                )}
              </div>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Visibility
              </label>
              <select
                {...register('visibility')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="public">Public (Visible to all freelancers)</option>
                <option value="invite-only">Invite Only (Only invited freelancers)</option>
                <option value="private">Private (Not visible)</option>
              </select>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-8 border-t border-gray-200">
              <Link to="/my-jobs" className="flex-1">
                <button
                  type="button"
                  className="w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating...' : 'Update Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditJobPage;
