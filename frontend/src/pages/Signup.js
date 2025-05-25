import React, { useState } from 'react';
import '../styles/Signup.css';
import logo from '../logo.png';
import {signup} from'../utils/apiCalls.js';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit =async (e) => {
    e.preventDefault();
    const { name, surname, username, email, password, confirmPassword } = formData;
    const specialCharRegex = /[^A-Za-z0-9]/;

    if (!name || !surname || !username || !email || !password || !confirmPassword) {
      alert('Please fill in all fields.');
      return;
    }

    if (password.length < 8 || !specialCharRegex.test(password)) {
      alert('Password must be at least 8 characters long and contain at least one special character.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      // Use the service instead of direct fetch
      const data = await signup({ name, surname, username, email, password });
      alert(`Signup successful! Welcome ${data.user.username}`);
      // Redirect or clear form
    } catch (error) {
      alert(error.message);
    }
  

    
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="logo-header">
          <img src={logo} alt="Logo" className="logo-image" />
          <h1 className="signup-title">Create Account</h1>
        </div>
        <p className="signup-subtitle">Join the Hands UP community!</p>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">First Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="surname" className="form-label">Surname</label>
              <input
                type="text"
                name="surname"
                id="surname"
                value={formData.surname}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <button type="submit" className="signup-button">Sign Up</button>
        </form>

        <p className="signup-footer">
          Already have an account?
          <a href="/login" className="login-link">Log in</a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
