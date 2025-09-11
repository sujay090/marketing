import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeSelector from '../components/ThemeSelector';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { getCurrentTheme } = useTheme();
    const currentTheme = getCurrentTheme();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await login({
                email: formData.email,
                password: formData.password,
            });

            if (result.success) {
                navigate('/dashboard');
            } else {
                setError('Invalid email or password');
            }
        } catch (error) {
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
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
                            <i className="fas fa-sign-in-alt me-2" style={{ color: currentTheme.primary }}></i>
                            Sign In
                        </h4>
                        <p className="mb-0 mt-2" style={{ color: currentTheme.textSecondary }}>
                            Welcome back to Post Generator
                        </p>
                    </div>

                    <div className="p-4">
                        {error && (
                            <div
                                className="px-4 py-3 rounded-3 mb-4"
                                style={{
                                    background: `${currentTheme.danger}20`,
                                    border: `1px solid ${currentTheme.danger}50`,
                                    color: currentTheme.danger
                                }}
                            >
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
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

                            <div className="mb-4">
                                <label htmlFor="password" className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    Password
                                </label>
                                <div className="position-relative">
                                    <div className="position-absolute top-50 start-0 translate-middle-y ps-3" style={{ zIndex: 1 }}>
                                        <i className="fas fa-lock" style={{ color: currentTheme.textSecondary }}></i>
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-control ps-5 pe-5 py-3 rounded-3"
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
                                    <button
                                        type="button"
                                        className="position-absolute top-50 end-0 translate-middle-y pe-3 btn p-0 border-0"
                                        style={{ color: currentTheme.textSecondary, background: 'transparent', zIndex: 1 }}
                                        onClick={togglePasswordVisibility}
                                    >
                                        <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                                    </button>
                                </div>
                                <small className="text-muted">Minimum 6 characters</small>
                            </div>

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
                                        <span>Signing In...</span>
                                    </div>
                                ) : (
                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                        <i className="fas fa-sign-in-alt"></i>
                                        <span>Sign In</span>
                                    </div>
                                )}
                            </button>
                        </form>

                        <div className="text-center mt-4">
                            <p className="mb-0" style={{ color: currentTheme.textSecondary }}>
                                Don't have an account?{' '}
                                <Link
                                    to="/register"
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
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
