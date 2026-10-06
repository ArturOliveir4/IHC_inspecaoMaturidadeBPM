import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const PrivateRoute = ({ children, roles }) => {
  const { signed, user, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Carregando...</div>;
  }

  if (!signed) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.perfil)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};