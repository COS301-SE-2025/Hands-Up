import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/authContext.js';
import "../styles/userProfile.css"; 
import {
    uniqueUsername,
    uniqueEmail,
    updateUserDetails,
    updateUserPassword,
    deleteUserAccount,
    uploadUserAvatar
} from '../utils/apiCalls.js';

const BACKEND_BASE_URL = "https://localhost:2000"; 

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

    const [avatarurl, setAvatarUrl] = useState(
        currentUser?.avatarurl
            ? `${BACKEND_BASE_URL}/${currentUser.avatarurl}`
            : ''
    );
    const [avatarFile, setAvatarFile] = useState(null);
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [formErrors, setFormErrors] = useState({});
    const [formSuccess, setFormSuccess] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteStep, setDeleteStep] = useState(0);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [showEditForm, setShowEditForm] = useState(false);

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
        ]
    }

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
            setAvatarUrl(currentUser.avatarurl
                ? `${BACKEND_BASE_URL}/${currentUser.avatarurl}`
                : '');
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

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarUrl(URL.createObjectURL(file));
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
        const hasAvatarChanged = avatarFile !== null;

        if (!hasDetailsChanged && !hasPasswordChanged && !hasAvatarChanged) {
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
                const result = await updateUserPassword(currentUser.id, newPassword);
                setFormSuccess("Password updated successfully!");
                setFormData(prevData => ({ ...prevData, newPassword: '', confirmPassword: '' }));
            } catch (err) {
                console.error("Error updating password:", err);
                errors.general = (errors.general ? errors.general + " " : "") + "An error occurred while updating password: " + (err.message || "Please try again.");
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
                errors.general = (errors.general ? errors.general + " " : "") + "An error occurred while updating details: " + (err.message || "Please try again.");
                setFormErrors(errors);
            }
        }

        // --- Avatar Update ---
        if (hasAvatarChanged && avatarFile) {
            try {
                const dataToUpload = new FormData();
                dataToUpload.append('avatar', avatarFile);

                const newAvatarResult = await uploadUserAvatar(currentUser.id, dataToUpload);

                setFormSuccess("Avatar uploaded successfully!");
                if (newAvatarResult && newAvatarResult.data && newAvatarResult.data.avatarurl) {
                    updateUser({ ...currentUser, avatarurl: newAvatarResult.data.avatarurl });
                    setAvatarUrl(`${BACKEND_BASE_URL}/${newAvatarResult.data.avatarurl}`);
                    setAvatarFile(null);
                }
            } catch (err) {
                console.error("Error uploading avatar:", err);
                errors.general = (errors.general ? errors.general + " " : "") + "An error occurred while uploading avatar: " + (err.message || "Please try again.");
                setFormErrors(errors);
            }
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
        } else if (!formSuccess) {
            setFormSuccess("Profile updated successfully!");
        }
        if (Object.keys(errors).length === 0 && (hasDetailsChanged || hasPasswordChanged || hasAvatarChanged)) {
            setShowEditForm(false);
        }
    };

    const handleResetProgress = () => {
        if (window.confirm("Are you sure you want to reset all your learning progress? This action cannot be undone.")) {
            setFormSuccess("Learning progress reset successfully!");
            console.log("Resetting learning progress...");
        }
    };

    if (authLoading) return <div className="containerP loading-state">Loading authentication...</div>;
    if (!isLoggedIn) return null;
    if (loading) return <div className="containerP loading-state">Loading user profile...</div>;
    if (error) return <div className="containerP error-state">Error: {error}</div>;
    if (!currentUser) return <div className="containerP error-state">No user data available. Please log in.</div>;

    return (
        <>
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
                                &times;
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
                            <button onClick={() => setShowTermsModal(false)} className="btn-sec">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {showEditForm && (
                <div className="edit-form-overlay">
                    <div className="edit-form-container">
                        <div className="edit-form-header">
                            <h3>Edit Profile</h3>
                            <button className="close-edit-form" onClick={() => setShowEditForm(false)} aria-label="Close edit form">
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSaveChanges}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="name">First Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={formErrors.name ? 'error' : ''}
                                    />
                                    {formErrors.name && <p className="error-text">{formErrors.name}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="surname">Last Name</label>
                                    <input
                                        type="text"
                                        id="surname"
                                        value={formData.surname}
                                        onChange={handleChange}
                                        className={formErrors.surname ? 'error' : ''}
                                    />
                                    {formErrors.surname && <p className="error-text">{formErrors.surname}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="username">Username</label>
                                    <input
                                        type="text"
                                        id="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className={formErrors.username ? 'error' : ''}
                                    />
                                    {formErrors.username && <p className="error-text">{formErrors.username}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={formErrors.email ? 'error' : ''}
                                    />
                                    {formErrors.email && <p className="error-text">{formErrors.email}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="newPassword">New Password</label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        className={formErrors.newPassword ? 'error' : ''}
                                        placeholder="Leave blank to keep current"
                                    />
                                    {formErrors.newPassword && <p className="error-text">{formErrors.newPassword}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirm New Password</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={formErrors.confirmPassword ? 'error' : ''}
                                        placeholder="Confirm new password"
                                    />
                                    {formErrors.confirmPassword && <p className="error-text">{formErrors.confirmPassword}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="avatar-upload">Profile Picture</label>
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        ref={fileInputRef}
                                        onChange={handleAvatarChange}
                                        accept="image/*"
                                        style={{ display: 'block', marginTop: '0.5rem' }}
                                    />
                                </div>
                            </div>
                            {formErrors.general && <p className="error-message general-error">{formErrors.general}</p>}
                            {formSuccess && <p className="success-message general-success">{formSuccess}</p>}
                            <div className="form-actions">
                                <button type="button" onClick={() => setShowEditForm(false)} className="btn-sec">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-pri">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="danger-title">
                                {deleteStep === 1 ? "Confirm Account Deletion" : "Final Confirmation"}
                            </h2>
                            <button className="close-btn" onClick={cancelDelete} aria-label="Close confirmation">
                                &times;
                            </button>
                        </div>
                        <div className="modal-body">
                            {deleteStep === 1 && (
                                <>
                                    <p className="warning-message">
                                        <span className="material-icons">warning</span> Deleting your account is a permanent action. All your data will be irreversibly removed.
                                    </p>
                                    <p>Are you absolutely sure you want to delete your account? This will:</p>
                                    <ul className="deletion-list">
                                        <li>Permanently delete your profile and personal information.</li>
                                        <li>Erase all your learning progress and quiz scores.</li>
                                        <li>Remove any custom settings or preferences.</li>
                                    </ul>
                                    <p className="final-warning">This action cannot be undone.</p>
                                    <p>Click &quot;Proceed&quot; to continue to the final confirmation step, or &quot;Cancel&quot; to keep your account.</p>
                                </>
                            )}
                            {deleteStep === 2 && (
                                <>
                                    <p className="warning-message">
                                        To confirm deletion, please type &quot;DELETE&quot; into the box below. This is irreversible.
                                    </p>
                                    <input
                                        type="text"
                                        className="confirmation-input"
                                        value={deleteConfirmText}
                                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                                        placeholder="Type DELETE to confirm"
                                    />
                                    {formErrors.general && <p className="error-message">{formErrors.general}</p>}
                                </>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button onClick={cancelDelete} className="btn-sec" disabled={isDeleting}>
                                Cancel
                            </button>
                            <button
                                onClick={proceedWithDelete}
                                className="btn-danger"
                                disabled={isDeleting || (deleteStep === 2 && deleteConfirmText !== "DELETE")}
                            >
                                {deleteStep === 1 ? "Proceed" : isDeleting ? "Deleting..." : "Delete Account"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="containerP">
                <div className="profile-header">
                    <div className="avatar-wrapper" onClick={() => fileInputRef.current.click()}>
                        {avatarurl ? (
                            <img src={avatarurl} alt="User Avatar" className="avatar-img" />
                        ) : (
                            <div className="avatar">
                                {currentUser.name ? currentUser.name[0].toUpperCase() : ''}
                                {currentUser.surname ? currentUser.surname[0].toUpperCase() : ''}
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleAvatarChange}
                            accept="image/*"
                        />
                        <div className="upload-overlay">
                            <span className="upload-icon"></span>
                            Upload <br /> Image
                        </div>
                    </div>
                    <div className="profile">
                        <h1 className="name">{currentUser.name} {currentUser.surname}</h1>
                        <p className="username">@{currentUser.username}</p>
                        <p className="email">{currentUser.email}</p>
                        <p className="member-since">Member since: {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}.</p>
                    </div>
                </div>

                <div className="profile-options">
                    <button className="option-button primary-option" onClick={() => setShowEditForm(true)}>
                        Edit Profile
                        <span className="arrow-icon">&gt;</span>
                    </button>
                    {/* <button className="option-button" onClick={handleResetProgress}>
                        Reset Learning Progress
                        <span className="arrow-icon">&gt;</span>
                    </button> */}
                    <button className="option-button" onClick={() => setShowTermsModal(true)}>
                        View Terms and Conditions
                        <span className="arrow-icon">&gt;</span>
                    </button>
                    <button className="option-button" onClick={handleLogout}>
                        Log Out
                        <span className="arrow-icon">&gt;</span>
                    </button>
                    <button className="option-button danger-option" onClick={handleDeleteAccount}>
                        Delete Account
                        <span className="arrow-icon">&gt;</span>
                    </button>
                </div>
            </div>
        </>
    );
}