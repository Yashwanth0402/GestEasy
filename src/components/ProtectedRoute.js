import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase'; // Ensure this path points to your firebase.js configuration file

const ProtectedRoute = ({ element }) => {
  const user = auth.currentUser;

  // If there's no user, redirect to the login page
  return user ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;
