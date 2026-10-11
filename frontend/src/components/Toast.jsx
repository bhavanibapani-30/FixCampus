import React from 'react';

export default function Toast({ toasts, onDismiss }) {
    if (!toasts || toasts.length === 0) return null;

    return (
        <div id="toast-container">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`toast toast-${toast.type || 'info'}`}
                    onClick={() => onDismiss(toast.id)}
                    style={{ cursor: 'pointer' }}
                >
                    <span>
                        {toast.type === 'success' && '✅'}
                        {toast.type === 'error' && '⚠️'}
                        {toast.type === 'info' && 'ℹ️'}
                    </span>
                    <span style={{ flex: 1 }}>{toast.message}</span>
                    <span style={{ opacity: 0.7, fontSize: '11px', marginLeft: 8 }}>&times;</span>
                </div>
            ))}
        </div>
    );
}
