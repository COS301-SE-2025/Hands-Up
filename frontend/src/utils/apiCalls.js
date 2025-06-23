const API_BASE_URL_AUTH = 'https://localhost:2000/handsUPApi/auth';
const API_BASE_URL_USER = 'https://localhost:2000/handsUPApi/user';
const API_BASE_URL_LEARNING = 'https://localhost:2000/handsUPApi/learning';
const API_BASE_URL = "https://localhost:2000/handsUPApi";

export const handleApiResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        const error = new Error(data.message || 'An unknown error occurred');
        if (data.attemptsLeft !== undefined) {
            error.attemptsLeft = data.attemptsLeft;
        }
        if (data.locked !== undefined) {
            error.locked = data.locked;
        }
        if (data.timeLeft !== undefined) {
            error.timeLeft = data.timeLeft;
        }

        throw error;
    }
    return data;
};


export const signup = async ({ name, surname, username, email, password }) => {
    try {
        const response = await fetch(`${API_BASE_URL_AUTH}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                surname,
                username,
                email,
                password,
            }),
            credentials: 'include',
        });
        return handleApiResponse(response);
    } catch (error) {
        console.error("[API_CALLS - resetPassword] Network or unexpected error:", error);
        throw error;
    }
};

export const confirmPasswordReset = async (email, token, newPassword,confirmNewPassword ) => {
    const response = await fetch(`${API_BASE_URL}/auth/confirm-reset-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token, newPassword,confirmationPassword: confirmNewPassword }),
    });
    return handleApiResponse(response);
};

export const login = async (credentials) => {
    try {
        const response = await fetch(`${API_BASE_URL_AUTH}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
            credentials: 'include',
        });
        return handleApiResponse(response);
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        const response = await fetch(`${API_BASE_URL_AUTH}/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        return handleApiResponse(response);
    } catch (error) {
        console.error('API Logout error:', error);
        throw error;
    }
};

export const getUserData = async () => {
    console.log("apiCalls - getUserData: Attempting to fetch current user data...");
    try {
        const response = await fetch(`${API_BASE_URL_USER}/me`, {
            method: 'GET',
            credentials: 'include', 
        });

       return handleApiResponse(response);
    } catch (error) {
       console.error('Error fetching logged-in user details (network/unexpected):', error);
        throw error; 
    }
};

export const uniqueUsername = async (username) => {
    try {
        const response = await fetch(`${API_BASE_URL_AUTH}/unique-username/${encodeURIComponent(username)}`, { credentials: 'include' });
        const data = await handleApiResponse(response);
        return data.exists;
    } catch (error) {
        console.error('Error checking username:', error);
        throw error;
    }
};

export const uniqueEmail = async (email) => {
    try {
        const response = await fetch(`${API_BASE_URL_AUTH}/unique-email/${encodeURIComponent(email)}`, { credentials: 'include' });
        const data = await handleApiResponse(response);
        return data.exists;
    } catch (error) {
        console.error('Error checking email:', error);
        throw error;
    }
};


export const updateUserDetails = async (userID, name, surname, username, email) => {
    try {
        const response = await fetch(`${API_BASE_URL_USER}/${userID}/details`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, surname, username, email }),
            credentials: 'include',
        });
        return handleApiResponse(response);
    } catch (error) {
        console.error("Error in updateUserDetails:", error);
        throw error;
    }
};

export const updateUserPassword = async (userID, name, surname, username, email, newPassword) => {
    try {
        const response = await fetch(`${API_BASE_URL_USER}/${userID}/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, surname, username, email, password: newPassword }),
            credentials: 'include',
        });
        return handleApiResponse(response);
    } catch (err) {
        console.error('Error updating password:', err);
        throw err;
    }
};

export const uploadUserAvatar = async (userID, formData) => {
    try {
        const response = await fetch(`${API_BASE_URL_USER}/${userID}/avatar`, {
            method: 'PUT',
            body: formData,
            credentials: 'include',
        });
        return handleApiResponse(response);
    } catch (error) {
        console.error("Error in uploadUserAvatar:", error);
        throw error;
    }
};


export const getLearningProgress = async (username) => {
    try {
        const response = await fetch(`${API_BASE_URL_LEARNING}/progress/${username}`, {
            method: 'GET',
            credentials: 'include'
        });
        return handleApiResponse(response);
    } catch (error) {
        console.error("Error getting progress", error);
       throw error;
    }
};

export const updateLearningProgress = async (username, progressData) => {
    try {
        const response = await fetch(`${API_BASE_URL_LEARNING}/progress/${username}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(progressData),
            credentials: 'include',
        });
        return handleApiResponse(response);
    } catch (error) {
        console.error("Error updating progress", error);
        throw error;
    }
};


export const deleteUserAccount = async (userID) => {
    try {
        const response = await fetch(`${API_BASE_URL_USER}/${userID}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        return handleApiResponse(response);
    } catch (error) {
        console.error("Error deleting user account:", error);
        throw error;
    }
};

export const resetPassword = async (email) => {
    console.log("[API_CALLS - resetPassword] Sending password reset request for:", email);
    
    try {
        const response = await fetch(`${API_BASE_URL_AUTH}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email }),
        });

        return handleApiResponse(response);
    }catch (error) {
        console.error("Error deleting user account:", error);
        throw error;
    }};