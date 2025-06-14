import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Landing.css';
import video1 from "../media/landing_video1.mp4";
import logo from "../media/logo.png";
import background1 from "../media/background.png";
import angie from "../media/angie.png";
import phil from "../media/phil.png";

const NAV_ITEMS = ["Home", "Learn", "Translator", "Profile"];

const NAV_PATHS = {
  Home: "/home",
  Learn: "/learn",
  Translator: "/translator",
  Profile: "/userProfile", 
};

const LandingPage = () => {
  return (
    <div className="landing-container">

      <header className="landing-header">
        <div className="landing-header-left">
          <img src={logo} alt="Hands Up Logo" className="logo" />
          <h1>Hands UP</h1>
        </div>

        <nav className="landing-nav-center">
          <a href="#about" className="landing-nav-link">About</a>
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#help" className="landing-nav-link">Help</a>
        </nav>

        <div className="landing-header-right">
          <button className="nav-button login">Login</button>
          <button className="nav-button signup">Sign Up</button>
        </div>
      </header>

      <div className="hero-container">
        {/* <img src={background1} alt="Alphabet Background" className="background1"/> */}

        <div className="hero-div">
          <img src={phil} alt="Phil" className="side-image left-image" />
          <h1 className="hero-div-h1">Welcome to Hands Up</h1>
          <p className="hero-div-p">Empowering Communication <br></br> One Sign at a Time.</p>
          <div className="hero-buttons">
            <button className="hero-button">Start Translating</button>
            <button className="hero-button">Start Learning</button>
          </div>
          <img src={angie} alt="Angie" className="side-image right-image" />
        </div>
      </div>

      <div className="about-section">
        <h2 className="about-heading">OUR MISSION</h2>
        <div className="about-container">
          <div className="about">
            <p> Hands UP is an innovative, application that bridges the communication gap between
                signers and non-signers. <br></br><br></br>Using advanced AI technology, the application detects and
                translates sign language in real-time through the device's camera, converting signs
                into both text and spoken language without significant delays. <br></br><br></br>Beyond translation, it
                also serves as an interactive learning platform with structured lessons and
                immediate feedback on signing accuracy.</p>
          </div>
        </div>
      </div>

      <div className="landing-features-section">
        <h2 className="landing-features-heading">Explore Our Features</h2>
        <div className="features-container">
          <div className="feature-card">
            <div className="card-inner">
              <div className="card-front">
                <p>Translating</p>
              </div>
              <div className="card-back">
                <p>Real-time sign language translation to text and speech.</p>
              </div>
            </div>
          </div>

          <div className="feature-card">
            <div className="card-inner">
              <div className="card-front">
                <p>Learning</p>
              </div>
              <div className="card-back">
                <p>Interactive lessons to improve your signing skills with instant feedback.</p>
              </div>
            </div>
          </div>

          <div className="feature-card">
            <div className="card-inner">
              <div className="card-front">
                <p>User Profile</p>
              </div>
              <div className="card-back">
                <p>Track your progress, achievements, and personalize your experience.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default LandingPage;