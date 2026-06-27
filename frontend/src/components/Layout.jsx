import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import logo from '../assets/taskflow.png';
import NotificationBell from './NotificationBell';
import useTheme from '../hooks/useTheme';


const NAV = [
    { label: 'Dashboard', icon: '⊞', path: '/dashboard', section: 'Main' },
    { label: 'My Tasks', icon: '✓', path: '/tasks', section: 'Main' },
    { label: 'Users', icon: '👥', path: '/users', section: 'Admin', adminOnly: true },
    { label: 'Activity Log', icon: '📋', path: '/activity', section: 'Admin', adminOnly: true },
    { label: 'Profile', icon: '⚙', path: '/profile', section: 'Account' },
];

const PAGE_TITLES = {
    '/dashboard': 'Dashboard',
    '/tasks': 'My Tasks',
    '/users': 'Users',
    '/activity': 'Activity Log',
    '/profile': 'Profile',
};

const getInitials = (name) =>
    name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

const Layout = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { isDark, toggleTheme } = useTheme();

    useEffect(() => {
        document.body.classList.toggle('sidebar-open', sidebarOpen);
        return () => document.body.classList.remove('sidebar-open');
    }, [sidebarOpen]);

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully.');
        navigate('/login');
    };

    const visibleNav = NAV.filter(item => !item.adminOnly || isAdmin);
    const sections = [...new Set(visibleNav.map(n => n.section))];
    const pageTitle = PAGE_TITLES[location.pathname] || 'NeuroTask';

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    {/* <div className="sidebar-logo-icon">✓</div> */}
                    <img
                        src={logo}
                        alt="NeuroTask"
                        style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }}
                    />
                    <div>
                        <div className="sidebar-logo-text">NeuroTask</div>
                        <div className="sidebar-logo-sub">Task Management System</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {sections.map(section => {
                        const items = visibleNav.filter(n => n.section === section);
                        return (
                            <div key={section} className="nav-section">
                                <div className="nav-section-label">{section}</div>
                                {items.map(item => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <span className="nav-icon">{item.icon}</span>
                                        {item.label}
                                    </NavLink>
                                ))}
                            </div>
                        );
                    })}
                </nav>

                <div className="sidebar-user">
                    <div className="avatar" style={{ background: user?.role === 'admin' ? 'var(--accent)' : 'var(--success)' }}>
                        {getInitials(user?.name)}
                    </div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{user?.name}</div>
                        <div className="sidebar-user-role">{user?.role}</div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout} title="Logout">⏻</button>
                </div>
            </aside>

            {/* Main */}
            <div className="main-content">

                {/* ── Header ── */}
                <header className="header">
                    <div className="header-left">
                        <button
                            className="btn btn-ghost btn-icon"
                            onClick={() => setSidebarOpen(o => !o)}
                            style={{ display: 'none' }}
                            id="menu-toggle"
                        >☰</button>
                        <style>{`@media(max-width:768px){#menu-toggle{display:flex!important}}`}</style>
                        <div>
                            <h1 className="header-title">{pageTitle}</h1>
                            <p className="header-sub">Welcome back, {user?.name?.split(' ')[0]} 👋</p>
                        </div>
                    </div>
                    <div className="header-right">
                        <button
                            className="btn btn-ghost btn-icon"
                            onClick={toggleTheme}
                            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            style={{ fontSize: 18 }} >
                            {isDark ? '☀️' : '🌙'}
                        </button>
                        <NotificationBell />
                        <div className="header-badge">
                            <span className="header-badge-dot" />
                            {user?.role === 'admin' ? 'Admin' : 'Employee'}
                        </div>
                        <div className="header-avatar">
                            {getInitials(user?.name)}
                        </div>
                    </div>
                </header>

                {/* ── Page Content ── */}
                <main className="page-content">
                    <Outlet />
                </main>

                {/* ── Footer ── */}
                <footer className="app-footer">
                    <span>Ekana Technologies · NeuroTask - Task Management System</span>
                    <span className="footer-version">Developed by <strong>Soy-Yo-Dev</strong> · All rights reserved © 2026</span>
                </footer>

            </div>

            {sidebarOpen && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default Layout;