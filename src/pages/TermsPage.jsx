import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
              <p className="text-gray-600 mt-1">Last updated: January 2024</p>
            </div>
          </div>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing and using FreelancerHub's platform, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Permission is granted to temporarily access and use the materials on FreelancerHub's platform 
                for personal, non-commercial transitory viewing only. This is the grant of a license, not a 
                transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the platform</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you create an account with us, you must provide information that is accurate, complete, 
                and current at all times. Failure to do so constitutes a breach of the Terms, which may result 
                in immediate termination of your account on our Service.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                You are responsible for safeguarding the password that you use to access the Service and for 
                any activities or actions under your password. You agree not to disclose your password to any 
                third party and to take sole responsibility for any activities or actions under your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Service Terms for Freelancers</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                As a freelancer on our platform, you agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Provide accurate information about your skills, experience, and qualifications</li>
                <li>Deliver work as agreed upon in contracts with clients</li>
                <li>Maintain professional communication with clients</li>
                <li>Respond to project proposals and messages in a timely manner</li>
                <li>Complete projects within the agreed-upon timeframe</li>
                <li>Not engage in fraudulent activities or misrepresentation</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Service Terms for Clients</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                As a client on our platform, you agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Provide clear and accurate project descriptions</li>
                <li>Make timely payments for completed work</li>
                <li>Communicate professionally with freelancers</li>
                <li>Not request work that violates intellectual property rights</li>
                <li>Release milestone payments upon satisfactory completion</li>
                <li>Provide constructive feedback and reviews</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Payment Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All financial transactions are processed through our secure payment system. FreelancerHub 
                charges a service fee on all transactions as detailed in our fee schedule. Payments are held 
                in escrow until work is completed and approved by the client.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Clients must fund projects before work begins. Freelancers receive payment within 5-7 business 
                days after milestone approval. Dispute resolution may delay payment processing.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Dispute Resolution</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                In the event of a dispute between a client and freelancer, FreelancerHub will provide mediation 
                services. Both parties agree to participate in good faith dispute resolution. Our decision in 
                disputes is final and binding.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Unless otherwise stated in a contract, all intellectual property rights for work created through 
                our platform transfer to the client upon full payment. Freelancers retain the right to showcase 
                work in their portfolio unless specifically restricted by contract.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may terminate or suspend your account immediately, without prior notice or liability, for any 
                reason whatsoever, including without limitation if you breach the Terms. Upon termination, your 
                right to use the Service will immediately cease.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                In no event shall FreelancerHub, nor its directors, employees, partners, agents, suppliers, or 
                affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, 
                including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, 
                we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes 
                a material change will be determined at our sole discretion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">Email: legal@freelancerhub.com</p>
                <p className="text-gray-700">Phone: +1 (555) 123-4567</p>
                <p className="text-gray-700">Address: 123 Business St, San Francisco, CA 94102</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsPage;
