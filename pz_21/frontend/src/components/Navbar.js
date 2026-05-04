import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = {
  user: 'пользователь',
  seller: 'продавец',
  admin: 'администратор',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-track">
          {Array.from({ length: 2 }).map((_, half) =>
            Array.from({ length: 10 }).map((__, i) => (
              <span key={half * 10 + i} style={{ display: 'inline-flex', alignItems: 'center' }}>
                <span className="topbar-item">не днс</span>
                <span className="topbar-dot" />
              </span>
            ))
          )}
        </div>
      </div>
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/products" className="navbar-logo">
            <span className="dns">dns</span><span className="dot">.</span><span className="shop">shop</span>
          </Link>
          {user?.role === 'admin' && (
            <Link to="/users" className="navbar-nav-link">пользователи</Link>
          )}
        </div>
        <div className="navbar-right">
          {user && (
            <>
              <div className="navbar-user">
                <span className="navbar-user-name">{user.first_name} {user.last_name}</span>
                <span className="navbar-user-meta">
                  {user.email}
                  <span className="navbar-user-role">{ROLE_LABELS[user.role] || user.role}</span>
                </span>
              </div>
              <button className="btn btn-ghost" onClick={handleLogout}>выйти</button>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
