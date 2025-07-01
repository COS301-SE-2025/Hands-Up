const API_BASE_URL_AUTH = 'http://localhost:2000/handsUPApi/auth';
const API_BASE_URL_USER = 'http://localhost:2000/handsUPApi/user';
const API_BASE_URL_LEARNING = 'http://localhost:2000/handsUPApi/learning';
const API_BASE_URL = "http://localhost:2000/handsUPApi";

export const handleApiResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        const error = new Error(data.error || 'An unknown error occurred');
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

export const translateSequence = async (blobs) => {

    const formData = new FormData();
    blobs.forEach((blob, i) => {
        formData.append('frames', blob, `frame${i}.jpg`);
    });

    try {
        const response = await fetch('http://127.0.0.1:5000/handsUPApi/sign/processFrames', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            let errorMessage = `HTTP error! Status: ${response.status}`;
            try {
                const errorJson = JSON.parse(errorBody);
                errorMessage = errorJson.message || errorJson.error || errorMessage;
            } catch (e) {
                console.log(e);
                errorMessage = `${errorMessage} - ${errorBody}`;
            }
            throw new Error(`Failed to process frames: ${errorMessage}`);
        }

        const data = await response.json();
        console.log("Prediction result:", data);
        return data;
    } catch (err) {
        console.error("Error during fetch or response processing:", err);
        throw err;
    }
};

export const processImage = async (image) => {
  console.log("Processing captured image...");

  const formData = new FormData();
  formData.append('image', image, 'sign.jpg');
  console.log(image);

  try {
    const response = await fetch('http://127.0.0.1:5000/handsUPApi/sign/processImage', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log("Response:", data);
    return (data);

  } catch (error) {
    console.error(error);
    return ('Error processing image');
  }
};


export const getLearningProgress = async (username) => {
    try {
        const response = await fetch(`${API_BASE_URL_LEARNING}/progress/${username}`, {
            method: 'GET',
            credentials: 'include', 
        });
        
        return handleApiResponse(response);
    } catch (error) {
        console.error('Error fetching learning progress:', error.message);
        throw error;
    }
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

// signLanguageAPI.js
class SignLanguageAPI {
  constructor(baseURL = 'http://localhost:2000/handsUPApi') {
    this.baseURL = baseURL;
  }

  /**
   * Process a video for sign language recognition
   * @param {Blob} videoBlob - The video blob to process
   * @returns {Promise<Object>} - API response with phrase detection results
   */
  async processVideo(videoBlob) {
    // Add this console.log to confirm the method is entered
    console.log('--- Entering SignLanguageAPI.processVideo ---');
    console.log('Video blob received:', videoBlob);

    try {
      const formData = new FormData();
      formData.append('video', videoBlob, 'sign.webm');

      const response = await fetch(`${this.baseURL}/process-video`, {
        method: 'POST',
        body: formData
      });
      console.log("we are now here");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return {
        success: true,
        phrase: data.phrase,
        confidence: data.confidence || 0,
        rawData: data
      };
    } catch (error) {
      console.error('Error processing video:', error);
      return {
        success: false,
        error: error.message || 'Error processing video. Please check your connection.',
        phrase: null,
        confidence: 0
      };
    }
  }

  /**
   * Generic method to process media (auto-detects type)
   * @param {Blob} mediaBlob - The media blob to process
   * @param {string} type - 'image' or 'video'
   * @returns {Promise<Object>} - API response
   */
  async processMedia(mediaBlob, type) {
    if (type === 'video') {
      return await this.processVideo(mediaBlob);
    } else {
      // Assuming you have a processImage method
      return await this.processImage(mediaBlob);
    }
  }

  /**
   * Set a new base URL for the API
   * @param {string} newBaseURL - New base URL
   */
  setBaseURL(newBaseURL) {
    this.baseURL = newBaseURL;
  }

  /**
   * Get current base URL
   * @returns {string} - Current base URL
   */
  getBaseURL() {
    return this.baseURL;
  }

  /**
   * Health check for the API
   * @returns {Promise<boolean>} - True if API is accessible
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        // Note: 'timeout' option is not standard in Fetch API, it's typically handled
        // via a custom AbortController for fetch requests.
        // For now, it's left as is, but be aware it might not function as expected.
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
const signLanguageAPI = new SignLanguageAPI();

export default signLanguageAPI;

// Also export the class for custom instances
export { SignLanguageAPI };
