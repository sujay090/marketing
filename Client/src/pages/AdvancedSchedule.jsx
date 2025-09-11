import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { scheduleAPI, customerAPI, posterAPI } from '../services/api';
import { toast } from 'react-toastify';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, isTomorrow, isPast } from 'date-fns';

const AdvancedSchedule = () => {
    const { getCurrentTheme } = useTheme();
    const currentTheme = getCurrentTheme();

    const [schedules, setSchedules] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [posters, setPosters] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [selectedPoster, setSelectedPoster] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [scheduleType, setScheduleType] = useState('once'); // once, daily, weekly, monthly
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState('calendar'); // calendar, list
    const [showModal, setShowModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);

    const scheduleTypes = [
        { value: 'once', label: 'One Time', icon: 'fas fa-clock', color: currentTheme.info },
        { value: 'daily', label: 'Daily', icon: 'fas fa-redo', color: currentTheme.success },
        { value: 'weekly', label: 'Weekly', icon: 'fas fa-calendar-week', color: currentTheme.warning },
        { value: 'monthly', label: 'Monthly', icon: 'fas fa-calendar', color: currentTheme.primary }
    ];

    const priorityLevels = [
        { value: 'low', label: 'Low', color: currentTheme.success },
        { value: 'medium', label: 'Medium', color: currentTheme.warning },
        { value: 'high', label: 'High', color: currentTheme.danger },
        { value: 'urgent', label: 'Urgent', color: currentTheme.danger }
    ];

    useEffect(() => {
        fetchSchedules();
        fetchCustomers();
        fetchPosters();
    }, []);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            // Mock schedules for demo
            const mockSchedules = [
                {
                    _id: '1',
                    title: 'Festival Poster Campaign',
                    customer: { _id: '1', companyName: 'ABC Electronics', whatsapp: '+91-9876543210' },
                    poster: { _id: '1', title: 'Festival Special', imageUrl: 'https://picsum.photos/300/400?random=1' },
                    scheduledDate: new Date(Date.now() + 1000 * 60 * 60 * 2),
                    message: 'Special festival offer for your business!',
                    type: 'once',
                    priority: 'high',
                    status: 'scheduled',
                    createdAt: new Date()
                },
                {
                    _id: '2',
                    title: 'Daily Promotional Message',
                    customer: { _id: '2', companyName: 'XYZ Restaurant', whatsapp: '+91-9876543211' },
                    poster: { _id: '2', title: 'Daily Special', imageUrl: 'https://picsum.photos/300/400?random=2' },
                    scheduledDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
                    message: 'Check out today\'s special menu!',
                    type: 'daily',
                    priority: 'medium',
                    status: 'scheduled',
                    createdAt: new Date()
                },
                {
                    _id: '3',
                    title: 'Weekly Newsletter',
                    customer: { _id: '3', companyName: 'Tech Solutions', whatsapp: '+91-9876543212' },
                    poster: { _id: '3', title: 'Weekly Update', imageUrl: 'https://picsum.photos/300/400?random=3' },
                    scheduledDate: addDays(new Date(), 7),
                    message: 'Weekly tech updates and news',
                    type: 'weekly',
                    priority: 'low',
                    status: 'scheduled',
                    createdAt: new Date()
                }
            ];
            setSchedules(mockSchedules);
        } catch (error) {
            toast.error('Failed to fetch schedules');
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await customerAPI.getCustomers();
            setCustomers(response.data || []);
        } catch (error) {
            toast.error('Failed to fetch customers');
        }
    };

    const fetchPosters = async () => {
        try {
            // Mock posters for demo
            const mockPosters = [
                {
                    _id: '1',
                    title: 'Festival Special',
                    category: 'festivals',
                    imageUrl: 'https://picsum.photos/300/400?random=1'
                },
                {
                    _id: '2',
                    title: 'Business Offer',
                    category: 'offers',
                    imageUrl: 'https://picsum.photos/300/400?random=2'
                },
                {
                    _id: '3',
                    title: 'Event Announcement',
                    category: 'events',
                    imageUrl: 'https://picsum.photos/300/400?random=3'
                }
            ];
            setPosters(mockPosters);
        } catch (error) {
            toast.error('Failed to fetch posters');
        }
    };

    const handleCreateSchedule = async () => {
        if (!selectedCustomer || !selectedDate || !scheduleTime) {
            toast.error('Please fill all required fields');
            return;
        }

        setSaving(true);
        try {
            const customer = customers.find(c => c._id === selectedCustomer);
            const poster = posters.find(p => p._id === selectedPoster);
            
            const newSchedule = {
                _id: Date.now().toString(),
                title: `${scheduleType.charAt(0).toUpperCase() + scheduleType.slice(1)} Campaign`,
                customer,
                poster,
                scheduledDate: new Date(`${selectedDate.toISOString().split('T')[0]}T${scheduleTime}`),
                message: message || 'Scheduled message',
                type: scheduleType,
                priority: 'medium',
                status: 'scheduled',
                createdAt: new Date()
            };

            setSchedules(prev => [newSchedule, ...prev]);
            toast.success('Schedule created successfully!');
            resetForm();
            setShowModal(false);

        } catch (error) {
            toast.error('Failed to create schedule');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateSchedule = async (scheduleId, updates) => {
        try {
            setSchedules(prev => 
                prev.map(schedule => 
                    schedule._id === scheduleId 
                        ? { ...schedule, ...updates }
                        : schedule
                )
            );
            toast.success('Schedule updated successfully!');
        } catch (error) {
            toast.error('Failed to update schedule');
        }
    };

    const handleDeleteSchedule = async (scheduleId) => {
        if (!window.confirm('Are you sure you want to delete this schedule?')) {
            return;
        }

        try {
            setSchedules(prev => prev.filter(schedule => schedule._id !== scheduleId));
            toast.success('Schedule deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete schedule');
        }
    };

    const resetForm = () => {
        setSelectedCustomer('');
        setSelectedPoster('');
        setScheduleTime('');
        setMessage('');
        setScheduleType('once');
        setEditingSchedule(null);
    };

    const getWeekDays = () => {
        const start = startOfWeek(selectedDate);
        const end = endOfWeek(selectedDate);
        return eachDayOfInterval({ start, end });
    };

    const getSchedulesForDate = (date) => {
        return schedules.filter(schedule => 
            isSameDay(new Date(schedule.scheduledDate), date)
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return currentTheme.info;
            case 'completed': return currentTheme.success;
            case 'failed': return currentTheme.danger;
            case 'cancelled': return currentTheme.textSecondary;
            default: return currentTheme.primary;
        }
    };

    const getPriorityColor = (priority) => {
        const priorityObj = priorityLevels.find(p => p.value === priority);
        return priorityObj ? priorityObj.color : currentTheme.primary;
    };

    const getDateLabel = (date) => {
        if (isToday(date)) return 'Today';
        if (isTomorrow(date)) return 'Tomorrow';
        return format(date, 'MMM dd');
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
                    <div className="col-lg-6">
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="rounded-3 p-3 shadow-sm"
                                style={{ background: currentTheme.primary }}
                            >
                                <i className="fas fa-calendar-alt" style={{ color: '#ffffff', fontSize: '2rem' }}></i>
                            </div>
                            <div>
                                <h1 className="fs-2 fw-bold mb-1" style={{ color: currentTheme.text }}>
                                    Advanced Scheduler
                                </h1>
                                <p className="mb-0" style={{ color: currentTheme.textSecondary }}>
                                    Manage and automate your marketing campaigns
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 text-end">
                        <div className="d-flex align-items-center justify-content-end gap-3">
                            <div className="btn-group" role="group">
                                <button
                                    onClick={() => setViewMode('calendar')}
                                    className={`btn ${viewMode === 'calendar' ? 'active' : ''}`}
                                    style={{
                                        background: viewMode === 'calendar' ? currentTheme.primary : 'transparent',
                                        border: `1px solid ${currentTheme.primary}`,
                                        color: viewMode === 'calendar' ? '#ffffff' : currentTheme.primary
                                    }}
                                >
                                    <i className="fas fa-calendar me-2"></i>
                                    Calendar
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`btn ${viewMode === 'list' ? 'active' : ''}`}
                                    style={{
                                        background: viewMode === 'list' ? currentTheme.primary : 'transparent',
                                        border: `1px solid ${currentTheme.primary}`,
                                        color: viewMode === 'list' ? '#ffffff' : currentTheme.primary
                                    }}
                                >
                                    <i className="fas fa-list me-2"></i>
                                    List
                                </button>
                            </div>
                            <button
                                onClick={() => setShowModal(true)}
                                className="btn rounded-3"
                                style={{
                                    background: currentTheme.success,
                                    border: 'none',
                                    color: '#ffffff'
                                }}
                            >
                                <i className="fas fa-plus me-2"></i>
                                New Schedule
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="row g-4 mb-4">
                <div className="col-lg-3 col-md-6">
                    <div
                        className="card border-0 rounded-4 p-4"
                        style={{
                            background: currentTheme.surface,
                            border: `1px solid ${currentTheme.border}`
                        }}
                    >
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="rounded-3 p-3"
                                style={{ background: currentTheme.info + '20' }}
                            >
                                <i className="fas fa-clock" style={{ color: currentTheme.info, fontSize: '1.5rem' }}></i>
                            </div>
                            <div>
                                <h3 className="fw-bold mb-0" style={{ color: currentTheme.text }}>
                                    {schedules.filter(s => s.status === 'scheduled').length}
                                </h3>
                                <small style={{ color: currentTheme.textSecondary }}>Scheduled</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6">
                    <div
                        className="card border-0 rounded-4 p-4"
                        style={{
                            background: currentTheme.surface,
                            border: `1px solid ${currentTheme.border}`
                        }}
                    >
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="rounded-3 p-3"
                                style={{ background: currentTheme.success + '20' }}
                            >
                                <i className="fas fa-check-circle" style={{ color: currentTheme.success, fontSize: '1.5rem' }}></i>
                            </div>
                            <div>
                                <h3 className="fw-bold mb-0" style={{ color: currentTheme.text }}>
                                    {schedules.filter(s => s.status === 'completed').length}
                                </h3>
                                <small style={{ color: currentTheme.textSecondary }}>Completed</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6">
                    <div
                        className="card border-0 rounded-4 p-4"
                        style={{
                            background: currentTheme.surface,
                            border: `1px solid ${currentTheme.border}`
                        }}
                    >
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="rounded-3 p-3"
                                style={{ background: currentTheme.warning + '20' }}
                            >
                                <i className="fas fa-exclamation-triangle" style={{ color: currentTheme.warning, fontSize: '1.5rem' }}></i>
                            </div>
                            <div>
                                <h3 className="fw-bold mb-0" style={{ color: currentTheme.text }}>
                                    {schedules.filter(s => s.priority === 'high' || s.priority === 'urgent').length}
                                </h3>
                                <small style={{ color: currentTheme.textSecondary }}>High Priority</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6">
                    <div
                        className="card border-0 rounded-4 p-4"
                        style={{
                            background: currentTheme.surface,
                            border: `1px solid ${currentTheme.border}`
                        }}
                    >
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="rounded-3 p-3"
                                style={{ background: currentTheme.primary + '20' }}
                            >
                                <i className="fas fa-redo" style={{ color: currentTheme.primary, fontSize: '1.5rem' }}></i>
                            </div>
                            <div>
                                <h3 className="fw-bold mb-0" style={{ color: currentTheme.text }}>
                                    {schedules.filter(s => s.type !== 'once').length}
                                </h3>
                                <small style={{ color: currentTheme.textSecondary }}>Recurring</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar/List View */}
            {viewMode === 'calendar' ? (
                <div
                    className="rounded-4 shadow-sm p-4"
                    style={{
                        background: currentTheme.surface,
                        border: `1px solid ${currentTheme.border}`
                    }}
                >
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <h4 className="fw-bold mb-0" style={{ color: currentTheme.text }}>
                            {format(selectedDate, 'MMMM yyyy')}
                        </h4>
                        <div className="d-flex gap-2">
                            <button
                                onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                                className="btn btn-sm rounded-3"
                                style={{
                                    background: 'transparent',
                                    border: `1px solid ${currentTheme.border}`,
                                    color: currentTheme.text
                                }}
                            >
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            <button
                                onClick={() => setSelectedDate(new Date())}
                                className="btn btn-sm rounded-3"
                                style={{
                                    background: currentTheme.primary + '20',
                                    border: `1px solid ${currentTheme.primary}40`,
                                    color: currentTheme.primary
                                }}
                            >
                                Today
                            </button>
                            <button
                                onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                                className="btn btn-sm rounded-3"
                                style={{
                                    background: 'transparent',
                                    border: `1px solid ${currentTheme.border}`,
                                    color: currentTheme.text
                                }}
                            >
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>

                    {/* Week View */}
                    <div className="row g-2">
                        {getWeekDays().map((day, index) => {
                            const daySchedules = getSchedulesForDate(day);
                            return (
                                <div key={index} className="col">
                                    <div
                                        className={`card h-100 border-0 rounded-3 ${
                                            isToday(day) ? 'today' : ''
                                        }`}
                                        style={{
                                            background: isToday(day) 
                                                ? currentTheme.primary + '10'
                                                : currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                            border: isToday(day) 
                                                ? `2px solid ${currentTheme.primary}40`
                                                : `1px solid ${currentTheme.border}`,
                                            minHeight: '200px'
                                        }}
                                    >
                                        <div className="card-header border-0 p-3" style={{ background: 'transparent' }}>
                                            <div className="text-center">
                                                <small style={{ color: currentTheme.textSecondary }}>
                                                    {format(day, 'EEE')}
                                                </small>
                                                <div
                                                    className={`fw-bold ${isToday(day) ? 'text-primary' : ''}`}
                                                    style={{ 
                                                        color: isToday(day) ? currentTheme.primary : currentTheme.text,
                                                        fontSize: '1.1rem'
                                                    }}
                                                >
                                                    {format(day, 'dd')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-body p-2">
                                            {daySchedules.map((schedule, scheduleIndex) => (
                                                <div
                                                    key={scheduleIndex}
                                                    className="p-2 rounded-2 mb-2 cursor-pointer"
                                                    style={{
                                                        background: getStatusColor(schedule.status) + '20',
                                                        border: `1px solid ${getStatusColor(schedule.status)}40`,
                                                        fontSize: '0.8rem'
                                                    }}
                                                    onClick={() => {
                                                        setEditingSchedule(schedule);
                                                        setShowModal(true);
                                                    }}
                                                >
                                                    <div className="d-flex align-items-center gap-1">
                                                        <div
                                                            className="rounded-circle"
                                                            style={{
                                                                width: '6px',
                                                                height: '6px',
                                                                background: getPriorityColor(schedule.priority)
                                                            }}
                                                        ></div>
                                                        <small className="fw-semibold text-truncate" style={{ color: currentTheme.text }}>
                                                            {schedule.title}
                                                        </small>
                                                    </div>
                                                    <small style={{ color: currentTheme.textSecondary }}>
                                                        {format(new Date(schedule.scheduledDate), 'HH:mm')}
                                                    </small>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                // List View
                <div
                    className="rounded-4 shadow-sm p-4"
                    style={{
                        background: currentTheme.surface,
                        border: `1px solid ${currentTheme.border}`
                    }}
                >
                    <h4 className="fw-bold mb-4" style={{ color: currentTheme.text }}>
                        All Schedules
                    </h4>

                    {schedules.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="fas fa-calendar-times mb-3" style={{ fontSize: '3rem', color: currentTheme.textSecondary }}></i>
                            <p style={{ color: currentTheme.textSecondary }}>No schedules found</p>
                        </div>
                    ) : (
                        <div className="row g-3">
                            {schedules.map((schedule) => (
                                <div key={schedule._id} className="col-lg-6">
                                    <div
                                        className="card border-0 rounded-4 p-4"
                                        style={{
                                            background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                            border: `1px solid ${currentTheme.border}`
                                        }}
                                    >
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div
                                                    className="rounded-3 p-2"
                                                    style={{ background: getStatusColor(schedule.status) + '20' }}
                                                >
                                                    <i 
                                                        className={scheduleTypes.find(t => t.value === schedule.type)?.icon}
                                                        style={{ color: getStatusColor(schedule.status) }}
                                                    ></i>
                                                </div>
                                                <div>
                                                    <h6 className="fw-bold mb-0" style={{ color: currentTheme.text }}>
                                                        {schedule.title}
                                                    </h6>
                                                    <small style={{ color: currentTheme.textSecondary }}>
                                                        {schedule.customer?.companyName}
                                                    </small>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <span
                                                    className="badge rounded-2"
                                                    style={{
                                                        background: getPriorityColor(schedule.priority) + '20',
                                                        color: getPriorityColor(schedule.priority)
                                                    }}
                                                >
                                                    {schedule.priority}
                                                </span>
                                                <div className="dropdown">
                                                    <button
                                                        className="btn btn-sm rounded-2"
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: currentTheme.textSecondary
                                                        }}
                                                        data-bs-toggle="dropdown"
                                                    >
                                                        <i className="fas fa-ellipsis-v"></i>
                                                    </button>
                                                    <ul className="dropdown-menu">
                                                        <li>
                                                            <button 
                                                                className="dropdown-item"
                                                                onClick={() => {
                                                                    setEditingSchedule(schedule);
                                                                    setShowModal(true);
                                                                }}
                                                            >
                                                                <i className="fas fa-edit me-2"></i>Edit
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button 
                                                                className="dropdown-item text-danger"
                                                                onClick={() => handleDeleteSchedule(schedule._id)}
                                                            >
                                                                <i className="fas fa-trash me-2"></i>Delete
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <small style={{ color: currentTheme.textSecondary }}>
                                                    <i className="fas fa-calendar me-1"></i>
                                                    {getDateLabel(new Date(schedule.scheduledDate))}
                                                </small>
                                            </div>
                                            <div className="col-md-6">
                                                <small style={{ color: currentTheme.textSecondary }}>
                                                    <i className="fas fa-clock me-1"></i>
                                                    {format(new Date(schedule.scheduledDate), 'HH:mm')}
                                                </small>
                                            </div>
                                            <div className="col-md-6">
                                                <small style={{ color: currentTheme.textSecondary }}>
                                                    <i className="fas fa-redo me-1"></i>
                                                    {scheduleTypes.find(t => t.value === schedule.type)?.label}
                                                </small>
                                            </div>
                                            <div className="col-md-6">
                                                <span
                                                    className="badge rounded-2"
                                                    style={{
                                                        background: getStatusColor(schedule.status) + '20',
                                                        color: getStatusColor(schedule.status)
                                                    }}
                                                >
                                                    {schedule.status}
                                                </span>
                                            </div>
                                        </div>

                                        {schedule.message && (
                                            <p className="mb-0 text-truncate" style={{ 
                                                color: currentTheme.textSecondary,
                                                fontSize: '0.9rem'
                                            }}>
                                                {schedule.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Schedule Modal */}
            {showModal && (
                <div
                    className="modal show d-block"
                    style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
                    onClick={() => setShowModal(false)}
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
                                    {editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}
                                </h5>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="btn-close"
                                ></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                            Customer *
                                        </label>
                                        <select
                                            value={selectedCustomer}
                                            onChange={(e) => setSelectedCustomer(e.target.value)}
                                            className="form-select rounded-3"
                                            style={{
                                                background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                border: `1px solid ${currentTheme.border}`,
                                                color: currentTheme.text
                                            }}
                                        >
                                            <option value="">Select Customer</option>
                                            {customers.map(customer => (
                                                <option key={customer._id} value={customer._id}>
                                                    {customer.companyName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                            Poster (Optional)
                                        </label>
                                        <select
                                            value={selectedPoster}
                                            onChange={(e) => setSelectedPoster(e.target.value)}
                                            className="form-select rounded-3"
                                            style={{
                                                background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                border: `1px solid ${currentTheme.border}`,
                                                color: currentTheme.text
                                            }}
                                        >
                                            <option value="">Select Poster</option>
                                            {posters.map(poster => (
                                                <option key={poster._id} value={poster._id}>
                                                    {poster.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                            Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={selectedDate.toISOString().split('T')[0]}
                                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="form-control rounded-3"
                                            style={{
                                                background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                border: `1px solid ${currentTheme.border}`,
                                                color: currentTheme.text
                                            }}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                            Time *
                                        </label>
                                        <input
                                            type="time"
                                            value={scheduleTime}
                                            onChange={(e) => setScheduleTime(e.target.value)}
                                            className="form-control rounded-3"
                                            style={{
                                                background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                border: `1px solid ${currentTheme.border}`,
                                                color: currentTheme.text
                                            }}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                            Schedule Type
                                        </label>
                                        <select
                                            value={scheduleType}
                                            onChange={(e) => setScheduleType(e.target.value)}
                                            className="form-select rounded-3"
                                            style={{
                                                background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                border: `1px solid ${currentTheme.border}`,
                                                color: currentTheme.text
                                            }}
                                        >
                                            {scheduleTypes.map(type => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                            Message
                                        </label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Enter your message..."
                                            rows={4}
                                            className="form-control rounded-3"
                                            style={{
                                                background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                border: `1px solid ${currentTheme.border}`,
                                                color: currentTheme.text,
                                                resize: 'vertical'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0 p-4">
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="btn rounded-3"
                                    style={{
                                        background: 'transparent',
                                        border: `1px solid ${currentTheme.border}`,
                                        color: currentTheme.text
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateSchedule}
                                    disabled={saving}
                                    className="btn rounded-3"
                                    style={{
                                        background: currentTheme.primary,
                                        border: 'none',
                                        color: '#ffffff'
                                    }}
                                >
                                    {saving ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-save me-2"></i>
                                            {editingSchedule ? 'Update' : 'Create'} Schedule
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedSchedule;
