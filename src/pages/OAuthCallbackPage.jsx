import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isAuthResolved } = useAuth();
  const [statusMessage, setStatusMessage] = useState('Completing sign in');
  const retriesRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const resolveSession = async () => {
      if (!isAuthResolved) return;

      if (isAuthenticated) {
        if (user?.role === 'super_admin') {
          navigate('/admin/dashboard', { replace: true });
          return;
        }

        navigate('/dashboard', { replace: true });
        return;
      }

      try {
        setStatusMessage('Checking your session');
        const sessionResponse = await authAPI.session({ skipAuthRefresh: true });
        const sessionData = sessionResponse?.data?.data || {};

        if (cancelled) return;

        if (sessionData.authenticated && sessionData.user) {
          localStorage.setItem('user', JSON.stringify(sessionData.user));
          if (sessionData.accessToken) {
            localStorage.setItem('accessToken', sessionData.accessToken);
          }

          if (sessionData.user.role === 'super_admin') {
            navigate('/admin/dashboard', { replace: true });
            return;
          }

          navigate('/dashboard', { replace: true });
          return;
        }

        if (retriesRef.current < 4) {
          retriesRef.current += 1;
          window.setTimeout(() => {
            if (!cancelled) {
              resolveSession();
            }
          }, 500);
          return;
        }

        navigate('/login', { replace: true });
      } catch {
        if (retriesRef.current < 4) {
          retriesRef.current += 1;
          window.setTimeout(() => {
            if (!cancelled) {
              resolveSession();
            }
          }, 500);
          return;
        }

        navigate('/login', { replace: true });
      }
    };

    resolveSession();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isAuthResolved, navigate, user?.role]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600 mx-auto" />
        <h1 className="mt-4 text-xl font-semibold text-slate-900">{statusMessage}</h1>
        <p className="mt-2 text-sm text-slate-600">Please wait while we finish your Google login.</p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;