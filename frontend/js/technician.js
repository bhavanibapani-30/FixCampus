/**
 * Technician Dashboard & Task Resolution Management
 */

let currentTechnicianRequestId = null;

document.addEventListener('DOMContentLoaded', () => {
    const user = requireAuth(['TECHNICIAN']);
    if (!user) return;
    populateUserHeader(user);

    if (document.getElementById('technician-dashboard-view')) {
        loadTechnicianDashboard();
    }

    if (document.getElementById('technician-request-view')) {
        loadTechnicianRequestDetails();
        initTechnicianActions();
    }
});

/**
 * 1. Load Technician Dashboard
 */
async function loadTechnicianDashboard() {
    try {
        const stats = await apiRequest('/technician/dashboard');

        document.getElementById('stat-assigned').textContent = stats.assignedRequests || 0;
        document.getElementById('stat-in-progress').textContent = stats.inProgressRequests || 0;
        document.getElementById('stat-resolved').textContent = stats.resolvedRequests || 0;
        document.getElementById('stat-urgent').textContent = stats.highPriorityRequests || 0;

        renderTechnicianTasksTable(stats.requests || []);
    } catch (err) {
        console.error('Failed to load technician dashboard:', err);
    }
}

function renderTechnicianTasksTable(requests) {
    const tbody = document.querySelector('#technician-tasks-table tbody');
    if (!tbody) return;

    if (requests.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <div class="icon">🛠️</div>
                        <h3>No Maintenance Tasks Assigned</h3>
                        <p>You have no pending or active maintenance jobs assigned to you at the moment.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = requests.map(req => `
        <tr>
            <td style="font-weight: 700; color: var(--text-muted);">#${req.id}</td>
            <td>
                <div style="font-weight: 600; color: var(--text-main); margin-bottom: 2px;">${escapeHtml(req.title)}</div>
                <div style="font-size: 11px; color: var(--text-muted);"><span style="color: var(--primary);">📍</span> ${escapeHtml(req.location)}</div>
            </td>
            <td>${getCategoryTag(req.category)}</td>
            <td>${getPriorityBadge(req.priority)}</td>
            <td>${getStatusBadge(req.status)}</td>
            <td style="font-size: 12px; color: var(--text-muted); white-space: nowrap;">${formatDate(req.createdAt)}</td>
            <td>
                <div style="display: flex; gap: 6px;">
                    <a href="technician-request.html?id=${req.id}" class="btn btn-outline btn-sm">
                        Open Job
                    </a>
                    ${req.status === 'ASSIGNED' ? `
                        <button class="btn btn-primary btn-sm" onclick="startWorkDirect(${req.id})">
                            Start
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

async function startWorkDirect(id) {
    try {
        await apiRequest(`/technician/requests/${id}/start`, { method: 'PUT' });
        showToast('Work started on request #' + id, 'success');
        loadTechnicianDashboard();
    } catch (err) {}
}

/**
 * 2. Load Technician Request Details & Actions
 */
async function loadTechnicianRequestDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const requestId = urlParams.get('id');
    currentTechnicianRequestId = requestId;

    if (!requestId) {
        showToast('No request ID specified', 'error');
        window.location.href = 'technician-dashboard.html';
        return;
    }

    try {
        const req = await apiRequest(`/technician/requests/${requestId}`);

        document.getElementById('req-id').textContent = `#${req.id}`;
        document.getElementById('req-title').textContent = req.title;
        document.getElementById('req-status-badge').innerHTML = getStatusBadge(req.status);
        document.getElementById('req-priority-badge').innerHTML = getPriorityBadge(req.priority);
        document.getElementById('req-category-tag').innerHTML = getCategoryTag(req.category);
        document.getElementById('req-location').textContent = req.location;
        document.getElementById('req-created-at').textContent = formatDate(req.createdAt);
        document.getElementById('req-updated-at').textContent = formatDate(req.updatedAt);
        document.getElementById('req-student-name').textContent = req.student?.name || 'Student';
        document.getElementById('req-student-email').textContent = req.student?.email || '';
        document.getElementById('req-description').textContent = req.description;

        // Action Buttons Visibility
        const startBtn = document.getElementById('btn-start-work');
        const resolveBtn = document.getElementById('btn-open-resolve-modal');
        const statusAlert = document.getElementById('status-notice-alert');

        if (req.status === 'ASSIGNED') {
            if (startBtn) startBtn.style.display = 'inline-flex';
            if (resolveBtn) resolveBtn.style.display = 'none';
            if (statusAlert) statusAlert.innerHTML = `<span style="color: var(--warning-dark); font-weight: 600;">Job is assigned. Click 'Start Maintenance Work' when you arrive on site.</span>`;
        } else if (req.status === 'IN_PROGRESS') {
            if (startBtn) startBtn.style.display = 'none';
            if (resolveBtn) resolveBtn.style.display = 'inline-flex';
            if (statusAlert) statusAlert.innerHTML = `<span style="color: var(--primary-dark); font-weight: 600;">Maintenance currently in progress. Submit resolution notes when finished.</span>`;
        } else if (req.status === 'RESOLVED') {
            if (startBtn) startBtn.style.display = 'none';
            if (resolveBtn) resolveBtn.style.display = 'none';
            if (statusAlert) statusAlert.innerHTML = `<span style="color: var(--success-dark); font-weight: 600;">This request has been resolved and completed.</span>`;
        }

        // Resolution Section
        const resBox = document.getElementById('resolution-section');
        if (req.status === 'RESOLVED' && req.resolutionNotes) {
            resBox.style.display = 'block';
            document.getElementById('resolution-notes').textContent = req.resolutionNotes;
        } else {
            resBox.style.display = 'none';
        }

        // Timeline
        const timelineEl = document.getElementById('request-timeline');
        if (timelineEl && req.updates && req.updates.length > 0) {
            timelineEl.innerHTML = req.updates.map(u => `
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <div class="timeline-header">
                            <span class="timeline-user">${escapeHtml(u.updatedBy?.name || 'User')} (${u.updatedBy?.role || ''})</span>
                            <span class="timeline-time">${formatDate(u.createdAt)}</span>
                        </div>
                        <div class="timeline-comment">${escapeHtml(u.comment || 'Status update')}</div>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Failed to load technician request:', err);
    }
}

function initTechnicianActions() {
    document.getElementById('btn-start-work')?.addEventListener('click', async () => {
        try {
            await apiRequest(`/technician/requests/${currentTechnicianRequestId}/start`, { method: 'PUT' });
            showToast('Work started successfully!', 'success');
            loadTechnicianRequestDetails();
        } catch (err) {}
    });

    document.getElementById('resolve-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const resolutionNotes = document.getElementById('modal-resolution-notes').value.trim();

        if (!resolutionNotes) {
            showToast('Please provide resolution notes describing the fix', 'error');
            return;
        }

        try {
            await apiRequest(`/technician/requests/${currentTechnicianRequestId}/resolve`, {
                method: 'PUT',
                body: JSON.stringify({ resolutionNotes })
            });

            showToast('Maintenance request marked as RESOLVED!', 'success');
            closeModal('resolve-modal');
            loadTechnicianRequestDetails();
        } catch (err) {}
    });
}

function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('show');
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('show');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
