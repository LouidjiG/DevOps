import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../lib/api';
import type { User } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('Chargement de l\'utilisateur...');
        const token = localStorage.getItem('token');
        console.log('Token trouvé dans le localStorage:', !!token);

        if (token) {
          console.log('Tentative de récupération des informations utilisateur...');
          const response = await authApi.getMe();
          console.log('Réponse de l\'API:', response);
          if (response.data && (response.data as any).data) {
            setUser((response.data as any).data);
            console.log('Utilisateur connecté:', (response.data as any).data);
          } else {
            setUser(response.data);
            console.log('Utilisateur connecté (structure legacy?):', response.data);
          }
        }
      } catch (err: any) {
        console.error('Échec du chargement de l\'utilisateur:', err);
        if (err.response) {
          console.error('Détails de l\'erreur:', {
            status: err.response.status,
            data: err.response.data,
            headers: err.response.headers
          });
        }
        localStorage.removeItem('token');
      } finally {
        console.log('Chargement terminé');
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('Tentative de connexion avec:', { email });
    setError(null);
    try {
      console.log('Appel à authApi.login...');
      const response = await authApi.login({ email, password });

      console.log('Réponse complète de l\'API:', JSON.stringify(response, null, 2));

      if (!response.data) {
        throw new Error('Aucune donnée dans la réponse');
      }

      let user, token;

      if (response.data.data && response.data.data.user && response.data.data.token) {
        user = response.data.data.user;
        token = response.data.data.token;
      }
      else if (response.data.user && response.data.token) {
        user = response.data.user;
        token = response.data.token;
      }
      else if (response.data.data && response.data.data.user && response.headers.authorization) {
        user = response.data.data.user;
        token = response.headers.authorization.replace('Bearer ', '');
      }

      console.log('Token extrait:', token ? 'oui' : 'non');
      console.log('Utilisateur extrait:', user);

      if (!token) {
        console.error('Structure de réponse inattendue:', response.data);
        throw new Error('Impossible d\'extraire le token de la réponse');
      }

      localStorage.setItem('token', token);
      setUser(user);

      const origin = location.state?.from?.pathname || '/dashboard';
      console.log('Redirection vers:', origin);
      navigate(origin);
    } catch (err: any) {
      console.error('Erreur lors de la connexion:', err);
      console.error('Détails de l\'erreur:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      const errorMessage = err.response?.data?.message || 'Échec de la connexion';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (username: string, email: string, password: string, role?: string) => {
    setError(null);
    try {
      await authApi.register({ username, email, password, role });
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || "Échec de l'inscription");
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const isAuthenticated = !!user;

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    error,
    refreshUser: async () => {
      try {
        const response = await authApi.getMe();
        if (response.data && (response.data as any).data) {
          setUser((response.data as any).data);
        } else {
          setUser(response.data);
        }
      } catch (err) {
        console.error('Failed to refresh user:', err);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
