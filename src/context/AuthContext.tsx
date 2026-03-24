import React, { createContext, useContext, useEffect, useState } from 'react';
import { usersDAO, configurationsDAO } from '../services/db';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  branding: any;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  refreshBranding: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  branding: null,
  login: async () => false, 
  logout: () => {},
  refreshBranding: async () => {},
  refreshUser: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [branding, setBranding] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refreshBranding = async () => {
    const configs = await configurationsDAO.getAll();
    if (configs.length > 0) {
      setBranding(configs[0]);
    }
  };

  const login = async (email: string, password?: string) => {
    const users = await usersDAO.getAll();
    const configs = await configurationsDAO.getAll();
    const config = (configs.find((c: any) => c.id === 'main') || {}) as any;
    const autoAuthorize = config.autoAuthorizeNewUsers === true;

    const found = users.find((u: any) => 
      u.email === email && 
      (autoAuthorize || u.isActive !== false) && 
      (!u.password || u.password === password)
    );
    if (found) {
      setUser(found);
      localStorage.setItem('currentUser', JSON.stringify(found));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const refreshUser = async () => {
    if (user?.id) {
      const updated = await usersDAO.getById(user.id);
      if (updated) {
        setUser(updated);
        localStorage.setItem('currentUser', JSON.stringify(updated));
      }
    }
  };

  useEffect(() => {
    // Escucha en tiempo real de la configuración de branding
    const unsubscribeBranding = configurationsDAO.subscribe((configs) => {
      if (configs.length > 0) {
        setBranding(configs[0]);
      }
    });

    const init = async () => {
      try {
        const saved = localStorage.getItem('currentUser');
        if (saved) {
          setUser(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error parsing session:', error);
        localStorage.removeItem('currentUser');
      } finally {
        setLoading(false);
      }
    };
    init();

    return () => {
      unsubscribeBranding();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, branding, login, logout, refreshBranding, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
