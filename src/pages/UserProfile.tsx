import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { User, Mail, Lock, Bell, Shield, Download, Trash2, Edit3, Save, X } from 'lucide-react';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  location: string;
  bio: string;
  wellnessGoals: string[];
  substances: string[];
  notifications: {
    dailyReminders: boolean;
    weeklyReports: boolean;
    communityUpdates: boolean;
    safetyAlerts: boolean;
  };
  privacy: {
    profileVisible: boolean;
    shareProgress: boolean;
    anonymousMode: boolean;
  };
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profile, setProfile] = useState<UserProfile>({
    firstName: user?.first_name || 'Alex',
    lastName: user?.last_name || 'Johnson',
    email: user?.email || 'alex@example.com',
    dateOfBirth: '1990-05-15',
    location: 'Calgary, AB',
    bio: 'Wellness enthusiast focused on mindful consumption and optimizing my relationship with cannabis for better sleep and creativity.',
    wellnessGoals: ['Better Sleep', 'Stress Management', 'Creative Enhancement'],
    substances: ['Cannabis', 'Alcohol'],
    notifications: {
      dailyReminders: true,
      weeklyReports: true,
      communityUpdates: false,
      safetyAlerts: true
    },
    privacy: {
      profileVisible: false,
      shareProgress: true,
      anonymousMode: true
    }
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  const wellnessGoalOptions = [
    'Better Sleep', 'Stress Management', 'Creative Enhancement', 'Social Confidence',
    'Pain Relief', 'Anxiety Reduction', 'Focus Improvement', 'Tolerance Break'
  ];

  const substanceOptions = ['Cannabis', 'Alcohol', 'Both', 'Wellness', 'None'];

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    // Here you would typically save to your backend
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const toggleWellnessGoal = (goal: string) => {
    setEditedProfile(prev => ({
      ...prev,
      wellnessGoals: prev.wellnessGoals.includes(goal)
        ? prev.wellnessGoals.filter(g => g !== goal)
        : [...prev.wellnessGoals, goal]
    }));
  };

  const toggleSubstance = (substance: string) => {
    setEditedProfile(prev => ({
      ...prev,
      substances: prev.substances.includes(substance)
        ? prev.substances.filter(s => s !== substance)
        : [...prev.substances, substance]
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'account', label: 'Account', icon: Lock }
  ];

  return (
    <div className="min-h-screen bg-[#1B272C] text-white flex flex-col">
      <Header />

      <main className="flex-1 pt-20">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#7CC379] to-[#7CC379]/80 bg-clip-text text-transparent">
              Profile Settings
            </h1>
            <p className="text-gray-300">Manage your wellness journey and preferences</p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-2 mb-8 border border-[#7CC379]/20">
            <div className="flex space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#7CC379]/20 text-[#7CC379] border border-[#7CC379]/30'
                      : 'text-gray-300 hover:text-[#7CC379] hover:bg-[#7CC379]/10'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-[#7CC379]/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-[#7CC379]">Personal Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-[#7CC379]/20 text-[#7CC379] px-4 py-2 rounded-lg hover:bg-[#7CC379]/30 transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 bg-gradient-to-r from-[#7CC379] to-[#5a9556] px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-700 transition-all"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.firstName}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full bg-black/30 border border-[#7CC379]/20 rounded-lg px-4 py-3 text-white focus:border-[#7CC379] focus:outline-none"
                      />
                    ) : (
                      <div className="bg-black/30 border border-[#7CC379]/20 rounded-lg px-4 py-3 text-gray-200">
                        {profile.firstName}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.lastName}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full bg-black/30 border border-[#7CC379]/20 rounded-lg px-4 py-3 text-white focus:border-[#7CC379] focus:outline-none"
                      />
                    ) : (
                      <div className="bg-black/30 border border-[#7CC379]/20 rounded-lg px-4 py-3 text-gray-200">
                        {profile.lastName}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <div className="bg-black/30 border border-[#7CC379]/20 rounded-lg px-4 py-3 text-gray-400">
                      {profile.email}
                      <span className="text-xs ml-2">(Contact support to change)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.location}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full bg-black/30 border border-[#7CC379]/20 rounded-lg px-4 py-3 text-white focus:border-[#7CC379] focus:outline-none"
                      />
                    ) : (
                      <div className="bg-black/30 border border-[#7CC379]/20 rounded-lg px-4 py-3 text-gray-200">
                        {profile.location}
                      </div>
                    )}
                  </div>
                </div>

                {/* Wellness Preferences */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                    {isEditing ? (
                      <textarea
                        value={editedProfile.bio}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                        rows={4}
                        className="w-full bg-black/30 border border-[#7CC379]/20 rounded-lg px-4 py-3 text-white focus:border-[#7CC379] focus:outline-none resize-none"
                      />
                    ) : (
                      <div className="bg-black/30 border border-[#7CC379]/20 rounded-lg px-4 py-3 text-gray-200 min-h-[100px]">
                        {profile.bio}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Wellness Goals</label>
                    <div className="space-y-2">
                      {wellnessGoalOptions.map((goal) => (
                        <label key={goal} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={isEditing ? editedProfile.wellnessGoals.includes(goal) : profile.wellnessGoals.includes(goal)}
                            onChange={() => isEditing && toggleWellnessGoal(goal)}
                            disabled={!isEditing}
                            className="w-4 h-4 text-[#7CC379] bg-black/30 border-[#7CC379]/20 rounded focus:ring-[#7CC379]"
                          />
                          <span className="text-gray-200">{goal}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Substances</label>
                    <div className="space-y-2">
                      {substanceOptions.map((substance) => (
                        <label key={substance} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={isEditing ? editedProfile.substances.includes(substance) : profile.substances.includes(substance)}
                            onChange={() => isEditing && toggleSubstance(substance)}
                            disabled={!isEditing}
                            className="w-4 h-4 text-[#7CC379] bg-black/30 border-[#7CC379]/20 rounded focus:ring-[#7CC379]"
                          />
                          <span className="text-gray-200">{substance}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-[#7CC379]/20">
              <h2 className="text-2xl font-semibold text-[#7CC379] mb-6">Notification Preferences</h2>
              
              <div className="space-y-6">
                {Object.entries(profile.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                    <div>
                      <h3 className="font-medium text-white capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <p className="text-sm text-gray-300">
                        {key === 'dailyReminders' && 'Get reminded to log your daily entries'}
                        {key === 'weeklyReports' && 'Receive weekly wellness analytics reports'}
                        {key === 'communityUpdates' && 'Stay updated on community challenges and events'}
                        {key === 'safetyAlerts' && 'Important safety and health alerts'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, [key]: e.target.checked }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7CC379]"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-[#7CC379]/20">
              <h2 className="text-2xl font-semibold text-[#7CC379] mb-6">Privacy Settings</h2>
              
              <div className="space-y-6">
                {Object.entries(profile.privacy).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                    <div>
                      <h3 className="font-medium text-white capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <p className="text-sm text-gray-300">
                        {key === 'profileVisible' && 'Allow other users to see your profile'}
                        {key === 'shareProgress' && 'Share your progress in community challenges'}
                        {key === 'anonymousMode' && 'Use anonymous mode for community interactions'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, [key]: e.target.checked }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7CC379]"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Data Export */}
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-[#7CC379]/20">
                <h2 className="text-2xl font-semibold text-[#7CC379] mb-6">Data Management</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                    <div>
                      <h3 className="font-medium text-white">Export Your Data</h3>
                      <p className="text-sm text-gray-300">Download all your wellness data and insights</p>
                    </div>
                    <button className="flex items-center space-x-2 bg-[#7CC379]/20 text-[#7CC379] px-4 py-2 rounded-lg hover:bg-[#7CC379]/30 transition-all">
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-500/10 backdrop-blur-sm rounded-2xl p-8 border border-red-500/20">
                <h2 className="text-2xl font-semibold text-red-400 mb-6">Danger Zone</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div>
                      <h3 className="font-medium text-white">Delete Account</h3>
                      <p className="text-sm text-gray-300">Permanently delete your account and all data</p>
                    </div>
                    <button className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all">
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;