import React, { useEffect, useState } from 'react';
import './ProductsPage.scss';
import ProductsList from '../../components/ProductsList';
import ProductModal from '../../components/ProductModal';
import { api } from '../../api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingProduct, setEditingProduct] = useState(null);
  const [filter, setFilter] = useState('');

  // Загружаем товары при первом рендере
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      alert('Не удалось загрузить товары. Проверьте, запущен ли сервер.');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setModalMode('create');
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setModalMode('edit');
    setEditingProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id) => {
    const ok = window.confirm('Удалить товар?');
    if (!ok) return;
    try {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      alert('Не удалось удалить товар');
    }
  };

  const handleSubmitModal = async (payload) => {
    try {
      if (modalMode === 'create') {
        const newProduct = await api.createProduct(payload);
        setProducts(prev => [...prev, newProduct]);
      } else {
        const updatedProduct = await api.updateProduct(payload.id, payload);
        setProducts(prev => prev.map(p => p.id === payload.id ? updatedProduct : p));
      }
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Не удалось сохранить товар');
    }
  };

  // Простая фильтрация по названию и категории
  const visibleProducts = products.filter(p => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  return (
    <div className="page">
      <header className="header">
        <div className="header__inner">
          <div className="brand">🎲 Настольные игры</div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="toolbar">
            <h1 className="title">Каталог товаров</h1>
            <div className="toolbar__right">
              <input
                className="searchInput"
                placeholder="Поиск по названию или категории..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
              <button className="btn btn--primary" onClick={openCreate}>
                + Добавить
              </button>
            </div>
          </div>

          {loading ? (
            <div className="empty">Загрузка...</div>
          ) : (
            <>
              {filter && (
                <div className="searchInfo">
                  Найдено: {visibleProducts.length} из {products.length}
                </div>
              )}
              <ProductsList
                products={visibleProducts}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            </>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="footer__inner">
          © {new Date().getFullYear()} Board Games Shop
        </div>
      </footer>

      <ProductModal
        open={modalOpen}
        mode={modalMode}
        initialProduct={editingProduct}
        onClose={closeModal}
        onSubmit={handleSubmitModal}
      />
    </div>
  );
}
