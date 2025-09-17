import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uniqueUsername, uniqueEmail, updateUserDetails, updateUserPassword } from '../utils/apiCalls.js';

export function useUserProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [formSuccess, setFormSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const storedUser = localStorage.getItem('userData');

    if (!isLoggedIn || !storedUser) {
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      setUserData(user);
      fetchUserData(user.id);
    } catch (err) {
      setError("Failed to load user data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);


  useEffect(() => {
    if (formSuccess) {
      const timer = setTimeout(() => {
        setFormSuccess("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [formSuccess]);


  const fetchUserData = async (userID) => {
    try {
      const response = await fetch(`http://localhost:2000/handsUPApi/user/${userID}`);
      if (!response.ok) throw new Error('Failed to fetch user data');

      const data = await response.json();
      setUserData(data.user);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to fetch user data.");
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const surname = document.getElementById("surname").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const errors = {};


    if (
      name === userData.name &&
      surname === userData.surname &&
      username === userData.username &&
      email === userData.email &&
      !newPassword &&
      !confirmPassword
    ) {
      errors.general = "No changes detected to save";
      setFormErrors(errors);
      return;
    }

    if (!name) errors.name = "Name is required.";
    if (!surname) errors.surname = "Surname is required.";
    if (!username) errors.username = "Username is required.";
    if (!email) errors.email = "Email is required.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }


    const nameRegex = /^[A-Za-z]+$/;
    if (name && !nameRegex.test(name)) {
      errors.name = "Name must contain only letters.";
    }
    if (surname && !nameRegex.test(surname)) {
      errors.surname = "Surname must contain only letters.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (username !== userData.username) {
      try {
        const data = await uniqueUsername(username);  
        if (data) {
          errors.username = "Username already taken.";
          setFormErrors(errors);
          return;
        }
      } catch (error) {
        console.error('Error checking username:', error);
        errors.general = "An error occurred while checking username.";
        setFormErrors(errors);
        return;
      }
    }


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      errors.email = "Invalid email format.";
      setFormErrors(errors);
      return;
    }
    if (email !== userData.email) {
      try {
        const data = await uniqueEmail(email);
        if (data) {
          errors.email = "Email already in use.";
          setFormErrors(errors);
          return;
        }
      } catch (error) {
        console.error('Error checking email:', error);
        errors.general = "An error occurred while checking email.";
        setFormErrors(errors);
        return;
      }
    }

    if (newPassword || confirmPassword) {
      if (!newPassword) errors.newPassword = "Password is required.";
      if (!confirmPassword) errors.confirmPassword = "Confirm password is required.";
      if (newPassword !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match.";
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      try {
        await updateUserPassword(userData.userID, name, surname, username, email, newPassword);
        const updatedUser = {
          id: userData.userID,
          email: email,
          username: username
        };
        localStorage.setItem("userData", JSON.stringify(updatedUser));
        setUserData(updatedUser);
        fetchUserData(userData.userID);
        setFormSuccess("User updated successfully!");
      } catch (err) {
        errors.general = "An error occurred while updating password: " + err.message;
        setFormErrors(errors);
        return;
      }
    } else {

      try {
        await updateUserDetails(userData.userID, name, surname, username, email);
        const updatedUser = {
          id: userData.userID,
          email: email,
          username: username
        };
        localStorage.setItem("userData", JSON.stringify(updatedUser));
        setUserData(updatedUser);
        fetchUserData(userData.userID);
        setFormSuccess("User updated successfully!");
      } catch (err) {
        errors.general = "An error occurred while updating details: " + err.message;
        setFormErrors(errors);
        return;
      }
    }
    setFormErrors({}); 
  };

  return {
    userData,
    loading,
    error,
    formErrors,
    formSuccess,
    handleSaveChanges,
  };
}