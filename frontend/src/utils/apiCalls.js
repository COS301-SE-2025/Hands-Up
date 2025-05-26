// src/services/authService.js

const API_BASE_URL = 'http://localhost:2000/handsUPApi/auth';

export const signup = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    return data; // Successfully signed up
  } catch (error) {
    console.error('Signup error:', error);
    throw error; // Re-throw to handle in the component
  }
};


// New login function
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

export const getUserData = async (userID) => {
  const response = await fetch(`${API_BASE_URL}/user/${userID}`);
  if (!response.ok) throw new Error('Failed to fetch user data');
  const data = await response.json();
  return data.user;
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
