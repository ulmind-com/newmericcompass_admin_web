import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY, client } from './client';

export const adminApi = {
  // ---- Auth ----
  login: async (email, password) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    const { data } = await axios.post(`${API_BASE_URL}/auth/login`, form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    localStorage.setItem(TOKEN_KEY, data.access_token);
    return data;
  },
  me: async () => (await client.get('/auth/me')).data,
  logout: () => localStorage.removeItem(TOKEN_KEY),

  // ---- Dashboard ----
  getStats: async () => (await client.get('/admin/stats')).data,
  getUsers: async (page = 1, pageSize = 10) =>
    (await client.get(`/admin/users?page=${page}&page_size=${pageSize}`)).data,

  // ---- Categories ----
  getCategories: async () => (await client.get('/admin/categories/')).data,
  createCategory: async (payload) => (await client.post('/admin/categories/', payload)).data,
  updateCategory: async (id, payload) => (await client.put(`/admin/categories/${id}`, payload)).data,
  deleteCategory: async (id) => (await client.delete(`/admin/categories/${id}`)).data,

  // ---- Padas ----
  getPadas: async () => (await client.get('/admin/padas/')).data,
  updatePada: async (code, payload) => (await client.put(`/admin/padas/${code}`, payload)).data,

  // ---- Rules ----
  getRules: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return (await client.get(`/admin/rules/${qs ? `?${qs}` : ''}`)).data;
  },
  createRule: async (payload) => (await client.post('/admin/rules/', payload)).data,
  updateRule: async (id, payload) => (await client.put(`/admin/rules/${id}`, payload)).data,
  upsertRule: async (category, pada, payload) =>
    (await client.put(`/admin/rules/upsert/${category}/${pada}`, payload)).data,
  deleteRule: async (id) => (await client.delete(`/admin/rules/${id}`)).data,

  // ---- Submissions ----
  getSubmissions: async (page = 1, pageSize = 20) =>
    (await client.get(`/admin/submissions/?page=${page}&page_size=${pageSize}`)).data,
  getSubmission: async (id) => (await client.get(`/admin/submissions/${id}`)).data,
  updateSubmissionStatus: async (id, status) =>
    (await client.patch(`/admin/submissions/${id}`, { status })).data,

  // ---- Tips ----
  getTips: async () => (await client.get('/admin/tips/')).data,
  createTip: async (payload) => (await client.post('/admin/tips/', payload)).data,
  updateTip: async (id, payload) => (await client.put(`/admin/tips/${id}`, payload)).data,
  deleteTip: async (id) => (await client.delete(`/admin/tips/${id}`)).data,

  // ---- Uploads ----
  uploadImage: async (file, folder = 'newmericcompass') => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await client.post(`/admin/uploads/image?folder=${folder}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.url;
  },
};
