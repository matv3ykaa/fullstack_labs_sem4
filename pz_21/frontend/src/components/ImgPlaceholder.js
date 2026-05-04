export default function ImgPlaceholder({ height = 180 }) {
  return (
    <div className="product-card-img-placeholder" style={{ height }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f0f0f0" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    </div>
  );
}
