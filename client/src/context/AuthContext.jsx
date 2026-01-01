import { createContext, useContext, useState, useEffect } from 'react';
import { signup as signupService, login as loginService, logout as logoutService, verifyToken } from '../services/authService';
import { getToken, removeToken } from '../utils/storage';
import API from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(getToken());

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getToken();
      if (storedToken) {
        try {
          const response = await verifyToken();
          if (response.success) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            removeToken();
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          removeToken();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (token) {
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete API.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const signup = async (userData) => {
    try {
      const response = await signupService(userData);
      if (response.success) {
        setUser(response.data.user);
        setToken(response.data.token);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || { message: 'Signup failed' }
      };
    }
  };

  const login = async (credentials) => {
    try {
      const response = await loginService(credentials);
      if (response.success) {
        setUser(response.data.user);
        setToken(response.data.token);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || { message: 'Login failed' }
      };
    }
  };

  const logout = () => {
    logoutService();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    removeToken();
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    token,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
