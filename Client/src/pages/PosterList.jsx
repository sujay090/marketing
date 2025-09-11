import { useEffect, useState } from "react";
import { posterAPI, customerAPI, getImageUrl } from "../services/api";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext";

const PosterList = () => {
    const { getCurrentTheme } = useTheme();
    const currentTheme = getCurrentTheme();
    const [customerId, setCustomerId] = useState("");
    const [category, setCategory] = useState("");
    const [posters, setPosters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const categories = ["Offers", "Events", "Festivals"];

    const baseUrl = "https://marketing.gs3solution.us/api";

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await customerAPI.getCustomers();
                setCustomers(res.data);
            } catch (err) {
                toast.error("Failed to fetch customers");
            }
        };
        fetchCustomers();
    }, []);

    const fetchPosters = async () => {
        if (!customerId || !category) {
            toast.warn("Please select both customer and category");
            return;
        }

        setLoading(true);
        try {
            const res = await posterAPI.getByCategory(
                category.toLowerCase(),
                customerId
            );
            const data = res.data;

            if (Array.isArray(data)) {
                setPosters(data);
            } else if (Array.isArray(data.posters)) {
                setPosters(data.posters);
            } else {
                setPosters([]);
                toast.error("Unexpected API response format");
            }
        } catch (err) {
            toast.error("Failed to fetch posters");
            setPosters([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (posterId) => {
        if (!window.confirm("Are you sure you want to delete this poster?")) return;

        try {
            await posterAPI.deletePoster(posterId);
            toast.success("Poster deleted successfully");
            fetchPosters(); // Refresh posters
        } catch (err) {
            toast.error("Failed to delete poster");
        }
    };
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
                                style={{ background: currentTheme.primary }}
                            >
                                <i className="fas fa-images" style={{ color: '#ffffff', fontSize: '2rem' }}></i>
                            </div>
                            <div>
                                <h1 className="fs-2 fw-bold mb-1" style={{ color: currentTheme.text }}>
                                    Poster Gallery
                                </h1>
                                <p className="mb-0" style={{ color: currentTheme.textSecondary }}>
                                    Browse and manage your poster templates
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
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
                <div className="d-flex align-items-center mb-4">
                    <div
                        className="rounded-3 p-2 me-3"
                        style={{ background: currentTheme.primary }}
                    >
                        <i className="fas fa-filter" style={{ color: '#ffffff', fontSize: '1.2rem' }}></i>
                    </div>
                    <h3 className="fs-5 fw-bold mb-0" style={{ color: currentTheme.text }}>
                        Filter Posters
                    </h3>
                </div>

                <div className="row g-3">
                    <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                            Select Customer
                        </label>
                        <select
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            className="form-select py-3 rounded-3"
                            style={{
                                background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                border: `1px solid ${currentTheme.border}`,
                                color: currentTheme.text,
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)'
                            }}
                        >
                            <option value="">-- Choose Customer --</option>
                            {customers.map((cust) => (
                                <option key={cust._id} value={cust._id}>
                                    {cust.companyName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                            Select Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="form-select py-3 rounded-3"
                            style={{
                                background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                border: `1px solid ${currentTheme.border}`,
                                color: currentTheme.text,
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)'
                            }}
                        >
                            <option value="">-- Choose Category --</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    🎯 {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold" style={{ color: 'transparent' }}>
                            Action
                        </label>
                        <button
                            onClick={fetchPosters}
                            disabled={loading}
                            className={`btn w-100 py-3 fw-semibold rounded-3 shadow-sm ${loading ? 'disabled' : ''
                                }`}
                            style={{
                                background: loading ?
                                    currentTheme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' :
                                    currentTheme.primary,
                                border: 'none',
                                color: loading ? currentTheme.textSecondary : '#ffffff',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease'
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
                        >
                            {loading ? (
                                <>
                                    <div className="spinner-border spinner-border-sm me-2" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-search me-2"></i>
                                    Fetch Posters
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {Array.isArray(posters) && posters.length === 0 && !loading && (
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
                    <div
                        className="rounded-circle p-4 mx-auto mb-4 d-flex align-items-center justify-content-center"
                        style={{
                            background: currentTheme.primary + '20',
                            border: `2px solid ${currentTheme.primary}30`,
                            width: '120px',
                            height: '120px'
                        }}
                    >
                        <i className="fas fa-image" style={{ fontSize: '3rem', color: currentTheme.primary }}></i>
                    </div>
                    <h3 className="fs-4 fw-bold mb-3" style={{ color: currentTheme.text }}>
                        No posters found
                    </h3>
                    <p className="mb-4" style={{ color: currentTheme.textSecondary }}>
                        Select customer and category to view available posters.
                    </p>
                </div>
            )}

            {/* Posters Grid */}
            {Array.isArray(posters) && posters.length > 0 && (
                <div className="row g-4">
                    {posters.map((poster) => {
                        const imageUrl = getImageUrl(poster.imageUrl);

                        return (
                            <div key={poster._id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                                <div
                                    className="rounded-4 shadow-lg overflow-hidden h-100"
                                    style={{
                                        background: currentTheme.surface,
                                        border: `1px solid ${currentTheme.border}`,
                                        backdropFilter: 'blur(20px)',
                                        WebkitBackdropFilter: 'blur(20px)',
                                        boxShadow: currentTheme.shadow,
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-8px)';
                                        e.currentTarget.style.boxShadow = currentTheme.shadow;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {/* Image Container */}
                                    <div className="position-relative">
                                        <img
                                            src={imageUrl || "https://dummyimage.com/300x300/cccccc/666666&text=No+Image"}
                                            alt="Poster"
                                            className="w-100"
                                            style={{
                                                height: '300px',
                                                objectFit: 'cover',
                                                borderBottom: `1px solid ${currentTheme.border}`
                                            }}
                                            onError={(e) => {
                                                if (e.target.src !== "https://dummyimage.com/300x300/cccccc/666666&text=No+Image") {
                                                    e.target.src = "https://dummyimage.com/300x300/cccccc/666666&text=No+Image";
                                                }
                                            }}
                                        />

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => handleDelete(poster._id)}
                                            className="btn position-absolute top-0 end-0 m-3 rounded-3 shadow-sm"
                                            style={{
                                                background: currentTheme.danger + '90',
                                                border: `1px solid ${currentTheme.danger}`,
                                                color: '#ffffff',
                                                width: '40px',
                                                height: '40px',
                                                transition: 'all 0.3s ease',
                                                backdropFilter: 'blur(10px)',
                                                WebkitBackdropFilter: 'blur(10px)'
                                            }}
                                            title="Delete Poster"
                                            onMouseEnter={(e) => {
                                                e.target.style.background = currentTheme.danger;
                                                e.target.style.transform = 'scale(1.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background = currentTheme.danger + '90';
                                                e.target.style.transform = 'scale(1)';
                                            }}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <span
                                                className="badge rounded-3 px-3 py-2"
                                                style={{
                                                    background: currentTheme.primary + '20',
                                                    color: currentTheme.primary,
                                                    border: `1px solid ${currentTheme.primary}40`,
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                {poster.category}
                                            </span>
                                            <div
                                                className="rounded-3 px-3 py-2"
                                                style={{
                                                    background: currentTheme.success + '20',
                                                    color: currentTheme.success,
                                                    border: `1px solid ${currentTheme.success}40`,
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                <i className="fas fa-check-circle me-1"></i>
                                                Active
                                            </div>
                                        </div>

                                        {poster.customizedData && (
                                            <div>
                                                <h6 className="fw-bold mb-2" style={{ color: currentTheme.text }}>
                                                    Template Fields:
                                                </h6>
                                                <div className="d-flex flex-column gap-2">
                                                    {Object.entries(poster.customizedData).map(
                                                        ([key, value]) => (
                                                            <div
                                                                key={key}
                                                                className="rounded-3 px-3 py-2"
                                                                style={{
                                                                    background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                                    border: `1px solid ${currentTheme.border}`,
                                                                    borderLeft: `4px solid ${currentTheme.accent}`
                                                                }}
                                                            >
                                                                <small
                                                                    className="text-uppercase fw-bold d-block"
                                                                    style={{
                                                                        color: currentTheme.textSecondary,
                                                                        fontSize: '0.7rem',
                                                                        letterSpacing: '0.5px'
                                                                    }}
                                                                >
                                                                    {key}
                                                                </small>
                                                                <div style={{ color: currentTheme.text, fontSize: '0.9rem' }}>
                                                                    {value.value}
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Footer Actions */}
                                        <div className="d-flex justify-content-between align-items-center mt-4 pt-3" style={{ borderTop: `1px solid ${currentTheme.border}` }}>
                                            <small style={{ color: currentTheme.textSecondary }}>
                                                <i className="fas fa-calendar me-1"></i>
                                                Template
                                            </small>
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-sm rounded-3"
                                                    style={{
                                                        background: currentTheme.info + '20',
                                                        border: `1px solid ${currentTheme.info}40`,
                                                        color: currentTheme.info,
                                                        padding: '0.3rem 0.8rem'
                                                    }}
                                                    title="Preview"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm rounded-3"
                                                    style={{
                                                        background: currentTheme.success + '20',
                                                        border: `1px solid ${currentTheme.success}40`,
                                                        color: currentTheme.success,
                                                        padding: '0.3rem 0.8rem'
                                                    }}
                                                    title="Download"
                                                    onClick={() => {
                                                        const downloadUrl = getImageUrl(poster.imageUrl);
                                                        if (downloadUrl) {
                                                            const link = document.createElement('a');
                                                            link.href = downloadUrl;
                                                            link.download = `poster-${poster.category}.jpg`;
                                                            link.target = '_blank';
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            document.body.removeChild(link);
                                                        }
                                                    }}
                                                >
                                                    <i className="fas fa-download"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PosterList;
