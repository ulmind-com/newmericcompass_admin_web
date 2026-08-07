import axios from 'axios';

// Backend base, e.g. https://your-app.onrender.com/api . Falls back to local dev.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const TOKEN_KEY = 'nc_admin_token';

export const client = axios.create({ baseURL: API_BASE_URL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, drop the token and bounce to login.
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(err);
  },
);
