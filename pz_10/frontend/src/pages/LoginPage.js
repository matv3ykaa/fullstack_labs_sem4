import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (f) => (e) => setForm((prev) => ({ ...prev, [f]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError('заполните все поля'); return; }
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/products');
    } catch (e) {
      setError(e.response?.data?.error || 'ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-title">вход</div>
        <div className="auth-sub">нет аккаунта? <Link to="/register">зарегистрироваться</Link></div>
        {error && <div className="form-error">{error}</div>}
        <div className="form-group">
          <label className="form-label">email</label>
          <input className="form-input" type="email" value={form.email} onChange={set('email')} />
        </div>
        <div className="form-group">
          <label className="form-label">пароль</label>
          <input
            className="form-input"
            type="password"
            value={form.password}
            onChange={set('password')}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ marginTop: 8 }}>
          {loading ? '...' : 'войти'}
        </button>
      </div>
    </div>
  );
}