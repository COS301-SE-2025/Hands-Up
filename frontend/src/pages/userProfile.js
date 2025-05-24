import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/userProfile.css";

export default function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  const fetchUserData = async (userId) => {
    try {
      const response = await fetch(`http://localhost:2000/handsUPApi/user/${userId}`);
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

    //check if any fields are empty
    if (!name) errors.name = "Name is required.";
    if (!surname) errors.surname = "Surname is required.";
    if (!username) errors.username = "Username is required.";
    if (!email) errors.email = "Email is required.";
    if (!newPassword) errors.newPassword = "Password is required.";
    if (!confirmPassword) errors.confirmPassword = "Confirm password is required.";

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

    //check if email is in a valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      errors.email = "Invalid email format.";
      setFormErrors(errors);
      return;
    }

    //check that password and confirm password match
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
      setFormErrors(errors);
      return;
    }

    //check that username does not already exist 
    try {
      const response = await fetch(`/auth/unique-username/${encodeURIComponent(username)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.exists) {
        errors.username = "Username already taken.";
        setFormErrors(errors);
        return;  
      }
    } catch (error) {
      console.error('Error checking username:', error);
      return null; // or handle error differently
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

        <section className="learning-progress">
          <h3>Learning Progress</h3>
          <div className="progress-bar-wrapper" aria-label="Learning progress bar">
            <div className="progress-header">
              <span className="progress-status">In Progress</span>
              <span className="progress-percent">50%</span>
            </div>
            <div className="progress-bar" role="progressbar" aria-valuenow={50} aria-valuemin={0} aria-valuemax={100}>
              <div className="progress-fill" style={{ width: "50%" }}></div>
            </div>
          </div>

          <div className="progress-stats">
            <div className="stat-card">
              <p className="stat-value">10/20</p>
              <p className="stat-label">Lessons Completed</p>
            </div>
            <div className="stat-card">
              <p className="stat-value">35</p>
              <p className="stat-label">Signs Learned</p>
            </div>
            <div className="stat-card">
              <p className="stat-value">8</p>
              <p className="stat-label">Practice Days</p>
            </div>
            <div className="stat-card">
              <p className="stat-value">Silver</p>
              <p className="stat-label">Current Level</p>
            </div>
          </div>
        </section>

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
                {formErrors.name && <div className="error-text">{formErrors.name}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="surname">Surname</label>
                <input 
                  id="surname" 
                  type="text" 
                  defaultValue={userData?.surname || ''} 
                />
                {formErrors.surname && <div className="error-text">{formErrors.surname}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input 
                  id="username" 
                  type="text" 
                  defaultValue={userData?.username || ''} 
                />
                {formErrors.username && <div className="error-text">{formErrors.username}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  id="email" 
                  type="email" 
                  defaultValue={userData?.email || ''} 
                />
                {formErrors.email && <div className="error-text">{formErrors.email}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input id="newPassword" type="password" placeholder="••••••••" />
                {formErrors.newPassword && <div className="error-text">{formErrors.newPassword}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input id="confirmPassword" type="password" placeholder="••••••••" />
                {formErrors.confirmPassword && <div className="error-text">{formErrors.confirmPassword}</div>}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">Save Changes</button>
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