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