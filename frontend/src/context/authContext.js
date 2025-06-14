import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, logout as apiLogout, getLoggedInUserDetails } from '../utils/apiCalls'; 

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true); 

  const navigate = useNavigate();

  const checkAuthStatus = async () => {
    try {
      const response = await getLoggedInUserDetails(); 
      
      if (response && response.user) {
        setIsLoggedIn(true);
        setUserData(response.user);
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      setIsLoggedIn(false);
      setUserData(null);
    } finally {
      setLoadingAuth(false);
    }
  };

  useEffect(() => {
    checkAuthStatus(); 
  }, []);

  const login = async (credentials) => {
    setLoadingAuth(true);
    try {
      const responseData = await apiLogin(credentials); 
      setIsLoggedIn(true);
      setUserData(responseData.user); 
      navigate('../pages/Home');
      return responseData;
    } catch (error) {
      setIsLoggedIn(false);
      setUserData(null);
      throw error; 
    } finally {
      setLoadingAuth(false);
    }
  };

  const logout = async () => {
    try {
      await apiLogout(); 
      setIsLoggedIn(false);
      setUserData(null);
      navigate('../pages/login'); 
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggedIn(false);
      setUserData(null);
      navigate('../pages/login');
    }
  };

  const authContextValue = {
    isLoggedIn,
    userData,
    loadingAuth,
    login,
    logout,
    refreshUserData: checkAuthStatus 
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};