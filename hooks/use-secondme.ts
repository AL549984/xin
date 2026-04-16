'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SecondMeUser } from '@/lib/secondme';

interface UseSecondMeResult {
  user: SecondMeUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

export function useSecondMe(): UseSecondMeResult {
  const [user, setUser] = useState<SecondMeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/secondme/userinfo');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(() => {
    window.location.href = '/api/auth/secondme';
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/secondme/userinfo', { method: 'DELETE' });
    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    logout,
  };
}
