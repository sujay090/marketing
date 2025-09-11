import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { dashboardAPI, customerAPI, scheduleAPI, posterAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ModernDashboard = () => {
    const { user } = useAuth();
    const { getCurrentTheme } = useTheme();
    const currentTheme = getCurrentTheme();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalCustomers: 0,
        totalPosters: 0,
        scheduledMessages: 0,
        messagesDelivered: 0,
        recentSchedules: [],
        recentCustomers: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Parallel API calls for better performance
            const [dashboardRes, customersRes, schedulesRes] = await Promise.all([
                dashboardAPI.getMetrics(),
                customerAPI.getCustomers(),
                scheduleAPI.getAllSchedules()
            ]);

            // Calculate stats
            const customers = customersRes.data || [];
            const schedules = schedulesRes.data || [];
            
            setStats({
                totalCustomers: customers.length,
                totalPosters: dashboardRes.data.posters || 0,
                scheduledMessages: schedules.filter(s => s.status === 'Pending').length,
                messagesDelivered: schedules.filter(s => s.status === 'Sent').length,
                recentSchedules: schedules.slice(0, 5),
                recentCustomers: customers.slice(0, 5)
            });

        } catch (error) {
            console.error('Dashboard data fetch error:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        {
            title: 'Add New Customer',
            description: 'Add a new customer to your portfolio',
            icon: 'fas fa-user-plus',
            color: currentTheme.success,
            action: () => navigate('/customer'),
            count: stats.totalCustomers
        },
        {
            title: 'Create Schedule',
            description: 'Schedule posters for your customers',
            icon: 'fas fa-calendar-plus',
            color: currentTheme.primary,
            action: () => navigate('/schedule'),
            count: stats.scheduledMessages
        },
        {
            title: 'Generate Posters',
            description: 'Create personalized posters',
            icon: 'fas fa-image',
            color: currentTheme.warning,
            action: () => navigate('/posterlist'),
            count: stats.totalPosters
        },
        {
            title: 'Bulk Campaign',
            description: 'Send to multiple customers',
            icon: 'fas fa-broadcast-tower',
            color: currentTheme.info,
            action: () => navigate('/bulk-campaign'),
            count: stats.messagesDelivered
        }
    ];

    const recentActivities = [
        {
            type: 'schedule',
            title: 'New schedule created',
            description: 'Festival poster for Acme Corp',
            time: '2 hours ago',
            icon: 'fas fa-calendar-check',
            color: currentTheme.success
        },
        {
            type: 'customer',
            title: 'Customer added',
            description: 'Tech Solutions Pvt Ltd',
            time: '5 hours ago',
            icon: 'fas fa-user-plus',
            color: currentTheme.primary
        },
        {
            type: 'poster',
            title: 'Poster generated',
            description: 'Diwali offer poster created',
            time: '1 day ago',
            icon: 'fas fa-image',
            color: currentTheme.warning
        }
    ];

    if (loading) {
        return (
            <div 
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: '60vh' }}
            >
                <div className="text-center">
                    <div 
                        className="spinner-border mb-3"
                        style={{ color: currentTheme.primary, width: '3rem', height: '3rem' }}
                    />
                    <p style={{ color: currentTheme.textSecondary }}>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            {/* Welcome Section */}
            <div
                className="rounded-4 shadow-lg p-4 mb-4 position-relative overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${currentTheme.primary}20, ${currentTheme.secondary}20)`,
                    border: `1px solid ${currentTheme.border}`,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)'
                }}
            >
                <div className="row align-items-center">
                    <div className="col-lg-8">
                        <h1 className="display-5 fw-bold mb-3" style={{ color: currentTheme.text }}>
                            Welcome back, {user?.name}! 👋
                        </h1>
                        <p className="fs-5 mb-4" style={{ color: currentTheme.textSecondary }}>
                            Manage your poster campaigns and customer relationships efficiently
                        </p>
                        <div className="d-flex flex-wrap gap-3">
                            <button
                                onClick={() => navigate('/customer')}
                                className="btn btn-lg rounded-3 px-4"
                                style={{
                                    background: currentTheme.primary,
                                    border: 'none',
                                    color: '#ffffff'
                                }}
                            >
                                <i className="fas fa-plus me-2"></i>
                                Add Customer
                            </button>
                            <button
                                onClick={() => navigate('/schedule')}
                                className="btn btn-lg rounded-3 px-4"
                                style={{
                                    background: 'transparent',
                                    border: `2px solid ${currentTheme.primary}`,
                                    color: currentTheme.primary
                                }}
                            >
                                <i className="fas fa-calendar me-2"></i>
                                Schedule Campaign
                            </button>
                        </div>
                    </div>
                    <div className="col-lg-4 text-end">
                        <div
                            className="rounded-circle d-inline-flex align-items-center justify-content-center"
                            style={{
                                width: '120px',
                                height: '120px',
                                background: `linear-gradient(45deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                                boxShadow: currentTheme.shadow
                            }}
                        >
                            <i className="fas fa-chart-line" style={{ fontSize: '3rem', color: '#ffffff' }}></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row g-4 mb-4">
                {quickActions.map((action, index) => (
                    <div key={index} className="col-xl-3 col-lg-6 col-md-6">
                        <div
                            className="card h-100 border-0 rounded-4 shadow-sm position-relative overflow-hidden cursor-pointer"
                            style={{
                                background: currentTheme.surface,
                                border: `1px solid ${currentTheme.border}`,
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            onClick={action.action}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = currentTheme.shadow;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div className="card-body p-4">
                                <div className="d-flex align-items-start justify-content-between mb-3">
                                    <div
                                        className="rounded-3 p-3 d-inline-flex"
                                        style={{ background: action.color + '20' }}
                                    >
                                        <i 
                                            className={action.icon} 
                                            style={{ 
                                                color: action.color, 
                                                fontSize: '1.5rem' 
                                            }}
                                        ></i>
                                    </div>
                                    <div className="text-end">
                                        <div 
                                            className="h2 fw-bold mb-0" 
                                            style={{ color: currentTheme.text }}
                                        >
                                            {action.count}
                                        </div>
                                    </div>
                                </div>
                                <h5 className="card-title fw-bold mb-2" style={{ color: currentTheme.text }}>
                                    {action.title}
                                </h5>
                                <p className="card-text small mb-0" style={{ color: currentTheme.textSecondary }}>
                                    {action.description}
                                </p>
                            </div>
                            
                            {/* Decorative element */}
                            <div
                                className="position-absolute bottom-0 end-0"
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    background: `linear-gradient(45deg, ${action.color}20, transparent)`,
                                    borderRadius: '50% 0 0 0'
                                }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-4">
                {/* Recent Schedules */}
                <div className="col-lg-8">
                    <div
                        className="card border-0 rounded-4 shadow-sm h-100"
                        style={{
                            background: currentTheme.surface,
                            border: `1px solid ${currentTheme.border}`
                        }}
                    >
                        <div className="card-header bg-transparent border-bottom-0 p-4">
                            <div className="d-flex align-items-center justify-content-between">
                                <h5 className="card-title fw-bold mb-0" style={{ color: currentTheme.text }}>
                                    <i className="fas fa-clock me-2" style={{ color: currentTheme.primary }}></i>
                                    Recent Schedules
                                </h5>
                                <button
                                    onClick={() => navigate('/schedulelist')}
                                    className="btn btn-sm rounded-3"
                                    style={{
                                        background: currentTheme.primary + '20',
                                        border: `1px solid ${currentTheme.primary}40`,
                                        color: currentTheme.primary
                                    }}
                                >
                                    View All
                                </button>
                            </div>
                        </div>
                        <div className="card-body p-4">
                            {stats.recentSchedules.length > 0 ? (
                                <div className="list-group list-group-flush">
                                    {stats.recentSchedules.map((schedule, index) => (
                                        <div
                                            key={index}
                                            className="list-group-item bg-transparent border-0 px-0 py-3"
                                            style={{ borderBottom: `1px solid ${currentTheme.border}` }}
                                        >
                                            <div className="d-flex align-items-center">
                                                <div
                                                    className="rounded-3 p-2 me-3 d-flex align-items-center justify-content-center"
                                                    style={{
                                                        background: currentTheme.primary + '20',
                                                        width: '40px',
                                                        height: '40px'
                                                    }}
                                                >
                                                    <i className="fas fa-calendar-alt" style={{ color: currentTheme.primary }}></i>
                                                </div>
                                                <div className="flex-grow-1">
                                                    <h6 className="mb-1 fw-semibold" style={{ color: currentTheme.text }}>
                                                        {schedule.customerId?.companyName || 'Customer'}
                                                    </h6>
                                                    <small style={{ color: currentTheme.textSecondary }}>
                                                        {schedule.category} • {schedule.date} at {schedule.time}
                                                    </small>
                                                </div>
                                                <span
                                                    className="badge rounded-3 px-3 py-2"
                                                    style={{
                                                        background: schedule.status === 'Pending' 
                                                            ? currentTheme.warning + '20'
                                                            : currentTheme.success + '20',
                                                        color: schedule.status === 'Pending' 
                                                            ? currentTheme.warning
                                                            : currentTheme.success,
                                                        border: `1px solid ${schedule.status === 'Pending' 
                                                            ? currentTheme.warning + '40'
                                                            : currentTheme.success + '40'}`
                                                    }}
                                                >
                                                    {schedule.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <i 
                                        className="fas fa-calendar-times mb-3" 
                                        style={{ 
                                            fontSize: '3rem', 
                                            color: currentTheme.textSecondary + '60' 
                                        }}
                                    ></i>
                                    <p style={{ color: currentTheme.textSecondary }}>
                                        No schedules found. Create your first schedule!
                                    </p>
                                    <button
                                        onClick={() => navigate('/schedule')}
                                        className="btn rounded-3"
                                        style={{
                                            background: currentTheme.primary,
                                            border: 'none',
                                            color: '#ffffff'
                                        }}
                                    >
                                        Create Schedule
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="col-lg-4">
                    <div
                        className="card border-0 rounded-4 shadow-sm h-100"
                        style={{
                            background: currentTheme.surface,
                            border: `1px solid ${currentTheme.border}`
                        }}
                    >
                        <div className="card-header bg-transparent border-bottom-0 p-4">
                            <h5 className="card-title fw-bold mb-0" style={{ color: currentTheme.text }}>
                                <i className="fas fa-bell me-2" style={{ color: currentTheme.secondary }}></i>
                                Recent Activity
                            </h5>
                        </div>
                        <div className="card-body p-4">
                            <div className="list-group list-group-flush">
                                {recentActivities.map((activity, index) => (
                                    <div
                                        key={index}
                                        className="list-group-item bg-transparent border-0 px-0 py-3"
                                        style={{ borderBottom: `1px solid ${currentTheme.border}` }}
                                    >
                                        <div className="d-flex align-items-start">
                                            <div
                                                className="rounded-circle p-2 me-3 d-flex align-items-center justify-content-center"
                                                style={{
                                                    background: activity.color + '20',
                                                    width: '35px',
                                                    height: '35px'
                                                }}
                                            >
                                                <i className={activity.icon} style={{ 
                                                    color: activity.color, 
                                                    fontSize: '0.9rem' 
                                                }}></i>
                                            </div>
                                            <div className="flex-grow-1">
                                                <h6 className="mb-1 fw-semibold" style={{ color: currentTheme.text }}>
                                                    {activity.title}
                                                </h6>
                                                <p className="mb-1 small" style={{ color: currentTheme.textSecondary }}>
                                                    {activity.description}
                                                </p>
                                                <small style={{ color: currentTheme.textSecondary + '80' }}>
                                                    {activity.time}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Tips */}
            <div className="mt-4">
                <div
                    className="alert rounded-4 border-0"
                    style={{
                        background: currentTheme.info + '20',
                        border: `1px solid ${currentTheme.info}40`,
                        color: currentTheme.text
                    }}
                >
                    <div className="d-flex align-items-center">
                        <i className="fas fa-lightbulb me-3" style={{ color: currentTheme.info, fontSize: '1.5rem' }}></i>
                        <div>
                            <h6 className="mb-1 fw-bold">💡 Quick Tip</h6>
                            <p className="mb-0">
                                You can schedule bulk campaigns to multiple customers at once using the bulk campaign feature. 
                                Group customers by tags for targeted messaging!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModernDashboard;
