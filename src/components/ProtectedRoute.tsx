import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function ProtectedRoute() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
