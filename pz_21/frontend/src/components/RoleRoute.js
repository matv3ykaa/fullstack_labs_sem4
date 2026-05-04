import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">загрузка...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/products" replace />;
  return children;
}
