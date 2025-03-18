<img
  src={imageUrl || '/images/product-placeholder.jpg'}
  alt={name}
  className="w-full h-full object-cover"
  onError={(e) => {
    e.target.src = '/images/product-placeholder.jpg';
    e.target.onerror = null;
  }}
/>