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
    const response = await fetch(`http://localhost:2000/handsUPApi/learning/progress/${username}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting progress", error);
    return null;
  }
};

export const updateLearningProgress = async (username, progressData) => {
   try {
    const response = await fetch(`http://localhost:2000/handsUPApi/learning/progress/${username}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(progressData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating progress", error);
    return null;
  }
  
};

export const uniqueUsername = async (username) => {
    try {
        const response = await fetch(`http://localhost:2000/handsUPApi/auth/unique-username/${encodeURIComponent(username)}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.exists;
      } catch (error) {
        console.error('Error checking username:', error);
        throw error;  
      }
}

export const uniqueEmail = async (email) => {
    try {
        const response = await fetch(`http://localhost:2000/handsUPApi/auth/unique-email/${encodeURIComponent(email)}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.exists;
      } catch (error) {
        console.error('Error checking email:', error);
        throw error;
      }
}

export const updateUserDetails = async (userID, name, surname, username, email) => {
  try {
    const response = await fetch(`http://localhost:2000/handsUPApi/user/${userID}/details`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, surname, username, email })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to update user.");
    }

    return result; 
  } catch (error) {
    console.error("Error in updateUserDetails:", error);
    throw error; 
  }
};

export const updateUserPassword = async ( userID, name, surname, username, email, newPassword ) => {
  try {
    const response = await fetch(`http://localhost:2000/handsUPApi/user/${userID}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, surname, username, email, password: newPassword })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update user');
    }

    return result;  
  } catch (err) {
    console.error('Error updating password:', err);
    throw err;  
  }
};

const API_BASE_URL = 'http://localhost:2000/handsUPApi/auth';

export const signup = async ({ name, surname, username, email, password }) => {
  const response = await fetch('http://localhost:2000/handsUPApi/auth/signup', {
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
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Signup failed');
  }

  return data;
};

export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    return data; // Returns user data on success
  } catch (error) {
    console.error('Login error:', error);
    throw error; // Re-throw to handle in the component
  }
};

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
      const formData = new FormData();
      formData.append('video', videoBlob, 'sign.webm');
      
      const response = await fetch(`${this.baseURL}/process-video`, {
        method: 'POST',
        body: formData
      });
      
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