// src/context/AuthContext.js

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
        console.log("[AUTH_CONTEXT] currentUser updated manually via updateUser:", userData);
    }, []);

    const checkSession = useCallback(async () => {
        console.log("[AUTH_CONTEXT - checkSession] Starting session check...");
        setLoading(true);

        try {
            const responseData = await getUserData();

            if (responseData && (responseData.status === 401 || responseData.status === 403)) {
                setCurrentUser(null);
                console.info("[AUTH_CONTEXT - checkSession] No active session found (401/403 from API). User is not logged in.");
            } else if (responseData && responseData.user && responseData.user.id) {
                setCurrentUser(responseData.user);
                console.log("[AUTH_CONTEXT - checkSession] Session valid, currentUser set:", responseData.user.username);
            } else {
                setCurrentUser(null);
                console.warn("[AUTH_CONTEXT - checkSession] API response for user data was unexpected. Clearing user state.");
            }
        } catch (error) {
            console.error("[AUTH_CONTEXT - checkSession] Unexpected error during session check (e.g., network issue):", error.message);
            setCurrentUser(null); 
        } finally {
            setLoading(false);
            console.log("[AUTH_CONTEXT - checkSession] Session check finished. Global loading set to false.");
        }
    }, []);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    const login = useCallback(async ({ email, password }) => {
        console.log("[AUTH_CONTEXT - login] Initiating login for:", email);
        setLoading(true); 
        try {
            const data = await apiLogin({ email, password }); 
            console.log("[AUTH_CONTEXT - login] apiLogin successful. Data:", data);

            await checkSession(); 

            console.log("[AUTH_CONTEXT - login] Navigating to /Home after successful login and session check...");
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
        console.log("[AUTH_CONTEXT - logout] Initiating logout...");
        setLoading(true); 
        try {
            await apiLogout(); 
            setCurrentUser(null);
            console.log("[AUTH_CONTEXT - logout] User successfully logged out.");
            navigate('/login');
        } catch (error) {
            console.error("Logout failed:", error);
            setCurrentUser(null);
            navigate('/login');
        } finally {
            setLoading(false);
            console.log("[AUTH_CONTEXT - logout] Logout process finished. Global loading set to false.");
        }
    }, [navigate]);

    const resetPassword = useCallback(async (email) => {
        console.log("[AUTH_CONTEXT - resetPassword] Initiating password reset for:", email);
        
        try {
            const data = await apiResetPassword(email);
            console.log("[AUTH_CONTEXT - resetPassword] Password reset email sent successfully:", data);
            return data;
        } catch (error) {
            console.error('[AUTH_CONTEXT - resetPassword] Error during password reset:', error);
            throw error;
        }
    }, []);

const confirmPasswordReset = async (email, token, newPassword,confirmNewPassword ) => {
    try {
        const data = await apiConfirmPasswordReset(email, token, newPassword, confirmNewPassword );
        return data;
    } catch (error) {
        throw error;
    }
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