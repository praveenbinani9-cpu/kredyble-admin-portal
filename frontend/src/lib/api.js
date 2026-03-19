import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kredyble_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kredyble_token');
      localStorage.removeItem('kredyble_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  verify: () => api.get('/auth/verify'),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getVolumeChart: () => api.get('/dashboard/charts/volume'),
  getRevenueChart: () => api.get('/dashboard/charts/revenue'),
};

// Collections APIs
export const collectionsAPI = {
  getStats: () => api.get('/collections/stats'),
  getFlow: () => api.get('/collections/flow'),
};

// Transactions APIs
export const transactionsAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
};

// Payouts APIs
export const payoutsAPI = {
  getAll: (status) => api.get('/payouts', { params: { status } }),
  getStats: () => api.get('/payouts/stats'),
};

// Payment Links APIs
export const paymentLinksAPI = {
  getAll: () => api.get('/payment-links'),
  getStats: () => api.get('/payment-links/stats'),
  getById: (id) => api.get(`/payment-links/${id}`),
};

// Beneficiaries APIs
export const beneficiariesAPI = {
  getAll: () => api.get('/beneficiaries'),
};

// Users APIs
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  getPendingApproval: () => api.get('/users/pending-approval'),
  getDropoffAnalytics: () => api.get('/users/analytics/dropoff'),
  getJourneyAnalytics: () => api.get('/users/analytics/journey'),
  approveDocument: (userId, documentType, data) => 
    api.put(`/users/${userId}/documents/${documentType}/approve`, data),
  approveUser: (userId) => api.put(`/users/${userId}/approve`),
  rejectUser: (userId, reason) => api.put(`/users/${userId}/reject`, null, { params: { reason } }),
};

// Memberships APIs
export const membershipsAPI = {
  getAll: () => api.get('/memberships'),
};

// Offers APIs
export const offersAPI = {
  getAll: () => api.get('/offers'),
  toggle: (id) => api.put(`/offers/${id}/toggle`),
};

// Revenue APIs
export const revenueAPI = {
  getAnalytics: () => api.get('/revenue/analytics'),
  getTrend: () => api.get('/revenue/trend'),
};

// PG Charges APIs
export const pgChargesAPI = {
  getAll: () => api.get('/pg-charges'),
  getSummary: () => api.get('/pg-charges/summary'),
};

// GST APIs
export const gstAPI = {
  getSummary: () => api.get('/gst/summary'),
  getTransactions: () => api.get('/gst/transactions'),
};

// Risk APIs
export const riskAPI = {
  getAlerts: () => api.get('/risk/alerts'),
  getSummary: () => api.get('/risk/summary'),
  action: (id, action) => api.put(`/risk/alerts/${id}/action`, null, { params: { action } }),
};

export default api;
