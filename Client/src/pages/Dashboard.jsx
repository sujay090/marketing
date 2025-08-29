import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { toast } from 'react-toastify';
import {
  UsersIcon,
  PhotoIcon,
  CalendarIcon,
  UserPlusIcon,
  CloudArrowUpIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ChartBarIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Calculate previous month's count for growth comparison
  const calculatePreviousMonthCount = (key, currentCount) => {
    // This is a placeholder - you should implement actual logic to get previous month's count
    // For now, we'll just return a random number for demonstration
    return Math.floor(currentCount * 0.75); // 75% of current count as an example
  }

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await dashboardAPI.getMetrics();
        setMetrics(response.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex flex-col items-center justify-center py-24">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-300/30 border-t-blue-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-indigo-400 rounded-full animate-spin animation-delay-150"></div>
        </div>
        <div className="mt-8 text-center">
          <h3 className="text-2xl font-semibold text-white mb-2">Loading Dashboard</h3>
          <p className="text-gray-300">Fetching your latest metrics and insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-slate-800/80 via-blue-900/50 to-slate-700/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-500/20 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white shadow-lg">
                <ChartBarIcon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                <p className="text-gray-300 mt-1">Monitor your poster campaign performance and analytics</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-xl px-4 py-2 border border-blue-400/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-300">Live Data</span>
            </div>
          </div>
        </div>
        {/* Metrics Grid */}
        {metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Object.entries(metrics).map(([key, value]) => {
              const currentValue = typeof value === 'object' ? (
                Array.isArray(value) ? value.length : Object.keys(value).length
              ) : value;
              
              const previousValue = calculatePreviousMonthCount(key, currentValue);
              const growthPercentage = previousValue > 0 ? ((currentValue - previousValue) / previousValue * 100).toFixed(1) : 0;
              const isPositiveGrowth = growthPercentage > 0;

              return (
                <div
                  key={key}
                  className="bg-gradient-to-br from-slate-800/60 via-blue-900/30 to-slate-700/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-500/20 p-6 hover:shadow-blue-500/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-3 text-white shadow-md">
                        {getIconForMetric(key)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h3>
                        <p className="text-sm text-gray-400">Total count</p>
                      </div>
                    </div>
                    
                    {/* Growth Badge */}
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      isPositiveGrowth 
                        ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                        : growthPercentage < 0 
                          ? 'bg-red-500/20 text-red-300 border border-red-400/30'
                          : 'bg-gray-500/20 text-gray-300 border border-gray-400/30'
                    }`}>
                      {isPositiveGrowth ? (
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : growthPercentage < 0 ? (
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span>{Math.abs(growthPercentage)}%</span>
                    </div>
                  </div>

                  {/* Main Value */}
                  <div className="mb-4">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        {currentValue}
                      </span>
                      <span className="text-lg text-gray-400">items</span>
                    </div>
                  </div>

                  {/* Comparison with Previous Month */}
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-blue-500/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Previous month</p>
                        <p className="text-2xl font-semibold text-gray-200">{previousValue}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Growth</p>
                        <p className={`text-lg font-semibold ${
                          isPositiveGrowth ? 'text-green-400' : growthPercentage < 0 ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {isPositiveGrowth ? '+' : ''}{growthPercentage}%
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="bg-slate-700/50 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isPositiveGrowth ? 'bg-gradient-to-r from-green-400 to-green-600' : 
                            growthPercentage < 0 ? 'bg-gradient-to-r from-red-400 to-red-600' : 
                            'bg-gray-400'
                          }`}
                          style={{ 
                            width: `${Math.min(Math.abs(growthPercentage), 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-slate-800/60 via-blue-900/30 to-slate-700/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-500/20 p-12 text-center">
            <div className="bg-slate-700/50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <InformationCircleIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Metrics Available</h3>
            <p className="text-gray-300 mb-6">There are currently no metrics to display. Start by adding customers and creating schedules.</p>
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg">
              Get Started
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function: return Heroicons components for each metric with appropriate colors
const getIconForMetric = (key) => {
  const iconMap = {
    totalUsers: <UsersIcon className="w-5 h-5" />,
    activePosters: <PhotoIcon className="w-5 h-5" />,
    schedules: <CalendarIcon className="w-5 h-5" />,
    customers: <UserPlusIcon className="w-5 h-5" />,
    uploads: <CloudArrowUpIcon className="w-5 h-5" />,
    views: <EyeIcon className="w-5 h-5" />,
    clicks: <CursorArrowRaysIcon className="w-5 h-5" />,
    impressions: <ChartBarIcon className="w-5 h-5" />,
  };

  // Make it case-insensitive
  const lowerKey = key.toLowerCase();
  return iconMap[lowerKey] || <InformationCircleIcon className="w-5 h-5" />;
};

export default Dashboard;
