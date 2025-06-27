import React from 'react';
import headshot from '../images/headshot.jpg';
import Header from '../components/Header';
const AboutUsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#1B272C] flex items-center justify-center p-6 text-white relative">
      {/* Background Effects (match signup/contact page) */}
      <Header />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7CC379]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
      <div className="relative w-full max-w-lg mx-auto">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 flex flex-col items-center">
          {/* Headshot placeholder */}
          <div className="w-32 h-32 rounded-full border-4 border-[#7CC379] bg-white/10 flex items-center justify-center mb-6 overflow-hidden">
            <img src={headshot} alt="Richard Omorotionmwan" className="w-full h-full object-cover rounded-full object-[center_20%] scale-110" />
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#7CC379] to-[#7CC379]/80 bg-clip-text text-transparent text-center">About Us</h1>
          <p className="text-white font-semibold mb-2 text-center">Richard Omorotionmwan</p>
          <p className="text-gray-300 mb-4 max-w-lg mx-auto text-center">
            <span className="block mb-2 italic">“My vision for VICES is to empower people to build healthier, more mindful relationships with substances through data-driven insights, AI, and beautiful, accessible technology.”</span>
            Richard is a software engineer with expertise in AI, cloud, and full-stack development. He has built data and AI solutions at AIMCo, Suncor, and Enbridge, and is dedicated to using technology to make wellness accessible to all.
          </p>
          <div className="flex flex-col items-center gap-1 text-sm text-gray-400 mb-2">
            <span>San Francisco, California, USA</span>
            <span>iheoma.richard@gmail.com</span>
            <a href="https://linkedin.com/in/richardomor" className="text-[#7CC379] hover:underline" target="_blank" rel="noopener noreferrer">linkedin.com/in/richardomor</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage; 