import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {signup} from'../utils/apiCalls.js';
import '../styles/signup.css';

export function useSignup() {
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
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setError('');
        setSuccessMessage('');
        setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
        }));
    };

    const handleSignup = async (formData, termsAccepted) => {
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
            setSuccessMessage(`Signup successful! Welcome ${data.user.username}`);
            
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
    }

    return {formData, handleChange, handleSignup, isLoading, error, successMessage,};

};