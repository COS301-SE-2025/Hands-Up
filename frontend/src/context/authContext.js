
import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout } from '../utils/apiCalls'; 
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
 useEffect(() => {
    const checkSession = async () => {
      try {
       
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const data = await apiLogin({ email, password });
      setCurrentUser(data.user); 
      navigate('/Home'); 
      return data;
    } catch (error) {
      setCurrentUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiLogout(); 
      setCurrentUser(null);
      navigate('/login'); 
    } catch (error) {
      console.error("Logout failed:", error);

      setCurrentUser(null);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    isLoggedIn: !!currentUser, 
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
