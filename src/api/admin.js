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

  // ---- Day-wise remedial protocol ----
  listDayProtocols: async () => (await client.get('/admin/days')).data,
  updateDayProtocol: async (id, payload) => (await client.put(`/admin/days/${id}`, payload)).data,

  // ---- App content: side-menu links + share/review settings ----
  listAppLinks: async () => (await client.get('/admin/app/links')).data,
  createAppLink: async (payload) => (await client.post('/admin/app/links', payload)).data,
  updateAppLink: async (id, payload) => (await client.put(`/admin/app/links/${id}`, payload)).data,
  deleteAppLink: async (id) => (await client.delete(`/admin/app/links/${id}`)).data,
  getShareSettings: async () => (await client.get('/admin/app/share')).data,
  updateShareSettings: async (payload) => (await client.put('/admin/app/share', payload)).data,

  // ---- Billing: plans, entitlements, money ----
  listPlans: async () => (await client.get('/admin/billing/plans')).data,
  createPlan: async (payload) => (await client.post('/admin/billing/plans', payload)).data,
  updatePlan: async (id, payload) => (await client.put(`/admin/billing/plans/${id}`, payload)).data,
  deletePlan: async (id) => (await client.delete(`/admin/billing/plans/${id}`)).data,

  listEntitlements: async (params = {}) => (await client.get('/admin/billing/entitlements', { params })).data,
  grantAccess: async (payload) => (await client.post('/admin/billing/grant', payload)).data,
  revokeAccess: async (id) => (await client.delete(`/admin/billing/entitlements/${id}`)).data,
  resetQuota: async (id) => (await client.post(`/admin/billing/entitlements/${id}/reset-quota`)).data,

  listPayments: async (params = {}) => (await client.get('/admin/billing/payments', { params })).data,
  revenue: async () => (await client.get('/admin/billing/revenue')).data,

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
