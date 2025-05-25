import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/userProfile.css";
import {getUserData} from'../utils/apiCalls.js';

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
      
      // Use the imported API function
      getUserData(user.id)
        .then(data => setUserData(data))
        .catch(err => {
          console.error("Error fetching user data:", err);
        });
      
    } catch (err) {
      setError("Failed to load user data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

 

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    // Implement update logic here
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
              </div>
              <div className="form-group">
                <label htmlFor="surname">Surname</label>
                <input 
                  id="surname" 
                  type="text" 
                  defaultValue={userData?.surname || ''} 
                />
              </div>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input 
                  id="username" 
                  type="text" 
                  defaultValue={userData?.username || ''} 
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  id="email" 
                  type="email" 
                  defaultValue={userData?.email || ''} 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input id="newPassword" type="password" placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input id="confirmPassword" type="password" placeholder="••••••••" />
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