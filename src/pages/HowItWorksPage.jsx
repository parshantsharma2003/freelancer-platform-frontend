import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Search, 
  FileText, 
  DollarSign,
  Shield,
  MessageSquare,
  CheckCircle,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorksPage = () => {
  const freelancerSteps = [
    {
      icon: UserPlus,
      title: 'Create Your Profile',
      description: 'Sign up and showcase your skills, experience, and portfolio to attract clients.',
      color: 'bg-blue-500'
    },
    {
      icon: Search,
      title: 'Browse & Apply',
      description: 'Find projects that match your expertise and submit compelling proposals.',
      color: 'bg-green-500'
    },
    {
      icon: MessageSquare,
      title: 'Get Hired',
      description: 'Connect with clients, discuss project details, and agree on terms.',
      color: 'bg-purple-500'
    },
    {
      icon: DollarSign,
      title: 'Get Paid',
      description: 'Complete the work, get approved, and receive secure payments through escrow.',
      color: 'bg-orange-500'
    }
  ];

  const clientSteps = [
    {
      icon: FileText,
      title: 'Post a Job',
      description: 'Describe your project requirements, budget, and deadline in minutes.',
      color: 'bg-indigo-500'
    },
    {
      icon: Search,
      title: 'Review Proposals',
      description: 'Receive proposals from qualified freelancers and review their profiles.',
      color: 'bg-pink-500'
    },
    {
      icon: CheckCircle,
      title: 'Hire & Collaborate',
      description: 'Select the perfect freelancer and track progress with real-time updates.',
      color: 'bg-teal-500'
    },
    {
      icon: Star,
      title: 'Review & Repeat',
      description: 'Rate your experience and build long-term relationships with top talent.',
      color: 'bg-yellow-500'
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Secure Escrow',
      description: 'Payments are held safely until work is completed and approved.'
    },
    {
      icon: MessageSquare,
      title: 'Real-time Messaging',
      description: 'Communicate seamlessly with built-in chat and file sharing.'
    },
    {
      icon: CheckCircle,
      title: 'Milestone Tracking',
      description: 'Break projects into milestones for better progress management.'
    },
    {
      icon: Star,
      title: 'Rating System',
      description: 'Build trust with verified reviews and ratings from real users.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How FreelancePro Works
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect with talented freelancers or find your next great project. 
              Our platform makes collaboration simple, secure, and successful.
            </p>
          </motion.div>
        </div>
      </section>

      {/* For Freelancers Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              For Freelancers
            </h2>
            <p className="text-lg text-gray-600">
              Start earning from your skills in 4 simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {freelancerSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow h-full border border-gray-100">
                  <div className={`${step.color} w-14 h-14 rounded-lg flex items-center justify-center mb-4`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link to="/register">
              <button className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg">
                Start as a Freelancer
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* For Clients Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              For Clients
            </h2>
            <p className="text-lg text-gray-600">
              Hire top talent and get your project done right
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {clientSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow h-full border border-gray-100">
                  <div className={`${step.color} w-14 h-14 rounded-lg flex items-center justify-center mb-4`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link to="/register">
              <button className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg">
                Start Hiring
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose FreelancePro?
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need for successful freelance collaboration
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all"
              >
                <feature.icon className="w-12 h-12 text-primary-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of freelancers and clients building successful partnerships
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <button className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg">
                  Sign Up Now
                </button>
              </Link>
              <Link to="/browse-jobs">
                <button className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                  Browse Jobs
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;
