/**
 * FixCampus Core API and Authentication Service
 */

const API_BASE = 'http://localhost:8080/api';

/**
 * Validates Anurag College email format: exactly 10 characters before @anurag.edu.in
 * e.g. 21H61A0501@anurag.edu.in, faculty001@anurag.edu.in, tech000001@anurag.edu.in
 */
export function isValidCollegeEmail(email) {
    if (!email || !email.includes('@')) return false;
    const parts = email.trim().toLowerCase().split('@');
    if (parts.length !== 2) return false;
    const [username, domain] = parts;
    return domain === 'anurag.edu.in' && username.length === 10 && /^[a-zA-Z0-9._]{10}$/.test(username);
}

export function isOutsiderDomain(email) {
    return !isValidCollegeEmail(email);
}

export const Storage = {
    getToken: () => localStorage.getItem('token'),
    setToken: (token) => localStorage.setItem('token', token),
    getUser: () => {
        const u = localStorage.getItem('user');
        try {
            return u ? JSON.parse(u) : null;
        } catch {
            return null;
        }
    },
    setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
    clear: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

export async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    const token = Storage.getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401) {
        Storage.clear();
        throw new Error('Session expired or unauthorized. Please sign in again.');
    }

    if (response.status === 403) {
        throw new Error('Access denied: You do not have permission for this action.');
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
        throw new Error(errorMsg);
    }

    return data;
}

// Authentication APIs
export const authApi = {
    login: (email, password, adminKey = '') =>
        apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, adminKey })
        }),
    register: (payload) =>
        apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
};

// Student & Faculty Request APIs
export const requestsApi = {
    getDashboardStats: () => apiRequest('/requests/dashboard'),
    getMyRequests: () => apiRequest('/requests/my'),
    getRequestDetails: (id) => apiRequest(`/requests/${id}`),
    createRequest: (payload) =>
        apiRequest('/requests', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
};

// Technician APIs
export const technicianApi = {
    getDashboardStats: () => apiRequest('/technician/dashboard'),
    getAssignedRequests: () => apiRequest('/technician/requests'),
    getRequestDetails: (id) => apiRequest(`/technician/requests/${id}`),
    startWork: (id) =>
        apiRequest(`/technician/requests/${id}/start`, {
            method: 'PUT'
        }),
    resolveRequest: (id, resolutionNotes) =>
        apiRequest(`/technician/requests/${id}/resolve`, {
            method: 'PUT',
            body: JSON.stringify({ resolutionNotes })
        })
};

// Admin APIs
export const adminApi = {
    getDashboardStats: () => apiRequest('/admin/dashboard'),
    getAllRequests: (params = {}) => {
        const query = new URLSearchParams();
        if (params.status) query.append('status', params.status);
        if (params.category) query.append('category', params.category);
        if (params.priority) query.append('priority', params.priority);
        if (params.search) query.append('search', params.search);
        const qs = query.toString();
        return apiRequest(`/admin/requests${qs ? `?${qs}` : ''}`);
    },
    getRequestDetails: (id) => apiRequest(`/admin/requests/${id}`),
    assignTechnician: (id, technicianId, comment) =>
        apiRequest(`/admin/requests/${id}/assign`, {
            method: 'PUT',
            body: JSON.stringify({ technicianId, comment })
        }),
    updatePriority: (id, priority, comment) =>
        apiRequest(`/admin/requests/${id}/priority`, {
            method: 'PUT',
            body: JSON.stringify({ priority, comment })
        }),
    rejectRequest: (id, reason) =>
        apiRequest(`/admin/requests/${id}/reject`, {
            method: 'PUT',
            body: JSON.stringify({ reason })
        }),
    getTechnicians: () => apiRequest('/admin/technicians'),
    createTechnician: (payload) =>
        apiRequest('/admin/technicians', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
};

// Utilities
export function formatDate(dateStr) {
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

export const CATEGORY_ICONS = {
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
