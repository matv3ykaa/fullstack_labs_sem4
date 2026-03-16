import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { products } from '../api';
import Navbar from '../components/Navbar';
import ProductModal from '../components/ProductModal';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editModal, setEditModal] = useState(false);

  useEffect(() => {
    products.getById(id)
      .then((res) => setProduct(res.data))
      .catch(() => setError('товар не найден'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('удалить товар?')) return;
    await products.remove(id);
    navigate('/products');
  };

  const handleSave = (updated) => setProduct(updated);

  if (loading) return <div className="loading">загрузка...</div>;

  return (
    <div className="layout">
      <Navbar />
      <main className="main">
        <Link to="/products" className="back-link">← назад</Link>

        {error ? (
          <div className="form-error">{error}</div>
        ) : product && (
          <div className="product-detail">
            {product.image
              ? <img src={product.image} alt={product.title} className="product-detail-img" onError={(e) => { e.target.style.display = 'none'; }} />
              : (
                <div className="product-detail-img-placeholder">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#f0f0f0" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )
            }
            <div className="product-detail-body">
              <div className="product-detail-category">
                <span className="tag">{product.category}</span>
              </div>
              <div className="product-detail-title">{product.title}</div>
              <div className="product-detail-desc">{product.description}</div>
              <div className="product-detail-price">{product.price.toLocaleString('ru-RU')} ₽</div>
              <div className="product-detail-actions">
                <button className="btn btn-accent-outline" onClick={() => setEditModal(true)}>редактировать</button>
                <button className="btn btn-danger" onClick={handleDelete}>удалить</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {editModal && (
        <ProductModal product={product} onClose={() => setEditModal(false)} onSave={handleSave} />
      )}
    </div>
  );
}