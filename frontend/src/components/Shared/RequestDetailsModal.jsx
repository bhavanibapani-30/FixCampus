import React from 'react';
import { formatDate, CATEGORY_ICONS } from '../../services/api';

export default function RequestDetailsModal({ request, onClose }) {
    if (!request) return null;

    const getStatusBadge = (status) => {
        const cls = `badge-${(status || 'pending').toLowerCase()}`;
        return <span className={`badge ${cls}`}>{(status || 'PENDING').replace('_', ' ')}</span>;
    };

    const getPriorityBadge = (priority) => {
        const cls = `priority-${(priority || 'low').toLowerCase()}`;
        return <span className={`priority-badge ${cls}`}>{priority || 'LOW'}</span>;
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-dialog" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            Ticket #{request.id}
                        </span>
                        <h3 style={{ fontSize: 18, marginTop: 2 }}>{request.title}</h3>
                    </div>
                    <button type="button" className="modal-close" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                    {/* Status & Priority Row */}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
                        {getStatusBadge(request.status)}
                        {getPriorityBadge(request.priority)}
                        <span className="cat-tag">
                            {CATEGORY_ICONS[request.category] || '🔧'} {(request.category || 'OTHER').replace('_', ' ')}
                        </span>
                    </div>

                    {/* Location & Reported Info */}
                    <div style={{ background: '#f8fafc', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: 18 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                            <div>
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>📍 Location</span>
                                <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{request.location}</div>
                            </div>
                            <div>
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>📅 Reported At</span>
                                <div style={{ fontSize: 13, color: 'var(--text-body)', marginTop: 2 }}>{formatDate(request.createdAt)}</div>
                            </div>
                            <div>
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>👤 Reported By</span>
                                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                                    {request.student?.name || 'Requester'}{' '}
                                    <span style={{
                                        fontSize: 10,
                                        padding: '1px 6px',
                                        borderRadius: 4,
                                        background: request.student?.role === 'FACULTY' ? '#e0e7ff' : '#f1f5f9',
                                        color: request.student?.role === 'FACULTY' ? '#4338ca' : '#475569'
                                    }}>
                                        {request.student?.role === 'FACULTY' ? '👨‍🏫 Faculty' : '🎓 Student'}
                                    </span>
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{request.student?.email}</div>
                            </div>
                            <div>
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>⚡ Assigned Technician</span>
                                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2, color: request.technician ? '#0f172a' : 'var(--text-muted)' }}>
                                    {request.technician ? `🛠️ ${request.technician.name}` : 'Unassigned'}
                                </div>
                                {request.technician && (
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{request.technician.email}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: 20 }}>
                        <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                            Problem Description
                        </h4>
                        <div style={{ background: '#ffffff', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: 13, lineHeight: 1.6 }}>
                            {request.description}
                        </div>
                    </div>

                    {/* Resolution Notes (if any) */}
                    {request.resolutionNotes && (
                        <div style={{ marginBottom: 20, background: 'var(--success-light)', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)', padding: 14 }}>
                            <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--success-dark)', textTransform: 'uppercase', marginBottom: 4 }}>
                                ✅ Official Resolution Notes
                            </h4>
                            <div style={{ fontSize: 13, color: 'var(--success-dark)', lineHeight: 1.5 }}>
                                {request.resolutionNotes}
                            </div>
                        </div>
                    )}

                    {/* Audit Timeline */}
                    <div>
                        <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
                            Status & Action History
                        </h4>
                        {request.updates && request.updates.length > 0 ? (
                            <div className="timeline">
                                {request.updates.map((upd, idx) => (
                                    <div key={upd.id || idx} className="timeline-item">
                                        <div className="timeline-dot" />
                                        <div className="timeline-content">
                                            <div className="timeline-header">
                                                <span className="timeline-user">
                                                    {upd.updatedBy?.name || 'System'}
                                                    {upd.newStatus && (
                                                        <span style={{ fontSize: 11, marginLeft: 6, fontWeight: 600, color: 'var(--primary)' }}>
                                                            → {upd.newStatus.replace('_', ' ')}
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="timeline-time">{formatDate(upd.createdAt)}</span>
                                            </div>
                                            <div className="timeline-comment">{upd.comment}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>No updates logged yet.</div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
