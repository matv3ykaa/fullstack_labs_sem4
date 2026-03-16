import { useState } from 'react';
import { usersApi } from '../api';

export default function UserEditModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.first_name || !form.last_name) {
      setError('заполните все поля');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await usersApi.update(user.id, form);
      onSave(res.data);
    } catch (e) {
      setError(e.response?.data?.error || 'ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">редактировать пользователя</div>
        {error && <div className="form-error">{error}</div>}
        <div className="form-group">
          <label className="form-label">имя</label>
          <input className="form-input" type="text" value={form.first_name} onChange={set('first_name')} />
        </div>
        <div className="form-group">
          <label className="form-label">фамилия</label>
          <input className="form-input" type="text" value={form.last_name} onChange={set('last_name')} />
        </div>
        <div className="form-group">
          <label className="form-label">роль</label>
          <select className="form-input" value={form.role} onChange={set('role')}>
            <option value="user">пользователь</option>
            <option value="seller">продавец</option>
            <option value="admin">администратор</option>
          </select>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>отмена</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? '...' : 'сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}
