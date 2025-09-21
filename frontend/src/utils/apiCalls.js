const API_BASE_URL_AUTH = 'https://hands-up.onrender.com/handsUPApi/auth';
const API_BASE_URL_USER = 'https://hands-up.onrender.com/handsUPApi/user';
const API_BASE_URL_LEARNING = 'https://hands-up.onrender.com/handsUPApi/learning';
const API_BASE_URL = "https://hands-up.onrender.com/handsUPApi";
const TRANSLATE_API_ROUTE = 'https://hands-up.onrender.com/handsUPApi/sign';


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
        const filename = `frame${i}.jpg`;
        formData.append('frames', blob, filename);
        
    });

    try {
        const response = await fetch(`${TRANSLATE_API_ROUTE}/processFrames`, {
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
                // console.log('Failed to parse error JSON:', e);
                errorMessage = `${errorMessage} - ${errorBody}. Another error ocurred: ${e}`;
                
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


export const processLetters = async (formData) => {
//   console.log("Processing captured image...");

  try {
    const response = await fetch(`${TRANSLATE_API_ROUTE}/processLetters`, {
      method: 'POST',
      body: formData
    });
    console.log(response);
    const data = await response.json();
    // console.log(data);
    return (data);

  } catch (error) {
    console.error(error);
    return ('Error processing image');
  }
};

export const processWords = async (formData) => {
  

  try {
    const response = await fetch(`${TRANSLATE_API_ROUTE}/processWords`, {
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


export const uploadUserAvatar = async (userID, formData) => {
    try {
        
        // for (let [key, value] of formData.entries()) {
        //     console.log(`${key}:`, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
        // }

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
        return handleApiResponse(response);
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

export const resetPassword = async (credentials) => {
    
    
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

export const produceSentence = async (glossToConvert) => {
//   console.log("Converting sentence...");

  try {
    const response = await fetch(`${TRANSLATE_API_ROUTE}/sentence`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({'gloss': glossToConvert})
    });

    const data = await response.json();
    // console.log("Response:", data);
    return (data);

  } catch (error) {
    console.error(error);
    return ('Error converting gloss');
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

/**
 * UPDATED: Get landmarks data from the backend using the correct endpoint
 * @param {string} landmarkName - Required: specific landmark file name (A, my, drinkWater, etc.)
 * @returns {Promise<Object>} - Landmarks data
 */
export const getLandmarks = async (landmarkName) => {
    try {
        if (!landmarkName) {
            throw new Error('Landmark name is required');
        }

       const url = `${API_BASE_URL}/curriculum/landmarks/${encodeURIComponent(landmarkName)}`;
        console.log('Fetching landmarks from:', url);

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { error: errorText };
            }
            
            console.error('Error fetching landmarks:', errorData);
            throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch landmarks');
        }
        
        console.log('Successfully fetched landmarks:', {
            letter: data.letter,
            filename: data.filename,
            count: data.count,
            directory: data.directory
        });
        
        return data.landmarks || data;
    } catch (error) {
        console.error('Error in getLandmarks:', error);
        throw error;
    }
};

/**
 * Test curriculum API health
 * @returns {Promise<Object>}
 */
export const testCurriculumHealth = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/curriculum/health`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Curriculum health check:', data);
        return data;
    } catch (error) {
        console.error('Curriculum health check failed:', error);
        throw error;
    }
};

/**
 * Get list of all available landmarks
 * @returns {Promise<Object>}
 */
export const getAvailableLandmarks = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/curriculum/landmarks`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch landmarks list: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Available landmarks:', data);
        return data;
    } catch (error) {
        console.error('Error fetching available landmarks:', error);
        throw error;
    }
};

/**
 * Get curriculum structure
 * @returns {Promise<Object>} 
 */
export const getCurriculumStructure = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/curriculum/structure`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch curriculum structure: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Curriculum structure:', data);
        return data;
    } catch (error) {
        console.error('Error fetching curriculum structure:', error);
        throw error;
    }
};



// signLanguageAPI.js
class SignLanguageAPI {
  constructor(baseURL = 'https://hands-up.onrender.com/handsUPApi') {
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

