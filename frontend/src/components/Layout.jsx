import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
    { label: 'Dashboard', icon: '⊞', path: '/dashboard', section: 'Main' },
    { label: 'My Tasks', icon: '✓', path: '/tasks', section: 'Main' },
    { label: 'Users', icon: '👥', path: '/users', section: 'Admin', adminOnly: true },
    { label: 'Profile', icon: '⚙', path: '/profile', section: 'Account' },
];

const PAGE_TITLES = {
    '/dashboard': 'Dashboard',
    '/tasks': 'My Tasks',
    '/users': 'Users',
    '/profile': 'Profile',
};

const getInitials = (name) =>
    name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

const Layout = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        document.body.classList.toggle('sidebar-open', sidebarOpen);
        return () => document.body.classList.remove('sidebar-open');
    }, [sidebarOpen]);

    const handleLogout = () => {
        logout();
        toast.info('Logged out successfully.');
        navigate('/login');
    };

    const visibleNav = NAV.filter(item => !item.adminOnly || isAdmin);
    const sections = [...new Set(visibleNav.map(n => n.section))];
    const pageTitle = PAGE_TITLES[location.pathname] || 'TaskFlow';

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">✓</div>
                    <div>
                        <div className="sidebar-logo-text">TaskFlow</div>
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
                        <div className="header-badge">
                            <span className="header-badge-dot" />
                            {user?.role === 'admin' ? 'Admin' : 'Member'}
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
                    <span>Ekana Technologies · Task Management System</span>
                    <span className="footer-version">All rights reserved © 2026</span>
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