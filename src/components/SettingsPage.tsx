import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Sun, User, Key, History, Cpu, Paperclip, MessageSquare } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ApiKeysSettings } from './settings/ApiKeysSettings';

export function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleBackToChat = () => {
    navigate('/');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User, disabled: true },
    { id: 'customization', label: 'Customization', icon: Sun, disabled: true },
    { id: 'history-sync', label: 'History & Sync', icon: History, disabled: true },
    { id: 'models', label: 'Models', icon: Cpu, disabled: true },
    { id: 'api-keys', label: 'API Keys', icon: Key, disabled: false },
    { id: 'attachments', label: 'Attachments', icon: Paperclip, disabled: true },
    { id: 'contact', label: 'Contact Us', icon: MessageSquare, disabled: true }
  ];

  const activeTab = location.pathname.split('/').pop() || 'api-keys';

  const handleTabClick = (tabId: string, disabled: boolean) => {
    if (!disabled) {
      navigate(`/settings/${tabId}`);
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-gray-600">Please sign in to access settings.</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Container with max-width and centered */}
      <div className="w-full max-w-[1200px] mx-auto flex">
        {/* 🧱 1. Sidebar / Left Column - Increased width for better alignment */}
        <div className="w-96 bg-gray-50 flex flex-col">
          
          {/* 1.1. Profile Block - Top of sidebar, center-aligned */}
          <div className="p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-1">
              {user.email?.split('@')[0] || 'User'}
            </h2>
            <p className="text-sm text-gray-600 mb-3">{user.email}</p>
            <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full font-medium">
              Free Plan
            </span>
          </div>

          {/* 1.2. Message Usage Block - Below profile, left-aligned with more padding */}
          <div className="px-8 pb-4">
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Message Usage</h3>
              <p className="text-xs text-gray-500 mb-4">Resets tomorrow at 7:00 AM</p>
              
              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-700">Standard</span>
                  <span className="text-sm text-gray-500">0/20</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
              <p className="text-sm text-gray-600">20 messages remaining</p>
            </div>
          </div>

          {/* 1.3. Keyboard Shortcuts Block - Directly below Message Usage with more padding */}
          <div className="px-8">
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Keyboard Shortcuts</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Search</span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border border-gray-300 font-sans">Ctrl</kbd>
                    <kbd className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border border-gray-300 font-sans">K</kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New Chat</span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border border-gray-300 font-sans">Ctrl</kbd>
                    <kbd className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border border-gray-300 font-sans">Shift</kbd>
                    <kbd className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border border-gray-300 font-sans">O</kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Toggle Sidebar</span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border border-gray-300 font-sans">Ctrl</kbd>
                    <kbd className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border border-gray-300 font-sans">B</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🧱 2. Main Content / Right Column - Majority width */}
        <div className="flex-1 flex flex-col bg-white">
          
          {/* 2.1. Header Block - Horizontal bar at very top, full-width - NO BORDERS */}
          <div className="flex items-center justify-between p-4 bg-gray-50">
            <button
              onClick={handleBackToChat}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Chat</span>
            </button>
            
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Sun className="w-4 h-4" />
              <span className="text-sm font-medium">Sign out</span>
            </button>
          </div>

          {/* 2.2. Tab Navigation Bar - Horizontal centered layout below header - NO BORDERS */}
          <div className="px-8 py-4 bg-gray-50">
            <div className="flex justify-center">
              <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id, tab.disabled)}
                      disabled={tab.disabled}
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap
                        ${isActive 
                          ? 'bg-white text-gray-900 shadow-sm font-semibold' 
                          : tab.disabled
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                        }
                      `}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2.3. Main Panel (API Keys Block) - Centered container under tab bar */}
          <div className="flex-1 bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
              {/* Section Title */}
              <div className="mb-8 text-left">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">API Keys</h1>
                <p className="text-gray-600">Bring your own API keys for select models.</p>
              </div>

              {/* Tab Content */}
              <Routes>
                <Route path="/" element={<Navigate to="/settings/api-keys\" replace />} />
                <Route path="/api-keys" element={<ApiKeysSettings />} />
                {/* Add other routes here when implementing other tabs */}
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}