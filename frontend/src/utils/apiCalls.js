// src/utils/apiCalls.js

const API_BASE_URL_AUTH = 'http://localhost:2000/handsUPApi/auth';
const API_BASE_URL_USER = 'http://localhost:2000/handsUPApi/user';
const API_BASE_URL_LEARNING = 'http://localhost:2000/handsUPApi/learning';

// Helper function to handle common response parsing and error throwing
// This helper will centralize how we deal with successful and unsuccessful responses
const handleApiResponse = async (response) => {
    // If the response is OK (2xx status)
    if (response.ok) {
        // Check content type to avoid parsing issues if no content
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        }
        // If no content or not JSON, just return a success status
        return { success: true, status: response.status };
    } else {
        // Handle specific non-OK statuses that are 'expected' unauthenticated states
        if (response.status === 401 || response.status === 403) {
            // Do NOT throw an error for 401/403.
            // Instead, return an object indicating the status, which AuthContext can check.
            // This prevents the console from showing a JS error stack for expected unauthenticated states.
            return { status: response.status, message: 'Unauthorized or Forbidden' };
        }

        // For other non-OK statuses, parse the error message and throw a genuine error
        let errorData = {};
        try {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                errorData = await response.json();
            } else {
                // If not JSON, just get text
                errorData = { message: await response.text() };
            }
        } catch (e) {
            // Fallback if parsing fails
            errorData = { message: `Failed to parse error response. Status: ${response.status}` };
        }
        throw new Error(errorData.message || `API Error: Status ${response.status}`);
    }
};


// AUTHENTICATION RELATED CALLS
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
        console.error('Signup error:', error);
        throw error;
    }
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
        return handleApiResponse(response); // Will return { success: true } or throw for other errors
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
            credentials: 'include', // Important for sending session cookies
        });

        // Use the centralized handler. It will return {status: 401} for unauthorized,
        // or the user data if successful, or throw a proper error for other issues.
        return handleApiResponse(response);
    } catch (error) {
        // This catch block should now primarily be for network issues (e.g., server unreachable)
        console.error('Error fetching logged-in user details (network/unexpected):', error);
        throw error; // Re-throw to AuthContext for broad error handling
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


// USER PROFILE RELATED CALLS
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


// LEARNING PROGRESS RELATED CALLS
export const getLearningProgress = async (username) => {
    try {
        const response = await fetch(`${API_BASE_URL_LEARNING}/progress/${username}`, {
            method: 'GET',
            credentials: 'include'
        });
        return handleApiResponse(response);
    } catch (error) {
        console.error("Error getting progress", error);
        // This now re-throws the error from handleApiResponse, so AuthContext can handle it.
        // If you specifically want this to return null even on error, you can keep the original `return null;`
        // However, it's generally better to let the calling context (like AuthContext) decide how to handle it.
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
        // Same as getLearningProgress, consider throwing the error or handling it based on context
        throw error;
    }
};