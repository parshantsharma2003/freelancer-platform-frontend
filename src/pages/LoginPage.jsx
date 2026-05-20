import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Github, Linkedin, KeyRound, ShieldCheck } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { showToast } from '../components/ui/Toast';
import { ENV } from '../config/env';
import { authAPI } from '../services/api';

const OTP_LENGTH = 6;

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, otpLogin, isLoading } = useAuth();

  const [mode, setMode] = useState('password');
  const [error, setError] = useState('');

  const [passwordForm, setPasswordForm] = useState({ email: '', password: '' });

  const [otpEmail, setOtpEmail] = useState('');
  const [otpStep, setOtpStep] = useState(1);
  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(''));
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const otpInputRefs = useRef([]);

  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = window.setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCountdown]);

  const otpCode = useMemo(() => otpValues.join(''), [otpValues]);

  const redirectAfterLogin = (user) => {
    const role = user?.role;

    if (role === 'client') {
      navigate('/client/profile/setup', { replace: true });
      return;
    }

    if (role === 'freelancer') {
      navigate('/profile/setup', { replace: true });
      return;
    }

    if (role === 'super_admin') {
      navigate('/admin/dashboard', { replace: true });
      return;
    }

    navigate('/dashboard', { replace: true });
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (isLoading) return;

    const result = await login(passwordForm);

    if (result.success) {
      showToast.success('Welcome back!');
      redirectAfterLogin(result.user);
      return;
    }

    if (result.requiresEmailVerification) {
      showToast.info('We sent a verification code to your email.');
      navigate(`/verify-email?email=${encodeURIComponent(result.email || passwordForm.email)}&flow=login`, { replace: true });
      return;
    }

    setError(result.error || 'Login failed');
    showToast.error(result.error || 'Login failed');
  };

  const handleOAuthLogin = (provider) => {
    window.location.href = `${ENV.OAUTH_BASE_URL}/auth/oauth/${provider}`;
  };

  const handleSendOtp = async () => {
    setError('');

    if (!otpEmail.trim()) {
      setError('Email is required');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await authAPI.requestLoginOtp(otpEmail.trim().toLowerCase());
      setOtpStep(2);
      setOtpValues(Array(OTP_LENGTH).fill(''));
      setResendCountdown(30);

      window.setTimeout(() => {
        otpInputRefs.current?.[0]?.focus();
      }, 50);
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'Unable to send OTP';
      setError(message);
      showToast.error(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpInputChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const nextValues = [...otpValues];
    nextValues[index] = value;
    setOtpValues(nextValues);

    if (value && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }

    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pasted = (event.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    const nextValues = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((digit, idx) => {
      nextValues[idx] = digit;
    });

    setOtpValues(nextValues);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    otpInputRefs.current[focusIndex]?.focus();
  };

  const handleVerifyOtp = async () => {
    setError('');

    if (otpCode.length !== OTP_LENGTH) {
      setError('Enter the 6-digit OTP');
      return;
    }

    const result = await otpLogin({
      email: otpEmail.trim().toLowerCase(),
      otp: otpCode,
    });

    if (result.success) {
      showToast.success('OTP verified. Login successful');
      redirectAfterLogin(result.user);
      return;
    }

    setError(result.error || 'OTP verification failed');
    showToast.error(result.error || 'OTP verification failed');
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    await handleSendOtp();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
              <LogIn className="h-8 w-8 text-primary-600" />
            </div>
          </motion.div>
          <h2 className="text-3xl font-display font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-gray-600">Sign in using password or secure email OTP.</p>
        </div>

        <Card className="shadow-xl">
          <Card.Body>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-2 mb-5 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('password');
                  setError('');
                }}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${mode === 'password' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <span className="inline-flex items-center gap-1"><Lock className="h-4 w-4" /> Password</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('otp');
                  setError('');
                }}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${mode === 'otp' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <span className="inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> Email OTP</span>
              </button>
            </div>

            {mode === 'password' ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={passwordForm.email}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, email: event.target.value }))}
                  icon={<Mail />}
                  placeholder="you@example.com"
                />

                <Input
                  label="Password"
                  type="password"
                  required
                  value={passwordForm.password}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, password: event.target.value }))}
                  icon={<Lock />}
                  placeholder="••••••••"
                />

                <Button type="submit" variant="primary" fullWidth size="lg" loading={isLoading}>
                  Sign In
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                {otpStep === 1 && (
                  <>
                    <Input
                      label="Email Address"
                      type="email"
                      required
                      value={otpEmail}
                      onChange={(event) => setOtpEmail(event.target.value)}
                      icon={<Mail />}
                      placeholder="you@example.com"
                    />

                    <Button
                      type="button"
                      variant="primary"
                      fullWidth
                      size="lg"
                      loading={otpLoading}
                      onClick={handleSendOtp}
                    >
                      Send OTP
                    </Button>
                  </>
                )}

                {otpStep === 2 && (
                  <>
                    <div className="rounded-lg border border-primary-100 bg-primary-50 p-3 text-xs text-primary-700">
                      OTP sent to <strong>{otpEmail}</strong>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Enter 6-digit OTP</label>
                      <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                        {otpValues.map((digit, index) => (
                          <input
                            key={index}
                            ref={(element) => {
                              otpInputRefs.current[index] = element;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(event) => handleOtpInputChange(index, event.target.value)}
                            onKeyDown={(event) => handleOtpKeyDown(index, event)}
                            className="h-12 w-12 rounded-lg border border-gray-300 text-center text-lg font-semibold focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                          />
                        ))}
                      </div>
                    </div>

                    <Button type="button" variant="primary" fullWidth size="lg" loading={isLoading} onClick={handleVerifyOtp}>
                      Verify OTP & Login
                    </Button>

                    <div className="flex items-center justify-between text-sm">
                      <button
                        type="button"
                        onClick={() => {
                          setOtpStep(1);
                          setOtpValues(Array(OTP_LENGTH).fill(''));
                        }}
                        className="text-slate-600 hover:text-slate-900"
                      >
                        Change email
                      </button>

                      <button
                        type="button"
                        disabled={resendCountdown > 0 || otpLoading}
                        onClick={handleResendOtp}
                        className={`font-medium ${resendCountdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-primary-600 hover:text-primary-700'}`}
                      >
                        {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend OTP'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mt-6">
              <Button variant="outline" onClick={() => handleOAuthLogin('google')} icon={<FaGoogle />} />
              <Button variant="outline" onClick={() => handleOAuthLogin('github')} icon={<Github />} />
              <Button variant="outline" onClick={() => handleOAuthLogin('linkedin')} icon={<Linkedin />} />
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                  Sign up for free
                </Link>
              </p>
            </div>
          </Card.Body>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
