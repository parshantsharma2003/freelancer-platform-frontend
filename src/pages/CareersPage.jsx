import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Briefcase } from 'lucide-react';

function CareersPage() {
  const benefits = [
    '🏥 Comprehensive Health Insurance',
    '🏖️ Unlimited PTO',
    '💰 Competitive Salary & Equity',
    '🏠 Remote-First Culture',
    '📚 Learning & Development Budget',
    '💻 Latest Tech & Equipment',
    '🌍 Annual Team Retreats',
    '⚖️ Work-Life Balance'
  ];

  const openPositions = [
    {
      title: 'Senior Full-Stack Engineer',
      department: 'Engineering',
      location: 'Remote (US/EU)',
      type: 'Full-time',
      description: 'Build scalable features for our platform using React, Node.js, and MongoDB. Lead technical decisions and mentor junior engineers.'
    },
    {
      title: 'Product Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      description: 'Create beautiful, intuitive experiences for freelancers and clients. Own the design process from research to final implementation.'
    },
    {
      title: 'Customer Success Manager',
      department: 'Customer Success',
      location: 'Remote (Global)',
      type: 'Full-time',
      description: 'Help our users succeed by providing exceptional support, gathering feedback, and building relationships with key clients.'
    },
    {
      title: 'Senior DevOps Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Scale our infrastructure, improve deployment pipelines, and ensure high availability. Experience with AWS, Docker, and Kubernetes required.'
    },
    {
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'Remote (US)',
      type: 'Full-time',
      description: 'Drive growth through creative campaigns, content marketing, and community building. Experience in B2B and marketplace growth preferred.'
    },
    {
      title: 'Data Analyst',
      department: 'Analytics',
      location: 'Remote',
      type: 'Full-time',
      description: 'Turn data into actionable insights. Work with product, engineering, and business teams to drive data-informed decision making.'
    }
  ];

  const values = [
    {
      title: 'Build with Empathy',
      description: 'We deeply understand our users\' needs and create solutions that truly help them succeed.'
    },
    {
      title: 'Move Fast, Learn Faster',
      description: 'We experiment, iterate, and aren\'t afraid to fail. Every mistake is a learning opportunity.'
    },
    {
      title: 'Own Your Impact',
      description: 'We give team members autonomy and trust them to make decisions that drive the business forward.'
    },
    {
      title: 'Grow Together',
      description: 'We invest in each other\'s growth and celebrate wins as a team.'
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
          <h1 className="text-5xl font-bold mb-6">Careers at FreelancerHub</h1>
          <p className="text-xl text-white/90 max-w-3xl">
            Join us in building the future of work. We're a remote-first team of passionate 
            individuals creating meaningful impact for millions of professionals worldwide.
          </p>
        </div>
      </div>

      {/* Why Join Us Section */}
      <div className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Why Join FreelancerHub?</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            We're more than just a company—we're a mission-driven team transforming how people work.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Benefits & Perks</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="text-3xl mb-3">{benefit.split(' ')[0]}</div>
                <div className="text-gray-700 font-medium">
                  {benefit.split(' ').slice(1).join(' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Open Positions Section */}
      <div className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Open Positions</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Find your next opportunity and make an impact with us.
          </p>
          <div className="space-y-6">
            {openPositions.map((position, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">{position.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-1" />
                        {position.department}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {position.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {position.type}
                      </div>
                    </div>
                  </div>
                  <button className="mt-4 md:mt-0 btn btn-primary whitespace-nowrap">
                    Apply Now
                  </button>
                </div>
                <p className="text-gray-700">{position.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* No Position Section */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Don't See a Perfect Fit?</h2>
            <p className="text-xl text-white/90 mb-8">
              We're always looking for talented individuals. Send us your resume and tell us 
              how you'd like to contribute to FreelancerHub's mission.
            </p>
            <a
              href="mailto:careers@freelancerhub.com?subject=General Application"
              className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg inline-block"
            >
              Send General Application
            </a>
          </div>
        </div>
      </div>

      {/* Application Process Section */}
      <div className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Hiring Process</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Apply', description: 'Submit your application through our careers page' },
              { step: '2', title: 'Phone Screen', description: '30-minute conversation with our recruiting team' },
              { step: '3', title: 'Interviews', description: 'Meet with team members and hiring manager' },
              { step: '4', title: 'Offer', description: 'Receive your offer and join the team!' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Questions About Careers?</h2>
          <p className="text-gray-600 mb-8">
            Our recruiting team is here to help. Reach out anytime!
          </p>
          <div className="bg-gray-50 rounded-xl p-8 inline-block">
            <p className="text-gray-700 mb-2">
              <strong>Email:</strong> <a href="mailto:careers@freelancerhub.com" className="text-primary-600 hover:text-primary-700">careers@freelancerhub.com</a>
            </p>
            <p className="text-gray-700">
              <strong>LinkedIn:</strong> <a href="#" className="text-primary-600 hover:text-primary-700">@freelancerhub</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CareersPage;
