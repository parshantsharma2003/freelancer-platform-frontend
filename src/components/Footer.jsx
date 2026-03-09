import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-xl font-bold mb-4">FreelancePro</h3>
            <p className="text-sm mb-4">
              The world's work marketplace. Find great talent or find great work.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary-400 transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-primary-400 transition">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-primary-400 transition">
                <Linkedin size={20} />
              </a>
              <a href="#" className="hover:text-primary-400 transition">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* For Clients */}
          <div>
            <h4 className="text-white font-semibold mb-4">For Clients</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/freelancers" className="hover:text-primary-400">Find Freelancers</Link></li>
              <li><Link to="/post-job" className="hover:text-primary-400">Post a Job</Link></li>
              <li><Link to="#" className="hover:text-primary-400">How to Hire</Link></li>
              <li><Link to="#" className="hover:text-primary-400">Enterprise</Link></li>
            </ul>
          </div>

          {/* For Freelancers */}
          <div>
            <h4 className="text-white font-semibold mb-4">For Freelancers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/browse-jobs" className="hover:text-primary-400">Find Work</Link></li>
              <li><Link to="/register" className="hover:text-primary-400">Create Profile</Link></li>
              <li><Link to="#" className="hover:text-primary-400">How to Work</Link></li>
              <li><Link to="#" className="hover:text-primary-400">Success Stories</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-primary-400">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-primary-400">Careers</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-400">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary-400">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} FreelancePro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
