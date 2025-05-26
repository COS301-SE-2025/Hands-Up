import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStatUpdater } from "../hooks/learningStatsUpdater";
import '../styles/Login.css';
import logo from '../logo.png';
import heroImage from '../sign2.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;

    } 
    
    try {
      const response = await fetch('http://localhost:2000/handsUPApi/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store user data and redirect
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userData', JSON.stringify(data.user));
      navigate('/userProfile');
      handleUpdate("streak");

    } catch (error) {
      console.log(email);
      setError(error.message);
      console.error('Login error:', error);

    }

    setError('');
    console.log('Login attempt for:', email);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    navigate('/userProfile');
  };

  const handleUpdate = useStatUpdater();

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form-section">
          <div className="form-header">
            <h1 className="form-title">Welcome Back!</h1>
            <p className="form-welcome-text">Unlock your learning journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="form-input"
                aria-label="Email Address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                aria-label="Password"
              />
            </div>

            <button type="submit" className="login-button">
              Log In
            </button>
          </form>

          <p className="signup-prompt">
            Don't have an account?{' '}
            <Link to="/Signup" className="signup-link">Sign up</Link>
          </p>
        </div>

        <div
          className="login-hero-section"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="login-hero-overlay"></div>
          <div className="login-hero-content">
            <img src={logo} alt="Hands UP Logo" className="hero-logo" />
            <h2 className="hero-title">Hands UP</h2>
            <p className="hero-tagline">Connecting hearts and minds through effortless communication.</p>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
            />
          </div>
          <button type="submit" className="login-button">
            Log In
          </button>
        </form>

        <p className="signup-prompt">
          Don&apos;t have an account?
          <Link to="/Signup" className="signup-link">Sign up</Link>
        </p>

        </div>
      </div>
    </div>
  );
}

export default Login;
