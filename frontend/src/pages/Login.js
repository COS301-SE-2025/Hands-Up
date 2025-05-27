import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import heroImage from "../sign33.png"
import logo from "../logo2.png"

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const navigate = useNavigate(); 

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    if (!email.includes('@') || password.length < 6) {
      setError('Invalid email or password format.');
      setIsLoading(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    setError('');
    console.log('Login attempt for:', email);
    setIsLoading(false);

    navigate('/home');
  };

  return (
    <div className="login-page">
      <div className="bg-animation-container">
        <div className="bg-animation-circle-1" style={{backgroundColor: '#b3d077', '--initial-opacity': 0.05, '--pulse-opacity': 0.08}}></div>
        <div className="bg-animation-circle-2" style={{backgroundColor: '#ffc61a', '--initial-opacity': 0.07, '--pulse-opacity': 0.1}}></div>
      </div>

      <div className={`login-content-wrapper ${mounted ? 'mounted' : ''}`}>
        <div className="login-grid">

          <div className="form-section">

            <div className="form-content">
              <div className="header-section">
                <div className="logo-group">
                  <div className="logo-icon-wrapper" style={{background: `linear-gradient(135deg, #ffc61a, #b3d077)`}}>
                    <img src={logo} alt="Logo" className="logo-image" />
                  </div>
                  <h1 className="welcome-title">
                    Welcome Back!
                  </h1>
                </div>
                <p className="subtitle">Unlock your signing journey.</p>
              </div>

              <div className="form-fields-container">
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                <div className="input-group">
                  <label htmlFor="email" className="input-label">
                    <Mail className="mail-icon" />
                    Email Address
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="text-input"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="password" className="input-label">
                    <Lock className="lock-icon" />
                    Password
                  </label>
                  <div className="input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="text-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle-button"
                    >
                      {showPassword ? <EyeOff className="password-icon" /> : <Eye className="password-icon" />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleSubmit}
                  className="submit-button"
                >
                  <div className="submit-button-overlay-1"></div>
                  <div className="submit-button-overlay-2"></div>
                  <div className="submit-button-content">
                    {isLoading ? (
                      <div className="spinner"></div>
                    ) : (
                      <>
                        <span className="button-text">Log In</span>
                        <ArrowRight className="arrow-right-icon" />
                      </>
                    )}
                  </div>
                </button>
              </div>

              <div className="signup-section">
                <div className="signup-card">
                  <p className="signup-text">Don't have an account?</p>
                  <button
                    onClick={() => navigate('/signup')}
                    className="signup-button"
                  >
                    Sign up
                    <ArrowRight className="signup-arrow-icon" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-section">
            <div
              className="hero-background-image"
              style={{ backgroundImage: `url(${heroImage})` }}
            >
            </div>

            <div className="hero-overlay" style={{background: `linear-gradient(135deg, rgba(78, 122, 81, 0.6), rgba(179, 208, 119, 0.55), rgba(255, 198, 26, 0.5))`}}></div>
            <div className="hero-content">
              <div className="hand-signs-wrapper">
              </div>

              <div className="hero-text-content">
                <h2 className="hero-title">
                  Hands UP
                </h2>

              </div>

              <div className="hero-decor-circle-1" style={{backgroundColor: '#ffc61a', opacity: 0.1}}></div>
              <div className="hero-decor-circle-2" style={{backgroundColor: '#b3d077', opacity: 0.08}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;