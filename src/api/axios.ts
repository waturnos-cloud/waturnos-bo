/// <reference types="vite/client" />

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
});

export const getToken = () => localStorage.getItem('jwtToken');

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err?.response?.status === 401) {
      // Notify the app that auth expired. AuthProvider listens for this event.
      localStorage.removeItem('jwtToken');
      window.dispatchEvent(new CustomEvent('auth:logout', { detail: { status: 401 } }));
    }
    return Promise.reject(err);
  }
);

export default api;

