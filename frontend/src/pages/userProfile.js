import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LearningStats } from "../components/learningStats.js";
import { useAuth } from '../context/authContext.js'; 
import "../styles/userProfile.css";
import {
  uniqueUsername,
  uniqueEmail,
  updateUserDetails,
  updateUserPassword,
  deleteUserAccount, 
} from '../utils/apiCalls.js';

export default function UserProfile() {
  const { currentUser, isLoggedIn, loading: authLoading, logout, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    username: '',
    email: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [formSuccess, setFormSuccess] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

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
  ]}

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        surname: currentUser.surname || '',
        username: currentUser.username || '',
        email: currentUser.email || '',
        newPassword: '', 
        confirmPassword: ''
      });
      setLoading(false); 
    } else {
      setError("User data not available after authentication.");
      setLoading(false);
    }
  }, [authLoading, isLoggedIn, currentUser, navigate]); 

  useEffect(() => {
    if (formSuccess) {
      const timer = setTimeout(() => {
        setFormSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formSuccess]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
    if (formErrors[id]) {
      setFormErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
    setDeleteStep(1);
  };

  const proceedWithDelete = async () => {
    if (deleteStep === 1) {
      setDeleteStep(2);
    } else if (deleteStep === 2) {
      if (deleteConfirmText === "DELETE") {
        setIsDeleting(true);
        try {
          await deleteUserAccount(currentUser.id);
          
          setFormSuccess("Account deletion request submitted. Your account will be deleted shortly.");
          setShowDeleteConfirm(false);
          setDeleteStep(0);
          setDeleteConfirmText("");
          
          setTimeout(() => {
            logout();
          }, 2000);
        } catch (err) {
          console.error('Error deleting account:', err);
          setFormErrors({ general: "Failed to delete account. Please try again." });
        } finally {
          setIsDeleting(false);
        }
      } else {
        setFormErrors({ general: "Please type exactly 'DELETE' to confirm." });
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteStep(0);
    setDeleteConfirmText("");
    setFormErrors({});
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setFormSuccess("");
    setError(""); 

    if (!currentUser || !currentUser.id) {
      setFormErrors({ general: "User data not available for saving. Please refresh and try again." });
      return;
    }

    const { name, surname, username, email, newPassword, confirmPassword } = formData;

    let errors = {};

    if (!name) errors.name = "Name is required.";
    if (!surname) errors.surname = "Surname is required.";
    if (!username) errors.username = "Username is required.";
    if (!email) errors.email = "Email is required.";

    const nameRegex = /^[A-Za-z\s]+$/;
    if (name && !nameRegex.test(name)) {
      errors.name = "Name must contain only letters and spaces.";
    }
    if (surname && !nameRegex.test(surname)) {
      errors.surname = "Surname must contain only letters and spaces.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      errors.email = "Invalid email format.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const hasDetailsChanged = (
      name !== currentUser.name ||
      surname !== currentUser.surname ||
      username !== currentUser.username ||
      email !== currentUser.email
    );
    const hasPasswordChanged = newPassword && confirmPassword;

    if (!hasDetailsChanged && !hasPasswordChanged) {
        errors.general = "No changes detected to save.";
        setFormErrors(errors);
        return;
    }

    if (username !== currentUser.username) {
      try {
        const usernameExists = await uniqueUsername(username);
        if (usernameExists) {
          errors.username = "Username already taken.";
          setFormErrors(errors);
          return;
        }
      } catch (err) {
        console.error('Error checking username:', err);
        errors.general = "An error occurred checking username availability.";
        setFormErrors(errors);
        return;
      }
    }

    if (email !== currentUser.email) {
      try {
        const emailExists = await uniqueEmail(email);
        if (emailExists) {
          errors.email = "Email already in use.";
          setFormErrors(errors);
          return;
        }
      } catch (err) {
        console.error('Error checking email:', err);
        errors.general = "An error occurred checking email availability.";
        setFormErrors(errors);
        return;
      }
    }

    if (hasPasswordChanged) {
      if (newPassword !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match.";
        setFormErrors(errors);
        return;
      }
      if (newPassword.length < 8) { 
          errors.newPassword = "Password must be at least 8 characters long.";
          setFormErrors(errors);
          return;
      }

      try {
        const result = await updateUserPassword(currentUser.id, name, surname, username, email, newPassword);
        setFormSuccess("Password updated successfully!");
        if (result && result.user) {
            updateUser(result.user); 
        }
        setFormData(prevData => ({ ...prevData, newPassword: '', confirmPassword: '' }));
      } catch (err) {
        console.error("Error updating password:", err);
        errors.general = "An error occurred while updating password: " + (err.message || "Please try again.");
        setFormErrors(errors);
      }
    }

    if (hasDetailsChanged) { 
        try {
            const result = await updateUserDetails(currentUser.id, name, surname, username, email);
            setFormSuccess("User details updated successfully!");
            if (result && result.user) {
                updateUser(result.user);
            }
        } catch (err) {
            console.error("Error updating details:", err);
            errors.general = "An error occurred while updating details: " + (err.message || "Please try again.");
            setFormErrors(errors);
        }
    }

    if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
    }
  };

  const handleResetProgress = () => {
    if (window.confirm("Are you sure you want to reset all your learning progress? This action cannot be undone.")) {

      setFormSuccess("Learning progress reset successfully!");
    }
  };

  if (authLoading) return <div className="containerP loading-state">Loading authentication...</div>;
  if (!isLoggedIn) return null;
  if (loading) return <div className="containerP loading-state">Loading user profile...</div>;
  if (error) return <div className="containerP error-state">Error: {error}</div>;
  if (!currentUser) return <div className="containerP error-state">No user data available. Please log in.</div>;

  return (
    <div className="containerP">
      {showTermsModal && (
        <div className="modal-overlay">
          <div className="modal-content terms-modal">
            <div className="modal-header">
              <h2>{termsContent.title}</h2>
              <button 
                className="close-btn"
                onClick={() => setShowTermsModal(false)}
                aria-label="Close"
              >
                
              </button>
            </div>
            <div className="modal-body">
              <p className="last-updated">{termsContent.lastUpdated}</p>
              {termsContent.sections.map((section, index) => (
                <div key={index} className="terms-section">
                  <h3>{section.title}</h3>
                  <p>{section.content}</p>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button 
                className="btn-primary"
                onClick={() => setShowTermsModal(false)}
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            {deleteStep === 1 && (
              <>
                <div className="modal-header">
                  <h3 className="danger-title">⚠️ Delete Account</h3>
                </div>
                <div className="modal-body">
                  <div className="warning-message">
                    <strong>This action cannot be undone!</strong>
                  </div>
                  <p>Deleting your account will permanently remove:</p>
                  <ul className="deletion-list">
                    <li>Your profile information</li>
                    <li>All your learning progress</li>
                    <li>Your account history</li>
                    <li>Any associated data</li>
                  </ul>
                  <p className="final-warning">
                    Are you sure you want to delete your account?
                  </p>
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn-primary"
                    onClick={cancelDelete}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-danger"
                    onClick={proceedWithDelete}
                  >
                    Yes, Continue
                  </button>
                </div>
              </>
            )}

            {deleteStep === 2 && (
              <>
                <div className="modal-header">
                  <h3 className="danger-title">🔒 Final Confirmation</h3>
                </div>
                <div className="modal-body">
                  <p>To confirm account deletion, please type <strong>"DELETE"</strong> exactly as shown:</p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type: DELETE"
                    className="confirmation-input"
                  />
                  {formErrors.general && (
                    <div className="error-message">{formErrors.general}</div>
                  )}
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn-primary"
                    onClick={cancelDelete}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-danger"
                    onClick={proceedWithDelete}
                    disabled={deleteConfirmText !== "DELETE" || isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete Account"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <main className="content">
        <section className="profile-header">
          <div className="avatar" aria-label="User initials">
            {currentUser?.name?.charAt(0)?.toUpperCase()}{currentUser?.surname?.charAt(0)?.toUpperCase()}
          </div>
          <div className="profile-info">
            <h2 className="name">{currentUser?.name} {currentUser?.surname}</h2>
            <p className="username">@{currentUser?.username}</p>
            <p className="email">{currentUser?.email}</p>
            <p className="member-since">
              Member since: {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
            </p>
          </div>
        </section>


        <section className="profile-settings">

          <h3>Profile Settings</h3>
          <form onSubmit={handleSaveChanges}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={formErrors.name ? 'error' : ''}
                />
                {formErrors.name && <div className="error-text">{formErrors.name}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="surname">Surname</label>
                <input
                  id="surname"
                  type="text"
                  value={formData.surname} 
                  onChange={handleChange}
                  className={formErrors.surname ? 'error' : ''}
                />
                {formErrors.surname && <div className="error-text">{formErrors.surname}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={formData.username} 
                  onChange={handleChange}
                  className={formErrors.username ? 'error' : ''}
                />
                {formErrors.username && <div className="error-text">{formErrors.username}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={formErrors.email ? 'error' : ''}
                />
                {formErrors.email && <div className="error-text">{formErrors.email}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.newPassword} 
                  onChange={handleChange}
                  className={formErrors.newPassword ? 'error' : ''}
                />
                {formErrors.newPassword && <div className="error-text">{formErrors.newPassword}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword} 
                  onChange={handleChange}
                  className={formErrors.confirmPassword ? 'error' : ''}
                />
                {formErrors.confirmPassword && <div className="error-text">{formErrors.confirmPassword}</div>}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">Save Changes</button>
              
              {formErrors.general && <div className="error-message">{formErrors.general}</div>}
              {formSuccess && <div className="success-message">{formSuccess}</div>}
              
              <div className="btn-group">
                
                <button 
                  type="button" 
                  className="btn-danger" 
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </button>
                <button 
                  type="button" 
                  className="btn-danger" 
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </form>
        </section>

        <section className="privacy-section">
          <div className="privacy-card">
            <h4>🔒 Privacy & Data Rights</h4>
            <p>We respect your privacy and comply with POPIA. 
                Your data is secure and you have full control over your information.</p>
            <div className="privacy-actions">
              <button 
                className="btn-primary"
                onClick={() => setShowTermsModal(true)}
              >
                📋 View Terms & Conditions
              </button>
      
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}