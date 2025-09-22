import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/authContext.js';
import { DexterityToggle } from '../components/dexterityToggle.js';
import "../styles/userProfile.css"; 
import {
    updateUserDetails,
    updateUserPassword,
    deleteUserAccount,
    uploadUserAvatar,
    deleteUserAvatar
} from '../utils/apiCalls.js';
import LoadingSpinner from '../components/loadingSpinner';

const BACKEND_BASE_URL = "http://localhost:2000"; 

export function UserProfile() {
    const { currentUser, isLoggedIn, loading: authLoading, logout, updateUser } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        username: '',
        email: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [avatarurl, setAvatarUrl] = useState(null);
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
    const [showFullAvatar, setShowFullAvatar] = useState(false);
    const [showAvatarOptions, setShowAvatarOptions] = useState(false); 
    const [selectedFile] = useState(null);

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

            if (currentUser.avatarurl && currentUser.avatarurl.trim()) {
            setAvatarUrl(`${BACKEND_BASE_URL}/${currentUser.avatarurl?.replace(/^\/+/, '') ?? ''}`);
            } else {
                setAvatarUrl(null);
            }
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

    // const handleAvatarChange = (e) => {
    //     const file = e.target.files[0];
    //     if (file) {
    //         setAvatarFile(file);
    //         setAvatarUrl(URL.createObjectURL(file));
    //     }
    // };
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        
        if (file) {
            // Use the new function to handle the upload
            const result = await handleProfileChange({ avatarFile: file });
           
            if (result.status) {
                setAvatarUrl(`${BACKEND_BASE_URL}/${currentUser.avatarurl?.replace(/^\/+/, '') ?? ''}`);
                console.log("success");// You can add additional success handling here if needed
            } else {
                console.log("failed");// Handle upload failure
            }
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

                if (process.env.NODE_ENV === 'test') {
                    logout();
                } else {
                    setTimeout(() => {
                        logout();
                    }, 2000);
                }
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
        let updatedUserData = { ...currentUser }; // Start with a copy of the current user

        // --- 1. Validate all form fields ---
        // ... (Your existing validation logic for name, surname, username, email, password) ...
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        // --- 2. Check for changes and perform API calls ---
        const hasDetailsChanged = (name !== currentUser.name || surname !== currentUser.surname || username !== currentUser.username || email !== currentUser.email);
        const hasPasswordChanged = newPassword && confirmPassword;
        const hasAvatarChanged = avatarFile !== null;

        if (!hasDetailsChanged && !hasPasswordChanged && !hasAvatarChanged) {
            setFormErrors({ general: "No changes detected to save." });
            return;
        }

        // --- Step 2a: Update user details if they've changed ---
        if (hasDetailsChanged) {
            try {
                const result = await updateUserDetails(currentUser.id, name, surname, username, email);
                if (result && result.user) {
                    updatedUserData = { ...updatedUserData, ...result.user };
                } else {
                    setFormErrors({ general: result.message || "Failed to update user details." });
                    return;
                }
            } catch (err) {
                console.log(err);
                setFormErrors({ general: "An error occurred while updating details." });
                return;
            }
        }

        // --- Step 2b: Update password if it has changed ---
        if (hasPasswordChanged) {
            if (newPassword !== confirmPassword) {
                setFormErrors({ confirmPassword: "Passwords do not match." });
                return;
            }
            try {
                await updateUserPassword(currentUser.id, newPassword);
                updatedUserData = { ...updatedUserData, passwordChanged: true }; // Custom flag
            } catch (err) {
                console.log(err);
                setFormErrors({ general: "An error occurred while updating password." });
                return;
            }
        }

        // --- Step 2c: Upload new avatar if it has changed ---
        if (hasAvatarChanged && avatarFile) {
            try {
                const dataToUpload = new FormData();
                dataToUpload.append('avatar', avatarFile);
                const newAvatarResult = await uploadUserAvatar(currentUser.id, dataToUpload);
                if (newAvatarResult && newAvatarResult.data && newAvatarResult.data.avatarurl) {
                    updatedUserData = { ...updatedUserData, avatarurl: newAvatarResult.data.avatarurl };
                    setAvatarFile(null); // Clear the local state
                } else {
                    setFormErrors({ general: "An error occurred while uploading avatar." });
                    return;
                }
            } catch (err) {
                console.log(err);
                setFormErrors({ general: "An error occurred while uploading avatar." });
                return;
            }
        }
        
        // --- 3. Final single state update after all changes have been processed ---
        try {
            if (Object.keys(updatedUserData).length > 0) {
                updateUser(updatedUserData);
                setFormSuccess("Profile updated successfully!");
            } else {
                setFormErrors({ general: "No changes to save." });
            }
        } catch(err) {
            console.log(err);
            setFormErrors({ general: "An error occurred during final state update." });
        }
        setShowEditForm(false);
    };

    const handleDeleteAvatar = async () => {
        setError("");
        setFormErrors({});
        setFormSuccess("");

        if (!currentUser || !currentUser.id) {
            setFormErrors({ general: "User data not available. Cannot delete avatar." });
            return;
        }

        try {
            // Use the new, dedicated API function for deleting the avatar
            const result = await deleteUserAvatar(currentUser.id);

            if (result && result.status === "success") {
                updateUser({ ...currentUser, avatarurl: null }); // Update context
                setAvatarUrl(null); // Update local state for UI
                setAvatarFile(null); // Clear the file reference
                setFormSuccess("Profile picture deleted successfully!");
            } else {
                setFormErrors({ general: result.message || "Failed to delete profile picture." });
            }
        } catch (err) {
            console.error("Error deleting avatar:", err);
            setFormErrors({ general: "An error occurred while deleting the profile picture." });
        }
    };

    const handleProfileChange = async (detailsToUpdate) => {
        setError("");
        setFormErrors({});
        setFormSuccess("");

        if (!currentUser || !currentUser.id) {
            setFormErrors({ general: "User data not available. Cannot update profile." });
            return { success: false, message: "User data not available." };
        }

        try {
            // Check if the change involves a new avatar file
            if (detailsToUpdate.avatarFile) {
                const formData = new FormData();
                formData.append('avatar', detailsToUpdate.avatarFile);
                
                const result = await uploadUserAvatar(currentUser.id, formData);
                
                if (result && result.status ==="success") {
                    const updatedUser = result.user ? result.user : { ...currentUser, avatarurl: result.data.avatarurl };
                    updateUser(updatedUser);
                    setAvatarUrl(updatedUser.avatarurl);
                    setAvatarFile(null);
                    setShowFullAvatar(false);
                    setFormSuccess("Profile picture updated successfully!");
                return { success: true, user: updatedUser };
                } else {
                    setFormErrors({ general: result.message || "Failed to upload new profile picture." });
                    return { success: false, message: result.message };
                }
            }
            
            // If no avatar file is provided, it's a regular profile details update
            const result = await updateUserDetails(
                currentUser.id,
                detailsToUpdate.name || currentUser.name,
                detailsToUpdate.surname || currentUser.surname,
                detailsToUpdate.username || currentUser.username,
                detailsToUpdate.email || currentUser.email
            );
            
            if (result && result.user) {
                updateUser(result.user);
                setFormSuccess("Profile details updated successfully!");
                return { success: true, user: result.user };
            } else {
                setFormErrors({ general: result.message || "Failed to update profile details." });
                return { success: false, message: result.message };
            }
        } catch (err) {
            console.error("Error updating profile:", err);
            setFormErrors({ general: "An error occurred while updating the profile." });
            return { success: false, message: "An error occurred." };
        }
    };


    if (authLoading) return <LoadingSpinner />;
    if (!isLoggedIn) return null;
    if (loading) return <LoadingSpinner />;
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
                            <button onClick={() => setShowTermsModal(false)} className="btn-primary">Close</button>
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
                                <button type="submit" className="btn-primary">
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
                                        <span className="material-icons"></span> Deleting your account is a permanent action. All your data will be irreversibly removed.
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

           {showFullAvatar && (
            <div className="modal-overlay" onClick={() => setShowFullAvatar(false)}>
                <div className="modal-content full-avatar-modal" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={() => setShowFullAvatar(false)}>&times;</button>
                
                {/* Conditionally render the content based on whether an avatar exists */}
                {avatarurl ? (
                    <>
                        <img src={avatarurl} alt="Full size user avatar" className="full-avatar-img" />
                        <div className="avatar-edit-icon-wrapper">
                            <button
                                className="edit-avatar-btn"
                                onClick={() => setShowAvatarOptions(prev => !prev)}
                                aria-label="Edit avatar options"
                            >
                                <span className="material-icons">edit</span>
                            </button>
                            {showAvatarOptions && (
                                <div className="avatar-options-dropdown">
                                    <button onClick={() => { fileInputRef.current.click(); setShowAvatarOptions(false); setShowFullAvatar(false); }} className="option-btn">Change Photo</button>
                                    <button onClick={handleDeleteAvatar} className="option-btn danger">Delete Photo</button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                        <div className="empty-avatar-upload">
                        <div className="file-upload-controls">
                            <label className="select-file-button">
                                + 
                                <input
                                    type="file"
                                    onChange={handleAvatarChange} // Use your existing handler
                                    style={{ display: 'none' }}
                                    ref={fileInputRef} // Link to a ref
                                />
                            </label>
                            <span className="selected-file-name">
                                {selectedFile ? selectedFile.name : `No photo chosen`}
                            </span>
                        </div>
                        <button onClick={handleSaveChanges} disabled={!selectedFile}>
                           
                        </button>
                    </div>
                )}
                </div>
            </div>
            )}

            <div className="containerP">
                <div className="profile-header">
                    <div className="avatar-wrapper" onClick={() => setShowFullAvatar(true)} >
                        {avatarurl ? (
                           <img 
                        src={avatarurl} 
                        alt="User Avatar" 
                        className="avatar-img"
                        onError={(e) => {
                        e.target.style.display = 'none';
                            setAvatarUrl(null);
                        }}
                    />
                        ) : (
                            <div className="avatar">
                                {currentUser.name ? currentUser.name[0].toUpperCase() : ''}
                                {currentUser.surname ? currentUser.surname[0].toUpperCase() : ''}
                            </div>
                            // <div className="avatar">
                            //     {currentUser.name ? currentUser.name[0].toUpperCase() : ''}
                            //     {currentUser.surname ? currentUser.surname[0].toUpperCase() : ''}
                            //     <div className="add-photo-text">
                            //         <span className="plus-sign">+</span>
                            //         <span className="upload-text">Upload</span>
                            //     </div>
                            // </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleAvatarChange}
                            accept="image/*"
                        />
                        
                    </div>
                    <div className="profile">
                        <h1 className="name">{currentUser.name} {currentUser.surname}</h1>
                        <p className="username">@{currentUser.username}</p>
                        <p className="email">{currentUser.email}</p>
                        <p className="member-since">Member since: {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}.</p>
                        <DexterityToggle />
                    </div>
                </div>

                
            <div className="profile-options">
                {formSuccess && <div className="success-message">{formSuccess}</div>}
                {error && <div className="error-message">{error}</div>} 

                <button className="option-button" onClick={() => setShowEditForm(true)}>
                     Edit Profile
                    <span className="arrow-icon">→</span>
                </button>

              

                <button className="option-button" onClick={() => setShowTermsModal(true)}>
                    View Terms and Conditions
                    <span className="arrow-icon">→</span>
                </button>

                  <button className="option-button" onClick={handleLogout}>
                    Log Out
                    <span className="arrow-icon">→</span>
                </button>

                <button className="option-button danger-option" onClick={handleDeleteAccount}>
                     Delete Account
                    <span className="arrow-icon">→</span>
                </button>

              
            </div>
            </div>
        </>
    );
}