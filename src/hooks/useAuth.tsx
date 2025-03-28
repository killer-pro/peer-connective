import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth';

interface User {
  id: number;
  username: string;
  email: string;
  phone_number?: string;
  profile_image?: string;
  online_status?: boolean;
  last_seen?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, password2: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Ajoutez un état séparé pour l'authentification
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          setIsAuthenticated(true); // Mettez à jour l'état d'authentification

          // Récupération immédiate des informations utilisateur stockées localement
          const storedUser = authService.getUserInfo();
          if (storedUser) {
            setUser(storedUser as User);
          }

          // Puis mise à jour avec les données fraîches du serveur
          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser as User);
          } catch (error) {
            console.error('Failed to fetch current user data', error);
            // En cas d'échec, vérifiez si nous devons nous déconnecter
            if (error instanceof Error && error.message.includes('401')) {
              setIsAuthenticated(false);
              setUser(null);
            }
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to initialize auth', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ username, password });
      // Créer un objet user à partir de la réponse
      const userData: User = {
        id: response.user_id,
        username: response.username,
        email: response.email
      };
      setUser(userData);
      setIsAuthenticated(true); // Mettez à jour l'état d'authentification
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string, password2: string) => {
    setIsLoading(true);
    try {
      const response = await authService.register({ username, email, password, password2 });
      // Créer un objet user à partir de la réponse
      const userData: User = {
        id: response.user_id,
        username: response.username,
        email: response.email
      };
      setUser(userData);
      setIsAuthenticated(true); // Mettez à jour l'état d'authentification
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false); // Mettez à jour l'état d'authentification
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <AuthContext.Provider value={{
        user,
        isAuthenticated, // Utilisez l'état séparé
        isLoading,
        login,
        register,
        logout
      }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};