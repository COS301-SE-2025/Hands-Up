// src/context/AuthContext.js
import PropTypes from 'prop-types';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, getUserData,resetPassword as apiResetPassword,confirmPasswordReset as apiConfirmPasswordReset} from '../utils/apiCalls';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const updateUser = useCallback((userData) => {
        setCurrentUser(userData);
        
    }, []);

    const checkSession = useCallback(async () => {
        
        setLoading(true);

        try {
            const responseData = await getUserData();

            if (responseData && (responseData.status === 401 || responseData.status === 403)) {
                setCurrentUser(null);
                
            } else if (responseData && responseData.user && responseData.user.id) {
                setCurrentUser(responseData.user);
                
            } else {
                setCurrentUser(null);
                
            }
        } catch (error) {
            console.error("[AUTH_CONTEXT - checkSession] Unexpected error during session check (e.g., network issue):", error.message);
            setCurrentUser(null); 
        } finally {
            setLoading(false);
            
        }
    }, []);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    const login = useCallback(async ({ email, password }) => {
        
        setLoading(true); 
        try {
            const data = await apiLogin({ email, password }); 
            

            await checkSession(); 

            
            navigate('/Home'); 

            return data;
        } catch (error) {
            console.error('[AUTH_CONTEXT - login] Error during login:', error);
            setCurrentUser(null); 
            setLoading(false);
            throw error; 
        }
    }, [navigate, checkSession]); 

    const logout = useCallback(async () => {
        
        setLoading(true); 
        try {
            await apiLogout(); 
            setCurrentUser(null);
            setJustSignedUp(false);
            
            navigate('/login');
        } catch (error) {
            
            setCurrentUser(null);
            navigate('/login');
        } finally {
            setLoading(false);
            
        }
    }, [navigate]);

    const resetPassword = useCallback(async (email) => {
        
        
        try {
            const data = await apiResetPassword(email);
            
            return data;
        } catch (error) {
            console.error('[AUTH_CONTEXT - resetPassword] Error during password reset:', error);
            throw error;
        }
    }, []);

const confirmPasswordReset = async (email, token, newPassword,confirmNewPassword ) => {
    const data = await apiConfirmPasswordReset(email, token, newPassword, confirmNewPassword );
    return data;
   
};

    const value = {
        currentUser,
        isLoggedIn: !!currentUser,
        loading,
        login,
        logout,
        updateUser,
        resetPassword,
        confirmPasswordReset,
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

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};