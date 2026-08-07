import axios from 'axios';

// Ensure this matches your FastAPI backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const adminApiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to attach the JWT token to requests
adminApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminApi = {
  // Authentication
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email); 
    formData.append('password', password);
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
  },

  // Vastu Rules CMS
  getVastuRules: async () => {
    const response = await adminApiClient.get('/admin/rules');
    return response.data;
  },

  updateVastuRule: async (ruleId, data) => {
    const response = await adminApiClient.put(`/admin/rules/${ruleId}`, data);
    return response.data;
  },
  
  // Dashboard Overviews
  getDashboardStats: async () => {
    const response = await adminApiClient.get('/admin/stats');
    return response.data;
  },

  // User Management
  getUsersList: async (page = 1, pageSize = 10) => {
    const response = await adminApiClient.get(`/admin/users?page=${page}&page_size=${pageSize}`);
    return response.data;
  }
};
