import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state on mount
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.name === "Vicky") {
            parsed.name = "Sathya";
            localStorage.setItem("user", JSON.stringify(parsed));
          }
          setUser(parsed);
        } catch {
          setUser({ username: "admin", name: "Sathya", role: "Admin" });
        }
      } else {
        setUser({ username: "admin", name: "Sathya", role: "Admin" });
      }
    } else {
      setToken(null);
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const data = await authApi.login(username, password);
      const accessToken = data.access_token;

      const userData = {
        username: username.trim(),
        name: "Sathya",
        role: "Admin",
      };

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(accessToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        (error.response?.status === 401
          ? "Incorrect username or password"
          : "Server connection failed. Please ensure the backend is running.");
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authApi.logout();
      }
    } catch (err) {
      console.warn("Backend logout notification failed:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token),
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
