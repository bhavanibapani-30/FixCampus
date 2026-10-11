import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { technicianApi, formatDate, CATEGORY_ICONS } from '../../services/api';
import RequestDetailsModal from '../Shared/RequestDetailsModal';
import UserProfileModal from '../Shared/UserProfileModal';

export default function TechnicianPortal({ showToast }) {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({
        assignedRequests: 0,
        inProgressRequests: 0,
        resolvedRequests: 0,
        highPriorityRequests: 0,
        requests: []
    });
    const [loading, setLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'URGENT_HIGH'

    // Resolve Modal State
    const [resolveTarget, setResolveTarget] = useState(null);
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [resolving, setResolving] = useState(false);

    const loadTechnicianData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await technicianApi.getDashboardStats();
            setStats(data || {});
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadTechnicianData();
    }, [loadTechnicianData]);

    const handleStartWork = async (id) => {
        try {
            await technicianApi.startWork(id);
            showToast(`Started maintenance work on Ticket #${id}!`, 'success');
            loadTechnicianData();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleResolveSubmit = async (e) => {
        e.preventDefault();
        if (!resolutionNotes.trim()) {
            showToast('Please provide official resolution notes', 'error');
            return;
        }

        try {
            setResolving(true);
            await technicianApi.resolveRequest(resolveTarget.id, resolutionNotes.trim());
            showToast(`Ticket #${resolveTarget.id} successfully marked as RESOLVED!`, 'success');
            setResolveTarget(null);
            setResolutionNotes('');
            loadTechnicianData();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setResolving(false);
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
                    <div className="brand-icon" style={{ background: 'linear-gradient(135deg, #0284c7, #38bdf8)' }}>⚡</div>
                    <div className="brand-info">
                        <h2>FixCampus</h2>
                        <span>Technician Portal</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-label">Technician Workspace</div>
                    <button type="button" className="nav-item active">
                        <span className="icon">🛠️</span>
                        <span>Assigned Tasks</span>
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
                        <h1>Technician Maintenance Workspace</h1>
                        <p>Manage your assigned repair tickets, start work on site, and file resolution reports</p>
                    </div>

                    <div className="topbar-right">
                        <div
                            className="user-badge clickable"
                            onClick={() => setShowProfileModal(true)}
                            title="Click to view profile & sign out"
                            role="button"
                            tabIndex={0}
                        >
                            <div className="user-avatar" style={{ background: 'linear-gradient(135deg, #0284c7, #38bdf8)' }}>
                                {user?.name?.charAt(0)?.toUpperCase() || 'T'}
                            </div>
                            <div className="user-meta">
                                <span className="user-name">{user?.name || 'Technician'}</span>
                                <span className="user-role-tag" style={{ color: '#0284c7' }}>
                                    ⚡ TECHNICIAN
                                </span>
                            </div>
                            <span className="user-chevron">▾</span>
                        </div>
                    </div>
                </header>

                {/* Content Body */}
                <main className="content-body">
                    {/* Stats Grid */}
                    <div className="stats-grid">
                        <div
                            className={`stat-card clickable ${filterStatus === 'ASSIGNED' ? 'active' : ''}`}
                            style={{ '--card-accent': 'var(--info)' }}
                            onClick={() => setFilterStatus(filterStatus === 'ASSIGNED' ? 'ALL' : 'ASSIGNED')}
                            title="Filter tickets in assigned queue"
                        >
                            <div className="stat-info">
                                <div className="stat-label">Assigned Queue</div>
                                <div className="stat-value">{stats.assignedRequests || 0}</div>
                                <div className="stat-hint">
                                    {filterStatus === 'ASSIGNED' ? '✓ Filtering assigned' : 'Filter assigned ➔'}
                                </div>
                            </div>
                            <div className="stat-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
                                📥
                            </div>
                        </div>

                        <div
                            className={`stat-card clickable ${filterStatus === 'IN_PROGRESS' ? 'active' : ''}`}
                            style={{ '--card-accent': 'var(--primary)' }}
                            onClick={() => setFilterStatus(filterStatus === 'IN_PROGRESS' ? 'ALL' : 'IN_PROGRESS')}
                            title="Filter tickets currently in progress"
                        >
                            <div className="stat-info">
                                <div className="stat-label">In Progress</div>
                                <div className="stat-value">{stats.inProgressRequests || 0}</div>
                                <div className="stat-hint">
                                    {filterStatus === 'IN_PROGRESS' ? '✓ Filtering in progress' : 'Filter in progress ➔'}
                                </div>
                            </div>
                            <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                🚀
                            </div>
                        </div>

                        <div
                            className={`stat-card clickable ${filterStatus === 'RESOLVED' ? 'active' : ''}`}
                            style={{ '--card-accent': 'var(--success)' }}
                            onClick={() => setFilterStatus(filterStatus === 'RESOLVED' ? 'ALL' : 'RESOLVED')}
                            title="Filter tickets resolved by you"
                        >
                            <div className="stat-info">
                                <div className="stat-label">Resolved by You</div>
                                <div className="stat-value">{stats.resolvedRequests || 0}</div>
                                <div className="stat-hint">
                                    {filterStatus === 'RESOLVED' ? '✓ Filtering resolved' : 'Filter resolved ➔'}
                                </div>
                            </div>
                            <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                                ✅
                            </div>
                        </div>

                        <div
                            className={`stat-card clickable ${filterStatus === 'URGENT_HIGH' ? 'active' : ''}`}
                            style={{ '--card-accent': 'var(--danger)' }}
                            onClick={() => setFilterStatus(filterStatus === 'URGENT_HIGH' ? 'ALL' : 'URGENT_HIGH')}
                            title="Filter urgent & high priority tickets"
                        >
                            <div className="stat-info">
                                <div className="stat-label">Urgent / High</div>
                                <div className="stat-value">{stats.highPriorityRequests || 0}</div>
                                <div className="stat-hint">
                                    {filterStatus === 'URGENT_HIGH' ? '✓ Filtering urgent' : 'Filter urgent/high ➔'}
                                </div>
                            </div>
                            <div className="stat-icon" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                                🚨
                            </div>
                        </div>
                    </div>

                    {/* Assigned Tasks Table Card */}
                    <div className="card">
                        <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
                            <div>
                                <div className="card-title">Your Assigned Maintenance Queue</div>
                                <div className="card-subtitle">Tickets dispatched to you by facility administration</div>
                                {filterStatus !== 'ALL' && (
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                                        <span
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 700,
                                                color: 'var(--primary)',
                                                background: 'var(--primary-light)',
                                                padding: '2px 10px',
                                                borderRadius: 'var(--radius-full)'
                                            }}
                                        >
                                            Filtering:{' '}
                                            {filterStatus === 'ASSIGNED'
                                                ? 'Assigned Queue'
                                                : filterStatus === 'IN_PROGRESS'
                                                ? 'In Progress'
                                                : filterStatus === 'RESOLVED'
                                                ? 'Resolved'
                                                : 'Urgent & High Priority'}
                                        </span>
                                        <button
                                            type="button"
                                            className="btn btn-outline btn-sm"
                                            style={{ padding: '2px 8px', fontSize: 11 }}
                                            onClick={() => setFilterStatus('ALL')}
                                        >
                                            Reset Filter
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {filterStatus !== 'ALL' && (
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => setFilterStatus('ALL')}
                                    >
                                        Show All ({stats.requests?.length || 0})
                                    </button>
                                )}
                                <button type="button" className="btn btn-outline btn-sm" onClick={loadTechnicianData}>
                                    🔄 Refresh
                                </button>
                            </div>
                        </div>

                        <div className="card-body" style={{ padding: 0 }}>
                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Ticket ID</th>
                                            <th>Requester</th>
                                            <th>Title & Location</th>
                                            <th>Category</th>
                                            <th>Priority</th>
                                            <th>Status</th>
                                            <th>Dispatched Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                                                    Loading your assigned maintenance jobs...
                                                </td>
                                            </tr>
                                        ) : (() => {
                                            const filteredList = (stats.requests || []).filter((req) => {
                                                if (filterStatus === 'ASSIGNED') return req.status === 'ASSIGNED';
                                                if (filterStatus === 'IN_PROGRESS') return req.status === 'IN_PROGRESS';
                                                if (filterStatus === 'RESOLVED') return req.status === 'RESOLVED';
                                                if (filterStatus === 'URGENT_HIGH') return req.priority === 'URGENT' || req.priority === 'HIGH';
                                                return true;
                                            });

                                            if (filteredList.length === 0) {
                                                return (
                                                    <tr>
                                                        <td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                                                            {filterStatus !== 'ALL'
                                                                ? 'No maintenance tickets match the selected filter.'
                                                                : 'No maintenance jobs currently assigned to you.'}
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            return filteredList.map((req) => (
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
                                                    <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                                        {formatDate(req.createdAt)}
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
                                                            {req.status === 'ASSIGNED' && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-primary btn-sm"
                                                                    onClick={() => handleStartWork(req.id)}
                                                                >
                                                                    Start Work
                                                                </button>
                                                            )}
                                                            {req.status === 'IN_PROGRESS' && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-success btn-sm"
                                                                    onClick={() => {
                                                                        setResolveTarget(req);
                                                                        setResolutionNotes('');
                                                                    }}
                                                                >
                                                                    Resolve
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
                                            ));
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Resolve Modal */}
            {resolveTarget && (
                <div className="modal-backdrop" onClick={() => setResolveTarget(null)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Mark Ticket #{resolveTarget.id} as Resolved</h3>
                            <button type="button" className="modal-close" onClick={() => setResolveTarget(null)}>&times;</button>
                        </div>
                        <form onSubmit={handleResolveSubmit}>
                            <div className="modal-body">
                                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
                                    Please enter clear, technical resolution notes explaining what actions were taken to fix the issue.
                                </p>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="res-notes">Resolution Notes *</label>
                                    <textarea
                                        id="res-notes"
                                        className="form-control"
                                        rows={4}
                                        placeholder="e.g. Replaced 3-pin faulty switchboard podium socket with 16A modular switch and tested voltage."
                                        value={resolutionNotes}
                                        onChange={(e) => setResolutionNotes(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setResolveTarget(null)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-success" disabled={resolving}>
                                    {resolving ? 'Submitting...' : 'Mark as Resolved'}
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
