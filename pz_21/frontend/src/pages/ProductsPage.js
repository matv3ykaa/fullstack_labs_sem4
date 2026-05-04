import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { products } from '../api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ImgPlaceholder from '../components/ImgPlaceholder';
import ProductModal from '../components/ProductModal';

export default function ProductsPage() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('relevance');

  const canManage = user?.role === 'seller' || user?.role === 'admin';

  useEffect(() => {
    products.getAll()
      .then((res) => {
        const payload = res.data;
        setList(Array.isArray(payload) ? payload : payload.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (product) => {
    setList((prev) => [...prev, product]);
  };

  const filtered = list
    .filter((p) => {
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === 'price-asc')  return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'alpha')      return a.title.localeCompare(b.title, 'ru');
      return 0;
    });

  if (loading) return <div className="loading">загрузка...</div>;

  return (
    <div className="layout">
      <Navbar />
      <main className="main">
        <div className="page-header">
          <div className="page-title">товары <span>{filtered.length} шт</span></div>
          {canManage && (
            <button className="btn btn-accent-outline" onClick={() => setModal(true)}>+ добавить</button>
          )}
        </div>

        <div className="toolbar">
          <div className="search-input-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="поиск по названию, категории, описанию..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="sort-tabs">
            {[
              { key: 'relevance',  label: 'по релевантности' },
              { key: 'alpha',      label: 'по алфавиту' },
              { key: 'price-asc',  label: 'дешевле' },
              { key: 'price-desc', label: 'дороже' },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`sort-tab${sort === key ? ' active' : ''}`}
                onClick={() => setSort(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            {list.length === 0 ? 'товаров пока нет' : 'ничего не найдено'}
          </div>
        ) : (
          <div className="products-grid">
            {filtered.map((p) => (
              <Link to={`/products/${p.id}`} key={p.id} className="product-card">
                {p.image
                  ? <img src={p.image} alt={p.title} className="product-card-img" onError={(e) => { e.target.style.display = 'none'; }} />
                  : <ImgPlaceholder />
                }
                <div className="product-card-body">
                  <div className="product-card-category">{p.category}</div>
                  <div className="product-card-title">{p.title}</div>
                  <div className="product-card-desc">{p.description}</div>
                  <div className="product-card-price">{p.price.toLocaleString('ru-RU')} ₽</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {modal && <ProductModal onClose={() => setModal(false)} onSave={handleSave} />}
    </div>
  );
}