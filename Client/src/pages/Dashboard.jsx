import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';
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
    const { getCurrentTheme } = useTheme();
    const currentTheme = getCurrentTheme();

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
            <div
                className="min-vh-100 d-flex flex-column align-items-center justify-content-center py-5"
                style={{ background: currentTheme.background }}
            >
                <div className="position-relative mb-4">
                    <div
                        className="spinner-border"
                        role="status"
                        style={{
                            width: '5rem',
                            height: '5rem',
                            borderColor: `${currentTheme.primary}30`,
                            borderTopColor: currentTheme.primary
                        }}
                    >
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <div
                        className="spinner-border position-absolute top-0 start-0"
                        role="status"
                        style={{
                            width: '5rem',
                            height: '5rem',
                            borderColor: 'transparent',
                            borderRightColor: currentTheme.accent,
                            animationDelay: '0.15s'
                        }}
                    >
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
                <div className="text-center">
                    <h3 className="fs-3 fw-semibold mb-3" style={{ color: currentTheme.text }}>
                        Loading Dashboard
                    </h3>
                    <p style={{ color: currentTheme.textSecondary }}>
                        Fetching your latest metrics and insights...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            {/* Header Section */}
            <div
                className="rounded-4 shadow-lg p-4 mb-4"
                style={{
                    background: currentTheme.surface,
                    border: `1px solid ${currentTheme.border}`,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)'
                }}
            >
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                        <div
                            className="rounded-3 p-3 shadow-sm"
                            style={{ background: currentTheme.primary }}
                        >
                            <ChartBarIcon className="h-8 w-8" style={{ color: '#ffffff' }} />
                        </div>
                        <div>
                            <h1 className="fs-2 fw-bold mb-1" style={{ color: currentTheme.text }}>
                                Dashboard Overview
                            </h1>
                            <p className="mb-0" style={{ color: currentTheme.textSecondary }}>
                                Monitor your poster campaign performance and analytics
                            </p>
                        </div>
                    </div>
                    <div
                        className="d-none d-md-flex align-items-center gap-2 px-3 py-2 rounded-3"
                        style={{
                            background: `${currentTheme.primary}20`,
                            border: `1px solid ${currentTheme.primary}40`
                        }}
                    >
                        <div
                            className="rounded-circle animate-pulse"
                            style={{
                                width: '8px',
                                height: '8px',
                                background: currentTheme.success
                            }}
                        ></div>
                        <span className="small fw-medium" style={{ color: currentTheme.text }}>
                            Live Data
                        </span>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            {metrics ? (
                <div className="row g-4">
                    {Object.entries(metrics).map(([key, value]) => {
                        const currentValue = typeof value === 'object' ? (
                            Array.isArray(value) ? value.length : Object.keys(value).length
                        ) : value;

                        const previousValue = calculatePreviousMonthCount(key, currentValue);
                        const growthPercentage = previousValue > 0 ? ((currentValue - previousValue) / previousValue * 100).toFixed(1) : 0;
                        const isPositiveGrowth = growthPercentage > 0;

                        return (
                            <div key={key} className="col-12 col-md-6 col-xl-4">
                                <div
                                    className="rounded-4 shadow-lg p-4 h-100 transition-all"
                                    style={{
                                        background: currentTheme.surface,
                                        border: `1px solid ${currentTheme.border}`,
                                        backdropFilter: 'blur(16px)',
                                        WebkitBackdropFilter: 'blur(16px)',
                                        transform: 'translateY(0)',
                                        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-4px)';
                                        e.target.style.boxShadow = currentTheme.shadow;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {/* Card Header */}
                                    <div className="d-flex align-items-center justify-content-between mb-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div
                                                className="rounded-3 p-3 shadow-sm"
                                                style={{ background: currentTheme.primary }}
                                            >
                                                <div style={{ color: '#ffffff' }}>
                                                    {getIconForMetric(key)}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="fs-6 fw-semibold mb-1 text-capitalize" style={{ color: currentTheme.text }}>
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </h3>
                                                <p className="small mb-0" style={{ color: currentTheme.textSecondary }}>
                                                    Total count
                                                </p>
                                            </div>
                                        </div>

                                        {/* Growth Badge */}
                                        <div
                                            className="d-flex align-items-center gap-1 px-2 py-1 rounded-pill"
                                            style={{
                                                background: isPositiveGrowth
                                                    ? `${currentTheme.success}20`
                                                    : growthPercentage < 0
                                                        ? `${currentTheme.danger}20`
                                                        : `${currentTheme.textSecondary}20`,
                                                color: isPositiveGrowth
                                                    ? currentTheme.success
                                                    : growthPercentage < 0
                                                        ? currentTheme.danger
                                                        : currentTheme.textSecondary,
                                                border: `1px solid ${isPositiveGrowth
                                                    ? currentTheme.success + '40'
                                                    : growthPercentage < 0
                                                        ? currentTheme.danger + '40'
                                                        : currentTheme.textSecondary + '40'}`
                                            }}
                                        >
                                            <i className={`fas fa-arrow-${isPositiveGrowth ? 'up' : growthPercentage < 0 ? 'down' : 'right'}`} style={{ fontSize: '0.75rem' }}></i>
                                            <span className="small fw-semibold">{Math.abs(growthPercentage)}%</span>
                                        </div>
                                    </div>

                                    {/* Main Value */}
                                    <div className="mb-4">
                                        <div className="d-flex align-items-baseline gap-2">
                                            <span className="display-4 fw-bold" style={{ color: currentTheme.primary }}>
                                                {currentValue}
                                            </span>
                                            <span className="fs-6" style={{ color: currentTheme.textSecondary }}>
                                                items
                                            </span>
                                        </div>
                                    </div>

                                    {/* Comparison with Previous Month */}
                                    <div
                                        className="rounded-3 p-3"
                                        style={{
                                            background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                            border: `1px solid ${currentTheme.border}`
                                        }}
                                    >
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div>
                                                <p className="small mb-1" style={{ color: currentTheme.textSecondary }}>
                                                    Previous month
                                                </p>
                                                <p className="fs-5 fw-semibold mb-0" style={{ color: currentTheme.text }}>
                                                    {previousValue}
                                                </p>
                                            </div>
                                            <div className="text-end">
                                                <p className="small mb-1" style={{ color: currentTheme.textSecondary }}>
                                                    Growth
                                                </p>
                                                <p
                                                    className="fs-6 fw-semibold mb-0"
                                                    style={{
                                                        color: isPositiveGrowth
                                                            ? currentTheme.success
                                                            : growthPercentage < 0
                                                                ? currentTheme.danger
                                                                : currentTheme.textSecondary
                                                    }}
                                                >
                                                    {isPositiveGrowth ? '+' : ''}{growthPercentage}%
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mt-3">
                                            <div
                                                className="rounded-pill overflow-hidden"
                                                style={{
                                                    height: '4px',
                                                    background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                                }}
                                            >
                                                <div
                                                    className="h-100 rounded-pill transition-all"
                                                    style={{
                                                        width: `${Math.min(Math.abs(growthPercentage), 100)}%`,
                                                        background: isPositiveGrowth
                                                            ? currentTheme.success
                                                            : growthPercentage < 0
                                                                ? currentTheme.danger
                                                                : currentTheme.textSecondary,
                                                        transition: 'width 0.5s ease'
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div
                    className="rounded-4 shadow-lg p-5 text-center"
                    style={{
                        background: currentTheme.surface,
                        border: `1px solid ${currentTheme.border}`,
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)'
                    }}
                >
                    <div
                        className="rounded-circle p-4 mx-auto mb-4 d-flex align-items-center justify-content-center"
                        style={{
                            width: '96px',
                            height: '96px',
                            background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <InformationCircleIcon className="h-12 w-12" style={{ color: currentTheme.textSecondary }} />
                    </div>
                    <h3 className="fs-4 fw-semibold mb-2" style={{ color: currentTheme.text }}>
                        No Metrics Available
                    </h3>
                    <p className="mb-4" style={{ color: currentTheme.textSecondary }}>
                        There are currently no metrics to display. Start by adding customers and creating schedules.
                    </p>
                    <button
                        className="btn px-4 py-2 fw-medium rounded-3 shadow-sm"
                        style={{
                            background: currentTheme.primary,
                            border: 'none',
                            color: '#ffffff',
                            transition: 'transform 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.05)';
                            e.target.style.boxShadow = currentTheme.shadow;
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                        }}
                    >
                        Get Started
                    </button>
                </div>
            )}
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
