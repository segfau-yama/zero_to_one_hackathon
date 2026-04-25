import { createContext, useContext, useState, ReactNode } from "react";

export interface AuthUser {
  id: number;
  username: string;
  isWorker: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = sessionStorage.getItem("authUser");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  });

  const login = (user: AuthUser) => {
    setUser(user);
    sessionStorage.setItem("authUser", JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("authUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
