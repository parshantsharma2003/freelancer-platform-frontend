import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Github, Linkedin } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { showToast } from '../components/ui/Toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Prevent duplicate submissions
    if (isLoading) {
      return;
    }

    const result = await login(formData);

    if (result.success) {
      showToast.success('Welcome back!');

      // ✅ ROLE-BASED REDIRECT - Navigate once after successful login
      const role = result.user?.role;

      if (role === 'client') {
        
        navigate('/dashboard', { replace: true });
      } else if (role === 'freelancer') {
        
        navigate('/dashboard', { replace: true });
      } else if (role === 'super_admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }

    } else {
      setError(result.error);
      showToast.error(result.error);
    }
  };

  const handleOAuthLogin = (provider) => {
    const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const normalizedBase = rawApiUrl.replace(/\/+$/, '').replace(/\/api$/i, '');
    const oauthBase = `${normalizedBase}/api`;
    window.location.href = `${oauthBase}/auth/oauth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Header */}
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
          <h2 className="text-3xl font-display font-bold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-gray-600">
            Sign in to your FreelancePro account
          </p>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                icon={<Mail />}
                placeholder="you@example.com"
              />

              <Input
                label="Password"
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                icon={<Lock />}
                placeholder="••••••••"
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={isLoading}
              >
                Sign In
              </Button>
            </form>

            {/* OAuth */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => handleOAuthLogin('google')}
                icon={<FaGoogle />}
              />
              <Button
                variant="outline"
                onClick={() => handleOAuthLogin('github')}
                icon={<Github />}
              />
              <Button
                variant="outline"
                onClick={() => handleOAuthLogin('linkedin')}
                icon={<Linkedin />}
              />
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
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
