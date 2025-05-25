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
