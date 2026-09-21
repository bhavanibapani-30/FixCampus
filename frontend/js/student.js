/**
 * Student Dashboard & Maintenance Requests Management
 */

let allStudentRequests = [];

document.addEventListener('DOMContentLoaded', () => {
    const user = requireAuth(['STUDENT']);
    if (!user) return;
    populateUserHeader(user);

    // Initialize page-specific scripts
    if (document.getElementById('student-dashboard-view')) {
        loadStudentDashboard();
    }

    if (document.getElementById('create-request-form')) {
        initCreateRequestForm();
    }

    if (document.getElementById('my-requests-view')) {
        loadMyRequests();
    }

    if (document.getElementById('request-details-view')) {
        loadRequestDetails();
    }
});

/**
 * 1. Load Student Dashboard Metrics & Recent Requests
 */
async function loadStudentDashboard() {
    try {
        const stats = await apiRequest('/requests/dashboard');
        
        document.getElementById('stat-total').textContent = stats.myTotalRequests || 0;
        document.getElementById('stat-pending').textContent = stats.pendingRequests || 0;
        document.getElementById('stat-in-progress').textContent = stats.inProgressRequests || 0;
        document.getElementById('stat-resolved').textContent = stats.resolvedRequests || 0;

        renderRequestsTable(stats.recentRequests || [], 'recent-requests-table');
    } catch (err) {
        console.error('Failed to load student dashboard:', err);
    }
}

/**
 * 2. Create Request Form Handler
 */
function initCreateRequestForm() {
    const form = document.getElementById('create-request-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submit-btn');

        const title = document.getElementById('title').value.trim();
        const category = document.getElementById('category').value;
        const location = document.getElementById('location').value.trim();
        const priority = document.getElementById('priority').value;
        const description = document.getElementById('description').value.trim();

        if (!title || !category || !location || !priority || !description) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            await apiRequest('/requests', {
                method: 'POST',
                body: JSON.stringify({ title, category, location, priority, description })
            });

            showToast('Maintenance request submitted successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'my-requests.html';
            }, 800);
        } catch (err) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Request';
        }
    });
}

/**
 * 3. Load All My Requests with Search & Filter
 */
async function loadMyRequests() {
    try {
        allStudentRequests = await apiRequest('/requests/my');
        applyMyRequestsFilter();

        // Attach listeners for live filter/search
        document.getElementById('search-input')?.addEventListener('input', applyMyRequestsFilter);
        document.getElementById('status-filter')?.addEventListener('change', applyMyRequestsFilter);
        document.getElementById('category-filter')?.addEventListener('change', applyMyRequestsFilter);
    } catch (err) {
        console.error('Failed to load my requests:', err);
    }
}

function applyMyRequestsFilter() {
    const search = document.getElementById('search-input')?.value.toLowerCase() || '';
    const status = document.getElementById('status-filter')?.value || '';
    const category = document.getElementById('category-filter')?.value || '';

    const filtered = allStudentRequests.filter(req => {
        const matchesSearch = !search || 
            req.title.toLowerCase().includes(search) || 
            req.location.toLowerCase().includes(search) ||
            req.description.toLowerCase().includes(search);
        
        const matchesStatus = !status || req.status === status;
        const matchesCategory = !category || req.category === category;

        return matchesSearch && matchesStatus && matchesCategory;
    });

    renderRequestsTable(filtered, 'my-requests-table');
}

/**
 * Generic Table Renderer for Student Requests
 */
function renderRequestsTable(requests, tableId) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    if (!tableBody) return;

    if (requests.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <div class="icon">📋</div>
                        <h3>No Maintenance Requests Found</h3>
                        <p>You have not submitted any maintenance requests matching your criteria.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = requests.map(req => `
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
                <a href="request-details.html?id=${req.id}" class="btn btn-outline btn-sm">
                    View Details
                </a>
            </td>
        </tr>
    `).join('');
}

/**
 * 4. Load Single Request Details
 */
async function loadRequestDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const requestId = urlParams.get('id');

    if (!requestId) {
        showToast('No request ID specified', 'error');
        window.location.href = 'my-requests.html';
        return;
    }

    try {
        const req = await apiRequest(`/requests/${requestId}`);

        document.getElementById('req-id').textContent = `#${req.id}`;
        document.getElementById('req-title').textContent = req.title;
        document.getElementById('req-status-badge').innerHTML = getStatusBadge(req.status);
        document.getElementById('req-priority-badge').innerHTML = getPriorityBadge(req.priority);
        document.getElementById('req-category-tag').innerHTML = getCategoryTag(req.category);
        document.getElementById('req-location').textContent = req.location;
        document.getElementById('req-created-at').textContent = formatDate(req.createdAt);
        document.getElementById('req-updated-at').textContent = formatDate(req.updatedAt);
        document.getElementById('req-description').textContent = req.description;

        // Technician Section
        const techBox = document.getElementById('tech-assigned-info');
        if (req.technician) {
            techBox.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div class="user-avatar" style="background: var(--info);">${req.technician.name.charAt(0)}</div>
                    <div>
                        <div style="font-weight: 700; color: var(--text-main);">${escapeHtml(req.technician.name)}</div>
                        <div style="font-size: 12px; color: var(--text-muted);">${escapeHtml(req.technician.email)}</div>
                    </div>
                </div>
            `;
        } else {
            techBox.innerHTML = `<span style="color: var(--text-muted); font-style: italic;">No technician assigned yet. Awaiting Admin review.</span>`;
        }

        // Resolution Section
        const resBox = document.getElementById('resolution-section');
        if (req.status === 'RESOLVED' && req.resolutionNotes) {
            resBox.style.display = 'block';
            document.getElementById('resolution-notes').textContent = req.resolutionNotes;
        } else {
            resBox.style.display = 'none';
        }

        // Timeline updates
        const timelineEl = document.getElementById('request-timeline');
        if (timelineEl && req.updates && req.updates.length > 0) {
            timelineEl.innerHTML = req.updates.map(u => `
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <div class="timeline-header">
                            <span class="timeline-user">${escapeHtml(u.updatedBy?.name || 'System')} (${u.updatedBy?.role || ''})</span>
                            <span class="timeline-time">${formatDate(u.createdAt)}</span>
                        </div>
                        <div class="timeline-comment">${escapeHtml(u.comment || 'Status updated')}</div>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Failed to load request details:', err);
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
