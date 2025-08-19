import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext'; 
import PropTypes from 'prop-types';
import LoadingSpinner from './loadingSpinner';

export function ProtectedRoute({ children }){
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
