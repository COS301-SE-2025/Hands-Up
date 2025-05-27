import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {signup} from'../utils/apiCalls.js';
import '../styles/Signup.css';
import heroImage from "../sign33.png";
import logo from "../logo2.png";

function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // New state for success messages
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    setError('');
    setSuccessMessage('');
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setSuccessMessage(''); 
    setIsLoading(true);

    const { name, surname, username, email, password, confirmPassword } = formData;
    const specialCharRegex = /[^A-Za-z0-9]/;

    if (!name || !surname || !username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    if (password.length < 8 || !specialCharRegex.test(password)) {
      setError('Password must be at least 8 characters long and contain at least one special character.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (!termsAccepted) {
      setError('You must accept the terms and conditions to sign up.');
      setIsLoading(false);
      return;
    }

    try {
      const data = await signup({ name, surname, username, email, password });
      console.log(data);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userData', JSON.stringify(data.user));
      setSuccessMessage(`Signup successful! Welcome ${data.user.username}. Redirecting to Home...`);
     
      setFormData({
        name: '',
        surname: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      
      setTimeout(() => {
        navigate('/Home');
      }, 2000);
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }

  };

   

  return (
    <div className="signup-page">
      <div className="bg-animation-container">
        <div className="bg-animation-circle-1" style={{ backgroundColor: '#b3d077', '--initial-opacity': 0.05, '--pulse-opacity': 0.08 }}></div>
        <div className="bg-animation-circle-2" style={{ backgroundColor: '#ffc61a', '--initial-opacity': 0.07, '--pulse-opacity': 0.1 }}></div>
      </div>

      <div className={`signup-content-wrapper ${mounted ? 'mounted' : ''}`}>
        <div className="signup-grid">
          <div className="hero-section">
            <div className="hero-background-image" style={{ backgroundImage: `url(${heroImage})` }}></div>
            <div className="hero-overlay" style={{ background: `linear-gradient(135deg, rgba(78, 122, 81, 0.6), rgba(179, 208, 119, 0.55), rgba(255, 198, 26, 0.5))` }}></div>
            <div className="hero-content">
              <div className="hero-text-content">
                <h2 className="hero-title">Join Us!</h2>
                <p className="hero-description">Create your account to start your journey with Hands UP.</p>
              </div>
              <div className="hero-decor-circle-1" style={{ backgroundColor: '#ffc61a', opacity: 0.1 }}></div>
              <div className="hero-decor-circle-2" style={{ backgroundColor: '#b3d077', opacity: 0.08 }}></div>
            </div>
          </div>

          <div className="form-section">
            <form className="form-content" onSubmit={handleSubmit}>
              <div className="header-section">
                <div className="logo-group">
                  <div className="logo-icon-wrapper" style={{ background: `linear-gradient(135deg, #ffc61a, #b3d077)` }}>
                    <img src={logo} alt="Logo" className="logo-image" />
                  </div>
                  <h1 className="welcome-title">Create Account</h1>
                </div>
                <p className="subtitle">Join the Hands UP community!</p>
              </div>

              <div className="form-fields-container">
                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}


                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="name" className="input-label"><User className="mail-icon" /> First Name</label>
                    <div className="input-wrapper">
                      <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} placeholder="Your First Name" className="text-input" />
                    </div>
                  </div>
                  <div className="input-group">
                    <label htmlFor="surname" className="input-label"><User className="mail-icon" /> Surname</label>
                    <div className="input-wrapper">
                      <input type="text" name="surname" id="surname" value={formData.surname} onChange={handleChange} placeholder="Your Surname" className="text-input" />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="username" className="input-label"><User className="mail-icon" /> Username</label>
                    <div className="input-wrapper">
                      <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} placeholder="Choose a Username" className="text-input" />
                    </div>
                  </div>
                  <div className="input-group">
                    <label htmlFor="email" className="input-label"><Mail className="mail-icon" /> Email Address</label>
                    <div className="input-wrapper">
                      <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="text-input" />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="password" className="input-label"><Lock className="lock-icon" /> Password</label>
                    <div className="input-wrapper">
                      <input type={showPassword ? "text" : "password"} name="password" id="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="text-input" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle-button">
                        {showPassword ? <EyeOff className="password-icon" /> : <Eye className="password-icon" />}
                      </button>
                    </div>
                  </div>
                  <div className="input-group">
                    <label htmlFor="confirmPassword" className="input-label"><Lock className="lock-icon" /> Confirm Password</label>
                    <div className="input-wrapper">
                      <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className="text-input" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="password-toggle-button">
                        {showConfirmPassword ? <EyeOff className="password-icon" /> : <Eye className="password-icon" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="terms-checkbox-group">
                  <input type="checkbox" id="termsAccepted" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="checkbox-input" />
                  <label htmlFor="termsAccepted" className="checkbox-label">
                    I agree to the <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="terms-link">Terms and Conditions</a>
                  </label>
                </div>

                <button type="submit" disabled={isLoading} className="submit-button">
                  <div className="submit-button-overlay-1"></div>
                  <div className="submit-button-overlay-2"></div>
                  <div className="submit-button-content">
                    {isLoading ? <div className="spinner"></div> : <>
                      <span className="button-text">Sign Up</span>
                      <ArrowRight className="arrow-right-icon" />
                    </>}
                  </div>
                </button>
              </div>

              <div className="login-section">
                <div className="login-card">
                  <p className="signup-text">Already have an account?</p>
                  <button className="login-button" onClick={() => navigate('/login')}>
                    Log In
                  </button>
                </div>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default SignupPage;
