import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        setProfile(response.data);
      } catch (error) {
        toast.error('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      toast.error('Logout failed');
    }
  };

  const displayProfile = profile || user;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 min-h-screen">
        <div className="bg-gradient-to-br from-slate-800/90 via-blue-900/50 to-slate-700/90 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8">
          <div
            className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent"
            role="status"
            aria-label="Loading"
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 py-10">
      <div className="bg-gradient-to-br from-slate-800/90 via-blue-900/50 to-slate-700/90 backdrop-blur-sm border border-blue-500/30 shadow-2xl rounded-lg overflow-hidden">
        <div className="p-6 flex flex-col items-center">
          <img
            src={`https://ui-avatars.com/api/?name=${displayProfile.name}&background=4ade80&color=fff`}
            alt="avatar"
            className="w-24 h-24 rounded-full shadow mb-4"
          />
          <h2 className="text-2xl font-semibold text-white">{displayProfile.name}</h2>
          <p className="text-gray-300">{displayProfile.email}</p>
          <span className="mt-2 inline-block px-3 py-1 text-sm bg-blue-600/20 text-blue-300 rounded-full border border-blue-400/30">
            {displayProfile.role || 'User'}
          </span>

          <button
            className="mt-6 px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded shadow-lg transition-all duration-200 transform hover:scale-105"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
