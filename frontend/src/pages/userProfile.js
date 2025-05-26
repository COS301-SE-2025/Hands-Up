import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {LearningStats} from "../components/learningStats.js";
import "../styles/userProfile.css";
import {uniqueUsername, uniqueEmail, updateUserDetails, updateUserPassword} from'../utils/apiCalls.js'; 

export default function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const storedUser = localStorage.getItem('userData');
    
    if (!isLoggedIn || !storedUser) {
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      setUserData(user);
      
      // Optional: Fetch fresh data from backend
      fetchUserData(user.id);
      
    } catch (err) {
      setError("Failed to load user data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchUserData = async (userID) => {
    try {
      const response = await fetch(`http://localhost:2000/handsUPApi/user/${userID}`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      
      const data = await response.json();
      setUserData(data.user);
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const surname = document.getElementById("surname").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const errors = {};

    //check if details actually changed 
    if (name === userData.name && surname === userData.surname && username === userData.username && email === userData.email && !newPassword && !confirmPassword) {
      errors.general = "No changes detected to save"; 
      setFormErrors(errors);
      return;
    }

    //check if any fields are empty
    if (!name) errors.name = "Name is required.";
    if (!surname) errors.surname = "Surname is required.";
    if (!username) errors.username = "Username is required.";
    if (!email) errors.email = "Email is required.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    //check if name and surname only contain letters
    const nameRegex = /^[A-Za-z]+$/;
    if (name && !nameRegex.test(name)) {
      errors.name = "Name must contain only letters.";
    }
    if (surname && !nameRegex.test(surname)) {
      errors.surname = "Surname must contain only letters.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    //check that username does not already exist 
    if (username !== userData.username) {
      try {
        const data = await uniqueUsername(username);
        if (data) {
          errors.username = "Username already taken.";
          setFormErrors(errors);
          return;  
        }
      } catch (error) {
        console.error('Error checking username:', error);
        return null; 
      }
    }

    //check if email is in a valid format and does not already exist 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      errors.email = "Invalid email format.";
      setFormErrors(errors);
      return;
    }
    if (email !== userData.email) {
      try {
        const data = await uniqueEmail(email);
        if (data) {
          errors.email = "Email already in use.";
          setFormErrors(errors);
          return;  
        }
      } catch (error) {
        console.error('Error checking email:', error);
        return null; 
      }
    }

    if (!newPassword && !confirmPassword) {
      //save updated user details (without password)
      try {
        const result = await updateUserDetails(userData.userID, name, surname, username, email);
        alert("User updated successfully!");
      } catch (err) {
        alert("An error occurred while updating.");
      }
    }
    else {
      //check that both fields are not empty 
      if (!newPassword) errors.newPassword = "Password is required.";
      if (!confirmPassword) errors.confirmPassword = "Confirm password is required.";
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      //check that password and confirm password match
      if (newPassword !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match.";
        setFormErrors(errors);
        return;
      }

      //save updated user details (with password)
      try {
        const result = await updateUserPassword( userData.userID, name, surname, username, email, newPassword );
        alert("User updated successfully!");
      } catch (err) {
        alert("An error occurred while updating.");
      }
    }

  };

  if (loading) return <div className="containerP">Loading...</div>;
  if (error) return <div className="containerP">Error: {error}</div>;

  return (
    <div className="containerP">
      <main className="content">
        <section className="profile-header">
          <div className="avatar" aria-label="User initials">
            {userData?.name?.charAt(0)}{userData?.surname?.charAt(0)}
          </div>
          <div className="profile-info">
            <h2 className="name">{userData?.name} {userData?.surname}</h2>
            <p className="email">{userData?.email}</p>
            <p className="member-since">Member since: {new Date().toLocaleDateString()}</p>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </section>

          <LearningStats />

        <section className="profile-settings">
          <h3>Profile Settings</h3>
          <form onSubmit={handleSaveChanges}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input 
                  id="name" 
                  type="text" 
                  defaultValue={userData?.name || ''} 
                />
                {formErrors.name && <div style={{ color: 'red' }}>{formErrors.name}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="surname">Surname</label>
                <input 
                  id="surname" 
                  type="text" 
                  defaultValue={userData?.surname || ''} 
                />
                {formErrors.surname && <div style={{ color: 'red' }}>{formErrors.surname}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input 
                  id="username" 
                  type="text" 
                  defaultValue={userData?.username || ''} 
                />
                {formErrors.username && <div style={{ color: 'red' }}>{formErrors.username}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  id="email" 
                  type="email" 
                  defaultValue={userData?.email || ''} 
                />
                {formErrors.email && <div style={{ color: 'red' }}>{formErrors.email}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input id="newPassword" type="password" placeholder="••••••••" />
                {formErrors.newPassword && <div style={{ color: 'red' }}>{formErrors.newPassword}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input id="confirmPassword" type="password" placeholder="••••••••" />
                {formErrors.confirmPassword && <div style={{ color: 'red' }}>{formErrors.confirmPassword}</div>}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">Save Changes</button>
              {formErrors.general && <div style={{ color: 'red' }}>{formErrors.general}</div>}
              <div className="btn-group">
                <button type="button" className="btn-secondary">Reset Progress</button>
                <button type="button" className="btn-danger">Delete Account</button>
              </div>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
