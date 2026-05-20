import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, CheckCircle2, Loader2, Save, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clientAPI } from '../services/api';
import { showToast } from '../components/ui/Toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const defaultValues = {
  companyName: '',
  companySize: '',
  industry: '',
  description: '',
  autoAcceptProposals: false,
  notifyNewProposals: true,
};

const ClientOnboardingPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthResolved, accessToken } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  const { data: profile, isLoading } = useQuery(
    ['client-onboarding-profile', user?._id],
    async () => {
      try {
        const response = await clientAPI.getMyProfile();
        return response?.data?.data?.profile || null;
      } catch (error) {
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    {
      enabled: !!user && isAuthResolved && !!accessToken && user?.role === 'client',
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const profileCompleteness = profile?.profileCompleteness ?? profile?.completeness ?? 0;

  useEffect(() => {
    if (!profile) {
      return;
    }

    reset({
      companyName: profile.companyName || '',
      companySize: profile.companySize || '',
      industry: profile.industry || '',
      description: profile.description || '',
      autoAcceptProposals: profile.preferences?.autoAcceptProposals ?? false,
      notifyNewProposals: profile.preferences?.notifyNewProposals ?? true,
    });
  }, [profile, reset]);

  const profileMutation = useMutation(
    (data) => clientAPI.createOrUpdateProfile(data),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(['client-onboarding-profile']);
        await queryClient.invalidateQueries(['myProfile']);
        showToast.success(profile ? 'Profile saved' : 'Profile setup complete');
        navigate('/dashboard', { replace: true });
      },
      onError: (error) => {
        showToast.error(error.response?.data?.message || 'Unable to save profile');
      },
    }
  );

  const onSubmit = handleSubmit((data) => {
    profileMutation.mutate({
      companyName: data.companyName?.trim(),
      companySize: data.companySize || undefined,
      industry: data.industry?.trim(),
      description: data.description?.trim(),
      preferences: {
        autoAcceptProposals: !!data.autoAcceptProposals,
        notifyNewProposals: !!data.notifyNewProposals,
      },
    });
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" />
          <p className="mt-4 text-gray-600">Loading your client setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          <div className="lg:col-span-4">
            <div className="rounded-3xl bg-white border border-slate-200 shadow-xl p-8 h-full">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                <Sparkles className="h-4 w-4" />
                Client onboarding
              </div>
              <h1 className="mt-5 text-4xl font-bold text-gray-900 leading-tight">
                Build a profile freelancers can trust.
              </h1>
              <p className="mt-4 text-gray-600 leading-relaxed">
                A clear company profile helps freelancers decide whether your work is a fit, and it improves the quality of proposals you receive.
              </p>

              <div className="mt-8 space-y-3 text-sm text-gray-600">
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 mb-2">
                  <div className="flex items-center justify-between text-sm text-blue-900">
                    <span>Profile completeness</span>
                    <span className="font-semibold">{Math.round(profileCompleteness)}%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-blue-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      style={{ width: `${Math.min(Math.max(profileCompleteness, 0), 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Make your company easy to understand at a glance.</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Set size and industry so applicants can self-filter.</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Choose hiring preferences that fit your workflow.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <Card className="shadow-[0_30px_80px_-20px_rgba(15,23,42,0.18)] border border-white/70">
              <Card.Body className="p-0">
                <div className="border-b border-gray-100 bg-white/80 backdrop-blur px-6 py-5">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-primary-600" />
                    {profile ? 'Edit your client profile' : 'Set up your client profile'}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    These details shape how freelancers understand your company and apply to your jobs.
                  </p>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company name
                    </label>
                    <input
                      {...register('companyName', { required: 'Company name is required' })}
                      type="text"
                      className="input"
                      placeholder="Acme Studio"
                    />
                    {errors.companyName && (
                      <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company size
                      </label>
                      <select
                        {...register('companySize', { required: 'Company size is required' })}
                        className="input"
                      >
                        <option value="">Select company size</option>
                        <option value="solo">Solo</option>
                        <option value="2-10">2-10</option>
                        <option value="11-50">11-50</option>
                        <option value="51-200">51-200</option>
                        <option value="201-500">201-500</option>
                        <option value="500+">500+</option>
                      </select>
                      {errors.companySize && (
                        <p className="mt-1 text-sm text-red-600">{errors.companySize.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industry
                      </label>
                      <input
                        {...register('industry', { required: 'Industry is required' })}
                        type="text"
                        className="input"
                        placeholder="SaaS, Healthcare, E-commerce"
                      />
                      {errors.industry && (
                        <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      {...register('description', {
                        required: 'Description is required',
                        minLength: { value: 40, message: 'Description should be at least 40 characters' },
                      })}
                      rows="6"
                      className="input"
                      placeholder="Tell freelancers what your company does, what you're building, and the type of work you hire for."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Hiring preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-4">
                        <input
                          {...register('autoAcceptProposals')}
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span>
                          <span className="block font-medium text-gray-900">Auto-accept proposals</span>
                          <span className="block text-sm text-gray-500">Route strong proposals faster.</span>
                        </span>
                      </label>

                      <label className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-4">
                        <input
                          {...register('notifyNewProposals')}
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span>
                          <span className="block font-medium text-gray-900">Notify on new proposals</span>
                          <span className="block text-sm text-gray-500">Get alerts when freelancers apply.</span>
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={() => navigate('/dashboard')}>
                      Skip for now
                    </Button>
                    <Button type="submit" variant="primary" loading={profileMutation.isLoading} icon={<Save />}>
                      {profile ? 'Save profile' : 'Complete setup'}
                    </Button>
                  </div>
                </form>
              </Card.Body>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientOnboardingPage;