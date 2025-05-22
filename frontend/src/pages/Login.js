
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import logo from '../logo.png'; 

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email || !password) 
    {
      setError('Please enter both email and password.');
    } 
    else 
    {
      setError('');
      console.log('Login successful for:', email);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      navigate('/userProfile');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="logo-header">
          <img src={logo} alt="Logo" className="logo-image" />
          <h1 className="logo-text">Hands UP</h1>
        </div>
        <p className="welcome-text">Welcome back! Please log in.</p>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="form-input"
            />
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
          Don't have an account?
          <Link to="/Signup" className="signup-link">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;