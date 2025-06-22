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
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 backdrop-blur-xl bg-[#1B272C]/80 ${className}`}>
      <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <div 
        className="text-3xl font-black bg-gradient-to-r from-[#7CC379] to-[#5a9556] bg-clip-text text-transparent cursor-pointer"
        onClick={() => navigate('/')}
      >
        VICES
      </div>
      
      <div className="flex items-center space-x-4">
        {showUserInfo && user && (
        <span className="text-[#7CC379]">Welcome, {user.first_name || 'User'}!</span>
        )}
        
        {additionalButtons}
        
        {showProfileButton && (
        <button 
          className="bg-gradient-to-r from-[#7CC379] to-[#66A363] px-4 py-2 rounded-full text-white font-medium hover:shadow-lg hover:shadow-[#7CC379]/25 transition-all duration-300"
          onClick={() => navigate('/profile')}
        >
          Profile
        </button>
        )}
        
        {showLogoutButton && (
        <button 
          className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 rounded-full text-white font-medium hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300"
          onClick={handleLogout}
        >
          Sign Out
        </button>
        )}
      </div>
      </nav>
    </header>
  );
};

export default Header;