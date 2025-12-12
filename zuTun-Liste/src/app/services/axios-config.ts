import axios, { AxiosInstance } from 'axios';
import { environment } from '../../environments/environment';

/**
 * Central axios instance used throughout the app.
 * - Reads base URL and auth path from `src/environments/environment.ts`.
 * - Attaches JWT from localStorage (key from environment.tokenStorageKey).
 */

const api: AxiosInstance = axios.create({
  baseURL: environment.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// Request interceptor: attach Authorization header when token exists
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem(environment.tokenStorageKey);
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore localStorage errors in some environments
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: on 401 remove token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error && error.response && error.response.status === 401) {
      try {
        localStorage.removeItem(environment.tokenStorageKey);
      } catch (e) {}
      // redirect to login route of the SPA
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export async function login(credentials: { username?: string; email?: string; password: string }) {
  // The authLoginPath is appended to baseURL by axios
  const response = await api.post(environment.authLoginPath, credentials);
  const token = response?.data?.token || response?.data?.accessToken || response?.data?.jwt;
  if (token) {
    try {
      localStorage.setItem(environment.tokenStorageKey, token);
    } catch (e) {}
  }
  return response;
}

export function logout() {
  try {
    localStorage.removeItem(environment.tokenStorageKey);
  } catch (e) {}
}

export default api;
