import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import CookieBanner from './components/CookieBanner';
import SessionExpiredModal from './components/SessionExpiredModal';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import UsersPage from './pages/UsersPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/register"     element={<RegisterPage />} />
          <Route path="/products"     element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
          <Route path="/products/:id" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />
          <Route path="/users"        element={<RoleRoute roles={['admin']}><UsersPage /></RoleRoute>} />
          <Route path="*"             element={<Navigate to="/products" replace />} />
        </Routes>
        <CookieBanner />
        <SessionExpiredModal />
      </AuthProvider>
    </BrowserRouter>
  );
}
