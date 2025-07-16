import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { email: string; password: string; firstName: string; lastName: string; role: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('sessionId');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('sessionId');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiRequest('POST', '/api/auth/login', { email, password });
      const data = await response.json();
      
      localStorage.setItem('sessionId', data.sessionId);
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: { email: string; password: string; firstName: string; lastName: string; role: string }) => {
    try {
      const response = await apiRequest('POST', '/api/auth/register', userData);
      const data = await response.json();
      
      // After registration, login the user
      await login(userData.email, userData.password);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      }).catch(console.error);
    }
    localStorage.removeItem('sessionId');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}