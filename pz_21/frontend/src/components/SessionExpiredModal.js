import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SessionExpiredModal() {
  const [visible, setVisible] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setVisible(true);
    window.addEventListener('session-expired', handler);
    return () => window.removeEventListener('session-expired', handler);
  }, []);

  const handleLogin = () => {
    setVisible(false);
    logout();
    navigate('/login');
  };

  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal session-modal">
        <div className="session-modal-icon">🔒</div>
        <div className="session-modal-title">сессия истекла</div>
        <div className="session-modal-desc">
          время сессии вышло. нужно войти заново.
        </div>
        <button className="btn btn-primary" onClick={handleLogin}>
          войти снова
        </button>
      </div>
    </div>
  );
}
