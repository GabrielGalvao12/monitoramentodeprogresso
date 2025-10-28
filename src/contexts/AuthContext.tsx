import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  verifyEmail: () => void;
  requestPasswordReset: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const login = async (email: string, password: string) => {
    if (!validateEmail(email)) {
      return { success: false, error: "E-mail inválido. Use o formato: usuario@dominio.com" };
    }
    if (!validatePassword(password)) {
      return { success: false, error: "A senha deve ter no mínimo 8 caracteres" };
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const existingUser = users.find((u: any) => u.email === email && u.password === password);

    if (!existingUser) {
      return { success: false, error: "E-mail ou senha incorretos" };
    }

    if (!existingUser.emailVerified) {
      return { success: false, error: "Verifique seu e-mail antes de fazer login" };
    }

    const userData: User = {
      email: existingUser.email,
      name: existingUser.name,
      emailVerified: true,
    };

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    return { success: true };
  };

  const signup = async (name: string, email: string, password: string) => {
    if (!name.trim()) {
      return { success: false, error: "Nome é obrigatório" };
    }
    if (!validateEmail(email)) {
      return { success: false, error: "E-mail inválido. Use o formato: usuario@dominio.com" };
    }
    if (!validatePassword(password)) {
      return { success: false, error: "A senha deve ter no mínimo 8 caracteres" };
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const existingUser = users.find((u: any) => u.email === email);

    if (existingUser) {
      return { success: false, error: "Este e-mail já está cadastrado" };
    }

    const newUser = {
      email,
      name,
      password,
      emailVerified: false,
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("pendingVerification", email);

    return { success: true };
  };

  const verifyEmail = () => {
    const pendingEmail = localStorage.getItem("pendingVerification");
    if (pendingEmail) {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const updatedUsers = users.map((u: any) =>
        u.email === pendingEmail ? { ...u, emailVerified: true } : u
      );
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      localStorage.removeItem("pendingVerification");
    }
  };

  const requestPasswordReset = (email: string) => {
    if (!validateEmail(email)) {
      return;
    }
    // Simulação de envio de e-mail
    localStorage.setItem("passwordResetRequested", email);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, verifyEmail, requestPasswordReset }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
