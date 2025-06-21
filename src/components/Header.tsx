// components/Header.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  showUserInfo?: boolean;
  showProfileButton?: boolean;
  showLogoutButton?: boolean;
  additionalButtons?: React.ReactNode;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  showUserInfo = true,
  showProfileButton = true,
  showLogoutButton = true,
  additionalButtons,
  className = ""
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={`bg-slate-900/95 backdrop-blur-md border-b border-green-500/20 sticky top-0 z-50 ${className}`}>
      <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <div 
          className="text-2xl font-bold text-green-500 flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          VICES
        </div>
        
        <div className="flex items-center gap-4">
          {showUserInfo && user && (
            <span className="text-white">Welcome, {user.first_name || 'User'}!</span>
          )}
          
          {additionalButtons}
          
          {showProfileButton && (
            <button 
              className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 rounded-full text-white font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
              onClick={() => navigate('/profile')}
            >
              Profile
            </button>
          )}
          
          {showLogoutButton && (
            <button 
              className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 rounded-full text-white font-medium hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;