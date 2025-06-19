import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css'; 
import homeImage from '../Picture1.png';
import signsBackground from '../media/signs.png';

const HomePage = () => {
  return (
    <div className="home-container">
      <section className="home-section">
        <div className="home-content">
          <h1>Hey, Awesome To See You Today!</h1>
          <p className="home-tagline">Your hands are telling an awesome story, let’s add a new chapter!</p>
          <div className="home-buttons">
            <Link to="/learn" className="btn-secondary">Continue Learning</Link>
            <Link to="/translator" className="btn-secondary">Translate</Link>
          </div>
        </div>
        <div className="home-image">
                <img src={homeImage} alt="Sign Language Hero" /> 
            </div>
      </section>

      <hr className="divider" /> 

      <div className="word-of-day-container">
        <h2 className="word-of-day-heading">WORD OF THE DAY</h2>
        <div className="word-of-day">
            <p>Tired</p>
        </div>
      </div>

      {/* <div className="word-of-day-container">
        <img src={signsBackground} alt="Word of the Day Background" className="word-of-day-bg" />
        <div className="word-of-day-overlay">
          <h2>Word of the Day ✨</h2>
          <p><strong>“Connection”</strong> — Because every sign brings us closer together.</p>
        </div>
      </div> */}

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

export default HomePage;