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
    console.log('--- Entering SignLanguageAPI.processVideo ---');
    console.log('Video blob received:', {
      size: videoBlob?.size,
      type: videoBlob?.type,
      constructor: videoBlob?.constructor?.name
    });

    try {
      if (!videoBlob || !(videoBlob instanceof Blob)) {
        throw new Error('Invalid video blob provided');
      }

      const formData = new FormData();
       const filename = `sign_${Date.now()}.webm`;
      formData.append('video', videoBlob, filename);

      console.log('FormData created, sending request to:', `${this.baseURL}/process-video`);

      const response = await fetch(`${this.baseURL}/process-video`, {
        method: 'POST',
        body: formData,
      });

      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
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
      console.log('Success response data:', data);

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
   * Process an image for sign language recognition
   * @param {Blob} imageBlob - The image blob to process
   * @returns {Promise<Object>} - API response
   */
  async processImage(imageBlob) {
    console.log('--- Entering SignLanguageAPI.processImage ---');
    console.log('Image blob received:', {
      size: imageBlob?.size,
      type: imageBlob?.type,
      constructor: imageBlob?.constructor?.name
    });

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
      console.error('Error processing image:', error);
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
   * @returns {Promise<boolean>}
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

const API_BASE_URL_AUTH = 'https://hands-up.onrender.com/handsUPApi/auth';
const API_BASE_URL_USER = 'https://hands-up.onrender.com/handsUPApi/user';
const API_BASE_URL_LEARNING = 'https://hands-up.onrender.com/handsUPApi/learning';
const API_BASE_URL = 'https://hands-up.onrender.com/handsUPApi';
const TRANSLATE_API_ROUTE = 'https://tmkdt-newhandsupmodel.hf.space/handsUPApi';

// export const handleApiResponse = async (response) => {
//     const data = await response.json();
//     if (!response.ok) {
//         const error = new Error(data.error || 'An unknown error occurred');
//         if (data.attemptsLeft !== undefined) {
//             error.attemptsLeft = data.attemptsLeft;
//         }
//         if (data.locked !== undefined) {
//             error.locked = data.locked;
//         }
//         if (data.timeLeft !== undefined) {
//             error.timeLeft = data.timeLeft;
//         }

//         throw error;
//     }
//     return data;
// };


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
  
  //console.log(`${TRANSLATE_API_ROUTE}/processWords`);
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

function isSessionCookieSet() {
    return document.cookie.includes('sessionId=');
}

function setSessionCookieFallback(sessionId) {
    console.log("setting th cookie")
    // 1. Calculate expiration date (24 hours from now)
    const expirationDate = new Date(Date.now() + (1000 * 60 * 60 * 24)).toUTCString();
    
    // 2. Build the cookie string with all required attributes for cross-site
    // NOTE: This must match the backend's cookie attributes exactly for the
    // browser to accept it as a valid session identifier.
    // NOTE: We cannot include HttpOnly here, but the cookie itself will still
    // be sent back to the server in the Cookie header.
    const cookieString = `sessionId=${sessionId}; expires=${expirationDate}; Path=/; Secure; SameSite=None`;
    
    document.cookie = cookieString;
    console.log("[FRONTEND - FALLBACK] JavaScript cookie set for Safari compatibility.");
}

export const login = async (credentials) => {
    try {
        console.log('[FRONTEND] Sending login request with credentials:', credentials);
        console.log("checkpoint 1");
        const response = await fetch(`${API_BASE_URL_AUTH}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
            credentials: 'include', // CRITICAL for sending/receiving cross-site cookies
        });
        
        const data = await response.json();
        console.log("checkpoint 2");
        if (!response.ok) {
            const error = new Error(data.error || 'Login failed');
            
            error.type = 'LOGIN_ERROR';
            error.persistent = true; 
            
            // --- Existing Custom Error Handling ---
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
            // --- End Custom Error Handling ---

            throw error;
        }
        console.log("checkpoint 3");
        // --- HYBRID COOKIE FALLBACK LOGIC ---
        
        // 1. Check if the secure HTTP cookie was successfully stored by the server.
        // 2. If it was blocked (likely Safari) AND the server returned the sessionId in the JSON.
        console.log("boolean for the q ",!isSessionCookieSet() && data.sessionId);
        if (!isSessionCookieSet() && data.sessionId) {
            console.warn("[FRONTEND] HTTP cookie was blocked/missing. Using JSON fallback to set cookie.");
            setSessionCookieFallback(data.sessionId);
        }
        
        // --- END HYBRID COOKIE FALLBACK LOGIC ---
        console.log("checkpoint 4");
        console.log("data:",data);
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

// export const login = async (credentials) => {
//     try {
//         console.log('[FRONTEND] Sending login request with credentials:', credentials);
//         const response = await fetch(`${API_BASE_URL_AUTH}/login`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(credentials),
//             credentials: 'include',
//         });
        
//         const data = await response.json();
        
//         if (!response.ok) {
//             const error = new Error(data.error || 'Login failed');
            
//             error.type = 'LOGIN_ERROR';
//             error.persistent = true; 
            
//             if (data.attemptsLeft !== undefined) {
//                 error.attemptsLeft = data.attemptsLeft;
//                 error.showAttemptsLeft = true;
//             }
            
//             if (data.locked !== undefined) {
//                 error.locked = data.locked;
//                 error.severity = 'high';
//             }
            
//             if (data.timeLeft !== undefined) {
//                 error.timeLeft = data.timeLeft;
//                 error.showTimeLeft = true;
//             }
            
//             if (data.error?.toLowerCase().includes('password')) {
//                 error.field = 'password';
//             } else if (data.error?.toLowerCase().includes('username') || 
//                        data.error?.toLowerCase().includes('email')) {
//                 error.field = 'username';
//             }
            
//             throw error;
//         }
//         console.log("data:",data);
//         return data;
//     } catch (error) {
//         console.error('Login error:', error);
        
//         if (error.type === 'LOGIN_ERROR') {
//             throw error;
//         }
        
//         const networkError = new Error(error.message || 'Network error occurred');
//         networkError.type = 'NETWORK_ERROR';
//         networkError.persistent = true;
//         networkError.severity = 'medium';
        
//         throw networkError;
//     }
// };

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

function getSessionIdFromDocumentCookie() {
    const cookieString = document.cookie;
    const name = 'sessionId=';
    const decodedCookie = decodeURIComponent(cookieString);
    const ca = decodedCookie.split(';');

    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.startsWith(name)) {
            const sessionId = c.substring(name.length, c.length);
            return sessionId;
        }
    }
    return null;
}

/**
 * Helper function to handle common API response parsing and error throwing.
 */
const handleApiResponse = async (response) => {
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Server returned non-JSON response (${response.status})`);
    }

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.error || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.details = data;
        // --- Existing Custom Error Handling ---
        if (data.attemptsLeft !== undefined) { error.attemptsLeft = data.attemptsLeft; error.showAttemptsLeft = true; }
        // etc... (include your full error logic here)
        // --- End Custom Error Handling ---
        throw error;
    }

    return data;
};

// Assuming getSessionIdFromDocumentCookie() utility is available and loginUser sets httpOnly: false
// Also assuming API_BASE_URL_USER is defined

export const getUserData = async () => {
    console.log("entered get user data (POST method) ");
    
    // 1. Manually read the Session ID from the client-accessible cookie
    const sessionId = getSessionIdFromDocumentCookie();

    if (!sessionId) {
        console.warn('[FRONTEND] Cannot fetch user data: No session ID found.');
        throw new Error('User not logged in.');
    }
    
    // 2. The session ID must be passed in the request body for POST
    const requestBody = {
        sessionId: sessionId 
    };

    // 3. CRITICAL: Switch to POST method
    try {
        const response = await fetch(`${API_BASE_URL_USER}/me`, {
            method: 'POST', // <-- CHANGED FROM GET TO POST
            headers: {
                'Content-Type': 'application/json',
                // We do NOT send the Cookie header or the Authorization header
            },
            body: JSON.stringify(requestBody), // <-- Sending the ID in the body
        });
        
        console.log("response: ",response);
        return handleApiResponse(response);
    } catch (error) {
       console.error('Error fetching logged-in user details (network/unexpected):', error);
        throw error; 
    }
};


// export const getUserData = async () => {
//     console.log("entered get user data ");
//     try {
//         const response = await fetch(`${API_BASE_URL_USER}/me`, {
//             method: 'GET',
//             credentials: 'include', 
//         });
//         console.log("response: ",response);
//        return handleApiResponse(response);
//     } catch (error) {
//        console.error('Error fetching logged-in user details (network/unexpected):', error);
//         throw error; 
//     }
// };

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
    //console.log("Response:", data);
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
        //console.log('Fetching landmarks from:', url);

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
        //console.log('Curriculum health check:', data);
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
        //console.log('Available landmarks:', data);
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
        //console.log('Curriculum structure:', data);
        return data;
    } catch (error) {
        console.error('Error fetching curriculum structure:', error);
        throw error;
    }
};





