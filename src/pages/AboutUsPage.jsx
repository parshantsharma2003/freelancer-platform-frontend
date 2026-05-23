import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Users, Award, TrendingUp } from 'lucide-react';

function AboutUsPage() {
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To empower professionals worldwide by creating the most trusted and efficient platform for freelance work, fostering meaningful connections between talented freelancers and forward-thinking businesses.'
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'We believe in building a supportive community where freelancers and clients can thrive together. Our platform prioritizes trust, transparency, and mutual success.'
    },
    {
      icon: Award,
      title: 'Quality & Excellence',
      description: 'We maintain high standards for both freelancers and clients, ensuring every project is an opportunity for exceptional work and professional growth.'
    },
    {
      icon: TrendingUp,
      title: 'Innovation',
      description: 'We continuously evolve our platform with cutting-edge technology, making it easier for professionals to connect, collaborate, and succeed in the digital economy.'
    }
  ];

  const stats = [
    { value: '500K+', label: 'Active Freelancers' },
    { value: '100K+', label: 'Happy Clients' },
    { value: '2M+', label: 'Projects Completed' },
    { value: '₹4,000 Cr+', label: 'Total Earnings' }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Co-Founder',
      bio: 'Former VP at UpWork with 15 years of experience in the freelance industry.',
      image: 'https://randomuser.me/api/portraits/women/1.jpg'
    },
    {
      name: 'Michael Chen',
      role: 'CTO & Co-Founder',
      bio: 'Tech visionary with background from Google and experience building scalable platforms.',
      image: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Operations',
      bio: 'Operations expert focused on creating seamless experiences for our community.',
      image: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    {
      name: 'David Park',
      role: 'Head of Product',
      bio: 'Product strategist passionate about building tools that empower freelancers.',
      image: 'https://randomuser.me/api/portraits/men/2.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center text-white/90 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-6">About FreelancerHub</h1>
          <p className="text-xl text-white/90 max-w-3xl">
            We're building the future of work by connecting talented professionals with 
            opportunities worldwide. Our platform empowers freelancers to build thriving 
            careers while helping businesses access top talent.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  FreelancerHub was born from a simple observation: the traditional employment 
                  model wasn't serving everyone. Talented professionals wanted flexibility and 
                  autonomy, while businesses needed access to specialized skills without the 
                  overhead of full-time hires.
                </p>
                <p>
                  Founded in 2020 by a team of freelance industry veterans and technology 
                  entrepreneurs, we set out to create a platform that would revolutionize how 
                  people work together. We combined the best practices from existing platforms 
                  with innovative features powered by modern technology.
                </p>
                <p>
                  Today, FreelancerHub serves hundreds of thousands of freelancers and clients 
                  across the globe, facilitating millions of successful projects and billions in 
                  earnings. But we're just getting started.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🚀</div>
                <div className="text-2xl font-bold text-gray-900">Building the Future of Work</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-gray-50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-700">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Meet Our Team</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            We're a diverse team of passionate individuals committed to transforming the way people work.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <div className="text-primary-600 font-medium mb-3">{member.role}</div>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Growing Community</h2>
          <p className="text-xl text-white/90 mb-8">
            Whether you're a freelancer looking for exciting projects or a business seeking 
            top talent, FreelancerHub is your platform for success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg"
            >
              Get Started
            </Link>
            <Link 
              to="/browse-jobs" 
              className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg"
            >
              Explore Opportunities
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUsPage;
