import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { customerAPI, posterAPI } from '../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const WhatsAppMessaging = () => {
    const { getCurrentTheme } = useTheme();
    const currentTheme = getCurrentTheme();

    const [customers, setCustomers] = useState([]);
    const [posters, setPosters] = useState([]);
    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const [selectedPoster, setSelectedPoster] = useState(null);
    const [message, setMessage] = useState('');
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [messageType, setMessageType] = useState('instant'); // instant, scheduled
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [messageHistory, setMessageHistory] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');

    const messageTemplates = [
        {
            id: 'offer',
            name: 'Special Offer',
            template: `🎉 *Special Offer Alert!* 🎉

Hello {{customerName}},

We have an exclusive offer just for you! Check out our latest poster design that's perfect for your business.

{{posterMessage}}

📱 For more information, visit: {{website}}
📞 Call us: {{phone}}

Don't miss out on this limited-time offer!

Best regards,
{{companyName}}`
        },
        {
            id: 'announcement',
            name: 'Business Announcement',
            template: `📢 *Important Announcement* 📢

Dear {{customerName}},

We're excited to share some great news with you!

{{posterMessage}}

This new design is now available and ready to help boost your business visibility.

🌐 Website: {{website}}
📱 WhatsApp: {{whatsapp}}

Thank you for being our valued customer!

Warm regards,
{{companyName}}`
        },
        {
            id: 'reminder',
            name: 'Friendly Reminder',
            template: `⏰ *Friendly Reminder* ⏰

Hi {{customerName}},

Just a quick reminder about your poster design:

{{posterMessage}}

We're here to help you make the most of your marketing materials!

📞 Contact us: {{phone}}
💬 WhatsApp: {{whatsapp}}

Have a great day!

Best,
{{companyName}}`
        }
    ];

    useEffect(() => {
        fetchCustomers();
        fetchPosters();
        fetchMessageHistory();
    }, []);

    useEffect(() => {
        if (selectedTemplate) {
            const template = messageTemplates.find(t => t.id === selectedTemplate);
            if (template) {
                setMessage(template.template);
            }
        }
    }, [selectedTemplate]);

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
                    title: 'Festival Special Poster',
                    category: 'festivals',
                    imageUrl: 'https://picsum.photos/300/400?random=1',
                    createdAt: new Date()
                },
                {
                    _id: '2',
                    title: 'Business Offer Poster',
                    category: 'offers',
                    imageUrl: 'https://picsum.photos/300/400?random=2',
                    createdAt: new Date()
                },
                {
                    _id: '3',
                    title: 'Event Announcement',
                    category: 'events',
                    imageUrl: 'https://picsum.photos/300/400?random=3',
                    createdAt: new Date()
                }
            ];
            setPosters(mockPosters);
        } catch (error) {
            toast.error('Failed to fetch posters');
        }
    };

    const fetchMessageHistory = async () => {
        try {
            // Mock message history
            const mockHistory = [
                {
                    id: '1',
                    customerName: 'ABC Electronics',
                    message: 'Special offer poster sent successfully!',
                    status: 'delivered',
                    sentAt: new Date(Date.now() - 1000 * 60 * 30),
                    type: 'instant'
                },
                {
                    id: '2',
                    customerName: 'XYZ Restaurant',
                    message: 'Festival poster scheduled for tomorrow',
                    status: 'scheduled',
                    sentAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
                    type: 'scheduled'
                }
            ];
            setMessageHistory(mockHistory);
        } catch (error) {
            console.error('Failed to fetch message history');
        }
    };

    const handleCustomerToggle = (customerId) => {
        setSelectedCustomers(prev => {
            if (prev.includes(customerId)) {
                return prev.filter(id => id !== customerId);
            } else {
                return [...prev, customerId];
            }
        });
    };

    const selectAllCustomers = () => {
        if (selectedCustomers.length === customers.length) {
            setSelectedCustomers([]);
        } else {
            setSelectedCustomers(customers.map(c => c._id));
        }
    };

    const formatMessage = (template, customer, poster) => {
        let formattedMessage = template;
        
        // Replace placeholders with actual data
        formattedMessage = formattedMessage.replace(/{{customerName}}/g, customer.companyName);
        formattedMessage = formattedMessage.replace(/{{website}}/g, customer.website || 'www.example.com');
        formattedMessage = formattedMessage.replace(/{{phone}}/g, customer.whatsapp || '+91-XXXXXXXXXX');
        formattedMessage = formattedMessage.replace(/{{whatsapp}}/g, customer.whatsapp || '+91-XXXXXXXXXX');
        formattedMessage = formattedMessage.replace(/{{companyName}}/g, 'GS3 Solution');
        
        if (poster) {
            formattedMessage = formattedMessage.replace(/{{posterMessage}}/g, 
                `Check out this amazing ${poster.category} poster we've created for you!`);
        }
        
        return formattedMessage;
    };

    const handleSendMessage = async () => {
        if (selectedCustomers.length === 0) {
            toast.error('Please select at least one customer');
            return;
        }

        if (!message.trim()) {
            toast.error('Please enter a message');
            return;
        }

        if (messageType === 'scheduled' && (!scheduleDate || !scheduleTime)) {
            toast.error('Please select schedule date and time');
            return;
        }

        setSending(true);
        try {
            const promises = selectedCustomers.map(async (customerId) => {
                const customer = customers.find(c => c._id === customerId);
                const formattedMessage = formatMessage(message, customer, selectedPoster);
                
                // Mock API call for sending WhatsApp message
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve({
                            customerId,
                            status: 'success',
                            message: 'Message sent successfully'
                        });
                    }, 1000 + Math.random() * 2000);
                });
            });

            const results = await Promise.all(promises);
            const successful = results.filter(r => r.status === 'success').length;

            toast.success(`${successful} messages ${messageType === 'scheduled' ? 'scheduled' : 'sent'} successfully!`);
            
            // Reset form
            setSelectedCustomers([]);
            setMessage('');
            setSelectedPoster(null);
            setScheduleDate('');
            setScheduleTime('');
            setSelectedTemplate('');

            // Refresh message history
            fetchMessageHistory();

        } catch (error) {
            toast.error('Failed to send messages');
        } finally {
            setSending(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return currentTheme.success;
            case 'pending': return currentTheme.warning;
            case 'failed': return currentTheme.danger;
            case 'scheduled': return currentTheme.info;
            default: return currentTheme.textSecondary;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered': return 'fas fa-check-circle';
            case 'pending': return 'fas fa-clock';
            case 'failed': return 'fas fa-times-circle';
            case 'scheduled': return 'fas fa-calendar-alt';
            default: return 'fas fa-question-circle';
        }
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
                                style={{ background: '#25D366' }}
                            >
                                <i className="fab fa-whatsapp" style={{ color: '#ffffff', fontSize: '2rem' }}></i>
                            </div>
                            <div>
                                <h1 className="fs-2 fw-bold mb-1" style={{ color: currentTheme.text }}>
                                    WhatsApp Messaging
                                </h1>
                                <p className="mb-0" style={{ color: currentTheme.textSecondary }}>
                                    Send posters and messages to your customers instantly or schedule for later
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 text-end">
                        <div className="row g-2 text-center">
                            <div className="col-4">
                                <div
                                    className="rounded-3 p-2"
                                    style={{ background: currentTheme.success + '20' }}
                                >
                                    <div className="fw-bold fs-4" style={{ color: currentTheme.success }}>
                                        {selectedCustomers.length}
                                    </div>
                                    <small style={{ color: currentTheme.textSecondary }}>Selected</small>
                                </div>
                            </div>
                            <div className="col-4">
                                <div
                                    className="rounded-3 p-2"
                                    style={{ background: currentTheme.info + '20' }}
                                >
                                    <div className="fw-bold fs-4" style={{ color: currentTheme.info }}>
                                        {customers.length}
                                    </div>
                                    <small style={{ color: currentTheme.textSecondary }}>Total</small>
                                </div>
                            </div>
                            <div className="col-4">
                                <div
                                    className="rounded-3 p-2"
                                    style={{ background: currentTheme.warning + '20' }}
                                >
                                    <div className="fw-bold fs-4" style={{ color: currentTheme.warning }}>
                                        {messageHistory.filter(m => m.status === 'scheduled').length}
                                    </div>
                                    <small style={{ color: currentTheme.textSecondary }}>Scheduled</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* Customer Selection */}
                <div className="col-lg-4">
                    <div
                        className="rounded-4 shadow-sm p-4 h-100"
                        style={{
                            background: currentTheme.surface,
                            border: `1px solid ${currentTheme.border}`
                        }}
                    >
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <h5 className="fw-bold mb-0" style={{ color: currentTheme.text }}>
                                Select Customers
                            </h5>
                            <button
                                onClick={selectAllCustomers}
                                className="btn btn-sm rounded-3"
                                style={{
                                    background: currentTheme.primary + '20',
                                    border: `1px solid ${currentTheme.primary}40`,
                                    color: currentTheme.primary
                                }}
                            >
                                {selectedCustomers.length === customers.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>

                        <div className="customer-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {customers.map((customer) => (
                                <div
                                    key={customer._id}
                                    className={`p-3 rounded-3 mb-2 cursor-pointer ${
                                        selectedCustomers.includes(customer._id) ? 'selected' : ''
                                    }`}
                                    style={{
                                        background: selectedCustomers.includes(customer._id)
                                            ? currentTheme.primary + '20'
                                            : currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                        border: selectedCustomers.includes(customer._id)
                                            ? `1px solid ${currentTheme.primary}`
                                            : `1px solid ${currentTheme.border}`,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onClick={() => handleCustomerToggle(customer._id)}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center"
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                background: selectedCustomers.includes(customer._id)
                                                    ? currentTheme.primary
                                                    : currentTheme.textSecondary + '40'
                                            }}
                                        >
                                            {selectedCustomers.includes(customer._id) ? (
                                                <i className="fas fa-check" style={{ color: '#ffffff' }}></i>
                                            ) : (
                                                <i className="fas fa-building" style={{ color: currentTheme.textSecondary }}></i>
                                            )}
                                        </div>
                                        <div className="flex-grow-1">
                                            <h6 className="fw-semibold mb-1" style={{ color: currentTheme.text }}>
                                                {customer.companyName}
                                            </h6>
                                            <small style={{ color: currentTheme.textSecondary }}>
                                                <i className="fab fa-whatsapp me-1"></i>
                                                {customer.whatsapp || 'No WhatsApp'}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Message Composition */}
                <div className="col-lg-8">
                    <div
                        className="rounded-4 shadow-sm p-4 mb-4"
                        style={{
                            background: currentTheme.surface,
                            border: `1px solid ${currentTheme.border}`
                        }}
                    >
                        <h5 className="fw-bold mb-4" style={{ color: currentTheme.text }}>
                            Compose Message
                        </h5>

                        {/* Message Type Toggle */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <div className="btn-group w-100" role="group">
                                    <button
                                        onClick={() => setMessageType('instant')}
                                        className={`btn ${messageType === 'instant' ? 'active' : ''}`}
                                        style={{
                                            background: messageType === 'instant' ? currentTheme.primary : 'transparent',
                                            border: `1px solid ${currentTheme.primary}`,
                                            color: messageType === 'instant' ? '#ffffff' : currentTheme.primary
                                        }}
                                    >
                                        <i className="fas fa-bolt me-2"></i>
                                        Send Now
                                    </button>
                                    <button
                                        onClick={() => setMessageType('scheduled')}
                                        className={`btn ${messageType === 'scheduled' ? 'active' : ''}`}
                                        style={{
                                            background: messageType === 'scheduled' ? currentTheme.info : 'transparent',
                                            border: `1px solid ${currentTheme.info}`,
                                            color: messageType === 'scheduled' ? '#ffffff' : currentTheme.info
                                        }}
                                    >
                                        <i className="fas fa-clock me-2"></i>
                                        Schedule
                                    </button>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <select
                                    value={selectedTemplate}
                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                    className="form-select rounded-3"
                                    style={{
                                        background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                        border: `1px solid ${currentTheme.border}`,
                                        color: currentTheme.text
                                    }}
                                >
                                    <option value="">Select Template</option>
                                    {messageTemplates.map(template => (
                                        <option key={template.id} value={template.id}>
                                            {template.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Schedule Settings */}
                        {messageType === 'scheduled' && (
                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                        Schedule Date
                                    </label>
                                    <input
                                        type="date"
                                        value={scheduleDate}
                                        onChange={(e) => setScheduleDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="form-control rounded-3"
                                        style={{
                                            background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                            border: `1px solid ${currentTheme.border}`,
                                            color: currentTheme.text
                                        }}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                        Schedule Time
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
                            </div>
                        )}

                        {/* Poster Selection */}
                        <div className="mb-4">
                            <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                Attach Poster (Optional)
                            </label>
                            <div className="row g-3">
                                {posters.slice(0, 3).map((poster) => (
                                    <div key={poster._id} className="col-md-4">
                                        <div
                                            className={`card border-0 rounded-3 cursor-pointer ${
                                                selectedPoster?._id === poster._id ? 'selected' : ''
                                            }`}
                                            style={{
                                                background: selectedPoster?._id === poster._id
                                                    ? currentTheme.primary + '20'
                                                    : currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                border: selectedPoster?._id === poster._id
                                                    ? `2px solid ${currentTheme.primary}`
                                                    : `1px solid ${currentTheme.border}`,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onClick={() => setSelectedPoster(selectedPoster?._id === poster._id ? null : poster)}
                                        >
                                            <img
                                                src={poster.imageUrl}
                                                alt={poster.title}
                                                className="card-img-top rounded-top-3"
                                                style={{ height: '120px', objectFit: 'cover' }}
                                            />
                                            <div className="card-body p-2">
                                                <small className="fw-semibold" style={{ color: currentTheme.text }}>
                                                    {poster.title}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Message Input */}
                        <div className="mb-4">
                            <label className="form-label fw-semibold" style={{ color: currentTheme.text }}>
                                Message
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message here... Use {{customerName}}, {{website}}, {{phone}} for personalization"
                                rows={8}
                                className="form-control rounded-3"
                                style={{
                                    background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                    border: `1px solid ${currentTheme.border}`,
                                    color: currentTheme.text,
                                    resize: 'vertical'
                                }}
                            />
                            <small style={{ color: currentTheme.textSecondary }}>
                                Characters: {message.length} | Recipients: {selectedCustomers.length}
                            </small>
                        </div>

                        {/* Send Button */}
                        <div className="d-flex justify-content-end">
                            <button
                                onClick={handleSendMessage}
                                disabled={sending || selectedCustomers.length === 0 || !message.trim()}
                                className="btn btn-lg rounded-3 px-4"
                                style={{
                                    background: messageType === 'scheduled' ? currentTheme.info : '#25D366',
                                    border: 'none',
                                    color: '#ffffff'
                                }}
                            >
                                {sending ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        {messageType === 'scheduled' ? 'Scheduling...' : 'Sending...'}
                                    </>
                                ) : (
                                    <>
                                        <i className={`${messageType === 'scheduled' ? 'fas fa-calendar-plus' : 'fab fa-whatsapp'} me-2`}></i>
                                        {messageType === 'scheduled' ? 'Schedule Message' : 'Send Message'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Message History */}
                    <div
                        className="rounded-4 shadow-sm p-4"
                        style={{
                            background: currentTheme.surface,
                            border: `1px solid ${currentTheme.border}`
                        }}
                    >
                        <h5 className="fw-bold mb-4" style={{ color: currentTheme.text }}>
                            Message History
                        </h5>

                        {messageHistory.length === 0 ? (
                            <div className="text-center py-4">
                                <i className="fas fa-inbox mb-3" style={{ fontSize: '3rem', color: currentTheme.textSecondary }}></i>
                                <p style={{ color: currentTheme.textSecondary }}>No messages sent yet</p>
                            </div>
                        ) : (
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {messageHistory.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className="d-flex align-items-center gap-3 p-3 rounded-3 mb-2"
                                        style={{
                                            background: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                            border: `1px solid ${currentTheme.border}`
                                        }}
                                    >
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center"
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                background: getStatusColor(msg.status) + '20'
                                            }}
                                        >
                                            <i 
                                                className={getStatusIcon(msg.status)}
                                                style={{ color: getStatusColor(msg.status) }}
                                            ></i>
                                        </div>
                                        <div className="flex-grow-1">
                                            <h6 className="fw-semibold mb-1" style={{ color: currentTheme.text }}>
                                                {msg.customerName}
                                            </h6>
                                            <p className="mb-1 text-truncate" style={{ color: currentTheme.textSecondary, maxWidth: '300px' }}>
                                                {msg.message}
                                            </p>
                                            <small style={{ color: currentTheme.textSecondary }}>
                                                {format(msg.sentAt, 'MMM dd, yyyy HH:mm')}
                                            </small>
                                        </div>
                                        <span
                                            className="badge rounded-2 px-2 py-1"
                                            style={{
                                                background: getStatusColor(msg.status) + '20',
                                                color: getStatusColor(msg.status),
                                                textTransform: 'capitalize'
                                            }}
                                        >
                                            {msg.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppMessaging;
