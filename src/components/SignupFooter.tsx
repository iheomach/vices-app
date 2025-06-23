// components/SignupFooter.tsx
import React from 'react';

const SignupFooter: React.FC = () => {
  return (
    <>
      {/* Footer */}
      <div className="text-center mt-6">
        <p className="text-gray-400 text-sm">
          Already have an account?{' '}
          <a
            href="/login"
            className="text-green-400 hover:text-green-300 underline font-medium"
            onClick={e => {
              e.preventDefault();
              window.location.href = '/login';
            }}
          >
            Sign in here
          </a>
        </p>
      </div>

      {/* Benefits Preview */}
      <div className="mt-8 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-green-600/20 backdrop-blur-lg rounded-xl p-6 border border-purple-400/30">
        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent mb-4 text-center">
          What You Get
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-400 mb-1">50+</div>
            <div className="text-xs text-gray-400">Local Vendors</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400 mb-1">24/7</div>
            <div className="text-xs text-gray-400">Live Updates</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupFooter;