import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (f) => (e) => setForm((prev) => ({ ...prev, [f]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.email || !form.first_name || !form.last_name || !form.password) {
      setError('заполните все поля'); return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form.email, form.first_name, form.last_name, form.password);
      navigate('/products');
    } catch (e) {
      setError(e.response?.data?.error || 'ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-title">регистрация</div>
        <div className="auth-sub">уже есть аккаунт? <Link to="/login">войти</Link></div>
        {error && <div className="form-error">{error}</div>}
        {[
          { label: 'email', field: 'email', type: 'email' },
          { label: 'имя', field: 'first_name' },
          { label: 'фамилия', field: 'last_name' },
          { label: 'пароль', field: 'password', type: 'password' },
        ].map(({ label, field, type }) => (
          <div className="form-group" key={field}>
            <label className="form-label">{label}</label>
            <input className="form-input" type={type || 'text'} value={form[field]} onChange={set(field)} />
          </div>
        ))}
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ marginTop: 8 }}>
          {loading ? '...' : 'создать аккаунт'}
        </button>
      </div>
    </div>
  );
}
