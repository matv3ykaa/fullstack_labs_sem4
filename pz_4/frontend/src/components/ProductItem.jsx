import React from 'react';

export default function ProductItem({ product, onEdit, onDelete }) {
  // Отображаем рейтинг в виде звёздочек, если он есть
  const renderRating = (rating) => {
    if (rating === null || rating === undefined) return null;
    const rounded = Math.round(rating * 10) / 10;
    return <span className="productRating">★ {rounded}</span>;
  };

  return (
    <div className="productRow">
      <div className="productMain">
        <div className="productHeader">
          <span className="productName">{product.name}</span>
          <span className="productCategory">{product.category}</span>
          {renderRating(product.rating)}
        </div>
        <div className="productDescription">{product.description}</div>
        <div className="productMeta">
          <span className="productPrice">{product.price.toLocaleString('ru-RU')} ₽</span>
          <span className={`productStock ${product.stock === 0 ? 'productStock--empty' : ''}`}>
            {product.stock === 0 ? 'Нет в наличии' : `На складе: ${product.stock} шт.`}
          </span>
        </div>
      </div>
      <div className="productActions">
        <button className="btn" onClick={() => onEdit(product)}>
          Изменить
        </button>
        <button className="btn btn--danger" onClick={() => onDelete(product.id)}>
          Удалить
        </button>
      </div>
    </div>
  );
}
