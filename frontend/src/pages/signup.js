import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, User } from 'lucide-react';
import {useSignup} from '../hooks/signup.js';
import { useNavigate } from 'react-router-dom';
import { signup } from '../utils/apiCalls.js';
import { useAuth } from '../context/authContext.js';
import '../styles/Signup.css';
import heroImage from "../sign33.png";
import logo from "../logo2.png";
import PropTypes from 'prop-types';

function TermsModal({ isOpen, onClose, termsContent }) {
    if (!isOpen) return null;

 return (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
                <h2>{termsContent.title}</h2>
                <button className="close-button" onClick={onClose}>&times;</button>
            </div>
            <div className="modal-body">
                <p className="last-updated">{termsContent.lastUpdated}</p>
                {termsContent.sections.map((section, index) => (
                <div key={index} className="modal-section">
                    <h3>{section.title}</h3>
                    <p>{section.content}</p>
                </div>
                ))}
                </div>
                <div className="modal-footer">
                    <button className="close-button-bottom" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}


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
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

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
            console.log('Signup successful, backend response:', data);
            await login({ email, password });

            setSuccessMessage(`Signup successful! Welcome ${data.user.username}`);

            setFormData({
                name: '',
                surname: '',
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
            });


        } catch (error) {
            console.error('Signup error:', error);
            setError(error.message || 'An unexpected error occurred during signup.');
        } finally {
            setIsLoading(false);
        }
    };

    const termsContent = {
        title: "Terms and Conditions",
        lastUpdated: "Last updated: June 2025",
        sections: [
            {
                title: "1. Acceptance of Terms",
                content: "By accessing and using this sign language learning and translation platform, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by the above, please do not use this service."
            },

            {
                title: "2. Description of Service",
                content: "Our website is a sign language application designed to facilitate learning and translation. Users can learn sign language through various modules and translate signs via visual input. The platform also includes interactive quizzes to assess learning progress."
            },
            {
                title: "3. Data Collection and Use (POPIA Compliance)",
                content: "We collect and process your personal information in accordance with the Protection of Personal Information Act (POPIA). This includes your name, email, learning progress (e.g., quiz scores, lesson completion), visual input for translation purposes (which is processed for service delivery and not stored permanently for identification), and general usage statistics. Your data is used solely to provide, maintain, and improve our educational and translation services."
            },
            {
                title: "4. Your Rights",
                content: "Under POPIA, you have the right to access, correct, or delete your personal information."
            },
            {
                title: "5. Data Security",
                content: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction."
            },
            {
                title: "6. Account Deletion",
                content: "You may delete your account at any time. Upon deletion, all your personal data and learning progress will be permanently removed from our systems within 30 days."
            },
            {
                title: "7. Contact Information",
                content: "For any questions about these terms or your data rights, please contact us at tmkdt.cos301@gmail.com"
            }
        ]
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
    I agree to the <button 
        type="button"
        onClick={() => setShowTermsModal(true)} 
        className="terms-link"
    >
        Terms and Conditions
    </button>
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

            <TermsModal
                isOpen={showTermsModal}
                onClose={() => setShowTermsModal(false)}
                termsContent={termsContent}
            />

        </div>
    );
}
TermsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    termsContent: PropTypes.shape({
        title: PropTypes.string.isRequired,
        lastUpdated: PropTypes.string.isRequired,
        sections: PropTypes.arrayOf(
            PropTypes.shape({
                title: PropTypes.string.isRequired,
                content: PropTypes.string.isRequired,
            })
        ).isRequired,
    }).isRequired,
};
export default SignupPage;