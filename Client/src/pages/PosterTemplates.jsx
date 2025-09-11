import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { posterAPI, customerAPI } from '../services/api';
import { toast } from 'react-toastify';

const PosterTemplates = () => {
    const { getCurrentTheme } = useTheme();
    const currentTheme = getCurrentTheme();

    const [templates, setTemplates] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [loading, setLoading] = useState(false);
    const [previewPoster, setPreviewPoster] = useState(null);
    const [generateLoading, setGenerateLoading] = useState(false);
    const [generatedPosters, setGeneratedPosters] = useState([]);

    const categories = [
        { value: 'offers', label: 'Offers & Discounts', icon: 'fas fa-tags', color: '#e74c3c' },
        { value: 'events', label: 'Events', icon: 'fas fa-calendar-star', color: '#3498db' },
        { value: 'festivals', label: 'Festivals', icon: 'fas fa-sparkles', color: '#f39c12' },
        { value: 'announcements', label: 'Announcements', icon: 'fas fa-bullhorn', color: '#9b59b6' },
        { value: 'promotions', label: 'Promotions', icon: 'fas fa-percentage', color: '#27ae60' }
    ];

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            fetchTemplates();
        }
    }, [selectedCategory]);

    const fetchCustomers = async () => {
        try {
            const response = await customerAPI.getCustomers();
            setCustomers(response.data || []);
        } catch (error) {
            toast.error('Failed to fetch customers');
        }
    };

    const fetchTemplates = async () => {
        if (!selectedCategory) return;
        
        setLoading(true);
        try {
            // For demo purposes, we'll use mock templates
            // In real app, this would fetch from templates API
            const mockTemplates = [
                {
                    _id: '1',
                    title: `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Template 1`,
                    category: selectedCategory,
                    imageUrl: `https://picsum.photos/300/400?random=${Math.random()}`,
                    placeholders: [
                        { key: 'companyName', x: 50, y: 50, width: 200, height: 30 },
                        { key: 'whatsapp', x: 50, y: 100, width: 200, height: 30 }
                    ],
                    tags: ['modern', 'professional'],
                    pricing: { price: 0, currency: 'FREE' },
                    isPublic: true
                },
                {
                    _id: '2',
                    title: `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Template 2`,
                    category: selectedCategory,
                    imageUrl: `https://picsum.photos/300/400?random=${Math.random()}`,
                    placeholders: [
                        { key: 'companyName', x: 60, y: 60, width: 180, height: 25 },
                        { key: 'website', x: 60, y: 120, width: 180, height: 25 }
                    ],
                    tags: ['creative', 'colorful'],
                    pricing: { price: 99, currency: 'INR' },
                    isPublic: true
                },
                {
                    _id: '3',
                    title: `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Template 3`,
                    category: selectedCategory,
                    imageUrl: `https://picsum.photos/300/400?random=${Math.random()}`,
                    placeholders: [
                        { key: 'companyName', x: 70, y: 80, width: 160, height: 35 },
                        { key: 'whatsapp', x: 70, y: 140, width: 160, height: 20 }
                    ],
                    tags: ['elegant', 'minimal'],
                    pricing: { price: 149, currency: 'INR' },
                    isPublic: true
                }
            ];
            
            setTemplates(mockTemplates);
        } catch (error) {
            toast.error('Failed to fetch templates');
            setTemplates([]);
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePoster = async (template) => {
        if (!selectedCustomer) {
            toast.error('Please select a customer first');
            return;
        }

        setGenerateLoading(true);
        try {
            const customer = customers.find(c => c._id === selectedCustomer);
            if (!customer) {
                toast.error('Customer not found');
                return;
            }

            // Generate poster with customer data
            const response = await posterAPI.getByCategory(selectedCategory, selectedCustomer);
            
            if (response.data && response.data.posters) {
                setGeneratedPosters(response.data.posters);
                toast.success('Poster generated successfully!');
            }

        } catch (error) {
            toast.error('Failed to generate poster');
        } finally {
            setGenerateLoading(false);
        }
    };

    const handleBulkGenerate = async () => {
        if (!selectedCategory || customers.length === 0) {
            toast.error('Please select category and ensure customers exist');
            return;
        }

        setGenerateLoading(true);
        try {
            const generatePromises = customers.slice(0, 5).map(customer => 
                posterAPI.getByCategory(selectedCategory, customer._id)
            );

            const results = await Promise.all(generatePromises);
            const allPosters = results.flatMap(result => result.data.posters || []);
            
            setGeneratedPosters(allPosters);
            toast.success(`Generated ${allPosters.length} posters for ${customers.slice(0, 5).length} customers!`);

        } catch (error) {
            toast.error('Failed to generate bulk posters');
        } finally {
            setGenerateLoading(false);
        }
    };

    const downloadPoster = (posterUrl, posterName) => {
        const link = document.createElement('a');
        link.href = posterUrl;
        link.download = posterName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Poster download started!');
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
                                <i className="fas fa-layer-group" style={{ color: '#ffffff', fontSize: '2rem' }}></i>
                            </div>
                            <div>
                                <h1 className="fs-2 fw-bold mb-1" style={{ color: currentTheme.text }}>
                                    Poster Templates
                                </h1>
                                <p className="mb-0" style={{ color: currentTheme.textSecondary }}>
                                    Browse and customize professional poster templates
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 text-end">
                        <div className="d-flex align-items-center justify-content-end gap-2">
                            <button
                                onClick={handleBulkGenerate}
                                disabled={!selectedCategory || generateLoading}
                                className="btn rounded-3"
                                style={{
                                    background: currentTheme.success,
                                    border: 'none',
                                    color: '#ffffff'
                                }}
                            >
                                {generateLoading ? (
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                ) : (
                                    <i className="fas fa-magic me-2"></i>
                                )}
                                Bulk Generate
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Selection */}
            <div
                className="rounded-4 shadow-sm p-4 mb-4"
                style={{
                    background: currentTheme.surface,
                    border: `1px solid ${currentTheme.border}`
                }}
            >
                <h4 className="fw-bold mb-3" style={{ color: currentTheme.text }}>
                    Select Category
                </h4>
                <div className="row g-3">
                    {categories.map((category) => (
                        <div key={category.value} className="col-lg-2 col-md-4 col-sm-6">
                            <div
                                className={`card h-100 border-0 rounded-3 cursor-pointer ${
                                    selectedCategory === category.value ? 'selected' : ''
                                }`}
                                style={{
                                    background: selectedCategory === category.value
                                        ? category.color + '20'
                                        : currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                    border: selectedCategory === category.value
                                        ? `2px solid ${category.color}`
                                        : `1px solid ${currentTheme.border}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={() => setSelectedCategory(category.value)}
                            >
                                <div className="card-body text-center p-3">
                                    <i 
                                        className={category.icon + ' mb-2'} 
                                        style={{ 
                                            fontSize: '2rem', 
                                            color: selectedCategory === category.value ? category.color : currentTheme.textSecondary 
                                        }}
                                    ></i>
                                    <h6 className="fw-semibold mb-0" style={{ color: currentTheme.text }}>
                                        {category.label}
                                    </h6>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Customer Selection */}
            {selectedCategory && (
                <div
                    className="rounded-4 shadow-sm p-4 mb-4"
                    style={{
                        background: currentTheme.surface,
                        border: `1px solid ${currentTheme.border}`
                    }}
                >
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <h5 className="fw-bold mb-3" style={{ color: currentTheme.text }}>
                                Select Customer (Optional)
                            </h5>
                            <select
                                value={selectedCustomer}
                                onChange={(e) => setSelectedCustomer(e.target.value)}
                                className="form-select py-3 rounded-3"
                                style={{
                                    background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                    border: `1px solid ${currentTheme.border}`,
                                    color: currentTheme.text
                                }}
                            >
                                <option value="">Select customer for personalization</option>
                                {customers.map((customer) => (
                                    <option key={customer._id} value={customer._id}>
                                        {customer.companyName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4 text-end">
                            {selectedCustomer && (
                                <div
                                    className="rounded-3 p-3"
                                    style={{
                                        background: currentTheme.primary + '20',
                                        border: `1px solid ${currentTheme.primary}40`
                                    }}
                                >
                                    <small style={{ color: currentTheme.primary }}>
                                        <i className="fas fa-user me-2"></i>
                                        {customers.find(c => c._id === selectedCustomer)?.companyName}
                                    </small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Templates Grid */}
            {selectedCategory && (
                <div
                    className="rounded-4 shadow-sm p-4 mb-4"
                    style={{
                        background: currentTheme.surface,
                        border: `1px solid ${currentTheme.border}`
                    }}
                >
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <h4 className="fw-bold mb-0" style={{ color: currentTheme.text }}>
                            Available Templates
                        </h4>
                        <span className="badge rounded-3 px-3 py-2" style={{
                            background: currentTheme.info + '20',
                            color: currentTheme.info,
                            border: `1px solid ${currentTheme.info}40`
                        }}>
                            {templates.length} templates found
                        </span>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div 
                                className="spinner-border mb-3"
                                style={{ color: currentTheme.primary }}
                            />
                            <p style={{ color: currentTheme.textSecondary }}>Loading templates...</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {templates.map((template) => (
                                <div key={template._id} className="col-lg-3 col-md-4 col-sm-6">
                                    <div
                                        className="card h-100 border-0 rounded-4 shadow-sm position-relative overflow-hidden"
                                        style={{
                                            background: currentTheme.surface,
                                            border: `1px solid ${currentTheme.border}`,
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-10px)';
                                            e.currentTarget.style.boxShadow = currentTheme.shadow;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        {/* Pricing Badge */}
                                        <div
                                            className="position-absolute top-0 end-0 m-3 badge rounded-3 px-3 py-2"
                                            style={{
                                                background: template.pricing.price === 0 ? currentTheme.success : currentTheme.warning,
                                                color: '#ffffff',
                                                fontSize: '0.8rem',
                                                zIndex: 2
                                            }}
                                        >
                                            {template.pricing.price === 0 ? 'FREE' : `₹${template.pricing.price}`}
                                        </div>

                                        <div className="position-relative">
                                            <img
                                                src={template.imageUrl}
                                                alt={template.title}
                                                className="card-img-top"
                                                style={{ 
                                                    height: '250px', 
                                                    objectFit: 'cover',
                                                    cursor: 'pointer' 
                                                }}
                                                onClick={() => setPreviewPoster(template)}
                                            />
                                            <div
                                                className="position-absolute bottom-0 start-0 end-0 p-3"
                                                style={{
                                                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                                                    color: '#ffffff'
                                                }}
                                            >
                                                <h6 className="fw-bold mb-1">{template.title}</h6>
                                                <small>
                                                    <i className="fas fa-layer-group me-1"></i>
                                                    {template.placeholders.length} fields
                                                </small>
                                            </div>
                                        </div>

                                        <div className="card-body p-3">
                                            <div className="d-flex flex-wrap gap-1 mb-3">
                                                {template.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="badge rounded-2"
                                                        style={{
                                                            background: currentTheme.secondary + '20',
                                                            color: currentTheme.secondary,
                                                            fontSize: '0.7rem'
                                                        }}
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="d-flex gap-2">
                                                <button
                                                    onClick={() => setPreviewPoster(template)}
                                                    className="btn btn-sm flex-grow-1 rounded-3"
                                                    style={{
                                                        background: currentTheme.primary + '20',
                                                        border: `1px solid ${currentTheme.primary}40`,
                                                        color: currentTheme.primary
                                                    }}
                                                >
                                                    <i className="fas fa-eye me-1"></i>
                                                    Preview
                                                </button>
                                                <button
                                                    onClick={() => handleGeneratePoster(template)}
                                                    disabled={generateLoading}
                                                    className="btn btn-sm flex-grow-1 rounded-3"
                                                    style={{
                                                        background: currentTheme.success,
                                                        border: 'none',
                                                        color: '#ffffff'
                                                    }}
                                                >
                                                    {generateLoading ? (
                                                        <span className="spinner-border spinner-border-sm"></span>
                                                    ) : (
                                                        <>
                                                            <i className="fas fa-magic me-1"></i>
                                                            Generate
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Generated Posters */}
            {generatedPosters.length > 0 && (
                <div
                    className="rounded-4 shadow-sm p-4"
                    style={{
                        background: currentTheme.surface,
                        border: `1px solid ${currentTheme.border}`
                    }}
                >
                    <h4 className="fw-bold mb-4" style={{ color: currentTheme.text }}>
                        Generated Posters
                    </h4>
                    <div className="row g-4">
                        {generatedPosters.map((poster, index) => (
                            <div key={index} className="col-lg-3 col-md-4 col-sm-6">
                                <div
                                    className="card border-0 rounded-4 shadow-sm"
                                    style={{
                                        background: currentTheme.surface,
                                        border: `1px solid ${currentTheme.border}`
                                    }}
                                >
                                    <img
                                        src={poster.imageUrl}
                                        alt="Generated Poster"
                                        className="card-img-top rounded-top-4"
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                    <div className="card-body p-3">
                                        <h6 className="fw-bold mb-2" style={{ color: currentTheme.text }}>
                                            {poster.customizedData?.companyName?.value || 'Generated Poster'}
                                        </h6>
                                        <button
                                            onClick={() => downloadPoster(poster.imageUrl, `poster-${index + 1}.jpg`)}
                                            className="btn btn-sm w-100 rounded-3"
                                            style={{
                                                background: currentTheme.primary,
                                                border: 'none',
                                                color: '#ffffff'
                                            }}
                                        >
                                            <i className="fas fa-download me-2"></i>
                                            Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewPoster && (
                <div
                    className="modal show d-block"
                    style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
                    onClick={() => setPreviewPoster(null)}
                >
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div
                            className="modal-content border-0 rounded-4"
                            style={{
                                background: currentTheme.surface,
                                border: `1px solid ${currentTheme.border}`
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header border-0 p-4">
                                <h5 className="modal-title fw-bold" style={{ color: currentTheme.text }}>
                                    {previewPoster.title}
                                </h5>
                                <button
                                    onClick={() => setPreviewPoster(null)}
                                    className="btn-close"
                                ></button>
                            </div>
                            <div className="modal-body p-4 text-center">
                                <img
                                    src={previewPoster.imageUrl}
                                    alt={previewPoster.title}
                                    className="img-fluid rounded-3 mb-3"
                                    style={{ maxHeight: '500px' }}
                                />
                                <div className="d-flex justify-content-center gap-3">
                                    <button
                                        onClick={() => handleGeneratePoster(previewPoster)}
                                        disabled={generateLoading}
                                        className="btn btn-lg rounded-3"
                                        style={{
                                            background: currentTheme.primary,
                                            border: 'none',
                                            color: '#ffffff'
                                        }}
                                    >
                                        {generateLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-magic me-2"></i>
                                                Generate This Template
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PosterTemplates;
