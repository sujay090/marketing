import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customerAPI, getImageUrl } from '../services/api';
import { toast } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';

const EditCustomer = () => {
    const { getCurrentTheme } = useTheme();
    const currentTheme = getCurrentTheme();
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        companyName: '',
        contactPerson: '',
        email: '',
        whatsapp: '',
        website: '',
        logo: null,
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [currentLogo, setCurrentLogo] = useState('');

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                // Try to fetch individual customer first, fallback to getting all customers
                let customer;
                try {
                    const response = await customerAPI.getCustomer(id);
                    customer = response.data;
                } catch (error) {
                    // If individual fetch fails, get all customers and find the one we need
                    const response = await customerAPI.getCustomers();
                    customer = response.data.find(c => c._id === id);
                }

                if (customer) {
                    setFormData({
                        companyName: customer.companyName || '',
                        contactPerson: customer.contactPerson || '',
                        email: customer.email || '',
                        whatsapp: customer.whatsapp || '',
                        website: customer.website || '',
                        logo: null,
                    });
                    setCurrentLogo(customer.logoUrl || '');
                } else {
                    toast.error('Customer not found');
                    navigate('/customers-list');
                }
            } catch (error) {
                console.error('Fetch error:', error);
                toast.error('Failed to fetch customer details');
                navigate('/customers-list');
            } finally {
                setLoading(false);
            }
        };

        fetchCustomer();
    }, [id, navigate]);

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
        setSubmitting(true);

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null) data.append(key, value);
            });

            await customerAPI.update(id, data);
            toast.success('Customer updated successfully!', {
                position: 'top-right',
                autoClose: 2000,
            });
            navigate('/customers-list');
        } catch (error) {
            console.error('Update error:', error);
            toast.error(
                error?.response?.data?.message || 'Failed to update customer',
                { position: 'top-right', autoClose: 3000 }
            );
        } finally {
            setSubmitting(false);
        }
    };

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
                    <div className="spinner-border mb-3" style={{ color: currentTheme.primary }} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mb-0" style={{ color: currentTheme.text }}>
                        Loading customer details...
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
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: currentTheme.shadow
                }}
            >
                <div className="row align-items-center g-3">
                    <div className="col-12 col-lg-8">
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="rounded-3 p-3 shadow-sm"
                                style={{ background: currentTheme.warning }}
                            >
                                <i className="fas fa-user-edit" style={{ color: '#ffffff', fontSize: '2rem' }}></i>
                            </div>
                            <div>
                                <h1 className="fs-2 fw-bold mb-1" style={{ color: currentTheme.text }}>
                                    Edit Customer
                                </h1>
                                <p className="mb-0" style={{ color: currentTheme.textSecondary }}>
                                    Update customer information and details
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-lg-4">
                        <button
                            onClick={() => navigate('/customers-list')}
                            className="btn w-100 py-3 fw-semibold rounded-3 shadow-sm"
                            style={{
                                background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                border: `1px solid ${currentTheme.border}`,
                                color: currentTheme.textSecondary,
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = currentTheme.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
                                e.target.style.transform = 'scale(1.02)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = currentTheme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                                e.target.style.transform = 'scale(1)';
                            }}
                        >
                            <i className="fas fa-arrow-left me-2"></i>
                            Back to Customers
                        </button>
                    </div>
                </div>
            </div>

            {/* Form Section */}
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
                <form onSubmit={handleSubmit} className="row g-4">
                    {/* Company Name */}
                    <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                            Company Name *
                        </label>
                        <div className="position-relative">
                            <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                                <i className="fas fa-building" style={{ color: currentTheme.textSecondary }}></i>
                            </div>
                            <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleInputChange}
                                placeholder="Enter company name"
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

                    {/* Contact Person */}
                    <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                            Contact Person
                        </label>
                        <div className="position-relative">
                            <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                                <i className="fas fa-user" style={{ color: currentTheme.textSecondary }}></i>
                            </div>
                            <input
                                type="text"
                                name="contactPerson"
                                value={formData.contactPerson}
                                onChange={handleInputChange}
                                placeholder="Enter contact person name"
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

                    {/* Email */}
                    <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                            Email Address
                        </label>
                        <div className="position-relative">
                            <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                                <i className="fas fa-envelope" style={{ color: currentTheme.textSecondary }}></i>
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter email address"
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

                    {/* WhatsApp */}
                    <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                            WhatsApp Number *
                        </label>
                        <div className="position-relative">
                            <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                                <i className="fab fa-whatsapp" style={{ color: currentTheme.success }}></i>
                            </div>
                            <input
                                type="tel"
                                name="whatsapp"
                                value={formData.whatsapp}
                                onChange={handleInputChange}
                                placeholder="Enter 10-digit WhatsApp number"
                                pattern="[0-9]{10}"
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

                    {/* Website */}
                    <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                            Website URL
                        </label>
                        <div className="position-relative">
                            <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                                <i className="fas fa-globe" style={{ color: currentTheme.textSecondary }}></i>
                            </div>
                            <input
                                type="url"
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

                    {/* Logo Upload */}
                    <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                            Company Logo
                        </label>
                        <input
                            type="file"
                            name="logo"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="form-control py-3 rounded-3"
                            style={{
                                background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                border: `1px solid ${currentTheme.border}`,
                                color: currentTheme.text,
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)'
                            }}
                        />
                        {currentLogo && (
                            <div className="mt-3">
                                <p className="small fw-semibold mb-2" style={{ color: currentTheme.text }}>
                                    Current logo:
                                </p>
                                <img
                                    src={getImageUrl(currentLogo)}
                                    alt="Current logo"
                                    className="rounded-3 shadow-sm"
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        objectFit: 'cover',
                                        border: `2px solid ${currentTheme.border}`
                                    }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/vite.svg";
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Submit Section */}
                    <div className="col-12">
                        <div
                            className="rounded-4 shadow-sm p-4"
                            style={{
                                background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                border: `1px solid ${currentTheme.border}`,
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)'
                            }}
                        >
                            <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                                <div>
                                    <h5 className="fw-bold mb-1" style={{ color: currentTheme.text }}>
                                        Ready to update?
                                    </h5>
                                    <p className="mb-0 small" style={{ color: currentTheme.textSecondary }}>
                                        Make sure all information is correct before saving
                                    </p>
                                </div>

                                <div className="d-flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/customers-list')}
                                        className="btn px-4 py-3 fw-semibold rounded-3 shadow-sm"
                                        style={{
                                            background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                            border: `1px solid ${currentTheme.border}`,
                                            color: currentTheme.textSecondary,
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <i className="fas fa-times me-2"></i>
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className={`btn px-4 py-3 fw-semibold rounded-3 shadow-sm d-flex align-items-center gap-2 ${submitting ? 'disabled' : ''
                                            }`}
                                        style={{
                                            background: submitting ?
                                                currentTheme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' :
                                                currentTheme.warning,
                                            border: 'none',
                                            color: submitting ? currentTheme.textSecondary : '#ffffff',
                                            cursor: submitting ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!submitting) {
                                                e.target.style.transform = 'scale(1.02)';
                                                e.target.style.boxShadow = currentTheme.shadow;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'scale(1)';
                                        }}
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="spinner-border spinner-border-sm" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                <span>Updating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save"></i>
                                                <span>Update Customer</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCustomer;
