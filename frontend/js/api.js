/**
 * Core API and Authentication Utility Module
 */
const API_BASE = 'http://localhost:8080/api';

const Storage = {
    getToken: () => localStorage.getItem('token'),
    setToken: (token) => localStorage.setItem('token', token),
    getUser: () => {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : null;
    },
    setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
    clear: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

/**
 * Perform authenticated fetch request
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    const token = Storage.getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            // Unauthorized - clear token and redirect to login
            Storage.clear();
            showToast('Session expired. Please log in again.', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
            throw new Error('Unauthorized');
        }

        if (response.status === 403) {
            showToast('Access denied: Insufficient permissions.', 'error');
            throw new Error('Forbidden');
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
            throw new Error(errorMsg);
        }

        return data;
    } catch (error) {
        if (error.message !== 'Unauthorized' && error.message !== 'Forbidden') {
            showToast(error.message, 'error');
        }
        throw error;
    }
}

/**
 * Role-based page access guard
 */
function requireAuth(allowedRoles = []) {
    const token = Storage.getToken();
    const user = Storage.getUser();

    if (!token || !user) {
        window.location.href = 'login.html';
        return null;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        showToast('Access restricted for your role.', 'error');
        if (user.role === 'ADMIN') window.location.href = 'admin-dashboard.html';
        else if (user.role === 'TECHNICIAN') window.location.href = 'technician-dashboard.html';
        else window.location.href = 'student-dashboard.html';
        return null;
    }

    return user;
}

/**
 * User Logout
 */
function logout() {
    Storage.clear();
    showToast('Logged out successfully', 'info');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 500);
}

/**
 * Toast Notifications
 */
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

/**
 * Date Formatter
 */
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Status Badge HTML Generator
 */
function getStatusBadge(status) {
    if (!status) return `<span class="badge badge-pending">PENDING</span>`;
    const label = status.replace('_', ' ');
    const cls = `badge-${status.toLowerCase()}`;
    return `<span class="badge ${cls}">${label}</span>`;
}

/**
 * Priority Badge HTML Generator
 */
function getPriorityBadge(priority) {
    if (!priority) return `<span class="priority-badge priority-low">LOW</span>`;
    const cls = `priority-${priority.toLowerCase()}`;
    return `<span class="priority-badge ${cls}">${priority}</span>`;
}

/**
 * Category Tag HTML Generator
 */
function getCategoryTag(category) {
    const icons = {
        ELECTRICAL: '⚡',
        WATER: '🚰',
        WIFI: '📶',
        PROJECTOR: '📽️',
        FAN_AC: '❄️',
        FURNITURE: '🪑',
        CLEANING: '🧹',
        CLASSROOM: '🏫',
        OTHER: '🔧'
    };
    const icon = icons[category] || '🔧';
    const label = (category || 'OTHER').replace('_', ' ');
    return `<span class="cat-tag">${icon} ${label}</span>`;
}

/**
 * Render Header User Badge
 */
function populateUserHeader(user) {
    if (!user) return;
    const nameEl = document.getElementById('header-user-name');
    const roleEl = document.getElementById('header-user-role');
    const avatarEl = document.getElementById('header-user-avatar');

    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.role;
    if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
}
