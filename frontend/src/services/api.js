import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('safenet_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token invalid or expired
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('safenet_token');
        localStorage.removeItem('safenet_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
};

export const cameraAPI = {
  getAll: () => api.get('/cameras'),
  add: (data) => api.post('/cameras', data),
  update: (id, data) => api.put(`/cameras/${id}`, data),
  delete: (id) => api.delete(`/cameras/${id}`),
  testConnection: (id) => api.post(`/cameras/${id}/test`),
};

export const vehicleAPI = {
  getAll: (params) => api.get('/vehicles', { params }),
  getLive: (cameraId) => api.get('/vehicles/live', { params: { cameraId } }),
};

export const alertAPI = {
  getAll: (params) => api.get('/alerts', { params }),
  getActive: () => api.get('/alerts/active'),
  create: (data) => api.post('/alerts', data),
  acknowledge: (id) => api.put(`/alerts/${id}/acknowledge`),
  resolve: (id) => api.put(`/alerts/${id}/resolve`),
};

export const riskAPI = {
  predict: (data) => api.post('/risk/predict', data),
  getRecent: (limit = 20) => api.get('/risk/recent', { params: { limit } }),
  getHotspots: (filter = 'ALL') => api.get('/risk/hotspots', { params: { filter } }),
};

export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  getRiskDistribution: () => api.get('/analytics/risk-distribution'),
  getRiskTypes: () => api.get('/analytics/risk-types'),
  getTrafficDensity: () => api.get('/analytics/traffic-density'),
  getHourlyRisk: () => api.get('/analytics/hourly-risk'),
};

export const aiAPI = {
  analyze: (data) => api.post('/ai/analyze', data),
  upload: (formData) => api.post('/ai/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  simulateIncident: (riskType, cameraId) => api.post('/ai/simulate-incident', { risk_type: riskType, camera_id: cameraId }),
};

export const healthAPI = {
  getHealth: () => api.get('/health'),
};

export default api;
