import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, Briefcase, Users, Check, Github, Linkedin } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { showToast } from '../components/ui/Toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [step, setStep] = useState(1); // 1: Role selection, 2: Form
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '',
  });
  const [error, setError] = useState('');

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Prevent duplicate submissions
    if (isLoading) {
      return;
    }

    const result = await register(formData);

    if (result.success) {
      showToast.success('Account created successfully!');
      
      // Navigate once after successful registration based on role
      const role = result.user?.role;
      if (role === 'client') {
        navigate('/dashboard', { replace: true });
      } else if (role === 'freelancer') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else {
      setError(result.error);
      showToast.error(result.error);
    }
  };

  const handleOAuthRegister = (provider) => {
    const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const normalizedBase = rawApiUrl.replace(/\/+$/, '').replace(/\/api$/i, '');
    const oauthBase = `${normalizedBase}/api`;
    window.location.href = `${oauthBase}/auth/oauth/${provider}?role=${formData.role || 'freelancer'}`;
  };

  const roles = [
    {
      value: 'freelancer',
      title: "I'm a Freelancer",
      description: 'I want to work on projects',
      icon: <Briefcase className="h-8 w-8" />,
      features: ['Find great projects', 'Set your own rates', 'Build your portfolio'],
      color: 'from-primary-500 to-primary-600',
    },
    {
      value: 'client',
      title: "I'm a Client",
      description: 'I want to hire talent',
      icon: <Users className="h-8 w-8" />,
      features: ['Post unlimited jobs', 'Hire top talent', 'Secure payments'],
      color: 'from-blue-500 to-blue-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
              <UserPlus className="h-8 w-8 text-primary-600" />
            </div>
          </motion.div>
          <h2 className="text-3xl font-display font-bold text-gray-900">Join FreelancePro</h2>
          <p className="mt-2 text-gray-600">
            {step === 1 ? 'Choose how you want to get started' : 'Create your account'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {roles.map((role, index) => (
                <motion.div
                  key={role.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card
                    clickable
                    onClick={() => handleRoleSelect(role.value)}
                    className="h-full hover:scale-105 transition-transform cursor-pointer"
                  >
                    <Card.Body className="p-8">
                      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${role.color} text-white rounded-2xl mb-4`}>
                        {role.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {role.title}
                      </h3>
                      <p className="text-gray-600 mb-6">{role.description}</p>
                      <ul className="space-y-3">
                        {role.features.map((feature, i) => (
                          <li key={i} className="flex items-center text-gray-700">
                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </Card.Body>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-md mx-auto"
            >
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

                  {/* Role Badge */}
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-gradient-to-br ${formData.role === 'freelancer' ? 'from-primary-500 to-primary-600' : 'from-blue-500 to-blue-600'} text-white rounded-lg`}>
                        {formData.role === 'freelancer' ? <Briefcase className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formData.role === 'freelancer' ? 'Freelancer Account' : 'Client Account'}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setStep(1)}
                    >
                      Change
                    </Button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        icon={<User />}
                        placeholder="John"
                      />
                      <Input
                        label="Last Name"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Doe"
                      />
                    </div>

                    <Input
                      label="Email Address"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      icon={<Mail />}
                      placeholder="you@example.com"
                    />

                    <Input
                      label="Password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      icon={<Lock />}
                      placeholder="••••••••"
                      helper="Must be at least 8 characters"
                    />

                    <div className="pt-2">
                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          required
                          className="mt-1 mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-600">
                          I agree to the{' '}
                          <Link to="/terms" className="text-primary-600 hover:text-primary-700">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link to="/privacy" className="text-primary-600 hover:text-primary-700">
                            Privacy Policy
                          </Link>
                        </span>
                      </label>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      size="lg"
                      loading={isLoading}
                    >
                      Create Account
                    </Button>
                  </form>

                  {/* OAuth Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">Or sign up with</span>
                    </div>
                  </div>

                  {/* OAuth Buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleOAuthRegister('google')}
                      icon={<FaGoogle className="h-5 w-5" />}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => handleOAuthRegister('github')}
                      icon={<Github className="h-5 w-5" />}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => handleOAuthRegister('linkedin')}
                      icon={<Linkedin className="h-5 w-5" />}
                      className="flex-1"
                    />
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-gray-600">
                      Already have an account?{' '}
                      <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-500">
            Trusted by 10,000+ freelancers and clients worldwide
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
