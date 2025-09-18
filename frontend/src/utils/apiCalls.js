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
   

    try {
      // Validate input
      if (!videoBlob || !(videoBlob instanceof Blob)) {
        throw new Error('Invalid video blob provided');
      }

      const formData = new FormData();
      
      // Ensure proper filename and MIME type
      const filename = `sign_${Date.now()}.webm`;
      formData.append('video', videoBlob, filename);

     

      const response = await fetch(`${this.baseURL}/process-video`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary
      });

     

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        throw new Error(errorData.details || errorData.error || `HTTP error! status: ${response.status}`);
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
     
      return {
        success: false,
        error: error.message || 'Error processing video. Please check your connection.',
        phrase: null,
        confidence: 0
      };
    }
  }

  /**
   * Process an image for sign language recognition
   * @param {Blob} imageBlob - The image blob to process
   * @returns {Promise<Object>} - API response
   */
  async processImage(imageBlob) {
   

    try {
      if (!imageBlob || !(imageBlob instanceof Blob)) {
        throw new Error('Invalid image blob provided');
      }

      const formData = new FormData();
      const filename = `sign_${Date.now()}.jpg`;
      formData.append('image', imageBlob, filename);

      const response = await fetch(`${this.baseURL}/process-sign`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        throw new Error(errorData.details || errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return {
        success: true,
        prediction: data.prediction,
        confidence: data.confidence || 0,
        rawData: data
      };
    } catch (error) {
      
      return {
        success: false,
        error: error.message || 'Error processing image. Please check your connection.',
        prediction: null,
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
    } else if (type === 'image') {
      return await this.processImage(mediaBlob);
    } else {
      throw new Error(`Unsupported media type: ${type}`);
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }
}

// Rest of your existing API functions...
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


// Fixed translateSequence function
export const translateSequence = async (blobs) => {
    

    const formData = new FormData();
    blobs.forEach((blob, i) => {
        const filename = `frame${i}.jpg`;
        formData.append('frames', blob, filename);
        
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
                console.log('Failed to parse error JSON:', e);
                errorMessage = `${errorMessage} - ${errorBody}`;
            }
            throw new Error(`Failed to process frames: ${errorMessage}`);
        }

        const data = await response.json();
        
        return data;
    } catch (err) {
        console.error("Error during fetch or response processing:", err);
        throw err;
    }
};

// Fixed processImage function
export const processImage = async (formData) => {
  

  try {
    const response = await fetch('http://127.0.0.1:5000/handsUPApi/sign/processImage', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log(data);
    return (data);

  } catch (error) {
    console.error(error);
    return ('Error processing image');
  }
};

export const processWords = async (formData) => {
  

  try {
    const response = await fetch('http://127.0.0.1:5000/handsUPApi/sign/processWords', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    return (data);

  } catch (error){
    console.error(error);
    return ('Error processing words');
  }
};

// Fixed uploadUserAvatar function
export const uploadUserAvatar = async (userID, formData) => {
    try {
        
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
        }

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

export const deleteUserAvatar = async (userID) => {
    
    try {
        const response = await fetch(`${API_BASE_URL_USER}/${userID}/avatar`, {
            method: 'DELETE',
            credentials: 'include',
        });
        return handleApiResponse(response);
    } catch (error) {
        console.error("Error in deleteUserAvatar:", error);
        throw error;
    }
};

// Rest of your existing functions remain the same...
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


export const confirmPasswordReset = async (email, token, newPassword, confirmNewPassword) => {
    const response = await fetch(`${API_BASE_URL}/auth/confirm-reset-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token, newPassword, confirmationPassword: confirmNewPassword }),
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
        
        const data = await response.json();
        
        if (!response.ok) {
            const error = new Error(data.error || 'Login failed');
            
            error.type = 'LOGIN_ERROR';
            error.persistent = true; 
            
            if (data.attemptsLeft !== undefined) {
                error.attemptsLeft = data.attemptsLeft;
                error.showAttemptsLeft = true;
            }
            
            if (data.locked !== undefined) {
                error.locked = data.locked;
                error.severity = 'high';
            }
            
            if (data.timeLeft !== undefined) {
                error.timeLeft = data.timeLeft;
                error.showTimeLeft = true;
            }
            
            if (data.error?.toLowerCase().includes('password')) {
                error.field = 'password';
            } else if (data.error?.toLowerCase().includes('username') || 
                       data.error?.toLowerCase().includes('email')) {
                error.field = 'username';
            }
            
            throw error;
        }
        
        return data;
    } catch (error) {
        console.error('Login error:', error);
        
        if (error.type === 'LOGIN_ERROR') {
            throw error;
        }
        
        const networkError = new Error(error.message || 'Network error occurred');
        networkError.type = 'NETWORK_ERROR';
        networkError.persistent = true;
        networkError.severity = 'medium';
        
        throw networkError;
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
        
        const data = await response.json();
        
        if (!response.ok) {
            const error = new Error(data.error || 'Signup failed');
            error.type = 'SIGNUP_ERROR';
            error.persistent = true;
            
            if (data.error?.toLowerCase().includes('username')) {
                error.field = 'username';
            } else if (data.error?.toLowerCase().includes('email')) {
                error.field = 'email';
            } else if (data.error?.toLowerCase().includes('password')) {
                error.field = 'password';
            }
            
            throw error;
        }
        
        return data;
    } catch (error) {
        console.error("[API_CALLS - signup] Network or unexpected error:", error);
        
        if (error.type === 'SIGNUP_ERROR') {
            throw error;
        }
        
        const networkError = new Error(error.message || 'Network error occurred');
        networkError.type = 'NETWORK_ERROR';
        networkError.persistent = true;
        
        throw networkError;
    }
};

export const resetPassword = async (email) => {
    
    
    try {
        const response = await fetch(`${API_BASE_URL_AUTH}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            const error = new Error(data.error || 'Password reset failed');
            error.type = 'PASSWORD_RESET_ERROR';
            error.persistent = true;
            
            if (data.error?.toLowerCase().includes('email')) {
                error.field = 'email';
            }
            
            throw error;
        }
        
        return data;
    } catch (error) {
        console.error("Error in resetPassword:", error);
        
        if (error.type === 'PASSWORD_RESET_ERROR') {
            throw error;
        }
        
        const networkError = new Error(error.message || 'Network error occurred');
        networkError.type = 'NETWORK_ERROR';
        networkError.persistent = true;
        
        throw networkError;
    }
};

export const createPersistentError = (message, type = 'GENERAL_ERROR', options = {}) => {
    const error = new Error(message);
    error.type = type;
    error.persistent = true;
    error.timestamp = Date.now();
    
    Object.assign(error, options);
    
    return error;
};

export const formatErrorForDisplay = (error) => {
    if (!error) return null;
    
    let displayMessage = error.message;
    if (error.showAttemptsLeft && error.attemptsLeft !== undefined) {
        displayMessage += ` (${error.attemptsLeft} attempts remaining)`;
    }
    
    if (error.locked) {
        displayMessage += ` Account locked.`;
    }
    
    if (error.showTimeLeft && error.timeLeft !== undefined) {
        displayMessage += ` Try again in ${error.timeLeft} minutes.`;
    }
    
    return {
        message: displayMessage,
        type: error.type,
        severity: error.severity || 'medium',
        field: error.field,
        persistent: error.persistent || false,
        timestamp: error.timestamp
    };
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

// export const resetPassword = async (email) => {
//     console.log("[API_CALLS - resetPassword] Sending password reset request for:", email);
    
//     try {
//         const response = await fetch(`${API_BASE_URL_AUTH}/reset-password`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             credentials: 'include',
//             body: JSON.stringify({ email }),
//         });
//         return handleApiResponse(response);
//     } catch (error) {
//         console.error("Error in resetPassword:", error);
//         throw error;
//     }
// };


const signLanguageAPI = new SignLanguageAPI();

export default signLanguageAPI;
export { SignLanguageAPI };