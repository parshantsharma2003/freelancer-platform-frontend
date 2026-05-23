import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  Award,
  Briefcase,
  Building2,
  Camera,
  CheckCircle2,
  DollarSign,
  Globe,
  Loader2,
  Mail,
  Phone,
  Plus,
  Save,
  Shield,
  Trash2,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI, clientAPI, freelancerAPI, userAPI } from '../services/api';
import { uploadChatAsset } from '../lib/uploadHelper';
import { showToast } from '../components/ui/Toast';
import { formatCurrency } from '../lib/utils';

const blankPortfolioItem = {
  title: '',
  description: '',
  imageUrl: '',
  projectUrl: '',
  tags: '',
};

const blankEducationItem = {
  degree: '',
  institution: '',
  fieldOfStudy: '',
  startDate: '',
  endDate: '',
};

const freelancerDefaultValues = {
  title: '',
  bio: '',
  hourlyRate: '',
  experienceLevel: 'intermediate',
  availability: 'full-time',
  visibility: 'public',
  country: '',
  city: '',
  timezone: '',
  portfolio: [blankPortfolioItem],
  education: [blankEducationItem],
};

const clientDefaultValues = {
  companyName: '',
  companySize: '',
  industry: '',
  website: '',
  legalName: '',
  registrationNumber: '',
  taxId: '',
  country: '',
  city: '',
  timezone: '',
  description: '',
  autoAcceptProposals: false,
  notifyNewProposals: true,
};

const formatDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const normalizeFreelancerToForm = (profile) => {
  const portfolio = (profile?.portfolio || []).map((item) => ({
    title: item?.title || '',
    description: item?.description || '',
    imageUrl: item?.imageUrl || '',
    projectUrl: item?.projectUrl || item?.url || '',
    tags: Array.isArray(item?.tags) ? item.tags.join(', ') : '',
  }));

  const education = (profile?.education || []).map((item) => ({
    degree: item?.degree || '',
    institution: item?.institution || '',
    fieldOfStudy: item?.fieldOfStudy || '',
    startDate: formatDateInput(item?.startDate),
    endDate: formatDateInput(item?.endDate),
  }));

  return {
    title: profile?.title || '',
    bio: profile?.description || profile?.bio || '',
    hourlyRate: profile?.hourlyRate ?? '',
    experienceLevel: profile?.experienceLevel || 'intermediate',
    availability: profile?.availability || 'full-time',
    visibility: profile?.visibility || 'public',
    country: profile?.location?.country || '',
    city: profile?.location?.city || '',
    timezone: profile?.location?.timezone || '',
    portfolio: portfolio.length > 0 ? portfolio : [blankPortfolioItem],
    education: education.length > 0 ? education : [blankEducationItem],
  };
};

const normalizeClientToForm = (profile) => ({
  companyName: profile?.companyName || '',
  companySize: profile?.companySize || '',
  industry: profile?.industry || '',
  website: profile?.website || '',
  legalName: profile?.companyInfo?.legalName || '',
  registrationNumber: profile?.companyInfo?.registrationNumber || '',
  taxId: profile?.companyInfo?.taxId || '',
  country: profile?.location?.country || '',
  city: profile?.location?.city || '',
  timezone: profile?.location?.timezone || '',
  description: profile?.description || '',
  autoAcceptProposals: profile?.preferences?.autoAcceptProposals ?? false,
  notifyNewProposals: profile?.preferences?.notifyNewProposals ?? true,
});

const completenessColorClass = (value) => {
  if (value >= 80) return 'text-emerald-700';
  if (value >= 50) return 'text-amber-700';
  return 'text-rose-700';
};

const MyProfilePage = () => {
  const { user, updateUser, accessToken, isAuthResolved } = useAuth();
  const queryClient = useQueryClient();

  const isFreelancer = user?.role === 'freelancer';
  const isClient = user?.role === 'client';

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [phoneCode, setPhoneCode] = useState('');
  const [emailTokenInput, setEmailTokenInput] = useState('');

  const {
    register: registerPersonal,
    handleSubmit: handleSubmitPersonal,
    reset: resetPersonal,
    formState: { errors: personalErrors },
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
    },
  });

  const {
    register: registerFreelancer,
    handleSubmit: handleSubmitFreelancer,
    reset: resetFreelancer,
    control: freelancerControl,
    formState: { errors: freelancerErrors },
  } = useForm({ defaultValues: freelancerDefaultValues });

  const {
    fields: portfolioFields,
    append: appendPortfolio,
    remove: removePortfolio,
  } = useFieldArray({
    control: freelancerControl,
    name: 'portfolio',
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control: freelancerControl,
    name: 'education',
  });

  const {
    register: registerClient,
    handleSubmit: handleSubmitClient,
    reset: resetClient,
    formState: { errors: clientErrors },
  } = useForm({ defaultValues: clientDefaultValues });

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

        return null;
      } catch (error) {
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    {
      enabled: !!user && isAuthResolved && !!accessToken,
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const profileCompleteness = profile?.profileCompleteness ?? profile?.completeness ?? 0;

  const readinessChecks = useMemo(() => {
    if (isFreelancer) {
      return [
        { label: 'Profile photo', done: !!avatarPreview },
        { label: 'Strong title + bio', done: !!profile?.title && (profile?.description || '').length >= 50 },
        { label: 'Skills listed', done: (skills || []).length >= 3 },
        { label: 'Portfolio proof', done: (profile?.portfolio || []).length > 0 },
      ];
    }

    return [
      { label: 'Company identity', done: !!profile?.companyName && !!profile?.industry },
      { label: 'Company description', done: (profile?.description || '').length >= 40 },
      { label: 'Hiring preferences', done: !!profile?.preferences },
      { label: 'Contactable web presence', done: !!profile?.website },
    ];
  }, [avatarPreview, isFreelancer, profile, skills]);

  useEffect(() => {
    resetPersonal({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    });
  }, [resetPersonal, user?.firstName, user?.lastName, user?.phone]);

  useEffect(() => {
    if (isFreelancer) {
      if (profile) {
        resetFreelancer(normalizeFreelancerToForm(profile));
        setSkills(profile.skills || []);
      } else {
        resetFreelancer(freelancerDefaultValues);
        setSkills([]);
      }
    }

    if (isClient) {
      if (profile) {
        resetClient(normalizeClientToForm(profile));
      } else {
        resetClient(clientDefaultValues);
      }
    }

    const nextAvatar = profile?.user?.avatar || user?.avatar || '';
    setAvatarUrl(nextAvatar);
    setAvatarPreview(nextAvatar);
  }, [isClient, isFreelancer, profile, resetClient, resetFreelancer, user?.avatar]);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previousPreview = avatarPreview;
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setUploadingAvatar(true);

    try {
      const uploaded = await uploadChatAsset({
        file,
        assetType: 'image',
        fileName: `profile-${Date.now()}-${file.name}`,
      });

      setAvatarUrl(uploaded.url);
      showToast.success('Profile photo uploaded');
    } catch (error) {
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setAvatarPreview(previousPreview || user?.avatar || '');
      showToast.error(error.response?.data?.message || 'Unable to upload profile photo');
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const addSkill = () => {
    const nextSkill = skillInput.trim();
    if (!nextSkill) return;
    if (skills.includes(nextSkill)) return;

    setSkills((prev) => [...prev, nextSkill]);
    setSkillInput('');
  };

  const removeSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((skill) => skill !== skillToRemove));
  };

  const savePersonalMutation = useMutation(
    (data) => {
      const payload = {
        firstName: data.firstName?.trim(),
        lastName: data.lastName?.trim(),
        phone: data.phone?.trim(),
      };

      if (avatarUrl && avatarUrl !== user?.avatar) {
        payload.avatar = avatarUrl;
      }

      return userAPI.updateProfile(payload);
    },
    {
      onSuccess: (response) => {
        const updatedUser = response?.data?.data?.user || response?.data?.user;
        if (updatedUser) {
          updateUser(updatedUser);
        }
        queryClient.invalidateQueries(['myProfile']);
        showToast.success('Personal information saved');
      },
      onError: (error) => {
        showToast.error(error.response?.data?.message || 'Unable to save personal information');
      },
    }
  );

  const requestEmailVerificationMutation = useMutation(
    () => authAPI.requestEmailVerification(),
    {
      onSuccess: (response) => {
        const devToken = response?.data?.data?.token;
        if (devToken) {
          setEmailTokenInput(devToken);
        }
        showToast.success(response?.data?.message || 'Verification email sent');
      },
      onError: (error) => {
        showToast.error(error.response?.data?.message || 'Unable to send email verification');
      },
    }
  );

  const verifyEmailByTokenMutation = useMutation(
    (token) => authAPI.verifyEmail(token),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(['myProfile']);
        const meResponse = await authAPI.getMe();
        updateUser(meResponse?.data?.data?.user);
        showToast.success('Email verified successfully');
      },
      onError: (error) => {
        showToast.error(error.response?.data?.message || 'Email verification failed');
      },
    }
  );

  const requestPhoneVerificationMutation = useMutation(
    () => authAPI.requestPhoneVerification(),
    {
      onSuccess: (response) => {
        showToast.success(response?.data?.message || 'Phone verification code sent');
      },
      onError: (error) => {
        showToast.error(error.response?.data?.message || 'Unable to send phone verification code');
      },
    }
  );

  const verifyPhoneMutation = useMutation(
    (code) => authAPI.verifyPhone(code),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(['myProfile']);
        const meResponse = await authAPI.getMe();
        updateUser(meResponse?.data?.data?.user);
        setPhoneCode('');
        showToast.success('Phone verified successfully');
      },
      onError: (error) => {
        showToast.error(error.response?.data?.message || 'Phone verification failed');
      },
    }
  );

  const saveFreelancerMutation = useMutation(
    (data) => {
      const payload = {
        title: data.title?.trim(),
        description: data.bio?.trim(),
        hourlyRate: Number.parseFloat(data.hourlyRate),
        experienceLevel: data.experienceLevel,
        availability: data.availability,
        visibility: data.visibility,
        location: {
          country: data.country?.trim(),
          city: data.city?.trim(),
          timezone: data.timezone?.trim(),
        },
        skills,
        portfolio: (data.portfolio || [])
          .map((item) => ({
            title: item?.title?.trim(),
            description: item?.description?.trim(),
            imageUrl: item?.imageUrl?.trim(),
            projectUrl: item?.projectUrl?.trim(),
            tags: (item?.tags || '')
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean),
          }))
          .filter((item) => item.title || item.description || item.imageUrl || item.projectUrl || item.tags.length),
        education: (data.education || [])
          .map((item) => ({
            degree: item?.degree?.trim(),
            institution: item?.institution?.trim(),
            fieldOfStudy: item?.fieldOfStudy?.trim(),
            startDate: item?.startDate || undefined,
            endDate: item?.endDate || undefined,
          }))
          .filter((item) => item.degree || item.institution || item.fieldOfStudy || item.startDate || item.endDate),
      };

      return freelancerAPI.createOrUpdateProfile(payload);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['myProfile']);
        showToast.success('Freelancer profile saved');
      },
      onError: (error) => {
        showToast.error(error.response?.data?.message || 'Unable to save freelancer profile');
      },
    }
  );

  const saveClientMutation = useMutation(
    (data) => {
      const payload = {
        companyName: data.companyName?.trim(),
        companySize: data.companySize || undefined,
        industry: data.industry?.trim(),
        website: data.website?.trim(),
        companyInfo: {
          legalName: data.legalName?.trim(),
          registrationNumber: data.registrationNumber?.trim(),
          taxId: data.taxId?.trim(),
        },
        location: {
          country: data.country?.trim(),
          city: data.city?.trim(),
          timezone: data.timezone?.trim(),
        },
        description: data.description?.trim(),
        preferences: {
          autoAcceptProposals: !!data.autoAcceptProposals,
          notifyNewProposals: !!data.notifyNewProposals,
        },
      };

      return clientAPI.createOrUpdateProfile(payload);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['myProfile']);
        showToast.success('Client profile saved');
      },
      onError: (error) => {
        showToast.error(error.response?.data?.message || 'Unable to save client profile');
      },
    }
  );

  const onSavePersonal = handleSubmitPersonal((data) => {
    savePersonalMutation.mutate(data);
  });

  const onSaveFreelancer = handleSubmitFreelancer((data) => {
    saveFreelancerMutation.mutate(data);
  });

  const onSaveClient = handleSubmitClient((data) => {
    saveClientMutation.mutate(data);
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" />
          <p className="mt-4 text-gray-600">Loading your profile dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="rounded-3xl bg-slate-950 text-white p-8 shadow-2xl shadow-slate-900/25 relative overflow-hidden">
          <div className="absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.35),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.5),_transparent_34%)]" />
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="md:col-span-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium">
                {isFreelancer ? <Briefcase className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                {isFreelancer ? 'Freelancer profile dashboard' : 'Client profile dashboard'}
              </div>
              <h1 className="mt-4 text-4xl font-bold leading-tight">Make your profile accurate, trusted, and hire-ready.</h1>
              <p className="mt-3 text-slate-200">
                Keep every profile field fresh and complete so search ranking, matching, and proposal quality stay strong.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur p-4">
              <div className="flex items-center justify-between text-sm text-slate-200">
                <span>Profile completeness</span>
                <span className="font-semibold text-white">{Math.round(profileCompleteness)}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/15 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400"
                  style={{ width: `${Math.min(Math.max(profileCompleteness, 0), 100)}%` }}
                />
              </div>
              <div className="mt-4 space-y-2">
                {readinessChecks.map((check) => (
                  <div key={check.label} className="flex items-center justify-between text-xs">
                    <span className="text-slate-200">{check.label}</span>
                    <span className={`inline-flex items-center gap-1 ${check.done ? 'text-emerald-300' : 'text-slate-400'}`}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {check.done ? 'Done' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl overflow-hidden bg-primary-100 flex items-center justify-center shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile avatar" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-8 w-8 text-primary-600" />
                  )}
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <p className={`text-xs mt-1 font-medium ${completenessColorClass(profileCompleteness)}`}>
                    {Math.round(profileCompleteness)}% complete
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Current Metrics</h2>
              {isFreelancer ? (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between"><span className="text-gray-600">Completed jobs</span><span className="font-semibold">{profile?.totalJobs || 0}</span></div>
                  <div className="flex items-center justify-between"><span className="text-gray-600">Rating</span><span className="font-semibold">{Number(profile?.rating || 0).toFixed(1)} ⭐</span></div>
                  <div className="flex items-center justify-between"><span className="text-gray-600">Hourly rate</span><span className="font-semibold">{formatCurrency(profile?.hourlyRate || 0)}/hr</span></div>
                  <div className="flex items-center justify-between"><span className="text-gray-600">Total earnings</span><span className="font-semibold">{formatCurrency(profile?.totalEarnings || 0)}</span></div>
                  <div className="flex items-center justify-between"><span className="text-gray-600">Success rate</span><span className="font-semibold">{profile?.successRate || 0}%</span></div>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between"><span className="text-gray-600">Jobs posted</span><span className="font-semibold">{profile?.totalJobs || 0}</span></div>
                  <div className="flex items-center justify-between"><span className="text-gray-600">Active jobs</span><span className="font-semibold">{profile?.activeJobs || 0}</span></div>
                  <div className="flex items-center justify-between"><span className="text-gray-600">Total spent</span><span className="font-semibold">{formatCurrency(profile?.totalSpent || 0)}</span></div>
                  <div className="flex items-center justify-between"><span className="text-gray-600">Rating</span><span className="font-semibold">{Number(profile?.rating || 0).toFixed(1)} ⭐</span></div>
                </div>
              )}
            </div>
          </aside>

          <main className="lg:col-span-8 space-y-6">
            <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                  <p className="text-sm text-gray-500 mt-1">This information appears on your account and profile header.</p>
                </div>
                <label className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-white text-sm font-medium cursor-pointer hover:bg-primary-700 transition-colors">
                  {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  {uploadingAvatar ? 'Uploading...' : 'Change photo'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
              <form onSubmit={onSavePersonal} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First name</label>
                    <input
                      {...registerPersonal('firstName', { required: 'First name is required' })}
                      type="text"
                      className="input"
                    />
                    {personalErrors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{personalErrors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last name</label>
                    <input
                      {...registerPersonal('lastName', { required: 'Last name is required' })}
                      type="text"
                      className="input"
                    />
                    {personalErrors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{personalErrors.lastName.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" value={user?.email || ''} disabled className="input bg-gray-100 cursor-not-allowed" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    {...registerPersonal('phone')}
                    type="tel"
                    className="input"
                    placeholder="+1 555 123 4567"
                  />
                  <p className="mt-1 text-xs text-gray-500">Use international format to receive verification SMS reliably.</p>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4 space-y-4 bg-gray-50/70">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary-600" />
                    <p className="text-sm font-semibold text-gray-900">Verification & Trust</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                          <Mail className="h-4 w-4 text-primary-600" />
                          Email verification
                        </div>
                        <span className={`text-xs font-semibold ${user?.emailVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {user?.emailVerified ? 'Verified' : 'Not verified'}
                        </span>
                      </div>

                      {!user?.emailVerified && (
                        <>
                          <button
                            type="button"
                            onClick={() => requestEmailVerificationMutation.mutate()}
                            disabled={requestEmailVerificationMutation.isLoading || !user?.email}
                            className="btn-secondary w-full"
                          >
                            {requestEmailVerificationMutation.isLoading ? 'Sending...' : 'Send verification email'}
                          </button>

                          <div className="flex gap-2">
                            <input
                              value={emailTokenInput}
                              onChange={(event) => setEmailTokenInput(event.target.value)}
                              className="input"
                              placeholder="Paste email token (dev/manual)"
                            />
                            <button
                              type="button"
                              onClick={() => verifyEmailByTokenMutation.mutate(emailTokenInput.trim())}
                              disabled={verifyEmailByTokenMutation.isLoading || !emailTokenInput.trim()}
                              className="btn-primary whitespace-nowrap"
                            >
                              Verify
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                          <Phone className="h-4 w-4 text-primary-600" />
                          Phone verification
                        </div>
                        <span className={`text-xs font-semibold ${user?.phoneVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {user?.phoneVerified ? 'Verified' : 'Not verified'}
                        </span>
                      </div>

                      {!user?.phoneVerified && (
                        <>
                          <button
                            type="button"
                            onClick={() => requestPhoneVerificationMutation.mutate()}
                            disabled={requestPhoneVerificationMutation.isLoading || !user?.phone}
                            className="btn-secondary w-full"
                          >
                            {requestPhoneVerificationMutation.isLoading ? 'Sending...' : 'Send verification code'}
                          </button>

                          <div className="flex gap-2">
                            <input
                              value={phoneCode}
                              onChange={(event) => setPhoneCode(event.target.value)}
                              className="input"
                              placeholder="Enter 6-digit code"
                            />
                            <button
                              type="button"
                              onClick={() => verifyPhoneMutation.mutate(phoneCode.trim())}
                              disabled={verifyPhoneMutation.isLoading || !phoneCode.trim()}
                              className="btn-primary whitespace-nowrap"
                            >
                              Verify
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={savePersonalMutation.isLoading} className="btn-primary flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {savePersonalMutation.isLoading ? 'Saving...' : 'Save personal info'}
                  </button>
                </div>
              </form>
            </section>

            {isFreelancer && (
              <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary-600" />
                    Freelancer Profile Details
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Everything clients evaluate before they hire you.</p>
                </div>

                <form onSubmit={onSaveFreelancer} className="p-6 space-y-7">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Professional title</label>
                      <input
                        {...registerFreelancer('title', { required: 'Title is required' })}
                        type="text"
                        className="input"
                        placeholder="Senior Full Stack Developer"
                      />
                      {freelancerErrors.title && <p className="mt-1 text-sm text-red-600">{freelancerErrors.title.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Hourly rate (INR)
                      </label>
                      <input
                        {...registerFreelancer('hourlyRate', {
                          required: 'Hourly rate is required',
                          min: { value: 1, message: 'Hourly rate must be at least 1' },
                        })}
                        type="number"
                        className="input"
                        placeholder="50"
                      />
                      {freelancerErrors.hourlyRate && (
                        <p className="mt-1 text-sm text-red-600">{freelancerErrors.hourlyRate.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio / Overview</label>
                    <textarea
                      {...registerFreelancer('bio', {
                        required: 'Bio is required',
                        minLength: { value: 50, message: 'Bio must be at least 50 characters' },
                      })}
                      rows="5"
                      className="input"
                      placeholder="Describe your niche, strengths, and results clients can expect."
                    />
                    {freelancerErrors.bio && <p className="mt-1 text-sm text-red-600">{freelancerErrors.bio.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Experience level</label>
                      <select {...registerFreelancer('experienceLevel')} className="input">
                        <option value="entry">Entry</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                      <select {...registerFreelancer('availability')} className="input">
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="not-available">Not available</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profile visibility</label>
                      <select {...registerFreelancer('visibility')} className="input">
                        <option value="public">Public</option>
                        <option value="invite-only">Invite-only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      Skills
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {skills.map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-xl text-sm font-medium inline-flex items-center gap-2">
                          {skill}
                          <button type="button" className="text-primary-500 hover:text-red-600" onClick={() => removeSkill(skill)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(event) => setSkillInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            addSkill();
                          }
                        }}
                        className="input flex-1"
                        placeholder="Add a skill and press Enter"
                      />
                      <button type="button" onClick={addSkill} className="btn-secondary inline-flex items-center gap-1">
                        <Plus className="h-4 w-4" />
                        Add
                      </button>
                    </div>
                  </div>

                  <section className="rounded-2xl border border-gray-200 p-4 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input {...registerFreelancer('country')} className="input" placeholder="Country" />
                      <input {...registerFreelancer('city')} className="input" placeholder="City" />
                      <input {...registerFreelancer('timezone')} className="input" placeholder="Timezone (e.g., UTC+5:30)" />
                    </div>
                  </section>

                  <section className="rounded-2xl border border-gray-200 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Portfolio</h3>
                      <button
                        type="button"
                        onClick={() => appendPortfolio(blankPortfolioItem)}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add project
                      </button>
                    </div>
                    <div className="space-y-4">
                      {portfolioFields.map((field, index) => (
                        <div key={field.id} className="rounded-xl border border-gray-200 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900">Project {index + 1}</p>
                            {portfolioFields.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removePortfolio(index)}
                                className="text-sm text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                              >
                                <Trash2 className="h-4 w-4" />
                                Remove
                              </button>
                            )}
                          </div>
                          <input {...registerFreelancer(`portfolio.${index}.title`)} className="input" placeholder="Project title" />
                          <textarea
                            {...registerFreelancer(`portfolio.${index}.description`)}
                            className="input"
                            rows="3"
                            placeholder="What was built and what results it delivered"
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input {...registerFreelancer(`portfolio.${index}.imageUrl`)} className="input" placeholder="Image URL" />
                            <input {...registerFreelancer(`portfolio.${index}.projectUrl`)} className="input" placeholder="Project URL" />
                          </div>
                          <input {...registerFreelancer(`portfolio.${index}.tags`)} className="input" placeholder="Tags (comma separated)" />
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-gray-200 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Education</h3>
                      <button
                        type="button"
                        onClick={() => appendEducation(blankEducationItem)}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add education
                      </button>
                    </div>
                    <div className="space-y-4">
                      {educationFields.map((field, index) => (
                        <div key={field.id} className="rounded-xl border border-gray-200 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900">Education {index + 1}</p>
                            {educationFields.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeEducation(index)}
                                className="text-sm text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                              >
                                <Trash2 className="h-4 w-4" />
                                Remove
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input {...registerFreelancer(`education.${index}.degree`)} className="input" placeholder="Degree" />
                            <input {...registerFreelancer(`education.${index}.institution`)} className="input" placeholder="Institution" />
                          </div>
                          <input {...registerFreelancer(`education.${index}.fieldOfStudy`)} className="input" placeholder="Field of study" />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input {...registerFreelancer(`education.${index}.startDate`)} type="date" className="input" />
                            <input {...registerFreelancer(`education.${index}.endDate`)} type="date" className="input" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="flex justify-end">
                    <button type="submit" disabled={saveFreelancerMutation.isLoading} className="btn-primary inline-flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      {saveFreelancerMutation.isLoading ? 'Saving...' : 'Save freelancer profile'}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {isClient && (
              <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary-600" />
                    Client Profile Details
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Give freelancers complete context before they apply.</p>
                </div>

                <form onSubmit={onSaveClient} className="p-6 space-y-7">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company name</label>
                      <input
                        {...registerClient('companyName', { required: 'Company name is required' })}
                        className="input"
                        placeholder="Acme Labs"
                      />
                      {clientErrors.companyName && <p className="mt-1 text-sm text-red-600">{clientErrors.companyName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company size</label>
                      <select
                        {...registerClient('companySize', { required: 'Company size is required' })}
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
                      {clientErrors.companySize && <p className="mt-1 text-sm text-red-600">{clientErrors.companySize.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                      <input
                        {...registerClient('industry', { required: 'Industry is required' })}
                        className="input"
                        placeholder="SaaS, Healthcare, Fintech"
                      />
                      {clientErrors.industry && <p className="mt-1 text-sm text-red-600">{clientErrors.industry.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        Website
                      </label>
                      <input
                        {...registerClient('website')}
                        type="url"
                        className="input"
                        placeholder="https://company.com"
                      />
                    </div>
                  </div>

                  <section className="rounded-2xl border border-gray-200 p-4 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Company legal information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input {...registerClient('legalName')} className="input" placeholder="Legal company name" />
                      <input {...registerClient('registrationNumber')} className="input" placeholder="Registration number" />
                      <input {...registerClient('taxId')} className="input" placeholder="Tax ID" />
                    </div>
                  </section>

                  <section className="rounded-2xl border border-gray-200 p-4 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input {...registerClient('country')} className="input" placeholder="Country" />
                      <input {...registerClient('city')} className="input" placeholder="City" />
                      <input {...registerClient('timezone')} className="input" placeholder="Timezone (e.g., UTC+1)" />
                    </div>
                  </section>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company description</label>
                    <textarea
                      {...registerClient('description', {
                        required: 'Description is required',
                        minLength: { value: 40, message: 'Description must be at least 40 characters' },
                      })}
                      rows="5"
                      className="input"
                      placeholder="Describe your business, products, and what kind of freelancers you hire."
                    />
                    {clientErrors.description && <p className="mt-1 text-sm text-red-600">{clientErrors.description.message}</p>}
                  </div>

                  <section className="rounded-2xl border border-gray-200 p-4 space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Hiring preferences</h3>
                    <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
                      <input
                        {...registerClient('autoAcceptProposals')}
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span>
                        <span className="block text-sm font-medium text-gray-900">Auto-accept proposals</span>
                        <span className="block text-xs text-gray-500">Automatically move high-fit proposals forward.</span>
                      </span>
                    </label>

                    <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
                      <input
                        {...registerClient('notifyNewProposals')}
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span>
                        <span className="block text-sm font-medium text-gray-900">Notify on new proposals</span>
                        <span className="block text-xs text-gray-500">Receive alerts when freelancers apply to your jobs.</span>
                      </span>
                    </label>
                  </section>

                  <div className="flex justify-end">
                    <button type="submit" disabled={saveClientMutation.isLoading} className="btn-primary inline-flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      {saveClientMutation.isLoading ? 'Saving...' : 'Save client profile'}
                    </button>
                  </div>
                </form>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;
