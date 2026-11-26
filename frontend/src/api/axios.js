import axios from 'axios';

const api = axios.create({
  baseURL: window.location.hostname === 'localhost' ? '' : 'https://medgaurd-x.onrender.com',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medguard_token') || sessionStorage.getItem('medguard_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('medguard_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
