
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

// Fonction principale pour les requêtes HTTP
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { token, params, ...fetchOptions } = options;
  
  // Configuration des headers par défaut
  const headers = new Headers(fetchOptions.headers);
  
  if (!headers.has("Content-Type") && !fetchOptions.body) {
    headers.append("Content-Type", "application/json");
  }
  
  // Ajout du token d'authentification si présent
  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
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
      body: data ? JSON.stringify(data) : undefined,
      ...options 
    }),
  
  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) => 
    apiRequest<T>(endpoint, { 
      method: "PUT", 
      body: data ? JSON.stringify(data) : undefined,
      ...options 
    }),
  
  patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) => 
    apiRequest<T>(endpoint, { 
      method: "PATCH", 
      body: data ? JSON.stringify(data) : undefined,
      ...options 
    }),
  
  delete: <T>(endpoint: string, options?: RequestOptions) => 
    apiRequest<T>(endpoint, { method: "DELETE", ...options }),
};
