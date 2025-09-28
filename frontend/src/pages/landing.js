import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FaAmericanSignLanguageInterpreting, FaComments, FaGlobeAfrica, FaChartLine, FaGamepad } from "react-icons/fa";
import { FaPersonChalkboard } from "react-icons/fa6";
import '../styles/landing.css';
import video1 from "../media/landing_video1.mp4";
import logo from "../media/logo.png";
import devices from "../media/devices.png";
import ModelViewer from '../components/mascotModelViewer'

export function Landing(){

  const navigate = useNavigate();
  const goToLogin = () => navigate('/login');
  const goToSignup = () => navigate('/signup');
  const goToTranslator = () => navigate('/translator');
  // Add these state variables inside your Landing component
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);

  const [error, setError] = useState('');

  const handleClick = () => {
    setError('Coming soon!');
    setTimeout(() => {
      setError('');
    }, 3000); 
  };

  // Inside your useEffect hook
  useEffect(() => {
    // PWA install prompt handler
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); 
      setDeferredPrompt(e); 
      setShowInstallBtn(true);
    };

    // Add a listener for the 'appinstalled' event to update state
    const handleAppInstalled = () => {
      setIsPWAInstalled(true);
      setShowInstallBtn(false);
    };

    // Check if the app is already in standalone mode on page load
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPWAInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Initialize AOS and other logic
    AOS.init({
      duration: 1000,
      once: false,
    });

    // Cleanup function
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Function to handle the install click
  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      // Prompt is used, reset state
      setDeferredPrompt(null);
      setShowInstallBtn(false);
    }
  };

  // Function to handle the open app click
  const handleOpenAppClick = () => {
    // Redirects the user to the app's home page
    navigate('/');
  };

  return (
    <div className="landing-container">

      <header className="landing-header">
        <div className="landing-header-left">
          <img src={logo} alt="Hands UP Logo" className="landing-logo" />
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
          <div>
            <h1 className="hero-div-h1">Welcome to Hands UP</h1>
            <p className="hero-div-p">Empowering Communication <br></br> One Sign at a Time.</p>
            <div className="hero-buttons">
              <button className="hero-button" onClick={goToTranslator}>Start Translating</button>
              <button className="hero-button" onClick={goToSignup}>Start Learning</button>
            </div>
          </div>
          <div className="side-image right-image">
            <div style={{ width: '100%', height: '85vh' }}>
              <ModelViewer modelPath={'/models/angieWaving.glb'}/>
            </div>
          </div>
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
          <div className="landing-feature-card" data-aos="fade-up">
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

          <div className="landing-feature-card" data-aos="fade-up">
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

          <div className="landing-feature-card" data-aos="fade-up">
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

          <div className="landing-feature-card" data-aos="fade-up">
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

          <div className="landing-feature-card" data-aos="fade-up">
            <div className="card-inner">
              <div className="card-front one-front">
                <FaGamepad className="landing-feature-icon" />
                <p>Fun Challenges</p>
              </div>
              <div className="card-back">
                <p>Play a fun sign-collecting game where you grab the right signs to build words as you go!</p>
              </div>
            </div>
          </div>

          <div className="landing-feature-card" data-aos="fade-up">
            <div className="card-inner">
              <div className="card-front two-front">
                <FaGlobeAfrica className="landing-feature-icon" />
                <p>Multi-Language Support <br></br>(Coming Soon)</p>
              </div>
              <div className="card-back">
                <p>Currently supports American Sign Language (ASL), with plans to expand to SASL, BSL and more.</p>
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
            <h3>Get the Hands UP App</h3>
            <p>Get instant access! You can install the Hands UP app directly to your device:</p>
            <p>Just tap the three dots menu (⋮) at the top right, and choose 'Install App' or 'Add to Home Screen' from the options.</p>
            <img src={devices} alt="Devices" className="device-image"/>
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