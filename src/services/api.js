// API Service

import axios from 'axios';

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not set');
}

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (user?.token) {
        config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    return config;
});

// Authentication API
export const authAPI = {
    // User login
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    // User registration
    register: async (name, email, password) => {
        const response = await api.post('/auth/register', { name, email, password });
        return response.data;
    },

    // Update user profile
    updateUser: async (userId, name, email, password) => {
        const response = await api.put(`/users/${userId}`, { name, email, password });
        return response.data;
    },
};

// Tasks API
export const tasksAPI = {
    // Get all tasks
    getTasks: async () => {
        const response = await api.get('/tasks');
        return response.data;
    },

    // Create a new task
    addTask: async (title, status = false, dueDateTime = null) => {
        const taskData = { title, status };
        if (dueDateTime) {
            taskData.dueDateTime = dueDateTime;
        }
        const response = await api.post('/tasks', taskData);
        return response.data;
    },

    // Toggle task completion status
    toggleTask: async (taskId) => {
        const response = await api.put(`/tasks/${taskId}/toggle`);
        return response.data;
    },

    // Delete a task
    deleteTask: async (taskId) => {
        const response = await api.delete(`/tasks/${taskId}`);
        return response.data;
    },

    // Update task
    updateTask: async (taskId, title, status, dueDateTime = null) => {
        const payload = {
            title,
            status,
            dueDateTime: dueDateTime ?? null, // always present even as null so backend will handel it
        };
        const response = await api.put(`/tasks/${taskId}`, payload);
        return response.data;
    },
};

// MFA API
export const mfaAPI = {
    // Setup TOTP secret and QR URI
    setupMfa: async () => {
        const response = await api.post('/mfa/setup');
        return response.data;
    },

    // Verify TOTP code and enable MFA
    verifyMfaSetup: async (code) => {
        const response = await api.post('/mfa/verify-setup', { code });
        return response.data;
    },

    // Verify a TOTP code and disable MFA
    disableMfa: async (code) => {
        const response = await api.post('/mfa/disable', { code });
        return response.data;
    },

    // Exchange temp token and TOTP code for a full JWT
    mfaLogin: async (tempToken, code) => {
        const response = await api.post('/auth/mfa-login', { tempToken, code });
        return response.data;
    },
};

// Subscription API
export const subscriptionAPI = {
    // Create an order
    createOrder: async (planType = 'monthly') => {
        const response = await api.post(`/subscription/create-order?planType=${planType}`);
        return response.data;
    },

    // Verify payment
    verifyPayment: async (razorpay_order_id, razorpay_payment_id, razorpay_signature, planType = 'monthly') => {
        const response = await api.post(`/subscription/verify-payment?planType=${planType}`, {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        });
        return response.data;
    },

    // Get subscription status
    getStatus: async () => {
        const response = await api.get('/subscription/status');
        return response.data;
    },
};

export default api;