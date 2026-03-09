import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { userAPI, freelancerAPI, clientAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Briefcase, DollarSign, Award, Save, Plus, X } from 'lucide-react';

const MyProfilePage = () => {
  const { user, updateUser, accessToken, isAuthResolved } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      hourlyRate: '',
      bio: '',
      company: '',
      website: '',
      description: '',
    }
  });

  const isFreelancer = user?.role === 'freelancer';
  const isClient = user?.role === 'client';

  // Fetch profile based on role
  const { data: profile, isLoading } = useQuery(
    ['myProfile', user?.role],
    async () => {
      try {
        if (isFreelancer) {
          const response = await freelancerAPI.getMyProfile();
          return response?.data?.data?.profile || null;
        }
        if (isClient) {
          const response = await clientAPI.getMyProfile();
          return response?.data?.data?.profile || null;
        }
      } catch (error) {
        // If 404, return empty object (profile doesn't exist yet)
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    { 
      enabled: !!user && isAuthResolved && !!accessToken,
      retry: false,
      refetchOnWindowFocus: false
    }
  );

  // Profile mutation
  const profileMutation = useMutation(
    (profileData) => {
      if (isFreelancer) return freelancerAPI.createOrUpdateProfile(profileData);
      if (isClient) return clientAPI.createOrUpdateProfile(profileData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['myProfile']);
        setIsEditing(false);
        alert('Profile updated successfully!');
      },
      onError: (error) => {
        console.error('Profile update error:', error.response?.data || error.message);
        alert(`Error: ${error.response?.data?.message || error.message}`);
      }
    }
  );

  // User info mutation
  const userMutation = useMutation(
    (userData) => userAPI.updateProfile(userData),
    {
      onSuccess: (data) => {
        updateUser(data);
        alert('User information updated successfully!');
      },
    }
  );

  useEffect(() => {
    if (profile && isFreelancer) {
      setSkills(profile.skills || []);
      setValue('title', profile.title);
      setValue('hourlyRate', profile.hourlyRate);
      // Backend returns 'description' but frontend form uses 'bio'
      setValue('bio', profile.description || profile.bio);
    } else if (profile && isClient) {
      setValue('company', profile.company);
      setValue('website', profile.website);
      setValue('description', profile.description);
    }
  }, [profile, setValue, isFreelancer, isClient]);

  useEffect(() => {
    if (profile === null) {
      setIsEditing(true);
    }
  }, [profile]);

  const onSubmitProfile = (data) => {
    console.log('Form data before submission:', data); // Debug: see what data is being sent
    
    if (isFreelancer) {
      // Map frontend field names to backend field names
      const freelancerData = {
        title: data.title?.trim(),
        description: (data.bio || '')?.trim(), // Frontend uses 'bio', backend expects 'description'
        hourlyRate: parseFloat(data.hourlyRate),
        skills: skills || [],
      };
      console.log('Freelancer data being sent:', freelancerData); // Debug: see the final data
      profileMutation.mutate(freelancerData);
    } else {
      profileMutation.mutate(data);
    }
  };

  const onSubmitUserInfo = handleSubmit((data) => {
    userMutation.mutate({
      firstName: data.firstName,
      lastName: data.lastName,
    });
  });

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <User className="w-8 h-8 text-primary-600" />
            My Profile
          </h1>
          <p className="text-gray-600 mt-2">Manage your personal information and {isFreelancer ? 'freelancer' : 'client'} profile</p>
        </div>

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
            </div>
            <form onSubmit={onSubmitUserInfo} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    {...register('firstName')}
                    defaultValue={user?.firstName}
                    type="text"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    {...register('lastName')}
                    defaultValue={user?.lastName}
                    type="text"
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={user?.email}
                  disabled
                  className="input bg-gray-100 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>
              <button type="submit" className="btn-primary" disabled={userMutation.isLoading}>
                {userMutation.isLoading ? 'Saving...' : 'Save Personal Info'}
              </button>
            </form>
          </div>

          {/* Freelancer Profile */}
          {isFreelancer && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Freelancer Profile
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {profile === null && (
                <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                  Your freelancer profile is not set up yet. Add your details below to go live.
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Title *
                  </label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    type="text"
                    className="input"
                    placeholder="e.g., Full Stack Developer"
                    disabled={!isEditing}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Hourly Rate (USD) *
                  </label>
                  <input
                    {...register('hourlyRate', { required: 'Hourly rate is required', min: 1 })}
                    type="number"
                    className="input"
                    placeholder="e.g., 50"
                    disabled={!isEditing}
                  />
                  {errors.hourlyRate && (
                    <p className="mt-1 text-sm text-red-600">{errors.hourlyRate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio / About Me *
                  </label>
                  <textarea
                    {...register('bio', { required: 'Bio is required', minLength: 50 })}
                    rows="6"
                    className="input"
                    placeholder="Tell clients about your experience and expertise..."
                    disabled={!isEditing}
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.bio.type === 'minLength' 
                        ? 'Bio must be at least 50 characters' 
                        : errors.bio.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium flex items-center gap-2"
                      >
                        {skill}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        className="input flex-1"
                        placeholder="Add a skill..."
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="btn-secondary flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={profileMutation.isLoading}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {profileMutation.isLoading ? 'Saving...' : 'Save Profile'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>

              {/* Profile Stats */}
              {profile && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-primary-600">{profile.totalJobs || 0}</p>
                      <p className="text-sm text-gray-600">Jobs Completed</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-primary-600">{profile.rating?.toFixed(1) || '0.0'}</p>
                      <p className="text-sm text-gray-600">Rating</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-primary-600">{profile.completeness || 0}%</p>
                      <p className="text-sm text-gray-600">Profile Complete</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Client Profile */}
          {isClient && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Client Profile
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {profile === null && (
                <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                  Your client profile is not set up yet. Add your details below to get started.
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    {...register('company')}
                    type="text"
                    className="input"
                    placeholder="Your company name"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    {...register('website')}
                    type="url"
                    className="input"
                    placeholder="https://example.com"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows="4"
                    className="input"
                    placeholder="Tell freelancers about your company..."
                    disabled={!isEditing}
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={profileMutation.isLoading}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {profileMutation.isLoading ? 'Saving...' : 'Save Profile'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>

              {/* Profile Stats */}
              {profile && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-primary-600">{profile.totalJobs || 0}</p>
                      <p className="text-sm text-gray-600">Jobs Posted</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-primary-600">{profile.activeJobs || 0}</p>
                      <p className="text-sm text-gray-600">Active Jobs</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-primary-600">${profile.totalSpent || 0}</p>
                      <p className="text-sm text-gray-600">Total Spent</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;
