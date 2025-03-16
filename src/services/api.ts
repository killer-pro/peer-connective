import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Créer une instance axios avec une configuration de base
const apiClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api', // Ajustez selon votre URL d'API
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification aux requêtes
apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        // Format pour Django REST Framework Token Authentication
        config.headers.Authorization = `Token ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs de réponse
apiClient.interceptors.response.use(
    (response) => {
      return response.data;
    },
    (error) => {
      const message = error.response?.data?.detail || error.message;
      return Promise.reject(new Error(message));
    }
);

// Service API avec méthodes pour les types de requêtes courants
export const apiService = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.get(url, config);
  },

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.post(url, data, config);
  },

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.put(url, data, config);
  },

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.patch(url, data, config);
  },

    delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        return apiClient.delete(url, config);
    },
    patchForm: <T>(url: string, config?: FormData): Promise<T> => {
        return apiClient.patchForm(url, config);
    },


};

export default apiClient;