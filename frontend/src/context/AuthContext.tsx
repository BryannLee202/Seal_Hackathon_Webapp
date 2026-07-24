import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../api/client";
import type { CurrentUser, RoleName } from "../api/types";

interface AuthContextValue {
  user: CurrentUser | null;
  loading: boolean;
  hasRole: (role: RoleName) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get<CurrentUser>("/api/auth/me");
      setUser(data);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      await api.post("/api/auth/login", { email, password });
      await refreshUser();
    },
    [refreshUser],
  );

  const logout = useCallback(async () => {
    await api.post("/api/auth/logout");
    setUser(null);
  }, []);

  // Re-issues the JWT from the refresh token so newly-granted roles (e.g. just
  // assigned as Judge/Mentor by the Coordinator) take effect without a full re-login.
  const refreshPermissions = useCallback(async () => {
    await api.post("/api/auth/refresh");
    await refreshUser();
  }, [refreshUser]);

  const hasRole = useCallback(
    (role: RoleName) => user?.roles.some((r) => r.roleName === role) ?? false,
    [user],
  );

  const value = useMemo(
    () => ({ user, loading, hasRole, login, logout, refreshUser, refreshPermissions }),
    [user, loading, hasRole, login, logout, refreshUser, refreshPermissions],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
