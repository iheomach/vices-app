import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ submit?: string }>({});
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();

  useEffect(() => {
    // For debugging purposes
    // console.log('Login component state:', { email, password, rememberMe, isLoading, errors });
  }, [email, password, rememberMe, isLoading, errors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setErrors({ submit: "Please enter both email and password" });
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // console.log('Attempting login with:', { email, password, rememberMe });
      await login(email, password, rememberMe);
      // console.log('Login successful, navigating to dashboard');
      navigate('/user-dashboard');
    } catch (error) {
      console.error('Login error caught in component:', error);
      setErrors({ 
        submit: "Login failed. Please check your credentials and try again." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1B272C] flex items-center justify-center p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="text-4xl font-bold bg-gradient-to-r from-[#7CC379] to-[#7CC379]/80 bg-clip-text text-transparent mb-2 cursor-pointer"
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
            Welcome Back
          </h1>
          <p className="text-gray-400">
            Sign in to master mindful consumption
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">Sign In</h2>
              <p className="text-gray-400 text-sm">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-3 group relative">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mt-1 w-4 h-4 text-green-500 bg-white/10 border-white/20 rounded focus:ring-green-500/50 cursor-pointer"
                  />
                  <label 
                    htmlFor="remember-me" 
                    className="text-sm text-gray-300 hover:text-green-300 cursor-pointer flex items-center"
                  >
                    Remember me
                    <span className="ml-1 text-green-500">*</span>
                  </label>
                  <div className="absolute left-0 -bottom-20 w-64 bg-gray-800/90 p-3 rounded-lg border border-green-500/30 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <p className="text-xs text-gray-300">
                      Stay logged in on this device even after closing the browser. 
                      Uncheck if using a public computer.
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  className="text-sm text-[#7CC379] hover:text-[#7CC379]/80 font-medium transition-colors"
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot password?
                </button>
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{errors.submit}</p>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Don't have an account?{' '}
            <a 
              href="/usersignup" 
              onClick={(e) => {
                e.preventDefault();
                navigate('/usersignup');
              }}
              className="text-green-400 hover:text-green-300 underline font-medium">
              Sign up for free
            </a>
          </p>
        </div>


      </div>
    </div>
  );
};

export default LoginPage;