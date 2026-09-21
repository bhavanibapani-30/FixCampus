/**
 * Authentication Form Management (Login & Register)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const token = Storage.getToken();
    const user = Storage.getUser();
    if (token && user) {
        if (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register.html')) {
            redirectToRoleDashboard(user.role);
            return;
        }
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        
        // Show/hide admin key field based on email input
        const emailInput = document.getElementById('email');
        const adminKeyGroup = document.getElementById('admin-key-group');
        if (emailInput && adminKeyGroup) {
            emailInput.addEventListener('input', () => {
                if (emailInput.value.toLowerCase().includes('admin')) {
                    adminKeyGroup.style.display = 'block';
                } else {
                    adminKeyGroup.style.display = 'none';
                }
            });
        }
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

function redirectToRoleDashboard(role) {
    if (role === 'ADMIN') {
        window.location.href = 'admin-dashboard.html';
    } else if (role === 'TECHNICIAN') {
        window.location.href = 'technician-dashboard.html';
    } else {
        window.location.href = 'student-dashboard.html';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const adminKey = document.getElementById('adminKey')?.value.trim() || '';
    const submitBtn = document.getElementById('submit-btn');

    if (!email || !password) {
        showToast('Please fill in both email and password', 'error');
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Authenticating...';

        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, adminKey })
        });

        Storage.setToken(data.token);
        Storage.setUser({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role
        });

        showToast(`Welcome back, ${data.name}!`, 'success');
        setTimeout(() => {
            redirectToRoleDashboard(data.role);
        }, 800);
    } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const submitBtn = document.getElementById('submit-btn');

    if (!name || !email || !password || !confirmPassword) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';

        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });

        Storage.setToken(data.token);
        Storage.setUser({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role
        });

        showToast('Account created successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'student-dashboard.html';
        }, 800);
    } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Student Account';
    }
}

/**
 * Helper to auto-fill demo accounts on login screen
 */
function fillDemo(role) {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const adminKeyInput = document.getElementById('adminKey');
    const adminKeyGroup = document.getElementById('admin-key-group');

    if (role === 'admin') {
        emailInput.value = 'admin@college.edu';
        passwordInput.value = 'Admin@123';
        if (adminKeyGroup) adminKeyGroup.style.display = 'block';
        if (adminKeyInput) adminKeyInput.value = 'CMS-ADMIN-2026';
    } else if (role === 'tech') {
        emailInput.value = 'tech.electrical@college.edu';
        passwordInput.value = 'Tech@123';
        if (adminKeyGroup) adminKeyGroup.style.display = 'none';
        if (adminKeyInput) adminKeyInput.value = '';
    } else if (role === 'student') {
        emailInput.value = 'student1@college.edu';
        passwordInput.value = 'Student@123';
        if (adminKeyGroup) adminKeyGroup.style.display = 'none';
        if (adminKeyInput) adminKeyInput.value = '';
    }
}
