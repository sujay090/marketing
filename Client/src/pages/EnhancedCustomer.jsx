import React, { useState } from 'react';
import { customerAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Customer = () => {
    const navigate = useNavigate();
    const { getCurrentTheme } = useTheme();
    const currentTheme = getCurrentTheme();

    const [formData, setFormData] = useState({
        companyName: '',
        website: '',
        whatsapp: '',
        email: '',
        address: {
            street: '',
            city: '',
            state: '',
            country: '',
            pincode: ''
        },
        businessInfo: {
            industry: '',
            businessType: 'other',
            establishedYear: '',
            description: ''
        },
        socialMedia: {
            facebook: '',
            instagram: '',
            twitter: '',
            linkedin: ''
        },
        preferences: {
            preferredCategories: [],
            messagingFrequency: 'weekly',
            bestTimeToSend: {
                start: '09:00',
                end: '18:00'
            }
        },
        tags: []
    });
    const [logo, setLogo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [newTag, setNewTag] = useState('');

    const industries = [
        'Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing',
        'Education', 'Real Estate', 'Food & Beverage', 'Automotive', 
        'Construction', 'Other'
    ];

    const businessTypes = [
        { value: 'retail', label: 'Retail' },
        { value: 'service', label: 'Service' },
        { value: 'manufacturing', label: 'Manufacturing' },
        { value: 'restaurant', label: 'Restaurant' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'education', label: 'Education' },
        { value: 'other', label: 'Other' }
    ];

    const categories = [
        { value: 'offers', label: 'Offers & Discounts' },
        { value: 'events', label: 'Events' },
        { value: 'festivals', label: 'Festivals' },
        { value: 'announcements', label: 'Announcements' },
        { value: 'promotions', label: 'Promotions' }
    ];

    const messagingFrequencies = [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'custom', label: 'Custom' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleNestedChange = (parent, child, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [child]: value
            }
        }));
    };

    const handleCategoryToggle = (category) => {
        setFormData(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                preferredCategories: prev.preferences.preferredCategories.includes(category)
                    ? prev.preferences.preferredCategories.filter(c => c !== category)
                    : [...prev.preferences.preferredCategories, category]
            }
        }));
    };

    const handleAddTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const validateStep = (step) => {
        switch (step) {
            case 1:
                if (!formData.companyName.trim()) {
                    toast.error('Company name is required');
                    return false;
                }
                if (!formData.whatsapp.trim() || !/^[0-9]{10}$/.test(formData.whatsapp)) {
                    toast.error('Valid 10-digit WhatsApp number is required');
                    return false;
                }
                return true;
            case 2:
                return true; // Business info is optional
            case 3:
                return true; // Preferences are optional
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateStep(currentStep)) return;

        setLoading(true);
        try {
            const formDataToSend = new FormData();
            
            // Add all form fields
            Object.keys(formData).forEach(key => {
                if (typeof formData[key] === 'object' && formData[key] !== null) {
                    formDataToSend.append(key, JSON.stringify(formData[key]));
                } else {
                    formDataToSend.append(key, formData[key]);
                }
            });

            if (logo) {
                formDataToSend.append('logo', logo);
            }

            await customerAPI.add(formDataToSend);
            toast.success('Customer added successfully!');
            navigate('/customers');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add customer');
        } finally {
            setLoading(false);
        }
    };

    const stepTitles = [
        'Basic Information',
        'Business Details',
        'Preferences & Tags'
    ];

    return (
        <div className="container-fluid py-4">
            {/* Header */}
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
                <div className="row align-items-center">
                    <div className="col-lg-8">
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="rounded-3 p-3 shadow-sm"
                                style={{ background: currentTheme.primary }}
                            >
                                <i className="fas fa-user-plus" style={{ color: '#ffffff', fontSize: '2rem' }}></i>
                            </div>
                            <div>
                                <h1 className="fs-2 fw-bold mb-1" style={{ color: currentTheme.text }}>
                                    Add New Customer
                                </h1>
                                <p className="mb-0" style={{ color: currentTheme.textSecondary }}>
                                    Step {currentStep} of 3: {stepTitles[currentStep - 1]}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 text-end">
                        <div className="d-flex align-items-center justify-content-end gap-2">
                            {[1, 2, 3].map((step) => (
                                <div
                                    key={step}
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        background: currentStep >= step ? currentTheme.primary : currentTheme.border,
                                        color: currentStep >= step ? '#ffffff' : currentTheme.textSecondary,
                                        fontSize: '0.9rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {step}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div
                    className="rounded-4 shadow-sm p-4"
                    style={{
                        background: currentTheme.surface,
                        border: `1px solid ${currentTheme.border}`,
                        boxShadow: currentTheme.shadow
                    }}
                >
                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
                        <div className="row g-4">
                            <div className="col-12">
                                <h4 className="fw-bold mb-4" style={{ color: currentTheme.text }}>
                                    Basic Information
                                </h4>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    Company Name *
                                </label>
                                <input
                                    type="text"
                                    name="companyName"
                                    className="form-control py-3 rounded-3"
                                    placeholder="Enter company name"
                                    value={formData.companyName}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                        border: `1px solid ${currentTheme.border}`,
                                        color: currentTheme.text
                                    }}
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    WhatsApp Number *
                                </label>
                                <input
                                    type="text"
                                    name="whatsapp"
                                    className="form-control py-3 rounded-3"
                                    placeholder="Enter 10-digit number"
                                    value={formData.whatsapp}
                                    onChange={handleInputChange}
                                    maxLength="10"
                                    required
                                    style={{
                                        background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                        border: `1px solid ${currentTheme.border}`,
                                        color: currentTheme.text
                                    }}
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    Website URL
                                </label>
                                <input
                                    type="url"
                                    name="website"
                                    className="form-control py-3 rounded-3"
                                    placeholder="https://example.com"
                                    value={formData.website}
                                    onChange={handleInputChange}
                                    style={{
                                        background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                        border: `1px solid ${currentTheme.border}`,
                                        color: currentTheme.text
                                    }}
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control py-3 rounded-3"
                                    placeholder="Enter email address"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    style={{
                                        background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                        border: `1px solid ${currentTheme.border}`,
                                        color: currentTheme.text
                                    }}
                                />
                            </div>

                            <div className="col-12">
                                <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    Company Logo
                                </label>
                                <input
                                    type="file"
                                    className="form-control py-3 rounded-3"
                                    accept="image/*"
                                    onChange={(e) => setLogo(e.target.files[0])}
                                    style={{
                                        background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                        border: `1px solid ${currentTheme.border}`,
                                        color: currentTheme.text
                                    }}
                                />
                            </div>

                            <div className="col-12">
                                <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    Address
                                </label>
                                <div className="row g-3">
                                    <div className="col-12">
                                        <input
                                            type="text"
                                            name="address.street"
                                            className="form-control py-3 rounded-3"
                                            placeholder="Street Address"
                                            value={formData.address.street}
                                            onChange={handleInputChange}
                                            style={{
                                                background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                border: `1px solid ${currentTheme.border}`,
                                                color: currentTheme.text
                                            }}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <input
                                            type="text"
                                            name="address.city"
                                            className="form-control py-3 rounded-3"
                                            placeholder="City"
                                            value={formData.address.city}
                                            onChange={handleInputChange}
                                            style={{
                                                background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                border: `1px solid ${currentTheme.border}`,
                                                color: currentTheme.text
                                            }}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <input
                                            type="text"
                                            name="address.state"
                                            className="form-control py-3 rounded-3"
                                            placeholder="State"
                                            value={formData.address.state}
                                            onChange={handleInputChange}
                                            style={{
                                                background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                border: `1px solid ${currentTheme.border}`,
                                                color: currentTheme.text
                                            }}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <input
                                            type="text"
                                            name="address.pincode"
                                            className="form-control py-3 rounded-3"
                                            placeholder="PIN Code"
                                            value={formData.address.pincode}
                                            onChange={handleInputChange}
                                            style={{
                                                background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                border: `1px solid ${currentTheme.border}`,
                                                color: currentTheme.text
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Business Details */}
                    {currentStep === 2 && (
                        <div className="row g-4">
                            <div className="col-12">
                                <h4 className="fw-bold mb-4" style={{ color: currentTheme.text }}>
                                    Business Details
                                </h4>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    Industry
                                </label>
                                <select
                                    name="businessInfo.industry"
                                    className="form-select py-3 rounded-3"
                                    value={formData.businessInfo.industry}
                                    onChange={handleInputChange}
                                    style={{
                                        background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                        border: `1px solid ${currentTheme.border}`,
                                        color: currentTheme.text
                                    }}
                                >
                                    <option value="">Select Industry</option>
                                    {industries.map(industry => (
                                        <option key={industry} value={industry}>{industry}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    Business Type
                                </label>
                                <select
                                    name="businessInfo.businessType"
                                    className="form-select py-3 rounded-3"
                                    value={formData.businessInfo.businessType}
                                    onChange={handleInputChange}
                                    style={{
                                        background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                        border: `1px solid ${currentTheme.border}`,
                                        color: currentTheme.text
                                    }}
                                >
                                    {businessTypes.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    Established Year
                                </label>
                                <input
                                    type="number"
                                    name="businessInfo.establishedYear"
                                    className="form-control py-3 rounded-3"
                                    placeholder="e.g., 2020"
                                    min="1900"
                                    max={new Date().getFullYear()}
                                    value={formData.businessInfo.establishedYear}
                                    onChange={handleInputChange}
                                    style={{
                                        background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                        border: `1px solid ${currentTheme.border}`,
                                        color: currentTheme.text
                                    }}
                                />
                            </div>

                            <div className="col-12">
                                <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    Business Description
                                </label>
                                <textarea
                                    name="businessInfo.description"
                                    className="form-control rounded-3"
                                    rows="4"
                                    placeholder="Describe your business..."
                                    value={formData.businessInfo.description}
                                    onChange={handleInputChange}
                                    style={{
                                        background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                        border: `1px solid ${currentTheme.border}`,
                                        color: currentTheme.text
                                    }}
                                />
                            </div>

                            <div className="col-12">
                                <h5 className="fw-bold mb-3" style={{ color: currentTheme.text }}>
                                    Social Media Links
                                </h5>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="input-group">
                                            <span 
                                                className="input-group-text rounded-start-3"
                                                style={{
                                                    background: currentTheme.primary + '20',
                                                    border: `1px solid ${currentTheme.border}`,
                                                    color: currentTheme.primary
                                                }}
                                            >
                                                <i className="fab fa-facebook"></i>
                                            </span>
                                            <input
                                                type="url"
                                                name="socialMedia.facebook"
                                                className="form-control rounded-end-3"
                                                placeholder="Facebook URL"
                                                value={formData.socialMedia.facebook}
                                                onChange={handleInputChange}
                                                style={{
                                                    background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                    border: `1px solid ${currentTheme.border}`,
                                                    color: currentTheme.text
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="input-group">
                                            <span 
                                                className="input-group-text rounded-start-3"
                                                style={{
                                                    background: currentTheme.primary + '20',
                                                    border: `1px solid ${currentTheme.border}`,
                                                    color: currentTheme.primary
                                                }}
                                            >
                                                <i className="fab fa-instagram"></i>
                                            </span>
                                            <input
                                                type="url"
                                                name="socialMedia.instagram"
                                                className="form-control rounded-end-3"
                                                placeholder="Instagram URL"
                                                value={formData.socialMedia.instagram}
                                                onChange={handleInputChange}
                                                style={{
                                                    background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                    border: `1px solid ${currentTheme.border}`,
                                                    color: currentTheme.text
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Preferences & Tags */}
                    {currentStep === 3 && (
                        <div className="row g-4">
                            <div className="col-12">
                                <h4 className="fw-bold mb-4" style={{ color: currentTheme.text }}>
                                    Preferences & Tags
                                </h4>
                            </div>

                            <div className="col-12">
                                <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    Preferred Categories
                                </label>
                                <div className="row g-3">
                                    {categories.map(category => (
                                        <div key={category.value} className="col-md-6 col-lg-4">
                                            <div
                                                className={`card h-100 border-0 rounded-3 cursor-pointer ${
                                                    formData.preferences.preferredCategories.includes(category.value) ? 'selected' : ''
                                                }`}
                                                style={{
                                                    background: formData.preferences.preferredCategories.includes(category.value)
                                                        ? currentTheme.primary + '20'
                                                        : currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                    border: formData.preferences.preferredCategories.includes(category.value)
                                                        ? `2px solid ${currentTheme.primary}`
                                                        : `1px solid ${currentTheme.border}`,
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => handleCategoryToggle(category.value)}
                                            >
                                                <div className="card-body p-3 text-center">
                                                    <h6 className="fw-semibold mb-0" style={{ color: currentTheme.text }}>
                                                        {category.label}
                                                    </h6>
                                                    {formData.preferences.preferredCategories.includes(category.value) && (
                                                        <i className="fas fa-check-circle mt-2" style={{ color: currentTheme.primary }}></i>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    Messaging Frequency
                                </label>
                                <select
                                    name="preferences.messagingFrequency"
                                    className="form-select py-3 rounded-3"
                                    value={formData.preferences.messagingFrequency}
                                    onChange={handleInputChange}
                                    style={{
                                        background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                        border: `1px solid ${currentTheme.border}`,
                                        color: currentTheme.text
                                    }}
                                >
                                    {messagingFrequencies.map(freq => (
                                        <option key={freq.value} value={freq.value}>{freq.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    Best Time to Send (Start - End)
                                </label>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <input
                                            type="time"
                                            value={formData.preferences.bestTimeToSend.start}
                                            onChange={(e) => handleNestedChange('preferences', 'bestTimeToSend', {
                                                ...formData.preferences.bestTimeToSend,
                                                start: e.target.value
                                            })}
                                            className="form-control py-3 rounded-3"
                                            style={{
                                                background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                border: `1px solid ${currentTheme.border}`,
                                                color: currentTheme.text
                                            }}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <input
                                            type="time"
                                            value={formData.preferences.bestTimeToSend.end}
                                            onChange={(e) => handleNestedChange('preferences', 'bestTimeToSend', {
                                                ...formData.preferences.bestTimeToSend,
                                                end: e.target.value
                                            })}
                                            className="form-control py-3 rounded-3"
                                            style={{
                                                background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                border: `1px solid ${currentTheme.border}`,
                                                color: currentTheme.text
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-12">
                                <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    Customer Tags
                                </label>
                                <div className="d-flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        className="form-control py-3 rounded-3"
                                        placeholder="Add a tag"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                        style={{
                                            background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                            border: `1px solid ${currentTheme.border}`,
                                            color: currentTheme.text
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddTag}
                                        className="btn rounded-3"
                                        style={{
                                            background: currentTheme.primary,
                                            border: 'none',
                                            color: '#ffffff',
                                            minWidth: '100px'
                                        }}
                                    >
                                        Add Tag
                                    </button>
                                </div>
                                <div className="d-flex flex-wrap gap-2">
                                    {formData.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="badge rounded-3 px-3 py-2 d-flex align-items-center gap-2"
                                            style={{
                                                background: currentTheme.secondary + '20',
                                                color: currentTheme.secondary,
                                                border: `1px solid ${currentTheme.secondary}40`,
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="btn-close btn-close-white"
                                                style={{ fontSize: '0.7rem' }}
                                            ></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="d-flex justify-content-between align-items-center mt-5 pt-4" style={{ borderTop: `1px solid ${currentTheme.border}` }}>
                        <div>
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="btn btn-lg rounded-3 px-4"
                                    style={{
                                        background: 'transparent',
                                        border: `2px solid ${currentTheme.border}`,
                                        color: currentTheme.text
                                    }}
                                >
                                    <i className="fas fa-arrow-left me-2"></i>
                                    Previous
                                </button>
                            )}
                        </div>

                        <div>
                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="btn btn-lg rounded-3 px-4"
                                    style={{
                                        background: currentTheme.primary,
                                        border: 'none',
                                        color: '#ffffff'
                                    }}
                                >
                                    Next
                                    <i className="fas fa-arrow-right ms-2"></i>
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-lg rounded-3 px-4"
                                    style={{
                                        background: currentTheme.success,
                                        border: 'none',
                                        color: '#ffffff'
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Adding Customer...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-user-plus me-2"></i>
                                            Add Customer
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </form>

            {/* Info Card */}
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
                        <i className="fas fa-info-circle me-3" style={{ color: currentTheme.info }}></i>
                        <div>
                            <h6 className="mb-1 fw-bold">💡 Customer Management Tips</h6>
                            <p className="mb-0 small">
                                • Use tags to group customers for targeted campaigns<br/>
                                • Set preferred categories to show relevant poster templates<br/>
                                • Configure messaging frequency to respect customer preferences<br/>
                                • Add complete business information for better personalization
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Customer;
