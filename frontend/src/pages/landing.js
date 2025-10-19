import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FaAmericanSignLanguageInterpreting, FaGlobeAfrica, FaChartLine, FaGamepad, FaMusic } from "react-icons/fa";
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
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState('');

  // eslint-disable-next-line no-unused-vars
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
                But it is more than just a translator. It&apos;s a complete learning space for all ages, with interactive lessons, a fun game, and nursery rhymes in sign language designed to make learning engaging and enjoyable.</p>
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
              <div className="card-front two-front">
                <FaGamepad className="landing-feature-icon" />
                <p>Sign Surfers</p>
              </div>
              <div className="card-back">
                <p>Play a fun sign-collecting game where you grab the right signs to build words as you go.</p>
              </div>
            </div>
          </div>

          <div className="landing-feature-card" data-aos="fade-up">
            <div className="card-inner">
              <div className="card-front one-front">
                <FaMusic className="landing-feature-icon" />
                <p>Sing & Sign</p>
              </div>
              <div className="card-back">
                <p>Follow along with Angie as you learn popular nursery rhymes in sign language.</p>
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
            <p className="download-subtitle">Get instant access! Install the Hands UP app directly to your device:</p>
            
            <img src={devices} alt="Devices" className="device-image"/>
            
            <div className="installation-cards">
              <div className="install-card desktop-card">
                <div className="card-header">
                  <h4>Desktop Installation</h4>
                </div>
                <div className="install-steps">
                  <div className="step-item">
                    <span className="step-number">1</span>
                    <p>Tap the three dots menu <strong>(⋮)</strong> at the top right</p>
                  </div>
                  <div className="step-item">
                    <span className="step-number">2</span>
                    <p>Select <strong>&apos;Cast, Save and Share&apos;</strong></p>
                  </div>
                  <div className="step-item">
                    <span className="step-number">3</span>
                    <p>Click <strong>&apos;Install App&apos;</strong></p>
                  </div>
                </div>
              </div>

              <div className="install-card mobile-card">
                <div className="card-header">
                  <h4>Mobile Installation</h4>
                </div>
                <div className="install-steps">
                  <div className="step-item">
                    <span className="step-number">1</span>
                    <p>Tap the menu icon <strong>(⋮)</strong> in your browser</p>
                  </div>
                  <div className="step-item">
                    <span className="step-number">2</span>
                    <p>Select <strong>&apos;Add to Home Screen&apos;</strong></p>
                  </div>
                  <div className="step-item">
                    <span className="step-number">3</span>
                    <p>Tap <strong>&apos;Install&apos;</strong> to confirm</p>
                  </div>
                </div>
              </div>
            </div>
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
