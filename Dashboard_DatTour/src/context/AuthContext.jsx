import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const storedUser =
    typeof window !== "undefined" ? localStorage.getItem("auth_user") : null;
  const initialUser = storedUser ? JSON.parse(storedUser) : null;
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(initialUser));
  const [user, setUser] = useState(initialUser);

  const login = (username, password) => {
    // Simple test login - in production, call your backend API
    if (
      (username === "admin" && password === "admin123") ||
      (username === "test" && password === "test")
    ) {
      const nextUser = {
        id: 1,
        username: username,
        name: username === "admin" ? "Admin User" : "Test User",
        role: "Admin",
        avatar: "👨‍💼",
      };

      setIsAuthenticated(true);
      setUser(nextUser);
      localStorage.setItem("auth_user", JSON.stringify(nextUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
