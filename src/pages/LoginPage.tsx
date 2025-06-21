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
    console.log('Login component state:', { email, password, rememberMe, isLoading, errors });
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
      console.log('Attempting login with:', { email, password, rememberMe });
      await login(email, password, rememberMe);
      console.log('Login successful, navigating to dashboard');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
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
            Welcome Back
          </h1>
          <p className="text-gray-400">
            Sign in to discover personalized deals
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
                  className="text-sm text-green-400 hover:text-green-300 font-medium transition-colors"
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

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-gray-400">or continue with</span>
              </div>
            </div>

            {/* Social Login Options */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center px-4 py-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-2 text-sm font-medium text-gray-300">Google</span>
              </button>
              <button className="flex items-center justify-center px-4 py-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all">
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="ml-2 text-sm font-medium text-gray-300">Facebook</span>
              </button>
            </div>
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

        {/* Age Verification Notice */}
        <div className="mt-8 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-green-600/20 backdrop-blur-lg rounded-xl p-6 border border-purple-400/30">
          <div className="text-center">
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent mb-2">
              21+ Only
            </h3>
            <p className="text-gray-400 text-sm">
              You must be 21 or older to access cannabis and alcohol deals
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;