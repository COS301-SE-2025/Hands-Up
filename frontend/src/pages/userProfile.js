import React from "react";
import "../styles/userProfile.css";

export default function UserProfile() 
{
  return (
    <div className="containerP">
        <main className="content">
          <section className="profile-header">
            <div className="avatar" aria-label="User initials">TT</div>
            <div className="profile-info">
              <h2 className="name">TMKDT Team</h2>
              <p className="email">TMKDT@gmail.com</p>
              <p className="member-since">Member since: May 2025</p>
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
            <form>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input id="name" type="text" defaultValue="TMKDT" />
                </div>
                <div className="form-group">
                  <label htmlFor="surname">Surname</label>
                  <input id="surname" type="text" defaultValue="Team" />
                </div>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input id="username" type="text" defaultValue="TMKDT" />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" defaultValue="TMKDT@gmail.com" />
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
