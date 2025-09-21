// frontend/src/components/Login.js

import { useNavigate, useParams, useLocation } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/authContext.js';
import '../styles/login.css';
import heroImage from "../images/sign33.png";
import logo from "../images/logo2.png";

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    const [attemptsLeft, setAttemptsLeft] = useState(null);
    const [isLockedOut, setIsLockedOut] = useState(false);
    const [lockoutTimer, setLockoutTimer] = useState(0);
    const lockoutTimerRef = useRef(null);

    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetToken, setResetToken] = useState(null);
    const [resettingPassword, setResettingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
    const [confirmResetLoading, setConfirmResetLoading] = useState(false);

    const navigate = useNavigate();
    const { login, resetPassword, confirmPasswordReset } = useAuth();
    const location = useLocation();
    const params = useParams();

    useEffect(() => {
        setMounted(true);
        if (location.pathname.startsWith('/reset-password/')) {
            const tokenFromUrl = params.token;
            const queryParams = new URLSearchParams(location.search);
            const emailFromUrl = queryParams.get('email');
            if (tokenFromUrl) {
                setResetToken(tokenFromUrl);
                setShowForgotPassword(true);
                setResettingPassword(true);
                if (emailFromUrl) setForgotEmail(emailFromUrl);
            } else {
                navigate('/login');
            }
        }
    }, [location.pathname, params.token, navigate, location.search]);

    useEffect(() => {
        if (isLockedOut && lockoutTimer > 0) {
            lockoutTimerRef.current = setInterval(() => {
                setLockoutTimer(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(lockoutTimerRef.current);
                        setIsLockedOut(false);
                        setAttemptsLeft(null);
                        setError(''); // Clear lockout error message
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        } else if (!isLockedOut && lockoutTimer === 0 && lockoutTimerRef.current) {
            clearInterval(lockoutTimerRef.current);
            lockoutTimerRef.current = null;
        }

        return () => {
            if (lockoutTimerRef.current) {
                clearInterval(lockoutTimerRef.current);
                lockoutTimerRef.current = null;
            }
        };
    }, [isLockedOut, lockoutTimer]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        setAttemptsLeft(null);
        setIsLockedOut(false);
        setLockoutTimer(0);

        if (!email || !password) {
            setError('Please enter both email and password.');
            setIsLoading(false);
            return;
        }

        try {
            console.log("denfing login to api");
            await login({ email, password });
            console.log("im here");
            setError('');
            setAttemptsLeft(null);
            setIsLockedOut(false);
            setLockoutTimer(0);
            navigate('/Home');
        } catch (err) {
            console.error('Login error:', err); 
            if (err.locked) {
                setIsLockedOut(true);
                setLockoutTimer(err.timeLeft || 0);
                setError(err.message);
            } else if (err.attemptsLeft !== undefined) {
                setAttemptsLeft(err.attemptsLeft);
                setError(err.message); 
            } else {
                setError(err.message || 'An unexpected error occurred. Please try again.');
            }
        } finally {
            if (!isLockedOut && attemptsLeft === null) {
                 await new Promise(resolve => setTimeout(resolve, 1000));
                 setError(''); 
            }
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setResetLoading(true);

        if (!forgotEmail) {
            setError('Please enter your email address.');
            setResetLoading(false);
            return;
        }

        try {
            await resetPassword(forgotEmail);
            setResetEmailSent(true);
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to send reset email. Please try again.');
            console.error('Password reset error:', err);
        } finally {
            setResetLoading(false);
        }
    };

    const handleConfirmPasswordReset = async (e) => {
        e.preventDefault();
        setError('');
        setConfirmResetLoading(true);

        if (!forgotEmail || !newPassword || !confirmNewPassword || !resetToken) {
            setError('All fields and a valid reset link are required.');
            setConfirmResetLoading(false);
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError('New password and confirm password do not match.');
            setConfirmResetLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            setConfirmResetLoading(false);
            return;
        }

        try {
            await confirmPasswordReset(forgotEmail, resetToken, newPassword, confirmNewPassword);
            setPasswordResetSuccess(true);
            setTimeout(() => {
                resetForgotPasswordForm();
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Failed to reset password. The link may be expired or invalid.');
            console.error('Confirm password reset error:', err);
        } finally {
            setConfirmResetLoading(false);
        }
    };

    const resetForgotPasswordForm = () => {
        setShowForgotPassword(false);
        setForgotEmail('');
        setResetEmailSent(false);
        setResetToken(null);
        setResettingPassword(false);
        setNewPassword('');
        setConfirmNewPassword('');
        setPasswordResetSuccess(false);
        setError('');
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

  return (
    <div className="login-page">
      <div className="bg-animation-container">
        <div className="bg-animation-circle-1" style={{ backgroundColor: '#b3d077', '--initial-opacity': 0.05, '--pulse-opacity': 0.08 }}></div>
        <div className="bg-animation-circle-2" style={{ backgroundColor: '#ffc61a', '--initial-opacity': 0.07, '--pulse-opacity': 0.1 }}></div>
      </div>

      <div className={`login-content-wrapper ${mounted ? 'mounted' : ''}`}>
        <div className="login-grid">
          <div className="form-section">
           <div className="form-content">
            <div className="header-section">
             <div className="logo-group">
              <div className="logo-icon-wrapper" style={{ background: `linear-gradient(135deg, #ffc61a, #b3d077)` }}>
                <img src={logo} alt="Logo" className="logo-image" />
              </div>
             </div>
             <h1 className="welcome-title">
                {resettingPassword ? 'Set New Password' : showForgotPassword ? 'Reset Password' : 'Welcome Back!'}
             </h1>
                <p className="subtitle">
                {resettingPassword ? 'Enter your new password below.' : showForgotPassword ? 'Enter your email to reset your password.' : 'Unlock your signing journey.'}
                </p>
            </div>
          <div className="form-fields-container">
              {error && <div className="error-message">{error}</div>}
          {isLockedOut && lockoutTimer > 0 && (
          <div className="error-message">
            Your account is locked. Please try again in **{formatTime(lockoutTimer)}**.
          </div> )}
           {passwordResetSuccess && (
          <div className="success-message">
           <CheckCircle className="success-icon" />
           <h3>Password Reset Successful!</h3>
           <p>You can now log in with your new password.</p>
          </div>)}

     {!showForgotPassword ? ( <>
                              <div className="input-group">
                              <label htmlFor="email" className="input-label">
                                <Mail className="mail-icon" /> Email Address
                                </label>
                               <div className="input-wrapper">
                                   <input
                                        type="email"
                                          id="email"
                                          value={email}
                                          onChange={(e) => setEmail(e.target.value)}
                                           placeholder="you@example.com"
                                          className="text-input"
                                          disabled={isLockedOut}
                                        />
                                      </div>
                                 </div>

                                <div className="input-group">
                                  <label htmlFor="password" className="input-label">
                                     <Lock className="lock-icon" /> Password
                                    </label>
                                    <div className="input-wrapper">
                                    <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="text-input"
                                    disabled={isLockedOut}
                                    autoComplete="off"
                                     />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="password-toggle-button"
                                    disabled={isLockedOut}
                                      >
                                      {showPassword ? <EyeOff className="password-icon" /> : <Eye className="password-icon" />}
                                    </button>
                                </div>
                                 </div>

                                        <div className="forgot-password-link-container">
                                            <button
                                                type="button"
                                                onClick={() => setShowForgotPassword(true)}
                                                className="forgot-password-link"
                                                disabled={isLockedOut}
                                            >
                                                Forgot your password?
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={isLoading || isLockedOut}
                                            onClick={handleSubmit}
                                            className="submit-button"
                                            data-testid="login-button"
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
                                    </>
                                ) : (
                                    <>
                                        {passwordResetSuccess ? null :
                                            resettingPassword ? (
                                                <>
                                                    <div className="input-group">
                                                        <label htmlFor="reset-email" className="input-label">
                                                            <Mail className="mail-icon" /> Your Email
                                                        </label>
                                                        <div className="input-wrapper">
                                                            <input
                                                                type="email"
                                                                id="reset-email"
                                                                value={forgotEmail}
                                                                onChange={(e) => setForgotEmail(e.target.value)}
                                                                placeholder="you@example.com"
                                                                className="text-input"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="input-group">
                                                        <label htmlFor="new-password" className="input-label">
                                                            <Lock className="lock-icon" /> New Password
                                                        </label>
                                                        <div className="input-wrapper">
                                                            <input
                                                                type={showPassword ? "text" : "password"}
                                                                id="new-password"
                                                                value={newPassword}
                                                                onChange={(e) => setNewPassword(e.target.value)}
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

                                                    <div className="input-group">
                                                        <label htmlFor="confirm-new-password" className="input-label">
                                                            <Lock className="lock-icon" /> Confirm New Password
                                                        </label>
                                                        <div className="input-wrapper">
                                                            <input
                                                                type={showPassword ? "text" : "password"}
                                                                id="confirm-new-password"
                                                                value={confirmNewPassword}
                                                                onChange={(e) => setConfirmNewPassword(e.target.value)}
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
                                                        disabled={confirmResetLoading}
                                                        onClick={handleConfirmPasswordReset}
                                                        className="submit-button"
                                                    >
                                                        <div className="submit-button-overlay-1"></div>
                                                        <div className="submit-button-overlay-2"></div>
                                                        <div className="submit-button-content">
                                                            {confirmResetLoading ? (
                                                                <div className="spinner"></div>
                                                            ) : (
                                                                <>
                                                                    <span className="button-text">Reset Password</span>
                                                                    <ArrowRight className="arrow-right-icon" />
                                                                </>
                                                            )}
                                                        </div>
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    {resetEmailSent ? (
                                                        <div className="reset-email-sent">
                                                            <div className="success-message">
                                                                <Mail className="mail-icon" />
                                                                <h3>Check your email!</h3>
                                                                <p>We&apos;ve sent a password reset link to **{forgotEmail}**</p>
                                                                <p className="reset-instructions">
                                                                    Click the link in the email to reset your password.
                                                                    If you don&apos;t see it, check your spam folder.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="input-group">
                                                            <label htmlFor="forgot-email" className="input-label">
                                                                <Mail className="mail-icon" /> Email Address
                                                            </label>
                                                            <div className="input-wrapper">
                                                                <input
                                                                    type="email"
                                                                    id="forgot-email"
                                                                    value={forgotEmail}
                                                                    onChange={(e) => setForgotEmail(e.target.value)}
                                                                    placeholder="you@example.com"
                                                                    className="text-input"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="forgot-password-buttons">
                                                        {!resetEmailSent && (
                                                            <button
                                                                type="button"
                                                                disabled={resetLoading}
                                                                onClick={handleForgotPassword}
                                                                className="submit-button"
                                                            >
                                                                <div className="submit-button-overlay-1"></div>
                                                                <div className="submit-button-overlay-2"></div>
                                                                <div className="submit-button-content">
                                                                    {resetLoading ? (
                                                                        <div className="spinner"></div>
                                                                    ) : (
                                                                        <>
                                                                            <span className="button-text">Send Reset Email</span>
                                                                            <ArrowRight className="arrow-right-icon" />
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={resetForgotPasswordForm}
                                                            className="back-to-login-button"
                                                        >
                                                            <ArrowLeft className="back-arrow-icon" />
                                                            <span>Back to Login</span>
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                    </>
                                )}
                            </div>
                        </div>

                        {!showForgotPassword && (
                            <div className="signup-section">
                                <div className="signup-card">
                                    <p className="signup-text">Don&apos;t have an account?</p>
                                    <button
                                        onClick={() => navigate('/signup')}
                                        className="signup-button"
                                    >
                                        Sign up
                                        <ArrowRight className="signup-arrow-icon" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="hero-section">
                        <div className="hero-background-image" style={{ backgroundImage: `url(${heroImage})` }}></div>
                        <div className="hero-overlay" style={{ background: `linear-gradient(135deg, rgba(78, 122, 81, 0.6), rgba(179, 208, 119, 0.55), rgba(255, 198, 26, 0.5))` }}></div>
                        <div className="hero-content">
                            <div className="hand-signs-wrapper"></div>
                            <div className="hero-text-content">
                                <h2 className="hero-title">Hands UP</h2>
                            </div>
                            <div className="hero-decor-circle-1" style={{ backgroundColor: '#ffc61a', opacity: 0.1 }}></div>
                            <div className="hero-decor-circle-2" style={{ backgroundColor: '#b3d077', opacity: 0.08 }}></div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
