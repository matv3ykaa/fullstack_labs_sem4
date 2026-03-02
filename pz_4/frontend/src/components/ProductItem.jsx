import React from 'react';

const PLACEHOLDER = 'https://via.placeholder.com/300x180/1a1f35/6366f1?text=🎲';

export default function ProductItem({ product, onEdit, onDelete }) {
  const renderRating = (rating) => {
    if (rating === null || rating === undefined) return null;
    const rounded = Math.round(rating * 10) / 10;
    return <span className="productRating">★ {rounded}</span>;
  };

  return (
    <div className="productCard">
      <div className="productImageWrap">
        <img
          className="productImage"
          src={product.image || PLACEHOLDER}
          alt={product.name}
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
      </div>
      <div className="productBody">
        <div className="productHeader">
          <span className="productName">{product.name}</span>
          <span className="productCategory">{product.category}</span>
          {renderRating(product.rating)}
        </div>
        <div className="productDescription">{product.description}</div>
        <div className="productFooter">
          <div className="productMeta">
            <span className="productPrice">{product.price.toLocaleString('ru-RU')} ₽</span>
            <span className={`productStock ${product.stock === 0 ? 'productStock--empty' : ''}`}>
              {product.stock === 0 ? 'Нет в наличии' : `${product.stock} шт.`}
            </span>
          </div>
          <div className="productActions">
            <button className="btn" onClick={() => onEdit(product)}>Изменить</button>
            <button className="btn btn--danger" onClick={() => onDelete(product.id)}>Удалить</button>
          </div>
        </div>
      </div>
    </div>
  );
}