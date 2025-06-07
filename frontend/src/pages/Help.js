import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Help.css'; 
import homeImage from '../Picture1.png';

const HelpPage = () => {
  return (
    <div className="home-container">
      <section className="home-section">
        <div className="home-content">
          <h1>Welcome to Hands UP!</h1>
          <p className="home-tagline">Your journey to mastering sign language starts here. Connect, learn, and translate with ease.</p>
          <div className="home-buttons">
            <Link to="/translator" className="btn-primary">Start Translating</Link>
            <Link to="/learn" className="btn-secondary">Begin Learning</Link>
          </div>
        </div>
        <div className="home-image">
                <img src={homeImage} alt="Sign Language Hero" /> 
            </div>
      </section>

      <hr className="divider" /> 

      <section className="features-section">
        <h2>Explore Our Features</h2>
        <div className="feature-grid">
          <Link to="/Translator" className="feature-card">
            <i className="fas fa-hand-paper feature-icon"></i> 
             <h3>Translator</h3>
            <p>Instantly translate sign language into words or phrases.</p>
          </Link>

          <Link to="/Learn" className="feature-card">
            <i className="fas fa-book-open feature-icon"></i>
            <h3>Learn & Practice</h3>
            <p>Dive into interactive lessons, quizzes, and practice exercises.</p>
          </Link>

          <Link to="/userProfile" className="feature-card">
            <i className="fas fa-user-circle feature-icon"></i>
            <h3>Your Profile</h3>
            <p>Track your learning progress and manage your account settings.</p>
          </Link>
          
        </div>
      </section>

      <hr className="divider" />

      <section className="cta-section">
        <h2>Ready to Communicate?</h2>
        <p>Join thousands of users who are bridging communication gaps with Hands UP.</p>
        <Link to="" className="btn-primary large">Get Started for Free</Link>
      </section>
    </div>
  );
};

export default HelpPage;