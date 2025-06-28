// components/Header.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu } from 'lucide-react';

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
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Responsive: show hamburger menu on mobile
  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 backdrop-blur-xl bg-[#1B272C]/80 ${className}`}>
      <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div 
          className="text-3xl font-black bg-gradient-to-r from-[#7CC379] to-[#5a9556] bg-clip-text text-transparent cursor-pointer"
          onClick={() => navigate('/')}
        >
          VICES
        </div>
        {/* Desktop nav */}
        <div className="hidden md:flex items-center space-x-4">
          {additionalButtons}
          {user && (
            <button 
              className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 rounded-full text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
              onClick={() => navigate('/vice-journey-tracker')}
            >
              Journey Tracker
            </button>
          )}
          {user && (
            <button 
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 rounded-full text-white font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
              onClick={() => navigate('/user-dashboard')}
            >
              Dashboard
            </button>
          )}
          {showProfileButton && user && (
            <button 
              className="bg-gradient-to-r from-[#7CC379] to-[#66A363] px-4 py-2 rounded-full text-white font-medium hover:shadow-lg hover:shadow-[#7CC379]/25 transition-all duration-300"
              onClick={() => navigate('/profile')}
            >
              Profile
            </button>
          )}
          {showLogoutButton && user && (
            <button 
              className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 rounded-full text-white font-medium hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          )}
        </div>
        {/* Mobile nav */}
        <div className="md:hidden flex items-center">
          <button
            className="p-2 rounded-full hover:bg-[#7CC379]/10 focus:outline-none"
            onClick={() => setMenuOpen(m => !m)}
            aria-label="Open menu"
          >
            <Menu className="w-7 h-7 text-white" />
          </button>
          {menuOpen && (
            <div className="absolute right-4 top-16 bg-[#1B272C] border border-[#7CC379]/20 rounded-xl shadow-lg py-2 w-48 z-50 flex flex-col space-y-1 animate-fade-in">
              {user && (
                <button
                  className="w-full text-left px-4 py-2 hover:bg-[#7CC379]/10 text-white"
                  onClick={() => { setMenuOpen(false); navigate('/vice-journey-tracker'); }}
                >
                  Journey Tracker
                </button>
              )}
              {user && (
                <button
                  className="w-full text-left px-4 py-2 hover:bg-[#7CC379]/10 text-white"
                  onClick={() => { setMenuOpen(false); navigate('/user-dashboard'); }}
                >
                  Dashboard
                </button>
              )}
              {showProfileButton && user && (
                <button
                  className="w-full text-left px-4 py-2 hover:bg-[#7CC379]/10 text-white"
                  onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                >
                  Profile
                </button>
              )}
              {showLogoutButton && user && (
                <button
                  className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-red-400"
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                >
                  Sign Out
                </button>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;