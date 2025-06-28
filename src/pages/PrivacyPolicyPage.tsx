import React from 'react';
import Header from '../components/Header';

const PrivacyPolicyPage: React.FC = () => (
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
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#7CC379] to-[#7CC379]/80 bg-clip-text text-transparent text-center">Privacy Policy</h1>
          <p className="text-gray-400 text-center mb-6 text-sm">Last updated: June 2025</p>
          <section className="space-y-4 text-gray-200 text-base">
            <p>VICES ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and services.</p>
            <h2 className="text-xl font-semibold text-[#7CC379] mt-6">1. Information We Collect</h2>
            <ul className="list-disc list-inside ml-4">
              <li><b>Personal Information:</b> When you sign up, we collect your name, email address, and other information you provide.</li>
              <li><b>Usage Data:</b> We collect information about how you use the app, such as journal entries, goals, and interactions.</li>
              <li><b>Device Data:</b> We may collect information about your device and browser for security and analytics.</li>
            </ul>
            <h2 className="text-xl font-semibold text-[#7CC379] mt-6">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside ml-4">
              <li>To provide and improve our services</li>
              <li>To personalize your experience and deliver AI-powered insights</li>
              <li>To communicate with you about your account or updates</li>
            </ul>
            <h2 className="text-xl font-semibold text-[#7CC379] mt-6">3. How We Share Your Information</h2>
            <ul className="list-disc list-inside ml-4">
              <li>We do <b>not</b> sell your personal information.</li>
              <li>We may disclose information if required by law or to protect our rights.</li>
            </ul>
            <h2 className="text-xl font-semibold text-[#7CC379] mt-6">4. Data Security</h2>
            <p>We use industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure.</p>
            <h2 className="text-xl font-semibold text-[#7CC379] mt-6">5. Your Choices</h2>
            <ul className="list-disc list-inside ml-4">
              <li>You can update your profile and privacy settings at any time.</li>
              <li>You can request to export or delete your data by contacting us at <a href="mailto:myvicesapp@gmail.com" className="text-[#7CC379] underline">myvicesapp@gmail.com</a>.</li>
            </ul>
            <h2 className="text-xl font-semibold text-[#7CC379] mt-6">6. Children's Privacy</h2>
            <p>Our app is not intended for children under 18. We do not knowingly collect data from children.</p>
            <h2 className="text-xl font-semibold text-[#7CC379] mt-6">7. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes.</p>
            <h2 className="text-xl font-semibold text-[#7CC379] mt-6">8. Contact Us</h2>
            <p>If you have any questions, contact us at <a href="mailto:myvicesapp@gmail.com" className="text-[#7CC379] underline">myvicesapp@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  </div>
);

export default PrivacyPolicyPage; 