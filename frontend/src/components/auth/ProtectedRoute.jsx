import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingState } from '../common/LoadingState';

export function ProtectedRoute({ allowedRoles = [], children }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoadingState
          message="Verifying governance credentials..."
          description="Restoring secure society session with backend services."
        />
      </div>
    );
  }

  // Not authenticated: redirect to login preserving destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but insufficient role authorization
  if (allowedRoles.length > 0 && (!role || !allowedRoles.includes(role))) {
    return (
      <Navigate
        to="/unauthorized"
        state={{
          requiredRoles: allowedRoles,
          currentRole: role || 'Unassigned',
          attemptedPath: location.pathname,
        }}
        replace
      />
    );
  }

  return children ? children : <Outlet />;
}
