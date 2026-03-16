import { useState } from 'react';
import { products } from '../api';
import ImageField from './ImageField';

export default function ProductModal({ product, onClose, onSave }) {
  const isEdit = !!product?.id;
  const [form, setForm] = useState({
    title: product?.title || '',
    category: product?.category || '',
    description: product?.description || '',
    price: product?.price || '',
    image: product?.image || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title || !form.category || !form.description || !form.price) {
      setError('заполните все поля');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        const res = await products.update(product.id, { ...form, price: Number(form.price) });
        onSave(res.data);
      } else {
        const res = await products.create({ ...form, price: Number(form.price) });
        onSave(res.data);
      }
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || 'ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{isEdit ? 'редактировать товар' : 'новый товар'}</div>
        {error && <div className="form-error">{error}</div>}
        {[
          { label: 'название', field: 'title' },
          { label: 'категория', field: 'category' },
          { label: 'описание', field: 'description' },
          { label: 'цена', field: 'price', type: 'number' },
        ].map(({ label, field, type }) => (
          <div className="form-group" key={field}>
            <label className="form-label">{label}</label>
            <input className="form-input" type={type || 'text'} value={form[field]} onChange={set(field)} />
          </div>
        ))}
        <ImageField value={form.image} onChange={(val) => setForm((f) => ({ ...f, image: val }))} />
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