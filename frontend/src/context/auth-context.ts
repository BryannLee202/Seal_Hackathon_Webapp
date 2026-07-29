import { createContext } from "react";
import type { CurrentUser, RoleName } from "../api/types";

export interface AuthContextValue {
  user: CurrentUser | null;
  loading: boolean;
  hasRole: (role: RoleName) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
