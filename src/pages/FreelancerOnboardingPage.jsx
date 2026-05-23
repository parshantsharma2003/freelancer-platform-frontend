import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Camera,
  CheckCircle2,
  GraduationCap,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { freelancerAPI, userAPI } from '../services/api';
import { uploadChatAsset } from '../lib/uploadHelper';
import { showToast } from '../components/ui/Toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';

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

const defaultValues = {
  title: '',
  bio: '',
  hourlyRate: '',
  experienceLevel: 'intermediate',
  portfolio: [blankPortfolioItem],
  education: [blankEducationItem],
};

const formatDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const normalizeProfileToForm = (profile) => {
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
    portfolio: portfolio.length > 0 ? portfolio : [blankPortfolioItem],
    education: education.length > 0 ? education : [blankEducationItem],
  };
};

const FreelancerOnboardingPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, updateUser, accessToken, isAuthResolved } = useAuth();
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  const {
    fields: portfolioFields,
    append: appendPortfolio,
    remove: removePortfolio,
  } = useFieldArray({
    control,
    name: 'portfolio',
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control,
    name: 'education',
  });

  const { data: profile, isLoading } = useQuery(
    ['freelancer-onboarding-profile', user?._id],
    async () => {
      try {
        const response = await freelancerAPI.getMyProfile();
        return response?.data?.data?.profile || null;
      } catch (error) {
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    {
      enabled: !!user && isAuthResolved && !!accessToken && user?.role === 'freelancer',
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const profileCompleteness = profile?.profileCompleteness ?? profile?.completeness ?? 0;

  const checklist = useMemo(() => {
    return [
      { label: 'Identity', complete: !!avatarPreview },
      { label: 'Positioning', complete: !!profile?.title || !!profile?.description },
      { label: 'Skills', complete: skills.length >= 3 },
      { label: 'Proof', complete: (profile?.portfolio || []).length > 0 || portfolioFields.length > 0 },
    ];
  }, [avatarPreview, portfolioFields.length, profile?.description, profile?.portfolio, profile?.title, skills.length]);

  useEffect(() => {
    if (!profile) {
      return;
    }

    reset(normalizeProfileToForm(profile));
    setSkills(profile.skills || []);
    const resolvedAvatar = profile?.user?.avatar || user?.avatar || '';
    setAvatarUrl(resolvedAvatar);
    setAvatarPreview(resolvedAvatar);
  }, [profile, reset, user?.avatar]);

  useEffect(() => {
    if (profile === null) {
      reset(defaultValues);
      setSkills([]);
      setAvatarUrl(user?.avatar || '');
      setAvatarPreview(user?.avatar || '');
    }
  }, [profile, reset, user?.avatar]);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleAvatarChange = async (event) => {
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
      showToast.error(error.response?.data?.message || 'Failed to upload profile photo');
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const addSkill = () => {
    const nextSkill = skillInput.trim();
    if (!nextSkill || skills.includes(nextSkill)) {
      return;
    }

    setSkills([...skills, nextSkill]);
    setSkillInput('');
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const profileMutation = useMutation(
    async (data) => {
      if (avatarUrl && avatarUrl !== user?.avatar) {
        const userResponse = await userAPI.updateProfile({ avatar: avatarUrl });
        const updatedUser = userResponse?.data?.data?.user;
        if (updatedUser) {
          updateUser(updatedUser);
        }
      }

      const payload = {
        title: data.title?.trim(),
        description: data.bio?.trim(),
        hourlyRate: Number.parseFloat(data.hourlyRate),
        experienceLevel: data.experienceLevel,
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
      onSuccess: async () => {
        await queryClient.invalidateQueries(['freelancer-onboarding-profile']);
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
    profileMutation.mutate(data);
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" />
          <p className="mt-4 text-gray-600">Loading your freelancer setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl bg-slate-950 text-white p-8 shadow-2xl shadow-slate-900/20 relative overflow-hidden">
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.35),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.45),_transparent_34%)]" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium">
                  <Sparkles className="h-4 w-4" />
                  Freelancer onboarding
                </div>
                <h1 className="mt-5 text-4xl font-bold leading-tight">
                  Turn a blank profile into a client-ready storefront.
                </h1>
                <p className="mt-4 text-slate-300 leading-relaxed">
                  Add the essentials that help clients understand your value fast: a clear title, a strong summary, proof of work, and the skills you want to be hired for.
                </p>

                <div className="mt-8 rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center justify-between text-sm text-slate-200">
                    <span>Profile completeness</span>
                    <span className="font-semibold text-white">{Math.round(profileCompleteness)}%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-primary-400"
                      style={{ width: `${Math.min(Math.max(profileCompleteness, 0), 100)}%` }}
                    />
                  </div>
                  <div className="mt-4 space-y-3">
                    {checklist.map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-sm">
                        <span className="text-slate-200">{item.label}</span>
                        <span className={`inline-flex items-center gap-1 ${item.complete ? 'text-emerald-300' : 'text-slate-400'}`}>
                          <CheckCircle2 className="h-4 w-4" />
                          {item.complete ? 'Done' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-6 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Why this matters</h2>
              <div className="mt-4 space-y-4 text-sm text-gray-600">
                <div className="flex gap-3">
                  <div className="mt-0.5 h-8 w-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <p>Clients trust complete profiles more, which improves response rates and invite conversion.</p>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5 h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <p>Portfolio items and education give context, so your rate is tied to evidence instead of only a headline.</p>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5 h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <ImagePlus className="h-4 w-4" />
                  </div>
                  <p>Profile photos help clients remember you when they are comparing multiple proposals.</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card className="overflow-hidden shadow-[0_30px_80px_-20px_rgba(15,23,42,0.18)] border border-white/70">
              <Card.Body className="p-0">
                <div className="border-b border-gray-100 bg-white/80 backdrop-blur px-6 py-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {profile ? 'Edit your freelancer profile' : 'Set up your freelancer profile'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      This is the information clients will see first when they review your profile.
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                    <Avatar src={avatarPreview} name={user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()} size="xl" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Profile photo</p>
                      <p className="text-xs text-gray-500">Upload a professional headshot</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-8">
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Profile Photo</label>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5">
                        <Avatar src={avatarPreview} name={user?.fullName || user?.firstName || 'U'} size="2xl" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">
                            Use a clear, front-facing image. This gets reused across your freelancer profile and account settings.
                          </p>
                          <div className="mt-4 flex flex-wrap gap-3">
                            <label className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-white font-medium cursor-pointer hover:bg-primary-700 transition-colors">
                              {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                              {uploadingAvatar ? 'Uploading...' : 'Upload photo'}
                              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setAvatarUrl('');
                                setAvatarPreview('');
                              }}
                              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                            >
                              <X className="h-4 w-4" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Professional Title</label>
                      <input
                        {...register('title', { required: 'Professional title is required' })}
                        type="text"
                        className="input"
                        placeholder="MERN Stack Developer"
                      />
                      {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate (INR)</label>
                      <input
                        {...register('hourlyRate', {
                          required: 'Hourly rate is required',
                          min: { value: 1, message: 'Hourly rate must be at least 1' },
                        })}
                        type="number"
                        min="1"
                        className="input"
                        placeholder="75"
                      />
                      {errors.hourlyRate && <p className="mt-1 text-sm text-red-600">{errors.hourlyRate.message}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio / Overview</label>
                      <textarea
                        {...register('bio', {
                          required: 'Bio is required',
                          minLength: { value: 80, message: 'Bio should be at least 80 characters' },
                        })}
                        rows="6"
                        className="input"
                        placeholder="Tell clients what you build, the problems you solve, and the kind of work you want to take on."
                      />
                      {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { value: 'entry', label: 'Entry' },
                          { value: 'intermediate', label: 'Intermediate' },
                          { value: 'expert', label: 'Expert' },
                        ].map((level) => (
                          <label
                            key={level.value}
                            className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 cursor-pointer hover:border-primary-300 hover:bg-primary-50/60 transition-colors"
                          >
                            <input
                              {...register('experienceLevel')}
                              type="radio"
                              value={level.value}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="font-medium text-gray-800">{level.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
                        <p className="text-sm text-gray-600">Add the tags clients should use to find you.</p>
                      </div>
                      <div className="text-sm text-gray-500">{skills.length} added</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700">
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-600" aria-label={`Remove ${skill}`}>
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
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
                        placeholder="React, Node.js, AWS, UI design..."
                      />
                      <Button type="button" variant="outline" icon={<Plus />} onClick={addSkill}>
                        Add skill
                      </Button>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Portfolio</h3>
                        <p className="text-sm text-gray-600">Add projects, images, and links that prove your work.</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        icon={<Plus />}
                        onClick={() => appendPortfolio(blankPortfolioItem)}
                      >
                        Add project
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {portfolioFields.map((field, index) => (
                        <div key={field.id} className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4">
                          <div className="flex items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-2 text-gray-900 font-medium">
                              <Briefcase className="h-4 w-4 text-primary-600" />
                              Project {index + 1}
                            </div>
                            <button
                              type="button"
                              onClick={() => removePortfolio(index)}
                              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Project title</label>
                              <input {...register(`portfolio.${index}.title`)} defaultValue={field.title} className="input" placeholder="E-commerce redesign" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Project link</label>
                              <input {...register(`portfolio.${index}.projectUrl`)} defaultValue={field.projectUrl} className="input" placeholder="https://..." />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Project image URL</label>
                              <input {...register(`portfolio.${index}.imageUrl`)} defaultValue={field.imageUrl} className="input" placeholder="https://..." />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                              <textarea
                                {...register(`portfolio.${index}.description`)}
                                defaultValue={field.description}
                                rows="4"
                                className="input"
                                placeholder="What was the challenge, your approach, and the result?"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                              <input
                                {...register(`portfolio.${index}.tags`)}
                                defaultValue={field.tags}
                                className="input"
                                placeholder="React, Node.js, API design"
                              />
                              <p className="mt-1 text-xs text-gray-500">Separate tags with commas.</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <GraduationCap className="h-5 w-5 text-primary-600" />
                          Education
                        </h3>
                        <p className="text-sm text-gray-600">List your strongest education credentials or bootcamps.</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        icon={<Plus />}
                        onClick={() => appendEducation(blankEducationItem)}
                      >
                        Add education
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {educationFields.map((field, index) => (
                        <div key={field.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-3 mb-4">
                            <div className="font-medium text-gray-900">Education {index + 1}</div>
                            <button
                              type="button"
                              onClick={() => removeEducation(index)}
                              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Degree / Program</label>
                              <input {...register(`education.${index}.degree`)} defaultValue={field.degree} className="input" placeholder="B.Sc. Computer Science" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                              <input {...register(`education.${index}.institution`)} defaultValue={field.institution} className="input" placeholder="University or bootcamp" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Field of study</label>
                              <input {...register(`education.${index}.fieldOfStudy`)} defaultValue={field.fieldOfStudy} className="input" placeholder="Software Engineering" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Start</label>
                                <input {...register(`education.${index}.startDate`)} defaultValue={field.startDate} type="date" className="input" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">End</label>
                                <input {...register(`education.${index}.endDate`)} defaultValue={field.endDate} type="date" className="input" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      You can update these details later from your profile page, but this setup gets you live faster.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => navigate('/dashboard')}
                      >
                        Skip for now
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        loading={profileMutation.isLoading}
                        icon={<Save />}
                      >
                        {profile ? 'Save profile' : 'Complete setup'}
                      </Button>
                    </div>
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

export default FreelancerOnboardingPage;