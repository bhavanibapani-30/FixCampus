/**
 * Admin Dashboard, Maintenance Request Triage, & Technicians Management
 */

let categoryChartInstance = null;
let statusChartInstance = null;
let currentSelectedRequestId = null;
let cachedTechnicians = [];

document.addEventListener('DOMContentLoaded', () => {
    const user = requireAuth(['ADMIN']);
    if (!user) return;
    populateUserHeader(user);

    if (document.getElementById('admin-dashboard-view')) {
        loadAdminDashboard();
    }

    if (document.getElementById('manage-requests-view')) {
        loadManageRequests();
        initModalEvents();
    }

    if (document.getElementById('technicians-view')) {
        loadTechniciansList();
        initTechnicianModalEvents();
    }
});

/**
 * 1. Admin Dashboard Loader
 */
async function loadAdminDashboard() {
    try {
        const stats = await apiRequest('/admin/dashboard');

        document.getElementById('stat-total').textContent = stats.totalRequests || 0;
        document.getElementById('stat-pending').textContent = stats.pendingRequests || 0;
        document.getElementById('stat-assigned').textContent = stats.assignedRequests || 0;
        document.getElementById('stat-in-progress').textContent = stats.inProgressRequests || 0;
        document.getElementById('stat-resolved').textContent = stats.resolvedRequests || 0;
        document.getElementById('stat-rejected').textContent = stats.rejectedRequests || 0;
        document.getElementById('stat-urgent').textContent = stats.urgentRequests || 0;
        document.getElementById('stat-techs').textContent = stats.totalTechnicians || 0;

        renderAdminRecentTable(stats.recentRequests || [], 'recent-requests-table');
        renderAdminUrgentTable(stats.highPriorityRequests || [], 'urgent-requests-table');

        renderCategoryChart(stats.requestsByCategory || {});
        renderStatusChart(stats.requestsByStatus || {});
    } catch (err) {
        console.error('Failed to load admin dashboard:', err);
    }
}

/**
 * Chart.js Category Breakdown (Doughnut)
 */
function renderCategoryChart(catData) {
    const ctx = document.getElementById('categoryChart')?.getContext('2d');
    if (!ctx) return;

    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }

    const labels = Object.keys(catData).map(k => k.replace('_', ' '));
    const dataValues = Object.values(catData);

    const colors = [
        '#6366f1', '#06b6d4', '#10b981', '#f59e0b',
        '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#64748b'
    ];

    categoryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                        font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" }
                    }
                }
            }
        }
    });
}

/**
 * Chart.js Status Breakdown (Bar)
 */
function renderStatusChart(statusData) {
    const ctx = document.getElementById('statusChart')?.getContext('2d');
    if (!ctx) return;

    if (statusChartInstance) {
        statusChartInstance.destroy();
    }

    const labels = Object.keys(statusData).map(k => k.replace('_', ' '));
    const dataValues = Object.values(statusData);

    const colors = ['#f59e0b', '#3b82f6', '#6366f1', '#10b981', '#ef4444'];

    statusChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Requests Count',
                data: dataValues,
                backgroundColor: colors.slice(0, labels.length),
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

/**
 * 2. Manage Requests Table & Live Filtering
 */
async function loadManageRequests() {
    await fetchTechnicians();
    await fetchAndRenderAdminRequests();

    // Filters event listeners
    document.getElementById('search-input')?.addEventListener('input', debounce(fetchAndRenderAdminRequests, 300));
    document.getElementById('status-filter')?.addEventListener('change', fetchAndRenderAdminRequests);
    document.getElementById('category-filter')?.addEventListener('change', fetchAndRenderAdminRequests);
    document.getElementById('priority-filter')?.addEventListener('change', fetchAndRenderAdminRequests);
}

async function fetchAndRenderAdminRequests() {
    const status = document.getElementById('status-filter')?.value || '';
    const category = document.getElementById('category-filter')?.value || '';
    const priority = document.getElementById('priority-filter')?.value || '';
    const search = document.getElementById('search-input')?.value.trim() || '';

    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    if (priority) params.append('priority', priority);
    if (search) params.append('search', search);

    try {
        const requests = await apiRequest(`/admin/requests?${params.toString()}`);
        renderAdminManagementTable(requests);
    } catch (err) {
        console.error('Failed to fetch requests:', err);
    }
}

function renderAdminManagementTable(requests) {
    const tbody = document.querySelector('#admin-requests-table tbody');
    if (!tbody) return;

    if (requests.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9">
                    <div class="empty-state">
                        <div class="icon">🔍</div>
                        <h3>No Maintenance Requests Match Your Filters</h3>
                        <p>Try resetting the search or filter criteria.</p>
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
                <div style="font-weight: 600; color: var(--text-main);">${escapeHtml(req.student?.name || 'Student')}</div>
                <div style="font-size: 11px; color: var(--text-muted);">${escapeHtml(req.student?.email || '')}</div>
            </td>
            <td>
                <div style="font-weight: 600; color: var(--text-main); margin-bottom: 2px;">${escapeHtml(req.title)}</div>
                <div style="font-size: 11px; color: var(--text-muted);"><span style="color: var(--primary);">📍</span> ${escapeHtml(req.location)}</div>
            </td>
            <td>${getCategoryTag(req.category)}</td>
            <td>${getPriorityBadge(req.priority)}</td>
            <td>${getStatusBadge(req.status)}</td>
            <td>
                ${req.technician 
                    ? `<span style="font-weight: 600; font-size: 12px; color: #1e293b;">🛠️ ${escapeHtml(req.technician.name)}</span>`
                    : `<span style="color: var(--text-muted); font-size: 12px; font-style: italic;">Unassigned</span>`
                }
            </td>
            <td style="font-size: 12px; color: var(--text-muted); white-space: nowrap;">${formatDate(req.createdAt)}</td>
            <td>
                <div style="display: flex; gap: 6px; flex-wrap: nowrap;">
                    <button class="btn btn-outline btn-sm" onclick="openAssignModal(${req.id})">
                        Assign
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="openPriorityModal(${req.id}, '${req.priority}')">
                        Priority
                    </button>
                    ${req.status === 'PENDING' ? `
                        <button class="btn btn-danger btn-sm" onclick="openRejectModal(${req.id})">
                            Reject
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

function renderAdminRecentTable(requests, tableId) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!tbody) return;

    if (requests.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No requests yet</td></tr>`;
        return;
    }

    tbody.innerHTML = requests.map(req => `
        <tr>
            <td style="font-weight: 700;">#${req.id}</td>
            <td>${escapeHtml(req.title)}</td>
            <td>${getCategoryTag(req.category)}</td>
            <td>${getPriorityBadge(req.priority)}</td>
            <td>${getStatusBadge(req.status)}</td>
            <td><a href="manage-requests.html" class="btn btn-outline btn-sm">Manage</a></td>
        </tr>
    `).join('');
}

function renderAdminUrgentTable(requests, tableId) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!tbody) return;

    if (requests.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No urgent requests pending</td></tr>`;
        return;
    }

    tbody.innerHTML = requests.map(req => `
        <tr>
            <td style="font-weight: 700;">#${req.id}</td>
            <td>${escapeHtml(req.title)}</td>
            <td>${getPriorityBadge(req.priority)}</td>
            <td>${getStatusBadge(req.status)}</td>
            <td><a href="manage-requests.html" class="btn btn-outline btn-sm">Review</a></td>
        </tr>
    `).join('');
}

/**
 * 3. Fetch Technicians & Populate Dropdown
 */
async function fetchTechnicians() {
    try {
        cachedTechnicians = await apiRequest('/admin/technicians');
        const select = document.getElementById('modal-technician-select');
        if (select) {
            select.innerHTML = '<option value="">-- Select Technician --</option>' + 
                cachedTechnicians.map(t => `<option value="${t.id}">${t.name} (${t.email})</option>`).join('');
        }
    } catch (err) {
        console.error('Failed to load technicians:', err);
    }
}

/**
 * 4. Modals Management (Assign, Priority, Reject)
 */
function initModalEvents() {
    // Assign form
    document.getElementById('assign-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const techId = document.getElementById('modal-technician-select').value;
        const comment = document.getElementById('modal-assign-comment').value.trim();

        if (!techId) {
            showToast('Please select a technician', 'error');
            return;
        }

        try {
            await apiRequest(`/admin/requests/${currentSelectedRequestId}/assign`, {
                method: 'PUT',
                body: JSON.stringify({ technicianId: Number(techId), comment })
            });
            showToast('Technician assigned successfully', 'success');
            closeModal('assign-modal');
            fetchAndRenderAdminRequests();
        } catch (err) {}
    });

    // Priority form
    document.getElementById('priority-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const priority = document.getElementById('modal-priority-select').value;
        const comment = document.getElementById('modal-priority-comment').value.trim();

        try {
            await apiRequest(`/admin/requests/${currentSelectedRequestId}/priority`, {
                method: 'PUT',
                body: JSON.stringify({ priority, comment })
            });
            showToast('Priority updated successfully', 'success');
            closeModal('priority-modal');
            fetchAndRenderAdminRequests();
        } catch (err) {}
    });

    // Reject form
    document.getElementById('reject-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const reason = document.getElementById('modal-reject-reason').value.trim();
        if (!reason) {
            showToast('Please provide a reason for rejection', 'error');
            return;
        }

        try {
            await apiRequest(`/admin/requests/${currentSelectedRequestId}/reject`, {
                method: 'PUT',
                body: JSON.stringify({ reason })
            });
            showToast('Request rejected successfully', 'success');
            closeModal('reject-modal');
            fetchAndRenderAdminRequests();
        } catch (err) {}
    });
}

function openAssignModal(id) {
    currentSelectedRequestId = id;
    document.getElementById('assign-modal-req-id').textContent = `#${id}`;
    openModal('assign-modal');
}

function openPriorityModal(id, currentPriority) {
    currentSelectedRequestId = id;
    document.getElementById('priority-modal-req-id').textContent = `#${id}`;
    document.getElementById('modal-priority-select').value = currentPriority;
    openModal('priority-modal');
}

function openRejectModal(id) {
    currentSelectedRequestId = id;
    document.getElementById('reject-modal-req-id').textContent = `#${id}`;
    openModal('reject-modal');
}

function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('show');
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('show');
}

/**
 * 5. Technicians Directory Page
 */
async function loadTechniciansList() {
    try {
        const techs = await apiRequest('/admin/technicians');
        const tbody = document.querySelector('#technicians-table tbody');
        if (!tbody) return;

        if (techs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No technicians added yet</td></tr>`;
            return;
        }

        tbody.innerHTML = techs.map(t => `
            <tr>
                <td style="font-weight: 700; color: var(--text-muted);">#${t.id}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="user-avatar" style="background: var(--info);">${t.name.charAt(0)}</div>
                        <div style="font-weight: 600; color: var(--text-main);">${escapeHtml(t.name)}</div>
                    </div>
                </td>
                <td>${escapeHtml(t.email)}</td>
                <td><span class="badge badge-assigned">TECHNICIAN</span></td>
                <td style="font-size: 12px; color: var(--text-muted);">${formatDate(t.createdAt)}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Failed to load technicians:', err);
    }
}

function initTechnicianModalEvents() {
    document.getElementById('add-technician-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('tech-name').value.trim();
        const email = document.getElementById('tech-email').value.trim();
        const password = document.getElementById('tech-password').value;

        if (!name || !email || !password) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        try {
            await apiRequest('/admin/technicians', {
                method: 'POST',
                body: JSON.stringify({ name, email, password })
            });

            showToast('New technician registered successfully', 'success');
            closeModal('add-technician-modal');
            loadTechniciansList();
        } catch (err) {}
    });
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
