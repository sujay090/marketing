import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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

const menuItems = [
  { label: 'Dashboard', icon: Squares2X2Icon, path: '/dashboard' },
  { label: 'Schedule', icon: CalendarIcon, path: '/schedule' },
  { label: 'Schedule List', icon: CalendarIcon, path: '/schedule-list' },
  { label: 'Customers List', icon: UsersIcon, path: '/customers-list' },
  { label: 'Add Customer', icon: UserPlusIcon, path: '/customers' },
  { label: 'Posters', icon: PhotoIcon, path: '/posterList' },
  { label: 'Upload Poster', icon: CloudArrowUpIcon, path: '/upload' },
  { label: 'Profile', icon: CalendarIcon, path: '/profile' },
];

const SidebarLayout = ({ children }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default to open on desktop
  const sidebarRef = useRef();

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  // Trap focus inside sidebar when open
  useEffect(() => {
    if (!sidebarOpen || !sidebarRef.current) return;

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
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen font-['Inter',sans-serif] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between bg-gradient-to-r from-slate-800 to-purple-800 text-white px-4 py-3 fixed top-0 left-0 right-0 z-20 shadow-lg border-b border-purple-500/20">
        <div className="text-xl font-bold">
          <span className="text-yellow-300">Post</span> Generator
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      </header>

      {/* Desktop Header with Toggle */}
      <header className="hidden md:flex items-center justify-between bg-gradient-to-r from-slate-800 to-purple-800 text-white px-4 py-3 fixed top-0 right-0 z-20 shadow-lg border-b border-purple-500/20" style={{ left: sidebarOpen ? '256px' : '0px', transition: 'left 0.3s ease-in-out' }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white hover:bg-purple-700/50 p-2 rounded-lg transition-colors"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
        <div className="text-xl font-bold">
          <span className="text-yellow-300">Post</span> Generator
        </div>
      </header>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        role="dialog"
        aria-label="Sidebar navigation"
        className={`
          fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-gray-100 flex flex-col
          transform transition-transform duration-300 ease-in-out z-30 shadow-2xl border-r border-purple-500/20
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Close button - Mobile only */}
        <div className="md:hidden flex justify-end p-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Logo */}
        <div className="text-xl font-bold px-6 py-5 border-b border-purple-500/30">
          <span className="text-yellow-300">Post</span> Generator
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {menuItems.map(({ label, icon: Icon, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`text-decoration-none flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg font-semibold border border-purple-400/30'
                    : 'hover:bg-gradient-to-r hover:from-slate-700 hover:to-purple-800/50 text-gray-100 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            );
          })}
          <button
            onClick={() => {
              logout();
              setSidebarOpen(false);
            }}
            className="mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-lg transition-transform hover:scale-105 w-full"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </nav>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-60 z-20 md:hidden backdrop-blur-sm"
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <main 
        className={`
          flex-1 p-6 pt-16 overflow-auto bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-slate-800/50 shadow-inner min-h-screen backdrop-blur-sm
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'md:ml-64' : 'md:ml-0'}
        `}
        style={{ paddingTop: '4.5rem' }}
      >
        {children}
      </main>
    </div>
  );
};

export default SidebarLayout;
