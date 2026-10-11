import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { requestsApi, formatDate, CATEGORY_ICONS } from '../../services/api';
import RequestDetailsModal from '../Shared/RequestDetailsModal';
import UserProfileModal from '../Shared/UserProfileModal';

export default function ReporterPortal({ showToast }) {
    const { user, logout } = useAuth();
    const [currentTab, setCurrentTab] = useState('dashboard'); // 'dashboard', 'create', 'my-requests'
    const [showProfileModal, setShowProfileModal] = useState(false);
    
    // Stats & Requests State
    const [stats, setStats] = useState({
        myTotalRequests: 0,
        pendingRequests: 0,
        inProgressRequests: 0,
        resolvedRequests: 0,
        recentRequests: []
    });
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Filter & Search State for My Requests
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Create Request Form State
    const [formData, setFormData] = useState({
        title: '',
        category: 'ELECTRICAL',
        location: '',
        priority: 'MEDIUM',
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const loadDashboardStats = useCallback(async () => {
        try {
            const data = await requestsApi.getDashboardStats();
            setStats(data || {});
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    }, []);

    const loadMyRequests = useCallback(async () => {
        try {
            setLoading(true);
            const data = await requestsApi.getMyRequests();
            setMyRequests(data || []);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadDashboardStats();
    }, [loadDashboardStats]);

    useEffect(() => {
        if (currentTab === 'my-requests') {
            loadMyRequests();
        }
    }, [currentTab, loadMyRequests]);

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.location.trim() || !formData.description.trim()) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        try {
            setSubmitting(true);
            await requestsApi.createRequest({
                title: formData.title.trim(),
                category: formData.category,
                location: formData.location.trim(),
                priority: formData.priority,
                description: formData.description.trim()
            });

            showToast('Maintenance request submitted successfully!', 'success');
            setFormData({
                title: '',
                category: 'ELECTRICAL',
                location: '',
                priority: 'MEDIUM',
                description: ''
            });
            loadDashboardStats();
            setCurrentTab('my-requests');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredRequests = myRequests.filter((req) => {
        const matchesSearch = !searchQuery || 
            req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || req.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        const cls = `badge-${(status || 'pending').toLowerCase()}`;
        return <span className={`badge ${cls}`}>{(status || 'PENDING').replace('_', ' ')}</span>;
    };

    const getPriorityBadge = (priority) => {
        const cls = `priority-${(priority || 'low').toLowerCase()}`;
        return <span className={`priority-badge ${cls}`}>{priority || 'LOW'}</span>;
    };

    const portalRoleLabel = user?.role === 'FACULTY' ? 'Faculty Portal' : 'Student Portal';
    const roleBadgeText = user?.role === 'FACULTY' ? '👨‍🏫 FACULTY' : '🎓 STUDENT';

    return (
        <div className="app-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="brand-icon">🛠️</div>
                    <div className="brand-info">
                        <h2>FixCampus</h2>
                        <span>{portalRoleLabel}</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-label">Main Menu</div>
                    <button
                        type="button"
                        className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setCurrentTab('dashboard')}
                    >
                        <span className="icon">📊</span>
                        <span>Dashboard</span>
                    </button>
                    <button
                        type="button"
                        className={`nav-item ${currentTab === 'create' ? 'active' : ''}`}
                        onClick={() => setCurrentTab('create')}
                    >
                        <span className="icon">➕</span>
                        <span>Create Request</span>
                    </button>
                    <button
                        type="button"
                        className={`nav-item ${currentTab === 'my-requests' ? 'active' : ''}`}
                        onClick={() => setCurrentTab('my-requests')}
                    >
                        <span className="icon">📋</span>
                        <span>My Requests</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button type="button" className="logout-btn" onClick={logout}>
                        <span>🚪</span>
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Wrapper */}
            <div className="main-wrapper">
                {/* Topbar */}
                <header className="topbar">
                    <div className="page-title">
                        <h1>
                            {currentTab === 'dashboard' && 'Campus Dashboard'}
                            {currentTab === 'create' && 'Create Maintenance Request'}
                            {currentTab === 'my-requests' && 'My Maintenance Requests'}
                        </h1>
                        <p>
                            {currentTab === 'dashboard' && 'Overview of your reported campus maintenance requests'}
                            {currentTab === 'create' && 'Report campus infrastructure, equipment, or facility issues'}
                            {currentTab === 'my-requests' && 'Track progress, technician updates, and official resolution reports'}
                        </p>
                    </div>

                    <div className="topbar-right">
                        {currentTab !== 'create' && (
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => setCurrentTab('create')}
                            >
                                <span>➕</span> New Request
                            </button>
                        )}

                        <div
                            className="user-badge clickable"
                            onClick={() => setShowProfileModal(true)}
                            title="Click to view profile & sign out"
                            role="button"
                            tabIndex={0}
                        >
                            <div className="user-avatar">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="user-meta">
                                <span className="user-name">{user?.name || 'User'}</span>
                                <span
                                    className="user-role-tag"
                                    style={{ color: user?.role === 'FACULTY' ? '#4338ca' : 'var(--primary)' }}
                                >
                                    {roleBadgeText}
                                </span>
                            </div>
                            <span className="user-chevron">▾</span>
                        </div>
                    </div>
                </header>

                {/* Content Body */}
                <main className="content-body">
                    {/* TAB 1: DASHBOARD */}
                    {currentTab === 'dashboard' && (
                        <div>
                            {/* Stats Grid */}
                            <div className="stats-grid">
                                <div
                                    className="stat-card clickable"
                                    style={{ '--card-accent': '#6366f1' }}
                                    onClick={() => {
                                        setStatusFilter('');
                                        setSearchQuery('');
                                        setCurrentTab('my-requests');
                                    }}
                                    title="View all your reported requests"
                                >
                                    <div className="stat-info">
                                        <div className="stat-label">Total Reported</div>
                                        <div className="stat-value">{stats.myTotalRequests || 0}</div>
                                        <div className="stat-hint">View all reports ➔</div>
                                    </div>
                                    <div className="stat-icon" style={{ background: '#eef2ff', color: '#6366f1' }}>
                                        📋
                                    </div>
                                </div>

                                <div
                                    className="stat-card clickable"
                                    style={{ '--card-accent': 'var(--warning)' }}
                                    onClick={() => {
                                        setStatusFilter('PENDING');
                                        setSearchQuery('');
                                        setCurrentTab('my-requests');
                                    }}
                                    title="Filter tickets pending triage"
                                >
                                    <div className="stat-info">
                                        <div className="stat-label">Pending Triage</div>
                                        <div className="stat-value">{stats.pendingRequests || 0}</div>
                                        <div className="stat-hint">Filter pending ➔</div>
                                    </div>
                                    <div className="stat-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
                                        ⏳
                                    </div>
                                </div>

                                <div
                                    className="stat-card clickable"
                                    style={{ '--card-accent': 'var(--primary)' }}
                                    onClick={() => {
                                        setStatusFilter('IN_PROGRESS');
                                        setSearchQuery('');
                                        setCurrentTab('my-requests');
                                    }}
                                    title="Filter tickets in progress"
                                >
                                    <div className="stat-info">
                                        <div className="stat-label">In Progress</div>
                                        <div className="stat-value">{stats.inProgressRequests || 0}</div>
                                        <div className="stat-hint">Filter in-progress ➔</div>
                                    </div>
                                    <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                        ⚡
                                    </div>
                                </div>

                                <div
                                    className="stat-card clickable"
                                    style={{ '--card-accent': 'var(--success)' }}
                                    onClick={() => {
                                        setStatusFilter('RESOLVED');
                                        setSearchQuery('');
                                        setCurrentTab('my-requests');
                                    }}
                                    title="Filter resolved tickets"
                                >
                                    <div className="stat-info">
                                        <div className="stat-label">Resolved</div>
                                        <div className="stat-value">{stats.resolvedRequests || 0}</div>
                                        <div className="stat-hint">Filter resolved ➔</div>
                                    </div>
                                    <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                                        ✅
                                    </div>
                                </div>
                            </div>

                            {/* Recent Requests Card */}
                            <div className="card">
                                <div className="card-header">
                                    <div>
                                        <div className="card-title">Recent Maintenance Requests</div>
                                        <div className="card-subtitle">Your recently reported issues and current status</div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-outline btn-sm"
                                        onClick={() => setCurrentTab('my-requests')}
                                    >
                                        View All ({stats.myTotalRequests || 0})
                                    </button>
                                </div>

                                <div className="card-body" style={{ padding: 0 }}>
                                    <div className="table-responsive">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Ticket ID</th>
                                                    <th>Title & Location</th>
                                                    <th>Category</th>
                                                    <th>Priority</th>
                                                    <th>Status</th>
                                                    <th>Reported Date</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stats.recentRequests && stats.recentRequests.length > 0 ? (
                                                    stats.recentRequests.map((req) => (
                                                        <tr key={req.id}>
                                                            <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{req.id}</td>
                                                            <td>
                                                                <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 2 }}>{req.title}</div>
                                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {req.location}</div>
                                                            </td>
                                                            <td>
                                                                <span className="cat-tag">
                                                                    {CATEGORY_ICONS[req.category] || '🔧'} {(req.category || 'OTHER').replace('_', ' ')}
                                                                </span>
                                                            </td>
                                                            <td>{getPriorityBadge(req.priority)}</td>
                                                            <td>{getStatusBadge(req.status)}</td>
                                                            <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                                                {formatDate(req.createdAt)}
                                                            </td>
                                                            <td>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline btn-sm"
                                                                    onClick={() => setSelectedRequest(req)}
                                                                >
                                                                    View
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={7} style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
                                                            No maintenance requests submitted yet. Click <strong>New Request</strong> to submit one.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: CREATE REQUEST */}
                    {currentTab === 'create' && (
                        <div className="card" style={{ maxWidth: 800, margin: '0 auto' }}>
                            <div className="card-header">
                                <div>
                                    <div className="card-title">New Campus Issue Report</div>
                                    <div className="card-subtitle">Provide clear details to accelerate repair assignment</div>
                                </div>
                            </div>

                            <div className="card-body">
                                <form onSubmit={handleCreateSubmit}>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="req-title">
                                            Request Title <span style={{ color: 'var(--danger)' }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="req-title"
                                            className="form-control"
                                            placeholder="e.g. Projector HDMI not displaying output in Lab 204"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="req-category">
                                                Category <span style={{ color: 'var(--danger)' }}>*</span>
                                            </label>
                                            <select
                                                id="req-category"
                                                className="form-control"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                required
                                            >
                                                <option value="ELECTRICAL">⚡ Electrical & Sockets</option>
                                                <option value="WATER">🚰 Plumbing & Water Supply</option>
                                                <option value="WIFI">📶 Wi-Fi & Campus Internet</option>
                                                <option value="PROJECTOR">📽️ Projector & Audiovisual</option>
                                                <option value="FAN_AC">❄️ Fan, AC & Ventilation</option>
                                                <option value="FURNITURE">🪑 Furniture & Desks</option>
                                                <option value="CLEANING">🧹 Sanitation & Cleaning</option>
                                                <option value="CLASSROOM">🏫 Classroom Infrastructure</option>
                                                <option value="OTHER">🔧 Other Issue</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label" htmlFor="req-priority">
                                                Urgency Priority <span style={{ color: 'var(--danger)' }}>*</span>
                                            </label>
                                            <select
                                                id="req-priority"
                                                className="form-control"
                                                value={formData.priority}
                                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                required
                                            >
                                                <option value="LOW">Low (Can be addressed within a week)</option>
                                                <option value="MEDIUM">Medium (Standard attention needed)</option>
                                                <option value="HIGH">High (Impacting classes or lab sessions)</option>
                                                <option value="URGENT">Urgent (Immediate safety / severe disruption)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="req-location">
                                            Precise Location <span style={{ color: 'var(--danger)' }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="req-location"
                                            className="form-control"
                                            placeholder="e.g. CSE Block - 2nd Floor Room 204 or Hostel B Room 301"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="req-desc">
                                            Detailed Problem Description <span style={{ color: 'var(--danger)' }}>*</span>
                                        </label>
                                        <textarea
                                            id="req-desc"
                                            className="form-control"
                                            rows={4}
                                            placeholder="Explain symptoms, exact equipment involved, when the problem started, and any safety hazards..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setCurrentTab('dashboard')}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={submitting}
                                        >
                                            {submitting ? 'Submitting Request...' : 'Submit Maintenance Request'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: MY REQUESTS */}
                    {currentTab === 'my-requests' && (
                        <div>
                            {/* Filter & Search Bar */}
                            <div className="filter-bar">
                                <div className="search-input-wrapper">
                                    <span className="search-icon">🔍</span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by title or location..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <select
                                    className="form-control filter-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="PENDING">Pending Triage</option>
                                    <option value="ASSIGNED">Technician Assigned</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="RESOLVED">Resolved</option>
                                    <option value="REJECTED">Rejected</option>
                                </select>

                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => { setSearchQuery(''); setStatusFilter(''); }}
                                >
                                    Reset Filters
                                </button>
                            </div>

                            {/* Table */}
                            <div className="card">
                                <div className="card-body" style={{ padding: 0 }}>
                                    <div className="table-responsive">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Title & Location</th>
                                                    <th>Category</th>
                                                    <th>Priority</th>
                                                    <th>Status</th>
                                                    <th>Technician</th>
                                                    <th>Date</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                                                            Loading your maintenance requests...
                                                        </td>
                                                    </tr>
                                                ) : filteredRequests.length > 0 ? (
                                                    filteredRequests.map((req) => (
                                                        <tr key={req.id}>
                                                            <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{req.id}</td>
                                                            <td>
                                                                <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 2 }}>{req.title}</div>
                                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {req.location}</div>
                                                            </td>
                                                            <td>
                                                                <span className="cat-tag">
                                                                    {CATEGORY_ICONS[req.category] || '🔧'} {(req.category || 'OTHER').replace('_', ' ')}
                                                                </span>
                                                            </td>
                                                            <td>{getPriorityBadge(req.priority)}</td>
                                                            <td>{getStatusBadge(req.status)}</td>
                                                            <td>
                                                                {req.technician ? (
                                                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
                                                                        🛠️ {req.technician.name}
                                                                    </span>
                                                                ) : (
                                                                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                                                        Unassigned
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                                                {formatDate(req.createdAt)}
                                                            </td>
                                                            <td>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline btn-sm"
                                                                    onClick={() => setSelectedRequest(req)}
                                                                >
                                                                    Details
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={8} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                                                            No matching maintenance requests found.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Request Details Modal */}
            {selectedRequest && (
                <RequestDetailsModal
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                />
            )}

            {/* User Profile & Account Modal */}
            <UserProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                onLogout={logout}
                user={user}
            />
        </div>
    );
}
