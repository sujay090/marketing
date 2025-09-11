import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import ThemeSelector from '../components/ThemeSelector';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const { getCurrentTheme } = useTheme();
    const currentTheme = getCurrentTheme();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            console.log('Register: Sending data', formData);
            const result = await register({
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
            });

            if (result.success) {
                toast.success('Registration successful!');
                navigate('/dashboard');
            } else {
                toast.error(result.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Register error:', error);
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-vh-100 d-flex align-items-center justify-content-center p-4 position-relative"
            style={{ background: currentTheme.background }}
        >
            {/* Theme Selector - Top Right */}
            <div className="position-absolute top-0 end-0 p-4">
                <ThemeSelector />
            </div>

            <div className="w-100" style={{ maxWidth: '28rem' }}>
                <div
                    className="rounded-4 shadow-lg overflow-hidden"
                    style={{
                        background: currentTheme.surface,
                        border: `1px solid ${currentTheme.border}`,
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        boxShadow: currentTheme.shadow
                    }}
                >
                    <div
                        className="px-4 py-4 text-center"
                        style={{ borderBottom: `1px solid ${currentTheme.border}` }}
                    >
                        <h4 className="fs-3 fw-bold mb-0" style={{ color: currentTheme.text }}>
                            <i className="fas fa-user-plus me-2" style={{ color: currentTheme.primary }}></i>
                            Sign Up
                        </h4>
                        <p className="mb-0 mt-2" style={{ color: currentTheme.textSecondary }}>
                            Create your Post Generator account
                        </p>
                    </div>

                    <div className="p-4">
                        <form onSubmit={handleSubmit}>
                            {/* Name */}
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    Full Name
                                </label>
                                <div className="position-relative">
                                    <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                                        <i className="fas fa-user" style={{ color: currentTheme.textSecondary }}></i>
                                    </div>
                                    <input
                                        type="text"
                                        className="form-control ps-5 py-3 rounded-3"
                                        style={{
                                            background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                            border: `1px solid ${currentTheme.border}`,
                                            color: currentTheme.text,
                                            backdropFilter: 'blur(10px)',
                                            WebkitBackdropFilter: 'blur(10px)'
                                        }}
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    Email Address
                                </label>
                                <div className="position-relative">
                                    <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                                        <i className="fas fa-envelope" style={{ color: currentTheme.textSecondary }}></i>
                                    </div>
                                    <input
                                        type="email"
                                        className="form-control ps-5 py-3 rounded-3"
                                        style={{
                                            background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                            border: `1px solid ${currentTheme.border}`,
                                            color: currentTheme.text,
                                            backdropFilter: 'blur(10px)',
                                            WebkitBackdropFilter: 'blur(10px)'
                                        }}
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    Password
                                </label>
                                <div className="position-relative">
                                    <div className="position-absolute top-50 start-0 translate-middle-y ps-3" style={{ zIndex: 1 }}>
                                        <i className="fas fa-lock" style={{ color: currentTheme.textSecondary }}></i>
                                    </div>
                                    <input
                                        type="password"
                                        className="form-control ps-5 py-3 rounded-3"
                                        style={{
                                            background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                            border: `1px solid ${currentTheme.border}`,
                                            color: currentTheme.text,
                                            backdropFilter: 'blur(10px)',
                                            WebkitBackdropFilter: 'blur(10px)'
                                        }}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        required
                                        minLength="6"
                                    />
                                </div>
                                <small style={{ color: currentTheme.textSecondary }}>Minimum 6 characters</small>
                            </div>

                            {/* Confirm Password */}
                            <div className="mb-4">
                                <label htmlFor="confirmPassword" className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    Confirm Password
                                </label>
                                <div className="position-relative">
                                    <div className="position-absolute top-50 start-0 translate-middle-y ps-3" style={{ zIndex: 1 }}>
                                        <i className="fas fa-check-circle" style={{ color: currentTheme.textSecondary }}></i>
                                    </div>
                                    <input
                                        type="password"
                                        className="form-control ps-5 py-3 rounded-3"
                                        style={{
                                            background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                            border: `1px solid ${currentTheme.border}`,
                                            color: currentTheme.text,
                                            backdropFilter: 'blur(10px)',
                                            WebkitBackdropFilter: 'blur(10px)'
                                        }}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm your password"
                                        required
                                        minLength="6"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="btn w-100 py-3 fw-semibold rounded-3 shadow-sm"
                                style={{
                                    background: currentTheme.primary,
                                    border: 'none',
                                    color: currentTheme.isDark ? '#ffffff' : '#ffffff',
                                    transition: 'all 0.3s ease',
                                    transform: 'scale(1)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'scale(1.02)';
                                    e.target.style.boxShadow = currentTheme.shadow;
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'scale(1)';
                                }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                        <div
                                            className="spinner-border spinner-border-sm"
                                            role="status"
                                            style={{ width: '1rem', height: '1rem' }}
                                        >
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <span>Creating Account...</span>
                                    </div>
                                ) : (
                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                        <i className="fas fa-user-plus"></i>
                                        <span>Sign Up</span>
                                    </div>
                                )}
                            </button>
                        </form>

                        <div className="text-center mt-4">
                            <p className="mb-0" style={{ color: currentTheme.textSecondary }}>
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="text-decoration-none fw-semibold"
                                    style={{
                                        color: currentTheme.primary,
                                        transition: 'color 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.color = currentTheme.accent;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.color = currentTheme.primary;
                                    }}
                                >
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
