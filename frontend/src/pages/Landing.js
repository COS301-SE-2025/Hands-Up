import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Landing.css';
import video1 from "../media/landing_video1.mp4";
import logo from "../logo2.png";
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

      <div className="hero-container">
        <img src={background1} alt="Alphabet Background" className="background1"/>

        <div className="hero-div">
          <img src={phil} alt="Phil" className="side-image left-image" />
          <h1 className="hero-div-h1">Welcome to Hands Up</h1>
          <p className="hero-div-p">Empowering Communication <br></br> One Sign at a Time.</p>
          <div className="hero-buttons">
            <button className="hero-button">Start Translating</button>
            <button className="hero-button">Sign Up</button>
            <button className="hero-button">Login</button>
          </div>
          <img src={angie} alt="Angie" className="side-image right-image" />
        </div>
      </div>

      <div className="features-section">
        <h2 className="features-heading">Explore Our Features</h2>
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

      <div className="problem-solution-section">
        {/* <h2 className="section-heading">Problem & Solution</h2>
        <div className="problem-solution-container">

          <div className="problem-box">
            <h3>Problem</h3>
            <p>Many people struggle to communicate with the Deaf community due to the lack of accessible sign language resources and tools.</p>
          </div>

          <div className="solution-box">
            <h3>Solution</h3>
            <p>Hands Up bridges this gap by providing real-time translation, engaging learning modules, and personalized progress tracking.</p>
          </div>

        </div> */}
      </div>


      {/* <header className="header">
        <div className="header-left">
          <img src={logo} alt="Hands UP Logo" className="logo" />
          <h1 className="site-title">Hands UP</h1>
        </div>

        <nav className="nav-right">
          <ul className="nav-list">
            {NAV_ITEMS.map((item) => (
              <li key={item}>
                <Link
                  to={NAV_PATHS[item]}
                  className={`nav-link ${
                    currentPage === item ? "nav-link-active" : ""
                  }`}
                >
                  {item}
                </Link>
              </li>
            ))}

            {isLoggedIn ? (
              <li>
                <button
                  onClick={handleLogout}
                  className="nav-link logout-button"
                  title="Logout"
                >
                  <i className="fas fa-sign-out-alt logout-icon"></i>
                  <span className="sr-only">Logout</span>
                </button>
              </li>
            ) : (
              <>
                <li>
                  <Link to="/login" className="nav-link btn-login">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="nav-link btn-signup">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>

      <div className="video-wrapper">
        <video className="background-video" autoPlay muted loop playsInline>
          <source src={video1} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div> */}

      {/* <section className="hero-section">
        <div className="hero-text">
          <h1 className="animated-title">👋 Welcome to <span>Hands UP!</span></h1>
          <p className="tagline">Learn. Sign. Connect. Make communication fun and inclusive.</p>
          <div className="cta-buttons">
            <Link to="/translator" className="btn-fun">🎤 Start Translating</Link>
            <Link to="/learn" className="btn-fun-outline">📚 Start Learning</Link>
          </div>
        </div>
        <div className="hero-image"> */}
          {/* <img src={landingImage} alt="Sign Language Animation" /> */}
        {/* </div>
      </section>

      <section className="fun-features">
        <h2>🎉 What You Can Do</h2>
        <div className="feature-cards">
          <Link to="/translator" className="card bounce">
            <i className="fas fa-sign-language"></i>
            <h3>Live Translator</h3>
            <p>Translate gestures to text instantly.</p>
          </Link>
          <Link to="/learn" className="card bounce">
            <i className="fas fa-chalkboard-teacher"></i>
            <h3>Gamified Learning</h3>
            <p>Level up with quizzes and fun lessons!</p>
          </Link>
          <Link to="/userProfile" className="card bounce">
            <i className="fas fa-trophy"></i>
            <h3>Your Progress</h3>
            <p>Earn badges and track your growth.</p>
          </Link>
        </div>
      </section> */}

      {/* <section className="join-us">
        <h2>✨ Ready to Sign?</h2>
        <p>Join a growing community of sign language learners today!</p>
        <Link to="/signup" className="btn-fun large">🚀 Get Started</Link>
      </section> */}
    </div>
  );
};

export default LandingPage;