import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { MEDIA_URL } from '../../utils/api/config';

const ProductCard = ({ product, variant = 'default' }) => {
  // Handle case where product might be null or undefined
  if (!product) {
    return null;
  }
  
  // Get the product ID for the link
  const productId = product.documentId || product.id;
  
  // Get the product image URL
  const getProductImage = () => {
    // If image is already a string URL, use it directly
    if (typeof product.image === 'string') {
      // If it's a relative URL, prepend the media URL
      if (product.image.startsWith('/')) {
        return `${MEDIA_URL}${product.image}`;
      }
      return product.image;
    }
    
    // If image is an object with formats (from API)
    if (product.image?.formats) {
      const imageUrl = product.image.formats.medium?.url || 
                      product.image.formats.small?.url || 
                      product.image.url;
      
      // If it's a relative URL, prepend the media URL
      if (imageUrl && imageUrl.startsWith('/')) {
        return `${MEDIA_URL}${imageUrl}`;
      }
      return imageUrl;
    }
    
    // If product has product_image data
    if (product.product_image?.data) {
      const image = product.product_image.data[0]?.attributes;
      const imageUrl = image?.formats?.medium?.url || 
                      image?.formats?.small?.url || 
                      image?.url;
      
      // If it's a relative URL, prepend the media URL
      if (imageUrl && imageUrl.startsWith('/')) {
        return `${MEDIA_URL}${imageUrl}`;
      }
      return imageUrl;
    }
    
    // Fallback to default image
    return '/products/product1.jpg';
  };

  if (variant === 'compact') {
    return (
      <Link to={`/product/${productId}`} className="flex-shrink-0 w-32">
        <img 
          src={getProductImage()} 
          alt={product.name} 
          className="w-full h-32 object-cover rounded-xl"
        />
      </Link>
    );
  }

  return (
    <Link to={`/product/${productId}`} className="block bg-gray-900 rounded-xl p-3 transition-transform hover:scale-105">
      <div className="relative">
        <img 
          src={getProductImage()} 
          alt={product.name} 
          className="w-full h-40 object-cover rounded-lg mb-2" 
        />
        {product.rating && (
          <div className="absolute top-2 right-2 bg-black/50 rounded-full p-2">
            <FontAwesomeIcon icon={faStar} className="text-yellow-400 w-4 h-4" />
          </div>
        )}
      </div>
      <h4 className="font-medium truncate">{product.name}</h4>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm">{product.price}</p>
          {product.originalPrice && (
            <p className="text-xs text-gray-500 line-through">{product.originalPrice}</p>
          )}
        </div>
        {product.rating && (
          <div className="flex items-center">
            <FontAwesomeIcon icon={faStar} className="text-yellow-400 w-3 h-3" />
            <span className="text-xs ml-1">{product.rating}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard; 