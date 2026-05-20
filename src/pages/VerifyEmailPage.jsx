import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, Mail, RotateCcw, ShieldCheck, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const OTP_LENGTH = 6;

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const { otpLogin } = useAuth();
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const emailFromQuery = (searchParams.get('email') || '').trim().toLowerCase();
  const flow = searchParams.get('flow') || 'verification';

  const [status, setStatus] = useState(token ? 'loading' : 'idle');
  const [message, setMessage] = useState(
    token ? 'Verifying your email...' : 'Enter the 6-digit code sent to your email.'
  );
  const [email, setEmail] = useState(emailFromQuery);
  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    setEmail(emailFromQuery);
  }, [emailFromQuery]);

  const otp = useMemo(() => otpValues.join(''), [otpValues]);

  const redirectAfterLogin = (user) => {
    const role = user?.role;
    if (role === 'client') return navigate('/client/profile/setup', { replace: true });
    if (role === 'freelancer') return navigate('/profile/setup', { replace: true });
    if (role === 'super_admin') return navigate('/admin/dashboard', { replace: true });
    return navigate('/dashboard', { replace: true });
  };

  useEffect(() => {
    let cancelled = false;

    const verifyToken = async () => {
      if (!token) return;

      try {
        const response = await authAPI.verifyEmailByToken(token);
        if (!cancelled) {
          setStatus('success');
          setMessage(response?.data?.message || 'Your email has been verified successfully.');
        }
      } catch (error) {
        if (!cancelled) {
          setStatus('error');
          setMessage(error?.response?.data?.message || 'Verification link is invalid or has expired.');
        }
      }
    };

    verifyToken();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const nextValues = [...otpValues];
    nextValues[index] = value;
    setOtpValues(nextValues);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== OTP_LENGTH) {
      setStatus('error');
      setMessage('Enter the 6-digit code sent to your email.');
      return;
    }

    if (!email) {
      setStatus('error');
      setMessage('Email is required.');
      return;
    }

    setLoading(true);
    setStatus('loading');
    try {
      const result = await otpLogin({ email, otp });
      if (!result?.success) {
        throw new Error(result?.error || 'OTP verification failed');
      }
      const user = result?.user;
      setStatus('success');
      setMessage('Your email has been verified successfully.');
      if (user) {
        window.setTimeout(() => redirectAfterLogin(user), 700);
      }
    } catch (error) {
      setStatus('error');
      setMessage(error?.response?.data?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setStatus('error');
      setMessage('Enter your email address first.');
      return;
    }

    setResendLoading(true);
    try {
      const response = await authAPI.requestLoginOtp(email);
      setStatus('idle');
      setMessage('A new OTP has been sent to your email.');
      setOtpValues(Array(OTP_LENGTH).fill(''));
    } catch (error) {
      setStatus('error');
      setMessage(error?.response?.data?.message || 'Unable to resend OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  if (token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white shadow-sm p-8 text-center">
          {status === 'loading' && <Loader2 className="h-10 w-10 animate-spin text-primary-600 mx-auto" />}
          {status === 'success' && <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />}
          {status === 'error' && <XCircle className="h-10 w-10 text-red-600 mx-auto" />}

          <h1 className="mt-4 text-2xl font-bold text-gray-900">Email Verification</h1>
          <p className="mt-2 text-sm text-gray-600">{message}</p>

          <div className="mt-6 flex justify-center gap-3">
            <Link to="/login" className="btn-secondary">Go to Login</Link>
            <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] flex items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-800 px-8 py-6 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
            <ShieldCheck className="h-4 w-4" /> Secure OTP
          </div>
          <h1 className="mt-4 text-3xl font-bold">Verify your account</h1>
          <p className="mt-2 text-sm text-white/80">Use the one-time code sent to your email to continue.</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 flex items-start gap-3">
            <Mail className="h-5 w-5 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Email destination</p>
              <p className="mt-1 break-all">{email || 'Enter your email below'}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input w-full"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">6-digit OTP</label>
            <div className="flex gap-2" onPaste={(event) => {
              event.preventDefault();
              const pasted = (event.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, OTP_LENGTH);
              if (!pasted) return;
              const next = Array(OTP_LENGTH).fill('');
              pasted.split('').forEach((digit, idx) => { next[idx] = digit; });
              setOtpValues(next);
              inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
            }}>
              {otpValues.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => { inputRefs.current[index] = element; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => handleOtpChange(index, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Backspace' && !otpValues[index] && index > 0) {
                      inputRefs.current[index - 1]?.focus();
                    }
                    if (event.key === 'ArrowLeft' && index > 0) {
                      inputRefs.current[index - 1]?.focus();
                    }
                    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
                      inputRefs.current[index + 1]?.focus();
                    }
                  }}
                  className="h-14 w-14 rounded-xl border border-slate-300 text-center text-xl font-bold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              ))}
            </div>
          </div>

          {message && (
            <div className={`rounded-2xl border px-4 py-3 text-sm ${status === 'error' ? 'border-red-200 bg-red-50 text-red-700' : status === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
              {message}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Verifying...' : flow === 'login' ? 'Verify & Login' : 'Verify Account'}
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="btn-secondary flex-1 inline-flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {resendLoading ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>

          <div className="text-center text-sm text-slate-600">
            <Link to="/login" className="font-semibold text-emerald-700 hover:underline">Back to login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
