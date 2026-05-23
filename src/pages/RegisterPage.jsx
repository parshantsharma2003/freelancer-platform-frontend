import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  KeyRound,
  Mail,
  Phone,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/ui/Toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { authAPI } from '../services/api';
import { ENV } from '../config/env';

const OTP_LENGTH = 6;

const STEPS = {
  METHOD: 1,
  FORM: 2,
  ROLE: 3,
  VERIFY: 4,
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, otpLogin, isLoading, isAuthenticated, isAuthResolved, user } = useAuth();

  const [step, setStep] = useState(STEPS.METHOD);
  const [signupMethod, setSignupMethod] = useState('');
  const [error, setError] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(''));
  const otpInputRefs = useRef([]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  useEffect(() => {
    if (!isAuthResolved) return;

    if (isAuthenticated) {
      if (user?.role === 'super_admin') {
        navigate('/admin/dashboard', { replace: true });
        return;
      }

      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isAuthResolved, navigate, user?.role]);

  useEffect(() => {
    if (step === STEPS.VERIFY) {
      otpInputRefs.current[0]?.focus();
    }
  }, [step]);

  const passwordChecks = useMemo(() => {
    const password = formData.password || '';
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      matches: password.length > 0 && password === formData.confirmPassword,
    };
  }, [formData.password, formData.confirmPassword]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateBasicForm = () => {
    if (!formData.fullName.trim()) return 'Full name is required';
    if (!formData.email.trim()) return 'Email is required';

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(formData.email.trim())) return 'Please provide a valid email';

    if (!passwordChecks.length || !passwordChecks.uppercase || !passwordChecks.lowercase || !passwordChecks.number) {
      return 'Password must be at least 8 chars with uppercase, lowercase, and number';
    }

    if (!passwordChecks.matches) return 'Confirm password must match password';

    if (formData.phone?.trim()) {
      const phoneRegex = /^\+?[1-9]\d{7,14}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        return 'Phone must be in international format (e.g., +14155552671)';
      }
    }

    return null;
  };

  const handleSelectMethod = (method) => {
    setError('');
    setSignupMethod(method);

    if (method === 'email') {
      setStep(STEPS.FORM);
      return;
    }

    if (method === 'google') {
      setStep(STEPS.ROLE);
      return;
    }

    showToast.info('Phone OTP registration is optional and will be enabled in a later update.');
  };

  const handleBasicFormContinue = (event) => {
    event.preventDefault();
    setError('');

    const validationError = validateBasicForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setStep(STEPS.ROLE);
  };

  const handleSelectRole = (role) => {
    setError('');
    updateField('role', role);

    if (signupMethod === 'google') {
      window.location.href = `${ENV.OAUTH_BASE_URL}/auth/google?role=${role}`;
      return;
    }
  };

  const handleCreateAccount = async () => {
    setError('');

    if (!formData.role) {
      setError('Please select a role to continue');
      return;
    }

    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim() || undefined,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      role: formData.role,
    };

    const result = await register(payload);

    if (!result.success) {
      if (!result.requiresEmailVerification) {
        setError(result.error || 'Registration failed');
        showToast.error(result.error || 'Registration failed');
        return;
      }
    }

    if (result.requiresEmailVerification) {
      setStep(STEPS.VERIFY);
      setVerificationMessage('We sent a verification code to your email. Enter it below to activate your account.');
      setOtpValues(Array(OTP_LENGTH).fill(''));
      showToast.info('Account created. Enter the OTP to complete registration.');
      return;
    }

    showToast.success('Registration completed successfully');
    navigate('/login', { replace: true });
  };

  const roleCards = [
    {
      value: 'freelancer',
      title: 'Freelancer',
      description: 'Build your profile and get hired for projects.',
      icon: <Briefcase className="h-6 w-6" />,
    },
    {
      value: 'client',
      title: 'Client',
      description: 'Post jobs and hire vetted freelance talent.',
      icon: <Users className="h-6 w-6" />,
    },
  ];

  const otp = useMemo(() => otpValues.join(''), [otpValues]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const nextValues = [...otpValues];
    nextValues[index] = value;
    setOtpValues(nextValues);

    if (value && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    setError('');

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    if (otp.length !== OTP_LENGTH) {
      setError('Enter the 6-digit OTP');
      return;
    }

    setVerificationLoading(true);
    try {
      const result = await otpLogin({
        email: formData.email.trim().toLowerCase(),
        otp,
      });

      if (!result.success) {
        throw new Error(result.error || 'OTP verification failed');
      }

      showToast.success('Registration completed. Email verified successfully');
      const role = result.user?.role || formData.role;
      if (role === 'client') {
        navigate('/client/profile/setup', { replace: true });
        return;
      }
      if (role === 'freelancer') {
        navigate('/profile/setup', { replace: true });
        return;
      }
      navigate('/dashboard', { replace: true });
    } catch (verificationError) {
      const message = verificationError?.response?.data?.message || verificationError?.message || 'OTP verification failed';
      setError(message);
      showToast.error(message);
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    setResendLoading(true);
    try {
      await authAPI.requestLoginOtp(formData.email.trim().toLowerCase());
      setOtpValues(Array(OTP_LENGTH).fill(''));
      setVerificationMessage('A new verification code has been sent to your email.');
      showToast.success('Verification code sent');
    } catch (resendError) {
      const message = resendError?.response?.data?.message || 'Unable to resend OTP';
      setError(message);
      showToast.error(message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-4 py-1.5 text-sm text-slate-700">
            <ShieldCheck className="h-4 w-4 text-primary-600" />
            Secure Registration
          </div>
          <h1 className="mt-4 text-4xl font-bold text-slate-900">Create your account safely</h1>
          <p className="mt-2 text-slate-600">Verification-first registration with role-based onboarding.</p>
        </motion.div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === STEPS.METHOD && (
            <motion.div
              key="method"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
            >
              <Card className="shadow-sm">
                <Card.Body className="p-8">
                  <h2 className="text-2xl font-semibold text-slate-900">1. Select signup method</h2>
                  <p className="text-slate-600 mt-1">Choose how you want to create your account.</p>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => handleSelectMethod('email')}
                      className="rounded-2xl border border-slate-200 bg-white hover:border-primary-300 hover:shadow-md transition-all p-5 text-left"
                    >
                      <Mail className="h-6 w-6 text-primary-600" />
                      <p className="mt-3 font-semibold text-slate-900">Email + Password</p>
                      <p className="text-sm text-slate-600 mt-1">Recommended secure flow with email verification.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectMethod('google')}
                      className="rounded-2xl border border-slate-200 bg-white hover:border-primary-300 hover:shadow-md transition-all p-5 text-left"
                    >
                      <FaGoogle className="h-6 w-6 text-rose-600" />
                      <p className="mt-3 font-semibold text-slate-900">Google OAuth</p>
                      <p className="text-sm text-slate-600 mt-1">Fast signup via verified Google identity.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectMethod('phone')}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left"
                    >
                      <Phone className="h-6 w-6 text-slate-500" />
                      <p className="mt-3 font-semibold text-slate-700">Phone OTP (Optional)</p>
                      <p className="text-sm text-slate-500 mt-1">Planned optional method. Use email flow for now.</p>
                    </button>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          )}

          {step === STEPS.FORM && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
            >
              <Card className="shadow-sm">
                <Card.Body className="p-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-slate-900">2. Basic registration details</h2>
                    <button
                      type="button"
                      onClick={() => setStep(STEPS.METHOD)}
                      className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </button>
                  </div>

                  <form onSubmit={handleBasicFormContinue} className="mt-6 space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Full name</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(event) => updateField('fullName', event.target.value)}
                        className="input"
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(event) => updateField('email', event.target.value)}
                        className="input"
                        placeholder="you@example.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Phone (optional)</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(event) => updateField('phone', event.target.value)}
                        className="input"
                        placeholder="+14155552671"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(event) => updateField('password', event.target.value)}
                          className="input"
                          placeholder="Create a strong password"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Confirm password</label>
                        <input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(event) => updateField('confirmPassword', event.target.value)}
                          className="input"
                          placeholder="Re-enter password"
                          required
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-medium text-slate-700">Password requirements</p>
                      <ul className="mt-2 text-xs text-slate-600 space-y-1">
                        <li className={passwordChecks.length ? 'text-emerald-700' : ''}>At least 8 characters</li>
                        <li className={passwordChecks.uppercase ? 'text-emerald-700' : ''}>One uppercase letter</li>
                        <li className={passwordChecks.lowercase ? 'text-emerald-700' : ''}>One lowercase letter</li>
                        <li className={passwordChecks.number ? 'text-emerald-700' : ''}>One number</li>
                        <li className={passwordChecks.matches ? 'text-emerald-700' : ''}>Passwords match</li>
                      </ul>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" variant="primary" icon={<KeyRound />}>Continue</Button>
                    </div>
                  </form>
                </Card.Body>
              </Card>
            </motion.div>
          )}

          {step === STEPS.ROLE && (
            <motion.div
              key="role"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
            >
              <Card className="shadow-sm">
                <Card.Body className="p-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-slate-900">3. Select your role</h2>
                    <button
                      type="button"
                      onClick={() => setStep(signupMethod === 'google' ? STEPS.METHOD : STEPS.FORM)}
                      className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </button>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roleCards.map((role) => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => handleSelectRole(role.value)}
                        className={`rounded-2xl border p-5 text-left transition-all ${formData.role === role.value ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:border-primary-300 hover:shadow-sm'}`}
                      >
                        <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-white border border-slate-200 text-primary-700">
                          {role.icon}
                        </div>
                        <p className="mt-3 font-semibold text-slate-900">{role.title}</p>
                        <p className="text-sm text-slate-600 mt-1">{role.description}</p>
                      </button>
                    ))}
                  </div>

                  {signupMethod === 'email' && (
                    <div className="mt-6 flex justify-end">
                      <Button
                        type="button"
                        variant="primary"
                        loading={isLoading}
                        disabled={!formData.role}
                        onClick={handleCreateAccount}
                      >
                        Create Account Securely
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </motion.div>
          )}

          {step === STEPS.VERIFY && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
            >
              <Card className="shadow-sm">
                <Card.Body className="p-8">
                  <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold text-slate-900 text-center">4. Verify your email</h2>
                  <p className="mt-2 text-slate-600 text-center">
                    Enter the 6-digit code sent to <strong>{formData.email}</strong> to finish creating your account.
                  </p>

                  {verificationMessage && (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 text-center">
                      {verificationMessage}
                    </div>
                  )}

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">6-digit OTP</label>
                    <div className="flex gap-2 justify-between" onPaste={(event) => {
                      event.preventDefault();
                      const pasted = (event.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, OTP_LENGTH);
                      if (!pasted) return;
                      const next = Array(OTP_LENGTH).fill('');
                      pasted.split('').forEach((digit, idx) => { next[idx] = digit; });
                      setOtpValues(next);
                      otpInputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
                    }}>
                      {otpValues.map((digit, index) => (
                        <input
                          key={index}
                          ref={(element) => { otpInputRefs.current[index] = element; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(event) => handleOtpChange(index, event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Backspace' && !otpValues[index] && index > 0) {
                              otpInputRefs.current[index - 1]?.focus();
                            }
                            if (event.key === 'ArrowLeft' && index > 0) {
                              otpInputRefs.current[index - 1]?.focus();
                            }
                            if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
                              otpInputRefs.current[index + 1]?.focus();
                            }
                          }}
                          className="h-12 w-12 rounded-xl border border-slate-300 text-center text-lg font-semibold focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      variant="primary"
                      fullWidth
                      loading={verificationLoading}
                      onClick={handleVerifyOtp}
                    >
                      Verify Email
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      fullWidth
                      loading={resendLoading}
                      onClick={handleResendOtp}
                    >
                      Resend OTP
                    </Button>
                  </div>

                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => setStep(STEPS.ROLE)}
                      className="text-sm text-slate-600 hover:text-slate-900"
                    >
                      Back to role selection
                    </button>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account? <Link to="/login" className="text-primary-700 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
