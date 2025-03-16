
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { authService } from './auth';

// Base API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error: Error | AxiosError) => {
    // Only handle Axios errors
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const { response } = error;

    // Handle 401 Unauthorized - token expired or invalid
    if (response?.status === 401) {
      // Logout user if token is invalid/expired
      authService.logout();
      window.location.href = '/auth';
    }

    return Promise.reject(error);
  }
);

// Type checking for error handling
const isAxiosError = (error: any): error is AxiosError => {
  return error.isAxiosError === true;
};

// API service with typed methods
export const apiService = {
  // GET request
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.get(url, config);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // POST request
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // PUT request
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // PATCH request
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.patch(url, data, config);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.delete(url, config);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

// Error handler function
const handleApiError = (error: unknown): void => {
  if (isAxiosError(error)) {
    const { response } = error;
    
    // Log errors to console in development
    console.error(
      'API Error:',
      response?.status,
      response?.data || error.message
    );
  } else if (error instanceof Error) {
    console.error('API Error:', error.message);
  } else {
    console.error('Unknown API Error', error);
  }
};

export default api;
