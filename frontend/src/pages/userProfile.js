import {LearningStats} from "../components/learningStats.js";
import "../styles/userProfile.css";

function UserProfile() {

  return (
    <div className="containerP">
        <main className="content">
          <section className="profile-header">
            <div className="avatar" aria-label="User initials">TT</div>
            <div className="profile-info">
              <h2 className="name">{localStorage.getItem("username")}</h2>
              <p className="email">TMKDT@gmail.com</p>
              <p className="member-since">Member since: May 2025</p>
            </div>
          </section>

          <LearningStats />

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

export default UserProfile;