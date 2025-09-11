import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
    Squares2X2Icon,
    CalendarIcon,
    UsersIcon,
    UserPlusIcon,
    PhotoIcon,
    CloudArrowUpIcon,
    ArrowLeftOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import ThemeSelector from './ThemeSelector';

const SidebarLayout = ({ children }) => {
    const { getCurrentTheme } = useTheme();
    const currentTheme = getCurrentTheme();
    const { logout } = useAuth();
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const sidebarRef = useRef(null);

    const menuItems = [
        {
            title: 'Dashboard',
            icon: 'fas fa-tachometer-alt',
            path: '/dashboard',
            color: currentTheme.primary
        },
        {
            title: 'Customers',
            icon: 'fas fa-users',
            path: '/customer',
            color: currentTheme.success
        },
        {
            title: 'Poster Templates',
            icon: 'fas fa-layer-group',
            path: '/poster-templates',
            color: currentTheme.info
        },
        {
            title: 'Poster Gallery',
            icon: 'fas fa-images',
            path: '/posterList',
            color: currentTheme.warning
        },
        {
            title: 'WhatsApp Messaging',
            icon: 'fab fa-whatsapp',
            path: '/whatsapp-messaging',
            color: '#25D366'
        },
        {
            title: 'Advanced Scheduler',
            icon: 'fas fa-calendar-alt',
            path: '/schedule',
            color: currentTheme.secondary
        },
        {
            title: 'Bulk Campaign',
            icon: 'fas fa-bullhorn',
            path: '/bulk-campaign',
            color: currentTheme.danger
        },
        {
            title: 'Upload Assets',
            icon: 'fas fa-cloud-upload-alt',
            path: '/upload',
            color: currentTheme.info
        },
        {
            title: 'Profile Settings',
            icon: 'fas fa-user-cog',
            path: '/profile',
            color: currentTheme.textSecondary
        }
    ];

    // Close sidebar on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isSidebarOpen) {
                setIsSidebarOpen(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isSidebarOpen]);

    // Trap focus inside sidebar when open
    useEffect(() => {
        if (!isSidebarOpen || !sidebarRef.current) return;

        const focusableElements = sidebarRef.current.querySelectorAll(
            'a, button, [tabindex]:not([tabindex="-1"])'
        );
        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        const trapFocus = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstEl) {
                    e.preventDefault();
                    lastEl.focus();
                }
            } else {
                if (document.activeElement === lastEl) {
                    e.preventDefault();
                    firstEl.focus();
                }
            }
        };

        document.addEventListener('keydown', trapFocus);
        firstEl?.focus();

        return () => document.removeEventListener('keydown', trapFocus);
    }, [isSidebarOpen]);

    return (
        <div
            className="d-flex min-vh-100"
            style={{
                fontFamily: "'Inter', sans-serif",
                background: currentTheme.background
            }}
        >
            {/* Mobile Header */}
            <header
                className="d-md-none d-flex align-items-center justify-content-between position-fixed top-0 start-0 end-0 px-4 py-3 shadow-lg"
                style={{
                    background: currentTheme.surface,
                    color: currentTheme.text,
                    zIndex: 20,
                    border: `1px solid ${currentTheme.border}`,
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                }}
            >
                <div className="fs-5 fw-bold">
                    <span style={{ color: currentTheme.primary }}>Post</span> Generator
                </div>
                <button
                    className="btn"
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Open sidebar"
                    style={{ color: currentTheme.text }}
                >
                    <Bars3Icon className="w-6 h-6" />
                </button>
            </header>

            {/* Desktop Header with Toggle */}
            <header
                className="d-none d-md-flex align-items-center justify-content-between position-fixed top-0 end-0 px-4 py-3 shadow-lg"
                style={{
                    left: isSidebarOpen ? '256px' : '0px',
                    transition: 'left 0.3s ease-in-out',
                    background: currentTheme.surface,
                    color: currentTheme.text,
                    zIndex: 20,
                    border: `1px solid ${currentTheme.border}`,
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                }}
            >
                <div className="d-flex align-items-center gap-3">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="btn btn-outline-primary"
                        style={{
                            background: 'transparent',
                            border: `1px solid ${currentTheme.primary}`,
                            color: currentTheme.primary,
                            borderRadius: '8px'
                        }}
                        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                    >
                        {isSidebarOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
                    </button>
                </div>

                <div className="fs-5 fw-bold">
                    <span style={{ color: currentTheme.primary }}>Post</span> Generator
                </div>

                <ThemeSelector />
            </header>

            {/* Sidebar */}
            <aside
                ref={sidebarRef}
                role="dialog"
                aria-label="Sidebar navigation"
                className={`position-fixed top-0 start-0 h-100 d-flex flex-column shadow-lg ${isSidebarOpen ? 'translate-x-0' : 'translate-x-n100'
                    }`}
                style={{
                    width: '256px',
                    background: currentTheme.surface,
                    color: currentTheme.text,
                    transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.3s ease-in-out',
                    zIndex: 30,
                    border: `1px solid ${currentTheme.border}`,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)'
                }}
            >
                {/* Close button - Mobile only */}
                <div className="d-md-none d-flex justify-content-end p-4">
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="btn"
                        style={{ color: currentTheme.text }}
                        aria-label="Close sidebar"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Logo */}
                <div
                    className="fs-5 fw-bold px-4 py-4"
                    style={{ borderBottom: `1px solid ${currentTheme.border}` }}
                >
                    <span style={{ color: currentTheme.primary }}>Post</span> Generator
                </div>

                {/* Navigation */}
                <nav className="flex-fill overflow-auto px-3 py-3" style={{ scrollbarWidth: 'thin' }}>
                    <div className="d-flex flex-column gap-2">
                        {menuItems.map(({ title, icon, path, color }) => {
                            const isActive = location.pathname === path;
                            return (
                                <Link
                                    key={path}
                                    to={path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="text-decoration-none d-flex align-items-center gap-3 px-3 py-2 rounded-3 transition-all"
                                    style={{
                                        background: isActive
                                            ? currentTheme.primary
                                            : 'transparent',
                                        color: isActive
                                            ? currentTheme.isDark ? '#ffffff' : '#ffffff'
                                            : currentTheme.text,
                                        fontWeight: isActive ? 600 : 400,
                                        boxShadow: isActive ? currentTheme.shadow : 'none',
                                        border: `1px solid ${isActive ? currentTheme.primary : 'transparent'}`,
                                        transform: 'scale(1)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.target.style.background = `${currentTheme.primary}20`;
                                            e.target.style.transform = 'translateX(4px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.target.style.background = 'transparent';
                                            e.target.style.transform = 'translateX(0)';
                                        }
                                    }}
                                >
                                    <i className={`${icon} w-5 h-5`} style={{ color: isActive ? '#ffffff' : color }}></i>
                                    <span>{title}</span>
                                </Link>
                            );
                        })}

                        <button
                            onClick={() => {
                                logout();
                                setIsSidebarOpen(false);
                            }}
                            className="d-flex align-items-center justify-content-center gap-2 px-3 py-2 mt-4 btn btn-danger rounded-3 shadow-sm fw-medium w-100"
                            style={{
                                background: currentTheme.danger,
                                border: 'none',
                                color: '#ffffff',
                                transition: 'transform 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'scale(1.02)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)';
                            }}
                        >
                            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="position-fixed top-0 start-0 w-100 h-100 d-md-none"
                    style={{
                        background: 'rgba(0, 0, 0, 0.6)',
                        zIndex: 20,
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)'
                    }}
                    aria-hidden="true"
                />
            )}

            {/* Main Content */}
            <main
                className="flex-fill p-4 overflow-auto"
                style={{
                    paddingTop: '5rem',
                    marginLeft: isSidebarOpen ? '256px' : '0',
                    transition: 'margin-left 0.3s ease-in-out',
                    minHeight: '100vh',
                    background: currentTheme.isDark
                        ? 'rgba(0, 0, 0, 0.2)'
                        : 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                }}
            >
                <div
                    className="container-fluid p-4 rounded-4 shadow-sm"
                    style={{
                        background: currentTheme.surface,
                        border: `1px solid ${currentTheme.border}`,
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        minHeight: 'calc(100vh - 7rem)'
                    }}
                >
                    {children}
                </div>
            </main>
        </div>
    );
};

export default SidebarLayout;
