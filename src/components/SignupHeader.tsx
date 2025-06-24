// components/SignupHeader.tsx
import React from 'react';
import { Check } from 'lucide-react';

interface SignupHeaderProps {
  currentStep: number;
}

const SignupHeader: React.FC<SignupHeaderProps> = ({ currentStep }) => {
  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <div
          className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent mb-2 cursor-pointer"
          onClick={() => window.location.href = "/"}
          tabIndex={0}
          role="button"
          aria-label="Go to homepage"
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") {
              window.location.href = "/";
            }
          }}
        >
          VICES
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Join the Community
        </h1>
        <p className="text-gray-400">
          Discover smarter consumption
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            currentStep >= 1 ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'
          }`}>
            {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
          </div>
          <div className={`w-16 h-1 rounded ${
            currentStep >= 2 ? 'bg-green-500' : 'bg-gray-700'
          }`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            currentStep >= 2 ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'
          }`}>
            2
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupHeader;