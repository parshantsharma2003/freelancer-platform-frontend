import { Link } from 'react-router-dom';
import { Search, Code, Palette, Video, Music, PenTool, Database, Globe, ArrowRight, Star, Shield, Clock, TrendingUp, Sparkles, Wand2, Wallet, Users, CheckCircle, Zap } from 'lucide-react';
import { useQuery } from 'react-query';
import { freelancerAPI } from '../services/api';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const LandingPage = () => {
  const { data: featuredFreelancers } = useQuery('featuredFreelancers', freelancerAPI.getFeatured);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const categories = [
    { name: 'Web Development', icon: Code, color: 'bg-blue-100 text-blue-600', hoverColor: 'group-hover:bg-blue-600 group-hover:text-white' },
    { name: 'Design & Creative', icon: Palette, color: 'bg-pink-100 text-pink-600', hoverColor: 'group-hover:bg-pink-600 group-hover:text-white' },
    { name: 'Video & Animation', icon: Video, color: 'bg-purple-100 text-purple-600', hoverColor: 'group-hover:bg-purple-600 group-hover:text-white' },
    { name: 'Music & Audio', icon: Music, color: 'bg-green-100 text-green-600', hoverColor: 'group-hover:bg-green-600 group-hover:text-white' },
    { name: 'Writing & Content', icon: PenTool, color: 'bg-yellow-100 text-yellow-600', hoverColor: 'group-hover:bg-yellow-600 group-hover:text-white' },
    { name: 'Data Science', icon: Database, color: 'bg-indigo-100 text-indigo-600', hoverColor: 'group-hover:bg-indigo-600 group-hover:text-white' },
    { name: 'Digital Marketing', icon: TrendingUp, color: 'bg-red-100 text-red-600', hoverColor: 'group-hover:bg-red-600 group-hover:text-white' },
    { name: 'Translation', icon: Globe, color: 'bg-teal-100 text-teal-600', hoverColor: 'group-hover:bg-teal-600 group-hover:text-white' },
  ];

  const steps = [
    { title: 'Post a Job', description: 'Tell us what you need done in seconds' },
    { title: 'Browse Talent', description: 'Get qualified proposals within 24 hours' },
    { title: 'Hire & Collaborate', description: 'Work with the best and pay upon completion' },
  ];

  const features = [
    { icon: Shield, title: 'Secure Escrow', description: 'Funds stay protected until you approve milestones' },
    { icon: Clock, title: 'Rapid Hiring', description: 'AI shortlists in minutes, not days' },
    { icon: Star, title: 'Top Talent', description: 'Verified profiles, real work history' },
  ];

  const differentiators = [
    { icon: Sparkles, title: 'AI Matching', description: 'Smart ranking by skills, budget, and fit' },
    { icon: Wallet, title: 'Fair Pricing', description: 'Transparent fees with regional pricing support' },
    { icon: Wand2, title: 'Freelancer-First Tools', description: 'Milestones, reviews, and portfolio boosts' },
    { icon: Users, title: 'Ethical Boost', description: 'Quality-based visibility, not pay-to-win' },
  ];

  const testimonials = [
    {
      quote: 'We hired a product designer in 48 hours. The workflow is as clean as the output.',
      name: 'Aisha Kumar',
      role: 'Founder, Sandline Studio'
    },
    {
      quote: 'The escrow and milestones made working across time zones feel effortless.',
      name: 'Mateo Alvarez',
      role: 'Ops Lead, Northwind'
    },
    {
      quote: 'It finally feels like a marketplace built for freelancers, not just clients.',
      name: 'Julien Park',
      role: 'Freelance Engineer'
    }
  ];

  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="hero-glow text-white relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.span
                className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-sm backdrop-blur-sm border border-white/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles size={14} className="mr-2" />
                FreelancePro Marketplace
              </motion.span>
              
              <motion.h1
                className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mt-6 mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Hire bold,{' '}
                <span className="text-gradient-animate bg-gradient-to-r from-primary-300 via-blue-300 to-primary-300 bg-clip-text text-transparent bg-[length:200%_auto]">
                  ship fast
                </span>
                , pay fair.
              </motion.h1>
              
              <motion.p
                className="text-lg md:text-xl text-white/80 mb-8 max-w-xl leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                AI matching, escrow-backed milestones, and a talent pool built for ambitious teams and creators.
              </motion.p>
              
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Link
                  to="/post-job"
                  className="group btn bg-white text-slate-900 hover:bg-primary-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-100 transition-all duration-200"
                >
                  Post a Job
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/browse-jobs"
                  className="btn glass border border-white/40 text-white hover:bg-white/20 px-8 py-4 text-lg font-semibold rounded-xl hover:scale-105 active:scale-100 transition-all duration-200"
                >
                  Browse Work
                </Link>
              </motion.div>
              
              <motion.div
                className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm text-white/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <span className="font-medium">Popular:</span>
                {['Website Design', 'Product UX', 'AI Prototyping', 'Video Editing'].map((tag, i) => (
                  <motion.a
                    key={tag}
                    href="#"
                    className="hover:text-white transition-colors underline underline-offset-4 decoration-white/30 hover:decoration-white"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + i * 0.1 }}
                  >
                    {tag}
                  </motion.a>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Card */}
            <motion.div
              className="glass-panel rounded-3xl p-8 border border-white/20 shadow-2xl backdrop-blur-xl"
              initial={{ opacity: 0, x: 30, rotateY: -15 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex items-center justify-between text-sm text-white/70 mb-6">
                <span className="flex items-center gap-2">
                  <Zap size={16} className="text-primary-300" />
                  Live Talent
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-400" />
                  Verified
                </span>
              </div>
              
              <div className="space-y-3">
                {[
                  { role: 'Product Designer', time: '2 hours', rate: '$45' },
                  { role: 'Motion Artist', time: '1 hour', rate: '$60' },
                  { role: 'Full-stack Engineer', time: '30 min', rate: '$75' }
                ].map((item, i) => (
                  <motion.div
                    key={item.role}
                    className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm border border-white/10 hover:bg-white/15 hover:border-white/20 transition-all cursor-pointer group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    whileHover={{ x: 6, transition: { duration: 0.2 } }}
                  >
                    <div>
                      <p className="text-white font-semibold group-hover:text-primary-200 transition-colors">
                        {item.role}
                      </p>
                      <p className="text-xs text-white/60">Matched in {item.time}</p>
                    </div>
                    <span className="text-sm rounded-full border border-white/30 px-3 py-1 font-medium group-hover:bg-white/10 transition-colors">
                      {item.rate}/hr
                    </span>
                  </motion.div>
                ))}
              </div>
              
              <motion.div
                className="mt-8 grid grid-cols-3 gap-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                {[
                  { value: '18k+', label: 'Freelancers' },
                  { value: '92%', label: 'Repeat hires' },
                  { value: '4.9', label: 'Avg rating' }
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.2 + i * 0.1, type: "spring" }}
                  >
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/60 mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <motion.div
            className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Categories Section */}
      <section className="py-20 mesh-bg relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <h2 className="text-4xl font-display font-bold text-slate-900">Popular Categories</h2>
              <p className="text-slate-600 mt-3 text-lg">Find the exact expertise you need.</p>
            </div>
            <Link
              to="/browse-jobs"
              className="text-primary-700 hover:text-primary-800 font-semibold flex items-center gap-2 group mt-4 md:mt-0"
            >
              View all
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                >
                  <Link
                    to="/browse-jobs"
                    className="card-interactive h-full"
                  >
                    <div className={`${category.color} ${category.hoverColor} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300`}>
                      <Icon size={28} strokeWidth={2} />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-center">{category.name}</h3>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display font-bold mb-4">How FreelancePro Works</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Getting started is easy. Follow these simple steps to find the perfect freelancer or job.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 z-0" />
            
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="text-center relative z-10"
              >
                <motion.div
                  className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-xl relative"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {index + 1}
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-primary-400"
                    animate={{ scale: [1, 1.3, 1.3], opacity: [0.5, 0, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  />
                </motion.div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Freelancers */}
      {featuredFreelancers?.data?.freelancers?.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="flex justify-between items-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <h2 className="text-4xl font-display font-bold">Featured Freelancers</h2>
                <p className="text-slate-600 mt-2 text-lg">Hire verified talent with proven track records</p>
              </div>
              <Link
                to="/freelancers"
                className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2 group"
              >
                View All
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            
            <div className="grid md:grid-cols-4 gap-6">
              {featuredFreelancers.data.freelancers.slice(0, 4).map((freelancer, i) => (
                <motion.div
                  key={freelancer._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <Link
                    to={`/freelancers/${freelancer._id}`}
                    className="card-interactive h-full"
                  >
                    <div className="text-center">
                      <motion.div
                        className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full mx-auto mb-4 overflow-hidden ring-4 ring-primary-100"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {freelancer.user?.avatar ? (
                          <img src={freelancer.user.avatar} alt={freelancer.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary-700">
                            {freelancer.user?.firstName?.[0]}
                          </div>
                        )}
                      </motion.div>
                      <h3 className="font-semibold text-lg mb-1 text-slate-900">
                        {freelancer.user?.firstName} {freelancer.user?.lastName}
                      </h3>
                      <p className="text-sm text-slate-600 mb-3">{freelancer.title}</p>
                      <div className="flex items-center justify-center gap-1 text-yellow-500 mb-3">
                        <Star size={16} fill="currentColor" />
                        <span className="text-slate-900 font-semibold">{freelancer.rating.toFixed(1)}</span>
                        <span className="text-slate-500 text-sm">({freelancer.totalJobs})</span>
                      </div>
                      <p className="text-primary-600 font-bold text-lg">${freelancer.hourlyRate}/hr</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Proof */}
      <section className="bg-gradient-to-br from-primary-50 via-blue-50 to-primary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-display font-bold mb-4">Built on Trust & Speed</h2>
            <p className="text-slate-600 text-lg">The guarantees that matter most</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-all"
                >
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon size={32} strokeWidth={2} />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-3 text-center text-slate-900">{feature.title}</h3>
                  <p className="text-slate-600 text-center leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-display font-bold mb-8">Why Choose FreelancePro?</h2>
              <div className="space-y-4">
                {differentiators.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      whileHover={{ x: 8, transition: { duration: 0.2 } }}
                      className="flex gap-4 rounded-2xl border-2 border-slate-200 bg-white p-5 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                        <Icon size={22} strokeWidth={2} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg mb-1 text-slate-900">{item.title}</h4>
                        <p className="text-slate-600 leading-relaxed">{item.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Right Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden"
            >
              {/* Animated background */}
              <motion.div
                className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 8, repeat: Infinity }}
              />
              
              <div className="relative z-10">
                <p className="text-sm uppercase tracking-[0.2em] text-white/60 font-semibold">Platform Differentiators</p>
                <h3 className="text-3xl font-display font-bold mt-4 leading-tight">
                  Regional pricing. Ethical boost. Real talent.
                </h3>
                <p className="text-white/70 mt-6 leading-relaxed text-lg">
                  We spotlight quality and fit. That means less spam, more signal, and better outcomes for everyone.
                </p>
                
                <div className="mt-8 flex flex-wrap gap-3">
                  {['AI hooks', 'Subscriptions', 'Fraud detection', 'KYC-ready'].map((tag, i) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="rounded-full border border-white/30 bg-white/5 px-4 py-2 text-sm font-medium backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>

                <motion.div
                  className="mt-8 pt-8 border-t border-white/10"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4].map((n) => (
                        <div
                          key={n}
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-blue-500 border-2 border-slate-900 flex items-center justify-center text-sm font-bold"
                        >
                          {String.fromCharCode(64 + n)}
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-sm text-white/90 font-medium">Join 18,000+ freelancers</p>
                      <p className="text-xs text-white/60">Building their careers here</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-display font-bold">Teams love the flow</h2>
              <p className="text-slate-600 mt-2">Hiring feels human and fast.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((item) => (
              <div key={item.name} className="card">
                <p className="text-slate-700">“{item.quote}”</p>
                <div className="mt-6">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-24 relative overflow-hidden">
        {/* Animated background */}
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -100, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
              Ready to get started?
            </h2>
            <p className="text-xl mb-10 text-primary-100 max-w-2xl mx-auto">
              Join thousands of businesses and freelancers working together
            </p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Link
                to="/register"
                className="group btn bg-white text-slate-900 hover:bg-primary-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-100 transition-all duration-200"
              >
                Join as Freelancer
                <ArrowRight size={20} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/register"
                className="btn glass border-2 border-white/40 text-white hover:bg-white hover:text-slate-900 px-8 py-4 text-lg font-semibold rounded-xl hover:scale-105 active:scale-100 transition-all duration-200"
              >
                Join as Client
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
