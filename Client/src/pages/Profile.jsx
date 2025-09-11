import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';

const Profile = () => {
    const { user, logout } = useAuth();
    const { getCurrentTheme } = useTheme();
    const currentTheme = getCurrentTheme();

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
            <div className="container-fluid py-4 d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div
                    className="rounded-4 shadow-lg p-5 text-center"
                    style={{
                        background: currentTheme.surface,
                        border: `1px solid ${currentTheme.border}`,
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        boxShadow: currentTheme.shadow
                    }}
                >
                    <div className="spinner-border" style={{ color: currentTheme.primary }} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 mb-0" style={{ color: currentTheme.text }}>
                        Loading profile...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                    {/* Header Section */}
                    <div
                        className="rounded-4 shadow-lg p-4 mb-4 text-center"
                        style={{
                            background: currentTheme.surface,
                            border: `1px solid ${currentTheme.border}`,
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            boxShadow: currentTheme.shadow
                        }}
                    >
                        <div className="d-flex align-items-center justify-content-center gap-3 mb-3">
                            <div
                                className="rounded-3 p-3 shadow-sm"
                                style={{ background: currentTheme.primary }}
                            >
                                <i className="fas fa-user h-8 w-8" style={{ color: '#ffffff', fontSize: '2rem' }}></i>
                            </div>
                            <div>
                                <h1 className="fs-2 fw-bold mb-1" style={{ color: currentTheme.text }}>
                                    User Profile
                                </h1>
                                <p className="mb-0" style={{ color: currentTheme.textSecondary }}>
                                    Your account information and settings
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Card */}
                    <div
                        className="rounded-4 shadow-lg p-5 text-center"
                        style={{
                            background: currentTheme.surface,
                            border: `1px solid ${currentTheme.border}`,
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            boxShadow: currentTheme.shadow
                        }}
                    >
                        {/* Avatar */}
                        <div className="position-relative d-inline-block mb-4">
                            <img
                                src={`https://ui-avatars.com/api/?name=${displayProfile.name}&background=${currentTheme.primary.replace('#', '')}&color=fff&size=120`}
                                alt="Profile Avatar"
                                className="rounded-circle shadow-lg"
                                style={{
                                    width: '120px',
                                    height: '120px',
                                    border: `4px solid ${currentTheme.primary}`
                                }}
                            />
                            <div
                                className="position-absolute bottom-0 end-0 rounded-circle d-flex align-items-center justify-content-center"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    background: currentTheme.success,
                                    border: `3px solid ${currentTheme.surface}`
                                }}
                            >
                                <i className="fas fa-check" style={{ color: '#ffffff', fontSize: '1rem' }}></i>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="mb-4">
                            <h2 className="fs-3 fw-bold mb-2" style={{ color: currentTheme.text }}>
                                {displayProfile.name}
                            </h2>
                            <p className="fs-6 mb-3" style={{ color: currentTheme.textSecondary }}>
                                {displayProfile.email}
                            </p>

                            <div
                                className="badge rounded-3 px-4 py-2"
                                style={{
                                    background: currentTheme.info + '20',
                                    color: currentTheme.info,
                                    fontSize: '0.9rem',
                                    border: `1px solid ${currentTheme.info}40`
                                }}
                            >
                                <i className="fas fa-shield-alt me-2"></i>
                                {displayProfile.role || 'User'}
                            </div>
                        </div>

                        {/* Profile Stats */}
                        <div className="row g-3 mb-4">
                            <div className="col-4">
                                <div
                                    className="rounded-3 p-3"
                                    style={{
                                        background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                        border: `1px solid ${currentTheme.border}`
                                    }}
                                >
                                    <i className="fas fa-calendar-check mb-2" style={{ color: currentTheme.primary, fontSize: '1.5rem' }}></i>
                                    <div className="fw-bold" style={{ color: currentTheme.text }}>Active</div>
                                    <small style={{ color: currentTheme.textSecondary }}>Status</small>
                                </div>
                            </div>
                            <div className="col-4">
                                <div
                                    className="rounded-3 p-3"
                                    style={{
                                        background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                        border: `1px solid ${currentTheme.border}`
                                    }}
                                >
                                    <i className="fas fa-clock mb-2" style={{ color: currentTheme.success, fontSize: '1.5rem' }}></i>
                                    <div className="fw-bold" style={{ color: currentTheme.text }}>24/7</div>
                                    <small style={{ color: currentTheme.textSecondary }}>Available</small>
                                </div>
                            </div>
                            <div className="col-4">
                                <div
                                    className="rounded-3 p-3"
                                    style={{
                                        background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                        border: `1px solid ${currentTheme.border}`
                                    }}
                                >
                                    <i className="fas fa-star mb-2" style={{ color: currentTheme.warning, fontSize: '1.5rem' }}></i>
                                    <div className="fw-bold" style={{ color: currentTheme.text }}>Pro</div>
                                    <small style={{ color: currentTheme.textSecondary }}>Account</small>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="d-grid gap-3">
                            <button
                                className="btn py-3 fw-semibold rounded-3 shadow-sm"
                                style={{
                                    background: currentTheme.primary,
                                    border: 'none',
                                    color: '#ffffff',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'scale(1.02)';
                                    e.target.style.boxShadow = currentTheme.shadow;
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'scale(1)';
                                }}
                            >
                                <i className="fas fa-edit me-2"></i>
                                Edit Profile
                            </button>

                            <button
                                onClick={handleLogout}
                                className="btn py-3 fw-semibold rounded-3 shadow-sm"
                                style={{
                                    background: currentTheme.danger + '20',
                                    border: `1px solid ${currentTheme.danger}40`,
                                    color: currentTheme.danger,
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = currentTheme.danger + '30';
                                    e.target.style.transform = 'scale(1.02)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = currentTheme.danger + '20';
                                    e.target.style.transform = 'scale(1)';
                                }}
                            >
                                <i className="fas fa-sign-out-alt me-2"></i>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
