import React, { useEffect, useState } from "react";
import { scheduleAPI, getImageUrl } from "../services/api";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext";

// ✅ IST time formatter
const formatDateTimeIST = (utcDateStr) => {
    const date = new Date(utcDateStr);

    const dateStr = date.toLocaleDateString("en-IN", {
        timeZone: "UTC",
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    const timeStr = date.toLocaleTimeString("en-IN", {
        timeZone: "UTC",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    return { dateStr, timeStr };
};

const ScheduleList = () => {
    const { getCurrentTheme } = useTheme();
    const currentTheme = getCurrentTheme();
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [searchName, setSearchName] = useState("");
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [posterDetails, setPosterDetails] = useState({});

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            let url = "/schedules?includePosters=true";
            const params = new URLSearchParams();

            if (fromDate) params.append("fromDate", fromDate);
            if (toDate) params.append("toDate", toDate);
            if (searchName) params.append("name", searchName);

            if (params.toString()) {
                url += `&${params.toString()}`;
            }

            const response = await scheduleAPI.getAllSchedules(url);

            console.log("Full API Response:", response); // Debug log
            console.log("Response data:", response.data); // Debug response data

            // Extract schedules data from axios response
            const schedulesData = Array.isArray(response.data) ? response.data : [];

            console.log("Schedules data extracted:", schedulesData); // Debug extracted data
            console.log("Poster details check:", schedulesData.map(s => ({
                id: s._id,
                posterId: s.posterId,
                poster: s.poster,
                customerName: s.customerId?.companyName
            }))); // Debug poster data

            // Sort schedules - upcoming schedules first, then past schedules (latest first)
            const sortedSchedules = schedulesData.sort((a, b) => {
                const dateA = new Date(a.date + 'T' + (a.time || '00:00'));
                const dateB = new Date(b.date + 'T' + (b.time || '00:00'));
                const now = new Date();

                // If both are in future, show nearest first
                if (dateA >= now && dateB >= now) {
                    return dateA - dateB;
                }
                // If both are in past, show latest first  
                if (dateA < now && dateB < now) {
                    return dateB - dateA;
                }
                // Future dates come before past dates
                return dateA >= now ? -1 : 1;
            });

            setSchedules(sortedSchedules);

            // Store poster details for quick access
            const posterMap = {};
            sortedSchedules.forEach(schedule => {
                // Check for poster in the enhanced response from backend
                if (schedule.poster) {
                    posterMap[schedule._id] = schedule.poster;
                }
            });
            setPosterDetails(posterMap);

            console.log("Final schedules with poster info:", sortedSchedules); // Debug final schedules
            console.log("Final poster map:", posterMap); // Debug final poster mapping

        } catch (error) {
            console.error("Error fetching schedules:", error);
            console.error("Error details:", error.response?.data); // Log error response details
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, []);

    const getStatus = (date, scheduleStatus) => {
        // If we have actual schedule status from API, use that
        if (scheduleStatus) {
            return scheduleStatus;
        }

        // Otherwise, calculate based on date
        const scheduleDate = new Date(date).toISOString().split("T")[0];
        const today = new Date().toISOString().split("T")[0];
        if (scheduleDate === today) return "Live";
        return scheduleDate > today ? "Upcoming" : "Expired";
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "Live":
            case "Sent":
                return "bg-green-500/20 text-green-300 border-green-500/30";
            case "Upcoming":
            case "Pending":
                return "bg-blue-500/20 text-blue-300 border-blue-500/30";
            case "Expired":
            case "Failed":
                return "bg-red-500/20 text-red-300 border-red-500/30";
            default:
                return "bg-gray-500/20 text-gray-300 border-gray-500/30";
        }
    };

    const handleEdit = (schedule) => {
        setEditingSchedule({
            ...schedule,
            date: new Date(schedule.date).toISOString().split('T')[0],
            time: schedule.time
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        try {
            const updatedSchedule = {
                ...editingSchedule,
                date: new Date(editingSchedule.date + 'T' + editingSchedule.time),
            };

            await scheduleAPI.updateSchedule(editingSchedule._id, updatedSchedule);
            setIsEditModalOpen(false);
            setEditingSchedule(null);
            fetchSchedules();
            alert("Schedule updated successfully!");
        } catch (error) {
            console.error("Error updating schedule:", error);
            alert("Error updating schedule");
        }
    };

    const downloadPoster = async (posterImageUrl, posterName = 'poster') => {
        try {
            const fullUrl = getImageUrl(posterImageUrl);
            if (!fullUrl) {
                toast.error('Invalid poster URL');
                return;
            }

            console.log('Downloading poster from:', fullUrl);

            // Create a temporary link element for download
            const link = document.createElement('a');
            link.href = fullUrl;
            link.download = `${posterName || 'poster'}.png`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Poster download started!');
        } catch (error) {
            console.error('Error downloading poster:', error);
            toast.error(`Error downloading poster: ${error.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this schedule?"))
            return;
        try {
            await scheduleAPI.deleteSchedule(id);
            toast.success("Schedule deleted successfully");
            fetchSchedules();
        } catch (error) {
            toast.error("Failed to delete schedule");
        }
    };

    const resetFilters = () => {
        setSearchName("");
        setFromDate("");
        setToDate("");
    };

    const filteredSchedules = schedules.filter((schedule) => {
        const scheduleDate = new Date(schedule.date).toISOString().split("T")[0];
        const matchesName = schedule.customerId?.companyName
            ?.toLowerCase()
            .includes(searchName.toLowerCase());
        const withinRange =
            (!fromDate || scheduleDate >= fromDate) &&
            (!toDate || scheduleDate <= toDate);
        return matchesName && withinRange;
    });

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
                                <i className="fas fa-calendar-check" style={{ color: '#ffffff', fontSize: '2rem' }}></i>
                            </div>
                            <div>
                                <h1 className="fs-2 fw-bold mb-1" style={{ color: currentTheme.text }}>
                                    Schedule Management
                                </h1>
                                <p className="mb-0" style={{ color: currentTheme.textSecondary }}>
                                    Monitor and manage your poster campaigns
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-lg-4">
                        <div className="d-flex gap-2">
                            <button
                                onClick={resetFilters}
                                className="btn px-4 py-2 fw-semibold rounded-3 shadow-sm"
                                style={{
                                    background: currentTheme.warning + '20',
                                    border: `1px solid ${currentTheme.warning}40`,
                                    color: currentTheme.warning,
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = currentTheme.warning + '30';
                                    e.target.style.transform = 'scale(1.02)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = currentTheme.warning + '20';
                                    e.target.style.transform = 'scale(1)';
                                }}
                            >
                                <i className="fas fa-redo me-2"></i>
                                Reset Filters
                            </button>
                            <button
                                onClick={fetchSchedules}
                                disabled={loading}
                                className="btn px-4 py-2 fw-semibold rounded-3 shadow-sm"
                                style={{
                                    background: loading ?
                                        currentTheme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' :
                                        currentTheme.success,
                                    border: 'none',
                                    color: loading ? currentTheme.textSecondary : '#ffffff',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {loading ? (
                                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                ) : (
                                    <i className="fas fa-sync me-2"></i>
                                )}
                                Refresh
                            </button>
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
                        Filter & Search
                    </h3>
                </div>

                <div className="row g-3">
                    <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                            Customer Name
                        </label>
                        <div className="position-relative">
                            <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                                <i className="fas fa-user" style={{ color: currentTheme.textSecondary }}></i>
                            </div>
                            <input
                                type="text"
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                placeholder="Search customer..."
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

                    <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                            From Date
                        </label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="form-control py-3 rounded-3"
                            style={{
                                background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                border: `1px solid ${currentTheme.border}`,
                                color: currentTheme.text,
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)'
                            }}
                        />
                    </div>

                    <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                            To Date
                        </label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="form-control py-3 rounded-3"
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
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="container-fluid py-4 d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
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
                            Loading schedules...
                        </p>
                    </div>
                </div>
            ) : filteredSchedules.length === 0 ? (
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
                        <i className="fas fa-calendar-times" style={{ fontSize: '3rem', color: currentTheme.primary }}></i>
                    </div>
                    <h3 className="fs-4 fw-bold mb-3" style={{ color: currentTheme.text }}>
                        No schedules found
                    </h3>
                    <p className="mb-4" style={{ color: currentTheme.textSecondary }}>
                        Try adjusting your search filters or create a new schedule.
                    </p>
                </div>
            ) : (
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
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead
                                className="border-bottom"
                                style={{
                                    background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                    borderColor: currentTheme.border
                                }}
                            >
                                <tr>
                                    <th className="px-4 py-4 fw-semibold" style={{ color: currentTheme.text }}>Customer</th>
                                    <th className="px-4 py-4 fw-semibold" style={{ color: currentTheme.text }}>Category</th>
                                    <th className="px-4 py-4 fw-semibold" style={{ color: currentTheme.text }}>Date</th>
                                    <th className="px-4 py-4 fw-semibold" style={{ color: currentTheme.text }}>Time</th>
                                    <th className="px-4 py-4 fw-semibold" style={{ color: currentTheme.text }}>Poster</th>
                                    <th className="px-4 py-4 fw-semibold" style={{ color: currentTheme.text }}>Status</th>
                                    <th className="px-4 py-4 fw-semibold text-end" style={{ color: currentTheme.text }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSchedules.map((schedule, index) => {
                                    const { dateStr, timeStr } = formatDateTimeIST(schedule.date);
                                    const status = getStatus(schedule.date, schedule.status);

                                    const getStatusStyle = () => {
                                        switch (status) {
                                            case "Live":
                                            case "Sent":
                                                return { background: currentTheme.success + '20', color: currentTheme.success };
                                            case "Upcoming":
                                            case "Pending":
                                                return { background: currentTheme.primary + '20', color: currentTheme.primary };
                                            case "Expired":
                                            case "Failed":
                                                return { background: currentTheme.danger + '20', color: currentTheme.danger };
                                            default:
                                                return { background: currentTheme.textSecondary + '20', color: currentTheme.textSecondary };
                                        }
                                    };

                                    return (
                                        <tr
                                            key={schedule._id}
                                            className="border-bottom"
                                            style={{
                                                borderColor: currentTheme.border,
                                                transition: 'background-color 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            <td className="px-4 py-4">
                                                <div className="d-flex align-items-center">
                                                    <div
                                                        className="rounded-3 d-flex align-items-center justify-content-center me-3 fw-bold"
                                                        style={{
                                                            width: '50px',
                                                            height: '50px',
                                                            background: currentTheme.primary + '20',
                                                            color: currentTheme.primary,
                                                            fontSize: '1.2rem'
                                                        }}
                                                    >
                                                        {(schedule.customerId?.companyName || 'N/A').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold" style={{ color: currentTheme.text }}>
                                                            {schedule.customerId?.companyName || 'N/A'}
                                                        </div>
                                                        <small style={{ color: currentTheme.textSecondary }}>
                                                            Schedule #{index + 1}
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <span
                                                    className="badge rounded-3 px-3 py-2"
                                                    style={{
                                                        background: currentTheme.info + '20',
                                                        color: currentTheme.info,
                                                        border: `1px solid ${currentTheme.info}40`
                                                    }}
                                                >
                                                    {schedule.category}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="d-flex align-items-center">
                                                    <i className="fas fa-calendar me-2" style={{ color: currentTheme.textSecondary }}></i>
                                                    <span style={{ color: currentTheme.text }}>{schedule.date}</span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="d-flex align-items-center">
                                                    <i className="fas fa-clock me-2" style={{ color: currentTheme.textSecondary }}></i>
                                                    <span style={{ color: currentTheme.text }}>{schedule.time}</span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                {schedule.poster ? (
                                                    <div className="d-flex align-items-center gap-2">
                                                        <img
                                                            src={getImageUrl(schedule.poster.imageUrl)}
                                                            alt="Poster"
                                                            className="rounded-3 shadow-sm"
                                                            style={{
                                                                width: '50px',
                                                                height: '50px',
                                                                objectFit: 'cover',
                                                                cursor: 'pointer',
                                                                border: `2px solid ${currentTheme.border}`,
                                                                transition: 'transform 0.3s ease'
                                                            }}
                                                            onClick={() => downloadPoster(schedule.poster.imageUrl, schedule.customerId?.companyName)}
                                                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                                                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = "https://dummyimage.com/50x50/cccccc/666666&text=No+Image";
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => downloadPoster(schedule.poster.imageUrl, schedule.customerId?.companyName)}
                                                            className="btn btn-sm rounded-3"
                                                            style={{
                                                                background: currentTheme.primary + '20',
                                                                border: `1px solid ${currentTheme.primary}40`,
                                                                color: currentTheme.primary
                                                            }}
                                                            title="Download poster"
                                                        >
                                                            <i className="fas fa-download"></i>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="d-flex align-items-center">
                                                        <div
                                                            className="rounded-3 d-flex align-items-center justify-content-center me-2"
                                                            style={{
                                                                width: '50px',
                                                                height: '50px',
                                                                background: currentTheme.danger + '20',
                                                                border: `2px solid ${currentTheme.danger}40`
                                                            }}
                                                        >
                                                            <i className="fas fa-exclamation-triangle" style={{ color: currentTheme.danger }}></i>
                                                        </div>
                                                        <span className="small" style={{ color: currentTheme.danger }}>
                                                            No poster
                                                        </span>
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-4 py-4">
                                                <span
                                                    className="badge rounded-3 px-3 py-2"
                                                    style={getStatusStyle()}
                                                >
                                                    {status}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4 text-end">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(schedule)}
                                                        className="btn btn-sm rounded-3 shadow-sm"
                                                        style={{
                                                            background: currentTheme.info + '20',
                                                            border: `1px solid ${currentTheme.info}40`,
                                                            color: currentTheme.info,
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                        title="Edit schedule"
                                                        onMouseEnter={(e) => {
                                                            e.target.style.background = currentTheme.info + '30';
                                                            e.target.style.transform = 'scale(1.05)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.target.style.background = currentTheme.info + '20';
                                                            e.target.style.transform = 'scale(1)';
                                                        }}
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(schedule._id)}
                                                        className="btn btn-sm rounded-3 shadow-sm"
                                                        style={{
                                                            background: currentTheme.danger + '20',
                                                            border: `1px solid ${currentTheme.danger}40`,
                                                            color: currentTheme.danger,
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                        title="Delete schedule"
                                                        onMouseEnter={(e) => {
                                                            e.target.style.background = currentTheme.danger + '30';
                                                            e.target.style.transform = 'scale(1.05)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.target.style.background = currentTheme.danger + '20';
                                                            e.target.style.transform = 'scale(1)';
                                                        }}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{
                        background: 'rgba(0, 0, 0, 0.6)',
                        zIndex: 9999,
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)'
                    }}
                    onClick={() => setIsEditModalOpen(false)}
                >
                    <div
                        className="rounded-4 shadow-lg p-5"
                        style={{
                            background: currentTheme.surface,
                            border: `1px solid ${currentTheme.border}`,
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            boxShadow: currentTheme.shadow,
                            maxWidth: '600px',
                            width: '90%',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="d-flex align-items-center mb-4">
                            <div
                                className="rounded-3 p-3 me-3"
                                style={{ background: currentTheme.primary }}
                            >
                                <i className="fas fa-edit" style={{ color: '#ffffff', fontSize: '1.5rem' }}></i>
                            </div>
                            <div>
                                <h3 className="fs-4 fw-bold mb-1" style={{ color: currentTheme.text }}>
                                    Edit Schedule
                                </h3>
                                <p className="mb-0" style={{ color: currentTheme.textSecondary }}>
                                    Update schedule information
                                </p>
                            </div>
                        </div>

                        <div className="row g-4">
                            <div className="col-12">
                                <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    Customer
                                </label>
                                <input
                                    type="text"
                                    value={editingSchedule?.customerId?.companyName || ''}
                                    disabled
                                    className="form-control py-3 rounded-3"
                                    style={{
                                        background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                        border: `1px solid ${currentTheme.border}`,
                                        color: currentTheme.textSecondary
                                    }}
                                />
                            </div>

                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={editingSchedule?.date || ''}
                                    onChange={(e) => setEditingSchedule({ ...editingSchedule, date: e.target.value })}
                                    className="form-control py-3 rounded-3"
                                    style={{
                                        background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                        border: `1px solid ${currentTheme.border}`,
                                        color: currentTheme.text,
                                        backdropFilter: 'blur(10px)',
                                        WebkitBackdropFilter: 'blur(10px)'
                                    }}
                                />
                            </div>

                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    Time
                                </label>
                                <input
                                    type="time"
                                    value={editingSchedule?.time || ''}
                                    onChange={(e) => setEditingSchedule({ ...editingSchedule, time: e.target.value })}
                                    className="form-control py-3 rounded-3"
                                    style={{
                                        background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                        border: `1px solid ${currentTheme.border}`,
                                        color: currentTheme.text,
                                        backdropFilter: 'blur(10px)',
                                        WebkitBackdropFilter: 'blur(10px)'
                                    }}
                                />
                            </div>

                            <div className="col-12">
                                <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={editingSchedule?.customerId?.phoneNumber || ''}
                                    onChange={(e) => setEditingSchedule({
                                        ...editingSchedule,
                                        customerId: { ...editingSchedule.customerId, phoneNumber: e.target.value }
                                    })}
                                    className="form-control py-3 rounded-3"
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

                        <div className="d-flex justify-content-end gap-3 mt-5">
                            <button
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setEditingSchedule(null);
                                }}
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
                                onClick={handleSaveEdit}
                                className="btn px-4 py-3 fw-semibold rounded-3 shadow-sm"
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
                                <i className="fas fa-save me-2"></i>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleList;
