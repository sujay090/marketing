import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { customerAPI, posterAPI, scheduleAPI } from '../services/api';
import { toast } from 'react-toastify';

const BulkCampaign = () => {
    const { getCurrentTheme } = useTheme();
    const currentTheme = getCurrentTheme();

    const [customers, setCustomers] = useState([]);
    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const [category, setCategory] = useState('');
    const [selectedPoster, setSelectedPoster] = useState(null);
    const [availablePosters, setAvailablePosters] = useState([]);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [campaignName, setCampaignName] = useState('');
    const [customMessage, setCustomMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const categories = ['offers', 'events', 'festivals', 'announcements', 'promotions'];

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        if (category && selectedCustomers.length > 0) {
            fetchPosters();
        }
    }, [category, selectedCustomers]);

    const fetchCustomers = async () => {
        try {
            const response = await customerAPI.getCustomers();
            setCustomers(response.data || []);
        } catch (error) {
            toast.error('Failed to fetch customers');
        }
    };

    const fetchPosters = async () => {
        if (!selectedCustomers.length || !category) return;
        
        try {
            // Use first customer to get category posters
            const response = await posterAPI.getByCategory(category, selectedCustomers[0]);
            setAvailablePosters(response.data.posters || []);
        } catch (error) {
            toast.error('Failed to fetch posters');
            setAvailablePosters([]);
        }
    };

    const handleCustomerSelect = (customerId) => {
        setSelectedCustomers(prev => {
            if (prev.includes(customerId)) {
                return prev.filter(id => id !== customerId);
            } else {
                return [...prev, customerId];
            }
        });
    };

    const selectAllCustomers = () => {
        setSelectedCustomers(customers.map(c => c._id));
    };

    const deselectAllCustomers = () => {
        setSelectedCustomers([]);
    };

    const handleBulkSchedule = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const schedulePromises = selectedCustomers.map(async (customerId) => {
                const customer = customers.find(c => c._id === customerId);
                return scheduleAPI.create({
                    customerId: customerId,
                    customerPhoneNumber: `91${customer.whatsapp}`,
                    schedules: [{
                        posterId: selectedPoster._id,
                        categories: [category],
                        dates: [scheduleDate],
                        selectedPosterUrls: [selectedPoster.finalImagePath],
                        date: scheduleDate,
                        time: scheduleTime
                    }]
                });
            });

            await Promise.all(schedulePromises);
            
            toast.success(`Bulk campaign "${campaignName}" scheduled successfully for ${selectedCustomers.length} customers!`);
            resetForm();
            
        } catch (error) {
            toast.error('Failed to schedule bulk campaign');
            console.error('Bulk schedule error:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        if (!campaignName.trim()) {
            toast.error('Please enter campaign name');
            return false;
        }
        if (selectedCustomers.length === 0) {
            toast.error('Please select at least one customer');
            return false;
        }
        if (!category) {
            toast.error('Please select a category');
            return false;
        }
        if (!selectedPoster) {
            toast.error('Please select a poster');
            return false;
        }
        if (!scheduleDate) {
            toast.error('Please select schedule date');
            return false;
        }
        if (!scheduleTime) {
            toast.error('Please select schedule time');
            return false;
        }
        
        const scheduleDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
        if (scheduleDateTime <= new Date()) {
            toast.error('Schedule time must be in the future');
            return false;
        }
        
        return true;
    };

    const resetForm = () => {
        setSelectedCustomers([]);
        setCategory('');
        setSelectedPoster(null);
        setAvailablePosters([]);
        setScheduleDate('');
        setScheduleTime('');
        setCampaignName('');
        setCustomMessage('');
        setStep(1);
    };

    const nextStep = () => {
        if (step === 1 && selectedCustomers.length === 0) {
            toast.error('Please select at least one customer');
            return;
        }
        if (step === 2 && !category) {
            toast.error('Please select a category');
            return;
        }
        if (step === 3 && !selectedPoster) {
            toast.error('Please select a poster');
            return;
        }
        setStep(step + 1);
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div
                className="rounded-4 shadow-lg p-4 mb-4"
                style={{
                    background: currentTheme.surface,
                    border: `1px solid ${currentTheme.border}`,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)'
                }}
            >
                <div className="row align-items-center">
                    <div className="col-lg-8">
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="rounded-3 p-3 shadow-sm"
                                style={{ background: currentTheme.primary }}
                            >
                                <i className="fas fa-broadcast-tower" style={{ color: '#ffffff', fontSize: '2rem' }}></i>
                            </div>
                            <div>
                                <h1 className="fs-2 fw-bold mb-1" style={{ color: currentTheme.text }}>
                                    Bulk Campaign
                                </h1>
                                <p className="mb-0" style={{ color: currentTheme.textSecondary }}>
                                    Send personalized posters to multiple customers at once
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 text-end">
                        <div className="d-flex align-items-center justify-content-end gap-2">
                            {[1, 2, 3, 4].map((stepNumber) => (
                                <div
                                    key={stepNumber}
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        background: step >= stepNumber ? currentTheme.primary : currentTheme.border,
                                        color: step >= stepNumber ? '#ffffff' : currentTheme.textSecondary,
                                        fontSize: '0.9rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {stepNumber}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Step Content */}
            <div
                className="rounded-4 shadow-sm p-4"
                style={{
                    background: currentTheme.surface,
                    border: `1px solid ${currentTheme.border}`,
                    minHeight: '60vh'
                }}
            >
                {/* Step 1: Select Customers */}
                {step === 1 && (
                    <div>
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <h3 className="fw-bold" style={{ color: currentTheme.text }}>
                                Step 1: Select Customers
                            </h3>
                            <div className="d-flex gap-2">
                                <button
                                    onClick={selectAllCustomers}
                                    className="btn btn-sm rounded-3"
                                    style={{
                                        background: currentTheme.success + '20',
                                        border: `1px solid ${currentTheme.success}40`,
                                        color: currentTheme.success
                                    }}
                                >
                                    Select All
                                </button>
                                <button
                                    onClick={deselectAllCustomers}
                                    className="btn btn-sm rounded-3"
                                    style={{
                                        background: currentTheme.danger + '20',
                                        border: `1px solid ${currentTheme.danger}40`,
                                        color: currentTheme.danger
                                    }}
                                >
                                    Deselect All
                                </button>
                            </div>
                        </div>

                        <div className="row g-3">
                            {customers.map((customer) => (
                                <div key={customer._id} className="col-lg-4 col-md-6">
                                    <div
                                        className={`card h-100 border-0 rounded-4 shadow-sm cursor-pointer ${
                                            selectedCustomers.includes(customer._id) ? 'selected' : ''
                                        }`}
                                        style={{
                                            background: selectedCustomers.includes(customer._id)
                                                ? currentTheme.primary + '20'
                                                : currentTheme.surface,
                                            border: selectedCustomers.includes(customer._id)
                                                ? `2px solid ${currentTheme.primary}`
                                                : `1px solid ${currentTheme.border}`,
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onClick={() => handleCustomerSelect(customer._id)}
                                    >
                                        <div className="card-body p-3">
                                            <div className="d-flex align-items-center mb-3">
                                                <div
                                                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                                    style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        background: currentTheme.primary,
                                                        color: '#ffffff',
                                                        fontSize: '1.2rem',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {customer.companyName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-grow-1">
                                                    <h6 className="fw-bold mb-1" style={{ color: currentTheme.text }}>
                                                        {customer.companyName}
                                                    </h6>
                                                    <small style={{ color: currentTheme.textSecondary }}>
                                                        +91 {customer.whatsapp}
                                                    </small>
                                                </div>
                                                {selectedCustomers.includes(customer._id) && (
                                                    <i className="fas fa-check-circle" style={{ color: currentTheme.primary }}></i>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-4">
                            <p style={{ color: currentTheme.textSecondary }}>
                                Selected {selectedCustomers.length} of {customers.length} customers
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 2: Select Category */}
                {step === 2 && (
                    <div>
                        <h3 className="fw-bold mb-4" style={{ color: currentTheme.text }}>
                            Step 2: Select Category
                        </h3>

                        <div className="row g-4">
                            {categories.map((cat) => (
                                <div key={cat} className="col-lg-3 col-md-4 col-sm-6">
                                    <div
                                        className={`card h-100 border-0 rounded-4 shadow-sm cursor-pointer ${
                                            category === cat ? 'selected' : ''
                                        }`}
                                        style={{
                                            background: category === cat
                                                ? currentTheme.primary + '20'
                                                : currentTheme.surface,
                                            border: category === cat
                                                ? `2px solid ${currentTheme.primary}`
                                                : `1px solid ${currentTheme.border}`,
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onClick={() => setCategory(cat)}
                                    >
                                        <div className="card-body text-center p-4">
                                            <div
                                                className="rounded-3 d-inline-flex align-items-center justify-content-center mb-3"
                                                style={{
                                                    width: '60px',
                                                    height: '60px',
                                                    background: currentTheme.primary + '20'
                                                }}
                                            >
                                                <i 
                                                    className={`fas fa-${
                                                        cat === 'offers' ? 'tags' :
                                                        cat === 'events' ? 'calendar-star' :
                                                        cat === 'festivals' ? 'sparkles' :
                                                        cat === 'announcements' ? 'bullhorn' :
                                                        'percentage'
                                                    }`}
                                                    style={{ 
                                                        color: currentTheme.primary,
                                                        fontSize: '1.5rem'
                                                    }}
                                                ></i>
                                            </div>
                                            <h5 className="fw-bold mb-2" style={{ color: currentTheme.text }}>
                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </h5>
                                            {category === cat && (
                                                <i className="fas fa-check-circle" style={{ color: currentTheme.primary }}></i>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Select Poster */}
                {step === 3 && (
                    <div>
                        <h3 className="fw-bold mb-4" style={{ color: currentTheme.text }}>
                            Step 3: Select Poster Template
                        </h3>

                        {availablePosters.length > 0 ? (
                            <div className="row g-4">
                                {availablePosters.map((poster) => (
                                    <div key={poster._id} className="col-lg-3 col-md-4 col-sm-6">
                                        <div
                                            className={`card h-100 border-0 rounded-4 shadow-sm cursor-pointer ${
                                                selectedPoster?._id === poster._id ? 'selected' : ''
                                            }`}
                                            style={{
                                                background: selectedPoster?._id === poster._id
                                                    ? currentTheme.primary + '20'
                                                    : currentTheme.surface,
                                                border: selectedPoster?._id === poster._id
                                                    ? `2px solid ${currentTheme.primary}`
                                                    : `1px solid ${currentTheme.border}`,
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onClick={() => setSelectedPoster(poster)}
                                        >
                                            <div className="position-relative">
                                                <img
                                                    src={poster.imageUrl}
                                                    alt={poster.title || 'Poster'}
                                                    className="card-img-top rounded-top-4"
                                                    style={{ 
                                                        height: '200px', 
                                                        objectFit: 'cover' 
                                                    }}
                                                />
                                                {selectedPoster?._id === poster._id && (
                                                    <div
                                                        className="position-absolute top-0 end-0 m-2 rounded-circle d-flex align-items-center justify-content-center"
                                                        style={{
                                                            width: '30px',
                                                            height: '30px',
                                                            background: currentTheme.primary,
                                                            color: '#ffffff'
                                                        }}
                                                    >
                                                        <i className="fas fa-check"></i>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="card-body p-3">
                                                <h6 className="fw-bold mb-1" style={{ color: currentTheme.text }}>
                                                    {poster.title || `${category} Poster`}
                                                </h6>
                                                <small style={{ color: currentTheme.textSecondary }}>
                                                    {poster.placeholders?.length || 0} customizable fields
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-5">
                                <i 
                                    className="fas fa-image mb-3" 
                                    style={{ 
                                        fontSize: '3rem', 
                                        color: currentTheme.textSecondary + '60' 
                                    }}
                                ></i>
                                <p style={{ color: currentTheme.textSecondary }}>
                                    No posters available for {category} category
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 4: Schedule Details */}
                {step === 4 && (
                    <div>
                        <h3 className="fw-bold mb-4" style={{ color: currentTheme.text }}>
                            Step 4: Campaign Details
                        </h3>

                        <div className="row g-4">
                            <div className="col-lg-6">
                                <div
                                    className="rounded-4 p-4"
                                    style={{
                                        background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                        border: `1px solid ${currentTheme.border}`
                                    }}
                                >
                                    <h5 className="fw-bold mb-3" style={{ color: currentTheme.text }}>
                                        Campaign Information
                                    </h5>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                            Campaign Name *
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control py-3 rounded-3"
                                            placeholder="Enter campaign name"
                                            value={campaignName}
                                            onChange={(e) => setCampaignName(e.target.value)}
                                            style={{
                                                background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                border: `1px solid ${currentTheme.border}`,
                                                color: currentTheme.text
                                            }}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                            Schedule Date *
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control py-3 rounded-3"
                                            value={scheduleDate}
                                            onChange={(e) => setScheduleDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            style={{
                                                background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                border: `1px solid ${currentTheme.border}`,
                                                color: currentTheme.text
                                            }}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                            Schedule Time *
                                        </label>
                                        <input
                                            type="time"
                                            className="form-control py-3 rounded-3"
                                            value={scheduleTime}
                                            onChange={(e) => setScheduleTime(e.target.value)}
                                            style={{
                                                background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                border: `1px solid ${currentTheme.border}`,
                                                color: currentTheme.text
                                            }}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                            Custom Message (Optional)
                                        </label>
                                        <textarea
                                            className="form-control rounded-3"
                                            rows="3"
                                            placeholder="Add a custom message to be sent with the poster"
                                            value={customMessage}
                                            onChange={(e) => setCustomMessage(e.target.value)}
                                            style={{
                                                background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                border: `1px solid ${currentTheme.border}`,
                                                color: currentTheme.text
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-6">
                                <div
                                    className="rounded-4 p-4 h-100"
                                    style={{
                                        background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                        border: `1px solid ${currentTheme.border}`
                                    }}
                                >
                                    <h5 className="fw-bold mb-3" style={{ color: currentTheme.text }}>
                                        Campaign Summary
                                    </h5>

                                    <div className="d-flex align-items-center mb-3">
                                        <i className="fas fa-users me-3" style={{ color: currentTheme.primary }}></i>
                                        <div>
                                            <div className="fw-semibold" style={{ color: currentTheme.text }}>
                                                {selectedCustomers.length} Customers
                                            </div>
                                            <small style={{ color: currentTheme.textSecondary }}>
                                                Selected for this campaign
                                            </small>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center mb-3">
                                        <i className="fas fa-tags me-3" style={{ color: currentTheme.secondary }}></i>
                                        <div>
                                            <div className="fw-semibold" style={{ color: currentTheme.text }}>
                                                {category?.charAt(0).toUpperCase() + category?.slice(1)} Category
                                            </div>
                                            <small style={{ color: currentTheme.textSecondary }}>
                                                Poster category
                                            </small>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center mb-3">
                                        <i className="fas fa-calendar-alt me-3" style={{ color: currentTheme.success }}></i>
                                        <div>
                                            <div className="fw-semibold" style={{ color: currentTheme.text }}>
                                                {scheduleDate} at {scheduleTime}
                                            </div>
                                            <small style={{ color: currentTheme.textSecondary }}>
                                                Scheduled delivery time
                                            </small>
                                        </div>
                                    </div>

                                    {selectedPoster && (
                                        <div className="border rounded-3 p-3 text-center">
                                            <img
                                                src={selectedPoster.imageUrl}
                                                alt="Selected Poster"
                                                className="img-fluid rounded-3"
                                                style={{ maxHeight: '150px' }}
                                            />
                                            <p className="mb-0 mt-2" style={{ color: currentTheme.textSecondary }}>
                                                Selected Poster Template
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="d-flex justify-content-between align-items-center mt-4 pt-4" style={{ borderTop: `1px solid ${currentTheme.border}` }}>
                    <div>
                        {step > 1 && (
                            <button
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
                        {step < 4 ? (
                            <button
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
                                onClick={handleBulkSchedule}
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
                                        Scheduling...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-rocket me-2"></i>
                                        Launch Campaign
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkCampaign;
