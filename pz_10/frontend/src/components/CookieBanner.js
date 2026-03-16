import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookiesAccepted');
    if (!accepted) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookiesAccepted', 'false');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-banner-content">
        <div className="cookie-banner-icon">🍪</div>
        <div className="cookie-banner-text">
          <div className="cookie-banner-title">мы используем cookies</div>
          <div className="cookie-banner-desc">
            для аутентификации мы используем <strong>HttpOnly cookie</strong> для хранения refresh-токена
            и <strong>localStorage</strong> для access-токена. без этого вход в систему невозможен.
          </div>
        </div>
        <div className="cookie-banner-actions">
          <button className="btn btn-primary cookie-btn-accept" onClick={accept}>принять</button>
          <button className="btn btn-ghost cookie-btn-decline" onClick={decline}>отклонить</button>
        </div>
      </div>
    </div>
  );
}