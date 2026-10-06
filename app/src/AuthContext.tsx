import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { LoginRequest, RegisterRequest } from './services/api/generatedClient';
import {
  apiClient,
  refreshSession,
  SESSION_EXPIRED_EVENT,
  SESSION_REFRESHED_EVENT,
  setAccessToken,
} from './services/api/apiClient';

export interface AuthUser {
  username: string;
}

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  sessionError: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const handleExpired = () => {
      if (active) {
        queryClient.clear();
        setUser(null);
      }
    };
    const handleRefreshed = (event: Event) => {
      if (!active) return;
      const { username } = (event as CustomEvent<{ username: string }>).detail;
      setUser({ username });
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    window.addEventListener(SESSION_REFRESHED_EVENT, handleRefreshed);

    void refreshSession()
      .then((session) => {
        if (active && session) setUser({ username: session.username });
      })
      .catch((error: unknown) => {
        if (active) setSessionError(`Could not restore your session: ${getErrorMessage(error)}`);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
      window.removeEventListener(SESSION_REFRESHED_EVENT, handleRefreshed);
    };
  }, [queryClient]);

  const login = useCallback(async (username: string, password: string) => {
    const session = await apiClient.login(new LoginRequest({ username, password }));
    queryClient.clear();
    setAccessToken(session.token);
    setUser({ username: session.username });
    setSessionError(null);
  }, [queryClient]);

  const signup = useCallback(
    async (username: string, password: string) => {
      await apiClient.register(new RegisterRequest({ username, password }));
      await login(username, password);
    },
    [login],
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
      setSessionError(null);
    } catch (error) {
      setSessionError(`Logout could not be completed on the server: ${getErrorMessage(error)}`);
    } finally {
      queryClient.clear();
      setAccessToken(null);
      setUser(null);
    }
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ user, loading, sessionError, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
