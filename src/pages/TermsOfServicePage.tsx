import React from 'react';
import Header from '../components/Header';

const TermsOfServicePage: React.FC = () => (
  <div className="min-h-screen bg-[#1B272C] text-white relative">
    {/* Background Effects */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7CC379]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
    </div>
    
    <Header />
    
    <div className="relative pt-24 pb-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#7CC379] to-[#7CC379]/80 bg-clip-text text-transparent text-center">Terms of Service</h1>
          <p className="text-gray-400 text-center mb-6 text-sm">Last updated: June 2025</p>
          <section className="space-y-4 text-gray-200 text-base">
            <p>Welcome to VICES! By using our website and services, you agree to these Terms of Service ("Terms"). Please read them carefully.</p>
            <h2 className="text-xl font-semibold text-[#7CC379] mt-6">1. Use of Service</h2>
            <ul className="list-disc list-inside ml-4">
              <li>You must be at least 18 years old to use VICES.</li>
              <li>You agree to provide accurate information and keep your account secure.</li>
              <li>You are responsible for your activity on the app.</li>
            </ul>
            <h2 className="text-xl font-semibold text-[#7CC379] mt-6">2. User Content</h2>
            <ul className="list-disc list-inside ml-4">
              <li>You own your journal entries, goals, and other content you create.</li>
              <li>By using VICES, you grant us a license to use your content to provide and improve our services (e.g., AI insights).</li>
              <li>You must not post illegal, harmful, or offensive content.</li>
            </ul>
            <h2 className="text-xl font-semibold text-[#7CC379] mt-6">3. Prohibited Conduct</h2>
            <ul className="list-disc list-inside ml-4">
              <li>Use the app for unlawful purposes</li>
              <li>Attempt to hack, disrupt, or misuse the service</li>
              <li>Violate the privacy or rights of others</li>
            </ul>
            <h2 className="text-xl font-semibold text-[#7CC379] mt-6">4. Account Termination</h2>
            <p>We may suspend or terminate your account if you violate these Terms or misuse the service.</p>
            <h2 className="text-xl font-semibold text-[#7CC379] mt-6">5. Disclaimer</h2>
            <p>VICES is for informational and wellness purposes only. It is <b>not</b> a substitute for professional medical advice. Always consult a healthcare provider for medical concerns.</p>
            <h2 className="text-xl font-semibold text-[#7CC379] mt-6">6. Limitation of Liability</h2>
            <p>We are not liable for any damages resulting from your use of the app. Use VICES at your own risk.</p>
            <h2 className="text-xl font-semibold text-[#7CC379] mt-6">7. Changes to Terms</h2>
            <p>We may update these Terms from time to time. Continued use of the app means you accept the new Terms.</p>
            <h2 className="text-xl font-semibold text-[#7CC379] mt-6">8. Contact</h2>
            <p>Questions? Contact us at <a href="mailto:myvicesapp@gmail.com" className="text-[#7CC379] underline">myvicesapp@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  </div>
);

export default TermsOfServicePage; 