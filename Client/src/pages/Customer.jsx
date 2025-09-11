import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';

const Customer = () => {
    const navigate = useNavigate();
    const { getCurrentTheme } = useTheme();
    const currentTheme = getCurrentTheme();
    const [formData, setFormData] = useState({
        companyName: '',
        logo: null,
        website: '',
        whatsapp: '',
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({ ...prev, logo: e.target.files[0] }));
    };

    const validateForm = () => {
        const { companyName, whatsapp } = formData;
        if (!companyName || !whatsapp) {
            toast.error('Company name and WhatsApp number are required.');
            return false;
        }
        const whatsappRegex = /^[0-9]{10}$/;
        if (!whatsappRegex.test(whatsapp)) {
            toast.error('Please enter a valid 10-digit WhatsApp number.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value) data.append(key, value);
            });

            await customerAPI.add(data);
            toast.success('Customer added successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add customer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid py-4">
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">
                    <div
                        className="rounded-4 shadow-lg p-4"
                        style={{
                            background: currentTheme.surface,
                            border: `1px solid ${currentTheme.border}`,
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            boxShadow: currentTheme.shadow
                        }}
                    >
                        {/* Header */}
                        <div className="text-center mb-4">
                            <h2 className="fs-2 fw-bold mb-2" style={{ color: currentTheme.text }}>
                                <i className="fas fa-user-plus me-2" style={{ color: currentTheme.primary }}></i>
                                Add New Customer
                            </h2>
                            <p className="mb-0" style={{ color: currentTheme.textSecondary }}>
                                Create a new customer profile for poster generation
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Company Name */}
                            <div className="mb-4">
                                <label htmlFor="companyName" className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    Company Name <span style={{ color: currentTheme.danger }}>*</span>
                                </label>
                                <div className="position-relative">
                                    <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                                        <i className="fas fa-building" style={{ color: currentTheme.textSecondary }}></i>
                                    </div>
                                    <input
                                        type="text"
                                        id="companyName"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Amazon, Google, Microsoft"
                                        className="form-control ps-5 py-3 rounded-3"
                                        style={{
                                            background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                            border: `1px solid ${currentTheme.border}`,
                                            color: currentTheme.text,
                                            backdropFilter: 'blur(10px)',
                                            WebkitBackdropFilter: 'blur(10px)'
                                        }}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Logo */}
                            <div className="mb-4">
                                <label htmlFor="logo" className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    Company Logo
                                </label>
                                <div className="position-relative">
                                    <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                                        <i className="fas fa-image" style={{ color: currentTheme.textSecondary }}></i>
                                    </div>
                                    <input
                                        type="file"
                                        id="logo"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="form-control ps-5 py-3 rounded-3"
                                        style={{
                                            background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                            border: `1px solid ${currentTheme.border}`,
                                            color: currentTheme.text,
                                            backdropFilter: 'blur(10px)',
                                            WebkitBackdropFilter: 'blur(10px)'
                                        }}
                                    />
                                </div>
                                <small style={{ color: currentTheme.textSecondary }}>
                                    Supported formats: JPG, PNG, GIF (Max 5MB)
                                </small>
                            </div>

                            {/* Website */}
                            <div className="mb-4">
                                <label htmlFor="website" className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    Website URL
                                </label>
                                <div className="position-relative">
                                    <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                                        <i className="fas fa-globe" style={{ color: currentTheme.textSecondary }}></i>
                                    </div>
                                    <input
                                        type="url"
                                        id="website"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com"
                                        className="form-control ps-5 py-3 rounded-3"
                                        style={{
                                            background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                            border: `1px solid ${currentTheme.border}`,
                                            color: currentTheme.text,
                                            backdropFilter: 'blur(10px)',
                                            WebkitBackdropFilter: 'blur(10px)'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* WhatsApp Number */}
                            <div className="mb-4">
                                <label htmlFor="whatsapp" className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    WhatsApp Number <span style={{ color: currentTheme.danger }}>*</span>
                                </label>
                                <div className="position-relative">
                                    <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                                        <i className="fab fa-whatsapp" style={{ color: currentTheme.textSecondary }}></i>
                                    </div>
                                    <input
                                        type="text"
                                        id="whatsapp"
                                        name="whatsapp"
                                        value={formData.whatsapp}
                                        onChange={handleInputChange}
                                        placeholder="10-digit WhatsApp number"
                                        className="form-control ps-5 py-3 rounded-3"
                                        style={{
                                            background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                            border: `1px solid ${currentTheme.border}`,
                                            color: currentTheme.text,
                                            backdropFilter: 'blur(10px)',
                                            WebkitBackdropFilter: 'blur(10px)'
                                        }}
                                        required
                                    />
                                </div>
                                <small style={{ color: currentTheme.textSecondary }}>
                                    Enter 10-digit number without country code
                                </small>
                            </div>

                            {/* Submit Button */}
                            <div className="d-grid">
                                <button
                                    type="submit"
                                    className="btn py-3 fw-semibold rounded-3 shadow-sm"
                                    style={{
                                        background: currentTheme.primary,
                                        border: 'none',
                                        color: '#ffffff',
                                        transition: 'all 0.3s ease',
                                        transform: 'scale(1)'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!loading) {
                                            e.target.style.transform = 'scale(1.02)';
                                            e.target.style.boxShadow = currentTheme.shadow;
                                        }
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
                                            <span>Adding Customer...</span>
                                        </div>
                                    ) : (
                                        <div className="d-flex align-items-center justify-content-center gap-2">
                                            <i className="fas fa-plus-circle"></i>
                                            <span>Add Customer</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Additional Info */}
                        <div
                            className="mt-4 p-3 rounded-3 d-flex align-items-center gap-2"
                            style={{
                                background: `${currentTheme.primary}15`,
                                border: `1px solid ${currentTheme.primary}30`
                            }}
                        >
                            <i className="fas fa-info-circle" style={{ color: currentTheme.primary }}></i>
                            <small style={{ color: currentTheme.text }}>
                                After adding a customer, you can create schedules and generate personalized posters for them.
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Customer;
