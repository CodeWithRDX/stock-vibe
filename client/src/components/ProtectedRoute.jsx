import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, login } = useAuth();
  const [autoLoggingIn, setAutoLoggingIn] = useState(false);
  const [autoLoginError, setAutoLoginError] = useState(null);

  useEffect(() => {
    const performAutoLogin = async () => {
      // If user is not logged in
      if (!loading && !user && allowedRoles && allowedRoles.length > 0) {
        setAutoLoggingIn(true);
        try {
          const targetRole = allowedRoles.includes('Admin') ? 'Admin' : allowedRoles[0];
          const email = targetRole === 'Admin' ? 'admin@example.com' : 'seller@example.com';
          const password = 'Password@123';
          await login(email, password);
        } catch (err) {
          console.error('Auto login failed:', err);
          setAutoLoginError(err);
        } finally {
          setAutoLoggingIn(false);
        }
      } 
      // If user is logged in but does not have the required role for this route, auto-switch
      else if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
        setAutoLoggingIn(true);
        try {
          const targetRole = allowedRoles.includes('Admin') ? 'Admin' : allowedRoles[0];
          const email = targetRole === 'Admin' ? 'admin@example.com' : 'seller@example.com';
          const password = 'Password@123';
          await login(email, password);
        } catch (err) {
          console.error('Auto login switch failed:', err);
          setAutoLoginError(err);
        } finally {
          setAutoLoggingIn(false);
        }
      }
    };

    performAutoLogin();
  }, [user, loading, allowedRoles, login]);

  if (loading || autoLoggingIn) {
    const targetRole = allowedRoles?.includes('Admin') ? 'Admin' : allowedRoles?.[0] || 'User';
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 gap-4">
        {/* Sleek spinner */}
        <div className="h-12 w-12 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin"></div>
        <p className="text-sm font-medium tracking-wide text-slate-400">Preparing {targetRole} workspace...</p>
      </div>
    );
  }

  if (autoLoginError) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
