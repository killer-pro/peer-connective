
import { toast } from "sonner";

// Configuration de base de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Interface pour les options de requête
interface RequestOptions extends RequestInit {
  token?: string;
  params?: Record<string, string>;
}

// Fonction pour construire l'URL avec les paramètres de requête
const buildUrl = (endpoint: string, params?: Record<string, string>): string => {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  
  return url.toString();
};

// Fonction pour récupérer le token d'authentification du stockage local
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Fonction principale pour les requêtes HTTP
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { token = getAuthToken(), params, ...fetchOptions } = options;
  
  // Configuration des headers par défaut
  const headers = new Headers(fetchOptions.headers);
  
  if (!headers.has("Content-Type") && !fetchOptions.body instanceof FormData) {
    headers.append("Content-Type", "application/json");
  }
  
  // Ajout du token d'authentification si présent
  if (token) {
    headers.append("Authorization", `Token ${token}`);
  }
  
  try {
    const response = await fetch(buildUrl(endpoint, params), {
      ...fetchOptions,
      headers,
    });
    
    // Vérification du statut de la réponse
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`);
    }
    
    // Si la réponse est vide ou No Content (204)
    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return {} as T;
    }
    
    // Parsing de la réponse JSON
    return await response.json() as T;
  } catch (error) {
    console.error("API request error:", error);
    
    // Affichage d'une notification d'erreur
    toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
    
    throw error;
  }
};

// Méthodes HTTP courantes
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) => 
    apiRequest<T>(endpoint, { method: "GET", ...options }),
  
  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) => 
    apiRequest<T>(endpoint, { 
      method: "POST", 
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
      ...options 
    }),
  
  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) => 
    apiRequest<T>(endpoint, { 
      method: "PUT", 
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
      ...options 
    }),
  
  patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) => 
    apiRequest<T>(endpoint, { 
      method: "PATCH", 
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
      ...options 
    }),
  
  delete: <T>(endpoint: string, options?: RequestOptions) => 
    apiRequest<T>(endpoint, { method: "DELETE", ...options }),
};

// API client adapted specifically for your Django API endpoints
export const callsApi = {
  getAllCalls: () => api.get('/api/calls/'),
  getCallHistory: () => api.get('/api/calls/history/'),
  getScheduledCalls: () => api.get('/api/calls/scheduled/'),
  getCallById: (id: number) => api.get(`/api/calls/${id}/`),
  createCall: (data: any) => api.post('/api/calls/', data),
  updateCall: (id: number, data: any) => api.put(`/api/calls/${id}/`, data),
  deleteCall: (id: number) => api.delete(`/api/calls/${id}/`),
  startCall: (pk: number) => api.post(`/api/calls/${pk}/start/`),
  joinCall: (pk: number) => api.post(`/api/calls/${pk}/join/`),
  leaveCall: (pk: number) => api.post(`/api/calls/${pk}/leave/`),
  endCall: (pk: number) => api.post(`/api/calls/${pk}/end/`),
  getCallMessages: (callId: number) => api.get(`/api/calls/messages/?call=${callId}`),
  sendCallMessage: (data: any) => api.post('/api/calls/messages/', data),
  getCallParticipants: (callId: number) => api.get(`/api/calls/participants/?call=${callId}`),
};

export const contactsApi = {
  getAllContacts: () => api.get('/api/contacts/'),
  getContactsByGroup: (groupId: number) => api.get(`/api/contacts/by_group/?group=${groupId}`),
  getFavoriteContacts: () => api.get('/api/contacts/favorites/'),
  getContactById: (id: number) => api.get(`/api/contacts/${id}/`),
  createContact: (data: any) => api.post('/api/contacts/', data),
  updateContact: (id: number, data: any) => api.put(`/api/contacts/${id}/`, data),
  deleteContact: (id: number) => api.delete(`/api/contacts/${id}/`),
  addToGroup: (pk: number, groupId: number) => api.post(`/api/contacts/${pk}/add_to_group/`, { group: groupId }),
  removeFromGroup: (pk: number, groupId: number) => api.post(`/api/contacts/${pk}/remove_from_group/`, { group: groupId }),
  toggleFavorite: (pk: number) => api.post(`/api/contacts/${pk}/toggle_favorite/`),
  getAllGroups: () => api.get('/api/contacts/groups/'),
  createGroup: (data: any) => api.post('/api/contacts/groups/', data),
  updateGroup: (id: number, data: any) => api.put(`/api/contacts/groups/${id}/`, data),
  deleteGroup: (id: number) => api.delete(`/api/contacts/groups/${id}/`),
};

export const signalingApi = {
  sendOffer: (data: any) => api.post('/api/signaling/offer/', data),
  sendAnswer: (data: any) => api.post('/api/signaling/answer/', data),
  sendIceCandidate: (data: any) => api.post('/api/signaling/ice-candidate/', data),
  pollSignaling: (callId: number) => api.get(`/api/signaling/poll/${callId}/`),
};

export const userApi = {
  login: (data: any) => api.post('/api/users/login/', data),
  logout: () => api.post('/api/users/logout/'),
  getCurrentUser: () => api.get('/api/users/me/'),
  updateUserStatus: (data: any) => api.patch('/api/users/status/', data),
  getUsers: () => api.get('/api/users/users/'),
  getUserById: (id: number) => api.get(`/api/users/users/${id}/`),
};
