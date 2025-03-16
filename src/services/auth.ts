
import { api } from './api';

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
}

interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

interface RefreshResponse {
  access: string;
}

const TOKEN_KEY = 'auth_tokens';

// Stockage et récupération des tokens en localStorage
const saveTokens = (tokens: { access: string; refresh: string }) => {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
};

const getTokens = (): { access: string | null; refresh: string | null } => {
  const tokensStr = localStorage.getItem(TOKEN_KEY);
  if (!tokensStr) return { access: null, refresh: null };
  
  try {
    return JSON.parse(tokensStr);
  } catch (error) {
    console.error('Failed to parse auth tokens', error);
    return { access: null, refresh: null };
  }
};

const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// Service d'authentification
export const authService = {
  // Connexion
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login/', credentials);
    saveTokens({ access: response.access, refresh: response.refresh });
    return response;
  },
  
  // Inscription
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register/', data);
    saveTokens({ access: response.access, refresh: response.refresh });
    return response;
  },
  
  // Déconnexion
  logout: async (): Promise<void> => {
    const { refresh } = getTokens();
    if (refresh) {
      try {
        await api.post('/auth/logout/', { refresh });
      } catch (error) {
        console.error('Logout error', error);
      }
    }
    clearTokens();
  },
  
  // Rafraîchissement du token
  refreshToken: async (): Promise<string | null> => {
    const { refresh } = getTokens();
    if (!refresh) return null;
    
    try {
      const response = await api.post<RefreshResponse>('/auth/token/refresh/', { refresh });
      saveTokens({ access: response.access, refresh });
      return response.access;
    } catch (error) {
      console.error('Token refresh error', error);
      clearTokens();
      return null;
    }
  },
  
  // Vérification de l'authentification
  isAuthenticated: (): boolean => {
    const { access } = getTokens();
    return !!access;
  },
  
  // Récupération du token pour les requêtes API
  getAccessToken: (): string | null => {
    const { access } = getTokens();
    return access;
  },
  
  // Récupération des informations utilisateur
  getCurrentUser: async () => {
    if (!authService.isAuthenticated()) return null;
    return api.get('/auth/user/', {
      token: authService.getAccessToken() || undefined
    });
  }
};

// Fonction pour ajouter un intercepteur de requête avec le token
export const withAuth = async <T>(
  apiCall: () => Promise<T>
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    // Si erreur 401, tenter de rafraîchir le token et réessayer
    if (error instanceof Error && error.message.includes('401')) {
      const newToken = await authService.refreshToken();
      if (newToken) {
        return await apiCall();
      }
    }
    throw error;
  }
};
