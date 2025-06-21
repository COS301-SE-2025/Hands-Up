import { useNavigate } from 'react-router-dom';
import { useStatUpdater } from "./learningStatsUpdater";
import { login } from "../utils/apiCalls";
import { useState } from "react";

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleUpdate = useStatUpdater();

  const handleLogin = async (email, password) => {
    setIsLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password.');
      setIsLoading(false);
      return false;
    }

    try {
      const data = await login({ email, password });
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userData', JSON.stringify(data.user));
      navigate('/home');
      handleUpdate("streak");
      return true;
    } catch (err) {
      setError(err.message || 'Login failed.');
      console.error('Login error:', err);
      return false;
    } finally {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setError('');
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading, error};
}
