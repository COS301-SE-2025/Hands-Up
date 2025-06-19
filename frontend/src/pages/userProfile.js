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
  const { currentUser, isLoggedIn, loading: authLoading, logout, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    username: '',
    email: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [formSuccess, setFormSuccess] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        surname: currentUser.surname || '',
        username: currentUser.username || '',
        email: currentUser.email || '',
        newPassword: '', 
        confirmPassword: ''
      });
      setLoading(false); 
    } else {
      setError("User data not available after authentication.");
      setLoading(false);
    }
  }, [authLoading, isLoggedIn, currentUser, navigate]); 

  useEffect(() => {
    if (formSuccess) {
      const timer = setTimeout(() => {
        setFormSuccess("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [formSuccess]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
    if (formErrors[id]) {
      setFormErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[id];
        return newErrors;
      });
    }
  };


  const handleLogout = () => {
    logout();
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setFormSuccess("");
    setError(""); 

    if (!currentUser || !currentUser.id) {
      setFormErrors({ general: "User data not available for saving. Please refresh and try again." });
      return;
    }

    const { name, surname, username, email, newPassword, confirmPassword } = formData;

    let errors = {};

    if (!name) errors.name = "Name is required.";
    if (!surname) errors.surname = "Surname is required.";
    if (!username) errors.username = "Username is required.";
    if (!email) errors.email = "Email is required.";

    const nameRegex = /^[A-Za-z]+$/;
    if (name && !nameRegex.test(name)) {
      errors.name = "Name must contain only letters.";
    }
    if (surname && !nameRegex.test(surname)) {
      errors.surname = "Surname must contain only letters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      errors.email = "Invalid email format.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const hasDetailsChanged = (
      name !== currentUser.name ||
      surname !== currentUser.surname ||
      username !== currentUser.username ||
      email !== currentUser.email
    );
    const hasPasswordChanged = newPassword && confirmPassword;

    if (!hasDetailsChanged && !hasPasswordChanged) {
        errors.general = "No changes detected to save.";
        setFormErrors(errors);
        return;
    }

    if (username !== currentUser.username) {
      try {
        const usernameExists = await uniqueUsername(username);
        if (usernameExists) {
          errors.username = "Username already taken.";
          setFormErrors(errors);
          return;
        }
      } catch (err) {
        console.error('Error checking username:', err);
        errors.general = "An error occurred checking username availability.";
        setFormErrors(errors);
        return;
      }
    }

    if (email !== currentUser.email) {
      try {
        const emailExists = await uniqueEmail(email);
        if (emailExists) {
          errors.email = "Email already in use.";
          setFormErrors(errors);
          return;
        }
      } catch (err) {
        console.error('Error checking email:', err);
        errors.general = "An error occurred checking email availability.";
        setFormErrors(errors);
        return;
      }
    }

    if (hasPasswordChanged) {
      if (newPassword !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match.";
        setFormErrors(errors);
        return;
      }
      if (newPassword.length < 6) { 
          errors.newPassword = "Password must be at least 6 characters long.";
          setFormErrors(errors);
          return;
      }

      try {
        const result = await updateUserPassword(currentUser.id, name, surname, username, email, newPassword); // Pass all details, even if not changed (API expects it)
        setFormSuccess("Password updated successfully!");
        if (result && result.user) {
            updateUser(result.user); 
        }
        setFormData(prevData => ({ ...prevData, newPassword: '', confirmPassword: '' }));
      } catch (err) {
        console.error("Error updating password:", err);
        errors.general = "An error occurred while updating password: " + (err.message || "Please try again.");
        setFormErrors(errors);
      }
    }

    if (hasDetailsChanged) { 
        try {
            const result = await updateUserDetails(currentUser.id, name, surname, username, email);
            setFormSuccess("User details updated successfully!");
            if (result && result.user) {
                updateUser(result.user);
            }
        } catch (err) {
            console.error("Error updating details:", err);
            errors.general = "An error occurred while updating details: " + (err.message || "Please try again.");
            setFormErrors(errors);
        }
    }

    if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
    }
  };

  if (authLoading) return <div className="containerP">Loading authentication...</div>;
  if (!isLoggedIn) return null;
  if (loading) return <div className="containerP">Loading user profile...</div>;
  if (error) return <div className="containerP">Error: {error}</div>;
  if (!currentUser) return <div className="containerP">No user data available. Please log in.</div>;

  return (
    <div className="containerP">
      <main className="content">
        <section className="profile-header">
          <div className="avatar" aria-label="User initials">
            {currentUser?.name?.charAt(0)}{currentUser?.surname?.charAt(0)}
          </div>
          <div className="profile-info">
            <h2 className="name">{currentUser?.name} {currentUser?.surname}</h2>
            <p className="email">{currentUser?.username}</p>
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
                  value={formData.name}
                  onChange={handleChange}
                />
                {formErrors.name && <div style={{ color: 'red' }}>{formErrors.name}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="surname">Surname</label>
                <input
                  id="surname"
                  type="text"
                  value={formData.surname} 
                  onChange={handleChange} 
                />
                {formErrors.surname && <div style={{ color: 'red' }}>{formErrors.surname}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={formData.username} 
                  onChange={handleChange}
                />
                {formErrors.username && <div style={{ color: 'red' }}>{formErrors.username}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  onChange={handleChange} 
                />
                {formErrors.email && <div style={{ color: 'red' }}>{formErrors.email}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.newPassword} 
                  onChange={handleChange}
                />
                {formErrors.newPassword && <div style={{ color: 'red' }}>{formErrors.newPassword}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                />
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