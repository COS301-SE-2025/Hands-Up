import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FaAmericanSignLanguageInterpreting, FaComments, FaGlobeAfrica, FaChartLine, FaGamepad } from "react-icons/fa";
import { FaPersonChalkboard } from "react-icons/fa6";
import '../styles/Landing.css';
import video1 from "../media/landing_video1.mp4";
import logo from "../media/logo.png";
import devices from "../media/devices.png";
import angie from "../media/angie.png";
import phil from "../media/phil.png";

const LandingPage = () => {

  const navigate = useNavigate();
  const goToLogin = () => navigate('/login');
  const goToSignup = () => navigate('/signup');
  const goToTranslator = () => navigate('/translator');

  const [error, setError] = useState('');

  const handleClick = () => {
    setError('Coming soon!');
    setTimeout(() => {
      setError('');
    }, 3000); 
  };

  useEffect(() => {
    AOS.init({
      duration: 1000, 
      once: false,     
    });
  }, []);

  return (
    <div className="landing-container">

      <header className="landing-header">
        <div className="landing-header-left">
          <img src={logo} alt="Hands Up Logo" className="landing-logo" />
          <h1>Hands UP</h1>
        </div>

        <nav className="landing-nav-center">
          <a href="#about" className="landing-nav-link">About</a>
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#help" className="landing-nav-link">Help</a>
        </nav>

        <div className="landing-header-right">
          <button className="nav-button login" onClick={goToLogin}>Login</button>
          <button className="nav-button signup" onClick={goToSignup}>Sign Up</button>
        </div>
      </header>

      <div className="hero-container">
        <div className="hero-div">
          <img src={phil} alt="Phil" className="side-image left-image" />
          <div>
            <h1 className="hero-div-h1">Welcome to Hands Up</h1>
            <p className="hero-div-p">Empowering Communication <br></br> One Sign at a Time.</p>
            <div className="hero-buttons">
              <button className="hero-button" onClick={goToTranslator}>Start Translating</button>
              <button className="hero-button" onClick={goToSignup}>Start Learning</button>
            </div>
          </div>
          <img src={angie} alt="Angie" className="side-image right-image" />
        </div>
      </div>

      <section id="about">
      <div className="about-section">
        <h2 className="about-heading" data-aos="zoom-in">OUR MISSION</h2>
        <div className="about-container">
          <div className="about" data-aos="fade-up">
            <p> Hands UP is designed to make sign language accessible, enjoyable and part of everyday life for everyone.
                <br></br><br></br>
                Whether you&apos;re just starting to learn or a novice signer, Hands UP uses AI to translate sign language instantly through your device&apos;s camera — turning signs into text and speech with ease, right when you need it.
                <br></br><br></br>
                But it is more than just a translator. It&apos;s a fun, interactive learning space where you can practice, improve your signing skills and get real-time feedback to build your confidence as you go.</p>
          </div>
        </div>
      </div>
      </section>

    <section id="features">
      <div className="landing-features-section">
        <h2 className="landing-features-heading" data-aos="zoom-in">Explore Our Features</h2>
        <div className="landing-features-container">
          <div className="feature-card" data-aos="fade-up">
            <div className="card-inner">
              <div className="card-front one-front">
                <FaAmericanSignLanguageInterpreting className="landing-feature-icon" />
                <p>Real-Time Translation</p>
              </div>
              <div className="card-back">
                <p>Instantly convert sign language into text and speech using your camera.</p>
              </div>
            </div>
          </div>

          <div className="feature-card" data-aos="fade-up">
            <div className="card-inner">
              <div className="card-front two-front">
                <FaPersonChalkboard className="landing-feature-icon" />
                <p>Interactive Learning</p>
              </div>
              <div className="card-back">
                <p>Step-by-step learning curriculum with engaging tutorials and challenges.</p>
              </div>
            </div>
          </div>

          <div className="feature-card" data-aos="fade-up">
            <div className="card-inner">
              <div className="card-front one-front">
                <FaComments className="landing-feature-icon" />
                <p>Instant Feedback</p>
              </div>
              <div className="card-back">
                <p>AI-driven feedback on your signs for better accuracy and faster improvement.</p>
              </div>
            </div>
          </div>

          <div className="feature-card" data-aos="fade-up">
            <div className="card-inner">
              <div className="card-front two-front">
                <FaChartLine className="landing-feature-icon" />
                <p>Progress Tracking</p>
              </div>
              <div className="card-back">
                <p>Track your progress, achievements and completed lessons.</p>
              </div>
            </div>
          </div>

          <div className="feature-card" data-aos="fade-up">
            <div className="card-inner">
              <div className="card-front one-front">
                <FaGlobeAfrica className="landing-feature-icon" />
                <p>Multi-Language Support <br></br>(Coming Soon)</p>
              </div>
              <div className="card-back">
                <p>Currently supports American Sign Language (ASL), with plans to expand to SASL, BSL and more.</p>
              </div>
            </div>
          </div>

          <div className="feature-card" data-aos="fade-up">
            <div className="card-inner">
              <div className="card-front two-front">
                <FaGamepad className="landing-feature-icon" />
                <p>Fun Challenges <br></br>(Coming Soon)</p>
              </div>
              <div className="card-back">
                <p>Play a fun sign-collecting game where you grab the right signs to build words and phrases as you go!</p>
              </div>
            </div>
          </div>

        </div>
      </div>
      </section>

      <section id="help">
      <div className="help-section">
        <h2 className="help-heading" data-aos="zoom-in">Need a Hand?</h2> 
        
        <div className="help-container">
          <div className="download-info" data-aos="fade-up">
            <h3>How to Download</h3>
            <p>Download info coming soon...</p>
            <img src={devices} alt="Devices" className="device-image"/>
            {/* <a href="https://play.google.com" target="_blank" rel="noopener noreferrer" className="download-button">Download Now</a> */}
            <button className="download-button" onClick={handleClick}>Download Now</button>
            {error && <p className="error-message">{error}</p>}
          </div>

          <div className="tutorial-video" data-aos="fade-up">
            <h3>Watch the Tutorial</h3>
            <p>See how Hands UP works and how to get started with signing and learning.</p>
            <iframe width="560" height="315" 
              src={video1}
              title="Hands UP Tutorial Video"
              frameBorder="0"
              allowFullScreen>
            </iframe>
          </div>
        </div>
      </div>
      </section>

      <footer className="landing-footer">
        <p>© 2025 Hands UP - A project by EPI-USE Africa in collaboration with TMKDT</p>
      </footer>

    </div>
  );
};

export default LandingPage;
