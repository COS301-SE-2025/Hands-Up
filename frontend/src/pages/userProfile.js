import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LearningStats } from "../components/learningStats.js";
import { useAuth } from '../context/authContext.js';
import "../styles/userProfile.css";
import { 
  uniqueUsername, 
  uniqueEmail, 
  updateUserDetails, 
  updateUserPassword,
 } from '../utils/apiCalls.js'; 

export default function UserProfile() {
  const { currentUser, isLoggedIn, loading: authLoading, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [formSuccess, setFormSuccess] = useState("");
  const navigate = useNavigate();

  const fetchOwnUserData = useCallback(async () => {
   try {
      const response = await fetch(`http://localhost:2000/handsUPApi/user/me`, {
        credentials: 'include' 
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error("Unauthorized access to user/me, logging out.");
          logout(); 
        }
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      setUserData(data.user); 
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  }, [logout]); 
  
  useEffect(() => {
    if (authLoading) {
      return; 
    }

    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

     if (currentUser) {
      setUserData(currentUser); 
     fetchOwnUserData(); 
    } else {
       setError("User data not available after authentication.");
      setLoading(false);
    }
  }, [authLoading, isLoggedIn, currentUser, navigate, fetchOwnUserData]);


  useEffect(() => {
    if (formSuccess) {
      const timer = setTimeout(() => {
        setFormSuccess("");
      }, 2000); 
      return () => clearTimeout(timer);
    }
  }, [formSuccess]);


  const handleLogout = () => {
    logout(); 
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setFormErrors({}); 
    setFormSuccess(""); 

    if (!userData || !userData.id) {
      setFormErrors({ general: "User data not available for saving." });
      return;
    }

    const name = document.getElementById("name").value.trim();
    const surname = document.getElementById("surname").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    let errors = {};

    if (name === userData.name && surname === userData.surname && username === userData.username && email === userData.email && !newPassword && !confirmPassword) {
      errors.general = "No changes detected to save"; 
      setFormErrors(errors);
      return;
    }

    if (!name) errors.name = "Name is required.";
    if (!surname) errors.surname = "Surname is required.";
    if (!username) errors.username = "Username is required.";
    if (!email) errors.email = "Email is required.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

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

    if (username !== userData.username) {
      try {
        const data = await uniqueUsername(username);
        if (data && data.exists) { // Ensure to check data.exists as per your uniqueUsername API
          errors.username = "Username already taken.";
          setFormErrors(errors);
          return; 
        }
      } catch (error) {
        console.error('Error checking username:', error);
        errors.general = "An error occurred checking username availability.";
        setFormErrors(errors);
        return; 
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      errors.email = "Invalid email format.";
      setFormErrors(errors);
      return;
    }
    if (email !== userData.email) {
      try {
        const data = await uniqueEmail(email);
        if (data && data.exists) { // Ensure to check data.exists as per your uniqueEmail API
          errors.email = "Email already in use.";
          setFormErrors(errors);
          return; 
        }
      } catch (error) {
        console.error('Error checking email:', error);
        errors.general = "An error occurred checking email availability.";
        setFormErrors(errors);
        return; 
      }
    }

    if (!newPassword && !confirmPassword) {
      try {
        await updateUserDetails(userData.id, name, surname, username, email);
        fetchOwnUserData(); // Re-fetch the current user's data after update
        setFormSuccess("User details updated successfully!");
      } catch (err) {
        errors.general = "An error occurred while updating details: " + err.message;
        setFormErrors(errors);
      }
    } else {
      if (!newPassword) errors.newPassword = "New password is required.";
      if (!confirmPassword) errors.confirmPassword = "Confirm password is required.";
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      if (newPassword !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match.";
        setFormErrors(errors);
        return;
      }

      try {
        await updateUserPassword( userData.id, name, surname, username, email, newPassword );
        fetchOwnUserData(); // Re-fetch the current user's data after password update
        setFormSuccess("Password updated successfully!");
      } catch (err) {
        errors.general = "An error occurred while updating password: " + err.message;
        setFormErrors(errors);
      }
    }
  };

  if (authLoading) return <div className="containerP">Loading authentication...</div>;
  if (!isLoggedIn) return null; 
  if (loading) return <div className="containerP">Loading user data...</div>;
  if (error) return <div className="containerP">Error: {error}</div>;
  if (!userData) return <div className="containerP">No user data available.</div>; 

  return (
    <div className="containerP">
      <main className="content">
        <section className="profile-header">
          <div className="avatar" aria-label="User initials">
            {userData?.name?.charAt(0)}{userData?.surname?.charAt(0)}
          </div>
          <div className="profile-info">
            <h2 className="name">{userData?.name} {userData?.surname}</h2>
            <p className="email">{userData?.username}</p>
            <p className="member-since">Member since: {new Date().toLocaleDateString()}</p>
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
              {formSuccess && <div style={{ color: 'green' }}>{formSuccess}</div>}
              <div className="btn-group">
                <button type="button" className="btn-secondary">Reset Progress</button>
                <button type="button" className="btn-danger">Delete Account</button>
                <button type="button" className="btn-danger" onClick={handleLogout}>Logout</button>
              </div>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}