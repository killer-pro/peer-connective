import api, { apiService } from './api';

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

// Mise à jour de l'interface pour correspondre à la réponse de Django
interface AuthResponse {
  token: string;
  user_id: number;
  username: string;
  email: string;
}

const TOKEN_KEY = 'auth_token';
const USER_INFO_KEY = 'auth_user';

// Stockage et récupération du token en localStorage
const saveAuth = (auth: AuthResponse) => {
  localStorage.setItem(TOKEN_KEY, auth.token);
  localStorage.setItem(USER_INFO_KEY, JSON.stringify({
    id: auth.user_id,
    username: auth.username,
    email: auth.email
  }));
};

const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

const getUserInfo = () => {
  const userStr = localStorage.getItem(USER_INFO_KEY);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Failed to parse user info', error);
    return null;
  }
};

const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
};

// Service d'authentification
export const authService = {
  // Connexion
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiService.post<AuthResponse>('/users/login/', credentials);
    saveAuth(response);
    return response;
  },

  // Inscription
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiService.post<AuthResponse>('/users/', data);
    saveAuth(response);
    return response;
  },

  // Déconnexion
  logout: async (): Promise<void> => {
    try {
      await apiService.post('/users/logout/', {});
    } catch (error) {
      console.error('Logout error', error);
    }
    clearAuth();
  },

  // Vérification de l'authentification
  isAuthenticated: (): boolean => {
    return !!getToken();
  },

  // Récupération du token pour les requêtes API
  getToken,

  // Récupération des informations utilisateur
  getCurrentUser: async () => {
    if (!authService.isAuthenticated()) return null;
    return apiService.get('/users/me/');
  },

  // Récupération des informations utilisateur depuis le stockage local
  getUserInfo
};

// Fonction pour ajouter un intercepteur de requête avec le token
export const withAuth = async <T>(
    apiCall: () => Promise<T>
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    // Si erreur 401, rediriger vers la page de connexion
    if (error instanceof Error && error.message.includes('401')) {
      clearAuth();
      // Rediriger vers la page de connexion ou dispatchez une action pour le faire
      window.location.href = '/login';
    }
    throw error;
  }
};