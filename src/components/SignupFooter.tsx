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


    </>
  );
};

export default SignupFooter;