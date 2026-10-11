import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminApi, formatDate, CATEGORY_ICONS, isOutsiderDomain } from '../../services/api';
import RequestDetailsModal from '../Shared/RequestDetailsModal';
import UserProfileModal from '../Shared/UserProfileModal';

export default function AdminPortal({ showToast }) {
    const { user, logout } = useAuth();
    const [currentTab, setCurrentTab] = useState('dashboard'); // 'dashboard', 'manage', 'technicians'
    const [showProfileModal, setShowProfileModal] = useState(false);

    // Dashboard Stats
    const [stats, setStats] = useState({
        totalRequests: 0,
        pendingRequests: 0,
        assignedRequests: 0,
        inProgressRequests: 0,
        resolvedRequests: 0,
        rejectedRequests: 0,
        urgentRequests: 0,
        totalTechnicians: 0,
        recentRequests: [],
        highPriorityRequests: []
    });

    // All Requests & Filter State
    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');

    // Technicians State
    const [technicians, setTechnicians] = useState([]);
    const [loadingTechs, setLoadingTechs] = useState(false);

    // Modals State
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [assignTarget, setAssignTarget] = useState(null);
    const [selectedTechId, setSelectedTechId] = useState('');
    const [assignComment, setAssignComment] = useState('');

    const [priorityTarget, setPriorityTarget] = useState(null);
    const [newPriority, setNewPriority] = useState('MEDIUM');
    const [priorityComment, setPriorityComment] = useState('');

    const [rejectTarget, setRejectTarget] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const [showAddTechModal, setShowAddTechModal] = useState(false);
    const [newTechForm, setNewTechForm] = useState({ name: '', email: '', password: '' });
    const [addingTech, setAddingTech] = useState(false);

    const loadDashboardStats = useCallback(async () => {
        try {
            const data = await adminApi.getDashboardStats();
            setStats(data || {});
        } catch (err) {
            console.error('Failed to load admin stats:', err);
        }
    }, []);

    const loadFilteredRequests = useCallback(async () => {
        try {
            setLoadingRequests(true);
            const data = await adminApi.getAllRequests({
                status: statusFilter || undefined,
                category: categoryFilter || undefined,
                priority: priorityFilter || undefined,
                search: searchQuery.trim() || undefined
            });
            setRequests(data || []);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoadingRequests(false);
        }
    }, [statusFilter, categoryFilter, priorityFilter, searchQuery, showToast]);

    const loadTechniciansList = useCallback(async () => {
        try {
            setLoadingTechs(true);
            const data = await adminApi.getTechnicians();
            setTechnicians(data || []);
        } catch (err) {
            console.error('Failed to load technicians:', err);
        } finally {
            setLoadingTechs(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardStats();
        loadTechniciansList();
    }, [loadDashboardStats, loadTechniciansList]);

    useEffect(() => {
        if (currentTab === 'manage') {
            loadFilteredRequests();
        } else if (currentTab === 'technicians') {
            loadTechniciansList();
        }
    }, [currentTab, loadFilteredRequests, loadTechniciansList]);

    // Actions
    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTechId) {
            showToast('Please select a technician', 'error');
            return;
        }

        try {
            await adminApi.assignTechnician(assignTarget.id, Number(selectedTechId), assignComment.trim());
            showToast(`Technician assigned to Ticket #${assignTarget.id}!`, 'success');
            setAssignTarget(null);
            setSelectedTechId('');
            setAssignComment('');
            loadFilteredRequests();
            loadDashboardStats();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handlePrioritySubmit = async (e) => {
        e.preventDefault();
        try {
            await adminApi.updatePriority(priorityTarget.id, newPriority, priorityComment.trim());
            showToast(`Priority updated for Ticket #${priorityTarget.id}!`, 'success');
            setPriorityTarget(null);
            setPriorityComment('');
            loadFilteredRequests();
            loadDashboardStats();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleRejectSubmit = async (e) => {
        e.preventDefault();
        if (!rejectReason.trim()) {
            showToast('Please provide a rejection reason', 'error');
            return;
        }

        try {
            await adminApi.rejectRequest(rejectTarget.id, rejectReason.trim());
            showToast(`Ticket #${rejectTarget.id} rejected.`, 'info');
            setRejectTarget(null);
            setRejectReason('');
            loadFilteredRequests();
            loadDashboardStats();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleAddTechnicianSubmit = async (e) => {
        e.preventDefault();
        const trimmedEmail = newTechForm.email.trim();
        if (!newTechForm.name.trim() || !trimmedEmail || !newTechForm.password) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        if (isOutsiderDomain(trimmedEmail)) {
            showToast('Technician must use official Anurag College email format: exactly 10 characters before @anurag.edu.in (e.g. tech000001@anurag.edu.in).', 'error');
            return;
        }

        try {
            setAddingTech(true);
            await adminApi.createTechnician({
                name: newTechForm.name.trim(),
                email: trimmedEmail,
                password: newTechForm.password
            });
            showToast('New technician account created successfully!', 'success');
            setShowAddTechModal(false);
            setNewTechForm({ name: '', email: '', password: '' });
            loadTechniciansList();
            loadDashboardStats();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setAddingTech(false);
        }
    };

    const getStatusBadge = (status) => {
        const cls = `badge-${(status || 'pending').toLowerCase()}`;
        return <span className={`badge ${cls}`}>{(status || 'PENDING').replace('_', ' ')}</span>;
    };

    const getPriorityBadge = (priority) => {
        const cls = `priority-${(priority || 'low').toLowerCase()}`;
        return <span className={`priority-badge ${cls}`}>{priority || 'LOW'}</span>;
    };

    return (
        <div className="app-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="brand-icon" style={{ background: 'linear-gradient(135deg, #4f46e5, #ec4899)' }}>🛡️</div>
                    <div className="brand-info">
                        <h2>FixCampus</h2>
                        <span>Facility Admin</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-label">Administration</div>
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
                        className={`nav-item ${currentTab === 'manage' ? 'active' : ''}`}
                        onClick={() => setCurrentTab('manage')}
                    >
                        <span className="icon">🛠️</span>
                        <span>Manage Requests</span>
                    </button>
                    <button
                        type="button"
                        className={`nav-item ${currentTab === 'technicians' ? 'active' : ''}`}
                        onClick={() => setCurrentTab('technicians')}
                    >
                        <span className="icon">👥</span>
                        <span>Technicians Directory</span>
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
                            {currentTab === 'dashboard' && 'Admin Executive Dashboard'}
                            {currentTab === 'manage' && 'Campus Maintenance Requests Management'}
                            {currentTab === 'technicians' && 'Campus Technicians Directory'}
                        </h1>
                        <p>
                            {currentTab === 'dashboard' && 'Monitor campus tickets, equipment health KPIs, and technician workloads'}
                            {currentTab === 'manage' && 'Filter tickets, evaluate reported issues, assign certified technicians, or triage priorities'}
                            {currentTab === 'technicians' && 'Manage facility technicians and certified maintenance staff accounts'}
                        </p>
                    </div>

                    <div className="topbar-right">
                        {currentTab === 'technicians' && (
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => setShowAddTechModal(true)}
                            >
                                <span>➕</span> Add Technician
                            </button>
                        )}

                        <div
                            className="user-badge clickable"
                            onClick={() => setShowProfileModal(true)}
                            title="Click to view profile & sign out"
                            role="button"
                            tabIndex={0}
                        >
                            <div className="user-avatar" style={{ background: 'linear-gradient(135deg, #4f46e5, #ec4899)' }}>
                                A
                            </div>
                            <div className="user-meta">
                                <span className="user-name">{user?.name || 'Administrator'}</span>
                                <span className="user-role-tag" style={{ color: '#4f46e5' }}>
                                    🛡️ ADMIN
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
                            {/* KPI Metrics */}
                            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                                <div
                                    className="stat-card clickable"
                                    style={{ '--card-accent': '#6366f1' }}
                                    onClick={() => {
                                        setStatusFilter('');
                                        setCategoryFilter('');
                                        setPriorityFilter('');
                                        setSearchQuery('');
                                        setCurrentTab('manage');
                                    }}
                                    title="View all maintenance requests"
                                >
                                    <div className="stat-info">
                                        <div className="stat-label">Total Tickets</div>
                                        <div className="stat-value">{stats.totalRequests || 0}</div>
                                        <div className="stat-hint">View all tickets ➔</div>
                                    </div>
                                    <div className="stat-icon" style={{ background: '#eef2ff', color: '#6366f1' }}>📋</div>
                                </div>

                                <div
                                    className="stat-card clickable"
                                    style={{ '--card-accent': 'var(--warning)' }}
                                    onClick={() => {
                                        setStatusFilter('PENDING');
                                        setCategoryFilter('');
                                        setPriorityFilter('');
                                        setSearchQuery('');
                                        setCurrentTab('manage');
                                    }}
                                    title="Filter tickets pending triage"
                                >
                                    <div className="stat-info">
                                        <div className="stat-label">Pending Triage</div>
                                        <div className="stat-value">{stats.pendingRequests || 0}</div>
                                        <div className="stat-hint">Filter pending ➔</div>
                                    </div>
                                    <div className="stat-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>⏳</div>
                                </div>

                                <div
                                    className="stat-card clickable"
                                    style={{ '--card-accent': 'var(--info)' }}
                                    onClick={() => {
                                        setStatusFilter('ASSIGNED');
                                        setCategoryFilter('');
                                        setPriorityFilter('');
                                        setSearchQuery('');
                                        setCurrentTab('manage');
                                    }}
                                    title="Filter dispatched tickets"
                                >
                                    <div className="stat-info">
                                        <div className="stat-label">Dispatched</div>
                                        <div className="stat-value">{stats.assignedRequests || 0}</div>
                                        <div className="stat-hint">Filter dispatched ➔</div>
                                    </div>
                                    <div className="stat-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>📥</div>
                                </div>

                                <div
                                    className="stat-card clickable"
                                    style={{ '--card-accent': 'var(--primary)' }}
                                    onClick={() => {
                                        setStatusFilter('IN_PROGRESS');
                                        setCategoryFilter('');
                                        setPriorityFilter('');
                                        setSearchQuery('');
                                        setCurrentTab('manage');
                                    }}
                                    title="Filter tickets in progress"
                                >
                                    <div className="stat-info">
                                        <div className="stat-label">In Progress</div>
                                        <div className="stat-value">{stats.inProgressRequests || 0}</div>
                                        <div className="stat-hint">Filter in-progress ➔</div>
                                    </div>
                                    <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>⚡</div>
                                </div>

                                <div
                                    className="stat-card clickable"
                                    style={{ '--card-accent': 'var(--success)' }}
                                    onClick={() => {
                                        setStatusFilter('RESOLVED');
                                        setCategoryFilter('');
                                        setPriorityFilter('');
                                        setSearchQuery('');
                                        setCurrentTab('manage');
                                    }}
                                    title="Filter resolved tickets"
                                >
                                    <div className="stat-info">
                                        <div className="stat-label">Resolved</div>
                                        <div className="stat-value">{stats.resolvedRequests || 0}</div>
                                        <div className="stat-hint">Filter resolved ➔</div>
                                    </div>
                                    <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>✅</div>
                                </div>

                                <div
                                    className="stat-card clickable"
                                    style={{ '--card-accent': 'var(--danger)' }}
                                    onClick={() => {
                                        setPriorityFilter('URGENT');
                                        setStatusFilter('');
                                        setCategoryFilter('');
                                        setSearchQuery('');
                                        setCurrentTab('manage');
                                    }}
                                    title="Filter urgent priority tickets"
                                >
                                    <div className="stat-info">
                                        <div className="stat-label">Urgent Queue</div>
                                        <div className="stat-value">{stats.urgentRequests || 0}</div>
                                        <div className="stat-hint">Filter urgent ➔</div>
                                    </div>
                                    <div className="stat-icon" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>🚨</div>
                                </div>

                                <div
                                    className="stat-card clickable"
                                    style={{ '--card-accent': '#0284c7' }}
                                    onClick={() => setCurrentTab('technicians')}
                                    title="Go to technicians directory"
                                >
                                    <div className="stat-info">
                                        <div className="stat-label">Technicians</div>
                                        <div className="stat-value">{stats.totalTechnicians || 0}</div>
                                        <div className="stat-hint">View directory ➔</div>
                                    </div>
                                    <div className="stat-icon" style={{ background: '#f0f9ff', color: '#0284c7' }}>👥</div>
                                </div>
                            </div>

                            {/* High Priority & Recent Tickets Layout */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 24 }}>
                                {/* High Priority */}
                                <div className="card">
                                    <div className="card-header">
                                        <div>
                                            <div className="card-title">🚨 High & Urgent Priority Tickets</div>
                                            <div className="card-subtitle">Require immediate triage and tech dispatch</div>
                                        </div>
                                    </div>
                                    <div className="card-body" style={{ padding: 0 }}>
                                        <div className="table-responsive">
                                            <table className="data-table">
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Title</th>
                                                        <th>Priority</th>
                                                        <th>Status</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {stats.highPriorityRequests && stats.highPriorityRequests.length > 0 ? (
                                                        stats.highPriorityRequests.map((req) => (
                                                            <tr key={req.id}>
                                                                <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{req.id}</td>
                                                                <td>
                                                                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{req.title}</div>
                                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {req.location}</div>
                                                                </td>
                                                                <td>{getPriorityBadge(req.priority)}</td>
                                                                <td>{getStatusBadge(req.status)}</td>
                                                                <td>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-outline btn-sm"
                                                                        onClick={() => setSelectedRequest(req)}
                                                                    >
                                                                        Inspect
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                                                                No urgent tickets currently pending.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Requests */}
                                <div className="card">
                                    <div className="card-header">
                                        <div>
                                            <div className="card-title">📋 Recently Submitted Tickets</div>
                                            <div className="card-subtitle">Freshly logged by students and faculty</div>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-outline btn-sm"
                                            onClick={() => setCurrentTab('manage')}
                                        >
                                            View All
                                        </button>
                                    </div>
                                    <div className="card-body" style={{ padding: 0 }}>
                                        <div className="table-responsive">
                                            <table className="data-table">
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Title & Requester</th>
                                                        <th>Category</th>
                                                        <th>Status</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {stats.recentRequests && stats.recentRequests.length > 0 ? (
                                                        stats.recentRequests.map((req) => (
                                                            <tr key={req.id}>
                                                                <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{req.id}</td>
                                                                <td>
                                                                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{req.title}</div>
                                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                                        By {req.student?.name || 'Requester'} (
                                                                        {req.student?.role === 'FACULTY' ? '👨‍🏫 Faculty' : '🎓 Student'})
                                                                    </div>
                                                                </td>
                                                                <td>{CATEGORY_ICONS[req.category] || '🔧'} {(req.category || 'OTHER').replace('_', ' ')}</td>
                                                                <td>{getStatusBadge(req.status)}</td>
                                                                <td>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-outline btn-sm"
                                                                        onClick={() => setSelectedRequest(req)}
                                                                    >
                                                                        Inspect
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                                                                No tickets in database yet.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: MANAGE REQUESTS */}
                    {currentTab === 'manage' && (
                        <div>
                            {/* Filter Bar */}
                            <div className="filter-bar">
                                <div className="search-input-wrapper">
                                    <span className="search-icon">🔍</span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by title, location, or requester..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && loadFilteredRequests()}
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

                                <select
                                    className="form-control filter-select"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    <option value="ELECTRICAL">⚡ Electrical</option>
                                    <option value="WATER">🚰 Plumbing & Water</option>
                                    <option value="WIFI">📶 Wi-Fi & IT</option>
                                    <option value="PROJECTOR">📽️ Projector & AV</option>
                                    <option value="FAN_AC">❄️ Fan & AC</option>
                                    <option value="FURNITURE">🪑 Furniture</option>
                                    <option value="CLEANING">🧹 Sanitation</option>
                                    <option value="CLASSROOM">🏫 Classroom</option>
                                    <option value="OTHER">🔧 Other</option>
                                </select>

                                <select
                                    className="form-control filter-select"
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                >
                                    <option value="">All Priorities</option>
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>

                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setStatusFilter('');
                                        setCategoryFilter('');
                                        setPriorityFilter('');
                                        loadFilteredRequests();
                                    }}
                                >
                                    Reset
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={loadFilteredRequests}
                                >
                                    Search
                                </button>
                            </div>

                            {/* Triage Table */}
                            <div className="card">
                                <div className="card-body" style={{ padding: 0 }}>
                                    <div className="table-responsive">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Requester</th>
                                                    <th>Title & Location</th>
                                                    <th>Category</th>
                                                    <th>Priority</th>
                                                    <th>Status</th>
                                                    <th>Assigned Tech</th>
                                                    <th>Date</th>
                                                    <th>Triage Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loadingRequests ? (
                                                    <tr>
                                                        <td colSpan={9} style={{ textAlign: 'center', padding: 36, color: 'var(--text-muted)' }}>
                                                            Loading campus maintenance tickets...
                                                        </td>
                                                    </tr>
                                                ) : requests.length > 0 ? (
                                                    requests.map((req) => (
                                                        <tr key={req.id}>
                                                            <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{req.id}</td>
                                                            <td>
                                                                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                                                                    {req.student?.name || 'Requester'}
                                                                </div>
                                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                                    <span style={{
                                                                        fontSize: 10,
                                                                        padding: '1px 5px',
                                                                        borderRadius: 4,
                                                                        background: req.student?.role === 'FACULTY' ? '#e0e7ff' : '#f1f5f9',
                                                                        color: req.student?.role === 'FACULTY' ? '#4338ca' : '#475569'
                                                                    }}>
                                                                        {req.student?.role === 'FACULTY' ? '👨‍🏫 Faculty' : '🎓 Student'}
                                                                    </span>
                                                                </div>
                                                            </td>
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
                                                                    <span style={{ fontWeight: 600, fontSize: 12, color: '#1e293b' }}>
                                                                        🛠️ {req.technician.name}
                                                                    </span>
                                                                ) : (
                                                                    <span style={{ color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic' }}>
                                                                        Unassigned
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                                                {formatDate(req.createdAt)}
                                                            </td>
                                                            <td>
                                                                <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-outline btn-sm"
                                                                        onClick={() => {
                                                                            setAssignTarget(req);
                                                                            setSelectedTechId(req.technician?.id ? String(req.technician.id) : '');
                                                                            setAssignComment('');
                                                                        }}
                                                                    >
                                                                        Assign
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-secondary btn-sm"
                                                                        onClick={() => {
                                                                            setPriorityTarget(req);
                                                                            setNewPriority(req.priority);
                                                                            setPriorityComment('');
                                                                        }}
                                                                    >
                                                                        Priority
                                                                    </button>
                                                                    {req.status === 'PENDING' && (
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-danger btn-sm"
                                                                            onClick={() => {
                                                                                setRejectTarget(req);
                                                                                setRejectReason('');
                                                                            }}
                                                                        >
                                                                            Reject
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-outline btn-sm"
                                                                        onClick={() => setSelectedRequest(req)}
                                                                    >
                                                                        Details
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={9} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                                                            No requests matching your filters.
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

                    {/* TAB 3: TECHNICIANS DIRECTORY */}
                    {currentTab === 'technicians' && (
                        <div>
                            <div className="card">
                                <div className="card-header">
                                    <div>
                                        <div className="card-title">Registered Campus Technicians</div>
                                        <div className="card-subtitle">Active certified maintenance personnel ready for dispatch</div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-sm"
                                        onClick={() => setShowAddTechModal(true)}
                                    >
                                        <span>➕</span> Add Technician
                                    </button>
                                </div>

                                <div className="card-body" style={{ padding: 0 }}>
                                    <div className="table-responsive">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Technician Name</th>
                                                    <th>Campus Email</th>
                                                    <th>Role Tag</th>
                                                    <th>Registered Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loadingTechs ? (
                                                    <tr>
                                                        <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                                                            Loading technicians directory...
                                                        </td>
                                                    </tr>
                                                ) : technicians.length > 0 ? (
                                                    technicians.map((t) => (
                                                        <tr key={t.id}>
                                                            <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{t.id}</td>
                                                            <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                                                                🛠️ {t.name}
                                                            </td>
                                                            <td style={{ color: 'var(--primary)', fontWeight: 500 }}>
                                                                {t.email}
                                                            </td>
                                                            <td>
                                                                <span className="badge badge-assigned">
                                                                    ⚡ TECHNICIAN
                                                                </span>
                                                            </td>
                                                            <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                                {formatDate(t.createdAt)}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
                                                            No technician profiles registered yet.
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

            {/* ASSIGN TECHNICIAN MODAL */}
            {assignTarget && (
                <div className="modal-backdrop" onClick={() => setAssignTarget(null)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Assign Technician - Ticket #{assignTarget.id}</h3>
                            <button type="button" className="modal-close" onClick={() => setAssignTarget(null)}>&times;</button>
                        </div>
                        <form onSubmit={handleAssignSubmit}>
                            <div className="modal-body">
                                <div style={{ marginBottom: 14, background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{assignTarget.title}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>📍 {assignTarget.location}</div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="tech-select">Select Technician *</label>
                                    <select
                                        id="tech-select"
                                        className="form-control"
                                        value={selectedTechId}
                                        onChange={(e) => setSelectedTechId(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Choose certified technician --</option>
                                        {technicians.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name} ({t.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="assign-comment">Dispatch Instructions / Note (Optional)</label>
                                    <input
                                        type="text"
                                        id="assign-comment"
                                        className="form-control"
                                        placeholder="e.g. Please check during afternoon break"
                                        value={assignComment}
                                        onChange={(e) => setAssignComment(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setAssignTarget(null)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Confirm Assignment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* UPDATE PRIORITY MODAL */}
            {priorityTarget && (
                <div className="modal-backdrop" onClick={() => setPriorityTarget(null)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Update Priority - Ticket #{priorityTarget.id}</h3>
                            <button type="button" className="modal-close" onClick={() => setPriorityTarget(null)}>&times;</button>
                        </div>
                        <form onSubmit={handlePrioritySubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="prio-select">New Priority Level *</label>
                                    <select
                                        id="prio-select"
                                        className="form-control"
                                        value={newPriority}
                                        onChange={(e) => setNewPriority(e.target.value)}
                                        required
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="URGENT">Urgent (Safety Critical)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="prio-comment">Reason for Priority Adjustment (Optional)</label>
                                    <input
                                        type="text"
                                        id="prio-comment"
                                        className="form-control"
                                        placeholder="e.g. Escalated due to upcoming midterm examinations"
                                        value={priorityComment}
                                        onChange={(e) => setPriorityComment(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setPriorityTarget(null)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Update Priority
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* REJECT REQUEST MODAL */}
            {rejectTarget && (
                <div className="modal-backdrop" onClick={() => setRejectTarget(null)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ color: 'var(--danger)' }}>Reject Request #{rejectTarget.id}</h3>
                            <button type="button" className="modal-close" onClick={() => setRejectTarget(null)}>&times;</button>
                        </div>
                        <form onSubmit={handleRejectSubmit}>
                            <div className="modal-body">
                                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
                                    Please specify why this maintenance request cannot be fulfilled by campus facility crew.
                                </p>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="reject-reason">Rejection Reason *</label>
                                    <textarea
                                        id="reject-reason"
                                        className="form-control"
                                        rows={3}
                                        placeholder="e.g. Out of facility scope or personal equipment not covered by campus maintenance policy."
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setRejectTarget(null)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-danger">
                                    Confirm Rejection
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ADD TECHNICIAN MODAL */}
            {showAddTechModal && (
                <div className="modal-backdrop" onClick={() => setShowAddTechModal(false)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add Certified Maintenance Technician</h3>
                            <button type="button" className="modal-close" onClick={() => setShowAddTechModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleAddTechnicianSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="tech-name">Technician Name & Specialization *</label>
                                    <input
                                        type="text"
                                        id="tech-name"
                                        className="form-control"
                                        placeholder="e.g. John Sparks (Electrical & HVAC)"
                                        value={newTechForm.name}
                                        onChange={(e) => setNewTechForm({ ...newTechForm, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="tech-email">College Email Address *</label>
                                    <input
                                        type="email"
                                        id="tech-email"
                                        className="form-control"
                                        placeholder="e.g. tech000001@anurag.edu.in"
                                        value={newTechForm.email}
                                        onChange={(e) => setNewTechForm({ ...newTechForm, email: e.target.value })}
                                        required
                                    />
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                        ⚠️ Must use official Anurag format: exactly 10 characters before @anurag.edu.in (e.g. tech000001@anurag.edu.in).
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="tech-pw">Password *</label>
                                    <input
                                        type="password"
                                        id="tech-pw"
                                        className="form-control"
                                        placeholder="At least 6 characters"
                                        minLength={6}
                                        value={newTechForm.password}
                                        onChange={(e) => setNewTechForm({ ...newTechForm, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddTechModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={addingTech}>
                                    {addingTech ? 'Creating Account...' : 'Create Technician'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
