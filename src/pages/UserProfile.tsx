import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { User, Mail, Lock, Bell, Shield, Download, Trash2, Edit3, Save, X, Settings } from 'lucide-react';
import { GoalsApi } from '../services/api/goalsApi';
import { TrackingApi } from '../services/api/trackingApi';
import { requestPasswordChange, confirmPasswordChange } from '../services/api/apiUtils';

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

const goalsApi = new GoalsApi();
const trackingApi = new TrackingApi();

const ProfilePage: React.FC = () => {
  const { user, updateUser, token } = useAuth();
  
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

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [passwordStep, setPasswordStep] = useState<'idle' | 'codeSent' | 'success'>('idle');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Fetch latest profile from backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProfile((prev) => ({
          ...prev,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          // ...add other fields as needed
        }));
      }
    };
    fetchProfile();
  }, [token]);

  const handleSave = async () => {
    try {
      // Update backend with new name
      await updateUser({ first_name: editedProfile.firstName, last_name: editedProfile.lastName });
      setProfile(editedProfile);
      setIsEditing(false);
    } catch (err) {
      alert('Failed to update name. Please try again.');
    }
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

  const handleExportData = async () => {
    try {
      // Only fetch goals and journal entries
      const [journalRes, goalsRes]: [any, any] = await Promise.all([
        trackingApi.getJournalEntries(),
        goalsApi.getGoals()
      ]);
      // Format the data
      const exportData = {
        journalEntries: Array.isArray(journalRes) ? journalRes : journalRes?.results ?? [],
        goals: Array.isArray(goalsRes) ? goalsRes : goalsRes?.results ?? [],
      };
      // Create a blob and trigger download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vices_export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleSendCode = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);
    setPasswordLoading(true);
    if (!token) {
      setPasswordError('You must be logged in to change your password.');
      setPasswordLoading(false);
      return;
    }
    try {
      await requestPasswordChange(token);
      setPasswordStep('codeSent');
      setPasswordSuccess('Verification code sent to your email.');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to send code.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleConfirmChange = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    if (!code || !newPassword) {
      setPasswordError('Please enter the code and new password.');
      return;
    }
    if (!token) {
      setPasswordError('You must be logged in to change your password.');
      return;
    }
    setPasswordLoading(true);
    try {
      await confirmPasswordChange(token, code, newPassword);
      setPasswordStep('success');
      setPasswordSuccess('Password changed successfully.');
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordStep('idle');
        setNewPassword('');
        setConfirmPassword('');
        setCode('');
        setPasswordSuccess(null);
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    // { id: 'notifications', label: 'Notifications', icon: Bell },
    // { id: 'privacy', label: 'Privacy', icon: Shield },
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
            <div className="flex justify-center">
              <div className="inline-flex space-x-2 overflow-x-auto">
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
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-[#7CC379]/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-[#7CC379]">Personal Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-[#7CC379]/20 text-[#7CC379] px-4 py-2 rounded-lg hover:bg-[#7CC379]/30 transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
              {/* Save/Cancel buttons inside the box, right-aligned */}
              {isEditing && (
                <div className="flex justify-end space-x-2 mb-6">
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
                </div>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Account Type Display */}
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-[#7CC379]/20">
                <h2 className="text-2xl font-semibold text-[#7CC379] mb-6">Account Information</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                    <div>
                      <h3 className="font-medium text-white">Account Type</h3>
                      <p className="text-sm text-gray-300">Your current subscription plan</p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg font-medium ${
                      user?.account_tier === 'premium' 
                        ? 'bg-gradient-to-r from-[#7CC379] to-[#5a9556] text-white' 
                        : 'bg-gray-600 text-gray-200'
                    }`}>
                      {user?.account_tier === 'premium' ? 'Premium' : 'Free'}
                    </div>
                  </div>

                  {user?.account_tier === 'premium' && (
                    <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                      <div>
                        <h3 className="font-medium text-white">Manage Subscription</h3>
                        <p className="text-sm text-gray-300">View billing, cancel, or update your subscription</p>
                      </div>
                      <a
                        href="/subscription-management"
                        className="flex items-center space-x-2 bg-[#7CC379]/20 text-[#7CC379] px-4 py-2 rounded-lg hover:bg-[#7CC379]/30 transition-all"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Manage</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Data Export */}
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-[#7CC379]/20">
                <h2 className="text-2xl font-semibold text-[#7CC379] mb-6">Data Management</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                    <div>
                      <h3 className="font-medium text-white">Export Your Data</h3>
                      <p className="text-sm text-gray-300">Download all your wellness data and insights</p>
                    </div>
                    <button
                      onClick={handleExportData}
                      className="flex items-center space-x-2 bg-[#7CC379]/20 text-[#7CC379] px-4 py-2 rounded-lg hover:bg-[#7CC379]/30 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-[#7CC379]/20">
                <h2 className="text-2xl font-semibold text-[#7CC379] mb-6">Change Password</h2>
                {!showPasswordForm ? (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="flex items-center space-x-2 bg-[#7CC379]/20 text-[#7CC379] px-4 py-2 rounded-lg hover:bg-[#7CC379]/30 transition-all"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Change Password</span>
                  </button>
                ) : (
                  <div className="space-y-4 max-w-md">
                    {passwordStep === 'success' ? (
                      <div className="text-green-400 font-semibold">{passwordSuccess}</div>
                    ) : (
                      <>
                        {passwordStep === 'idle' && (
                          <button
                            onClick={handleSendCode}
                            className="bg-[#7CC379] text-white px-4 py-2 rounded-lg hover:bg-[#5a9556] transition-all"
                            disabled={passwordLoading}
                          >
                            {passwordLoading ? 'Sending...' : 'Send Verification Code'}
                          </button>
                        )}
                        {passwordStep === 'codeSent' && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Verification Code</label>
                              <input
                                type="text"
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                className="w-full bg-black/30 border border-[#7CC379]/20 rounded-lg px-4 py-3 text-white focus:border-[#7CC379] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                              <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="w-full bg-black/30 border border-[#7CC379]/20 rounded-lg px-4 py-3 text-white focus:border-[#7CC379] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                              <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full bg-black/30 border border-[#7CC379]/20 rounded-lg px-4 py-3 text-white focus:border-[#7CC379] focus:outline-none"
                              />
                            </div>
                            <button
                              onClick={handleConfirmChange}
                              className="bg-[#7CC379] text-white px-4 py-2 rounded-lg hover:bg-[#5a9556] transition-all mt-2"
                              disabled={passwordLoading}
                            >
                              {passwordLoading ? 'Changing...' : 'Confirm Change'}
                            </button>
                          </>
                        )}
                        {passwordError && <div className="text-red-400 font-semibold mt-2">{passwordError}</div>}
                        {passwordSuccess && <div className="text-green-400 font-semibold mt-2">{passwordSuccess}</div>}
                        <button
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordStep('idle');
                            setNewPassword('');
                            setConfirmPassword('');
                            setCode('');
                            setPasswordError(null);
                            setPasswordSuccess(null);
                          }}
                          className="text-gray-400 hover:text-white text-sm mt-4"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                )}
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