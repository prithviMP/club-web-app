import { getOptimizedImageUrl } from '../api/productApi';

// Default fallback image
export const FALLBACK_IMAGE = '/assets/placeholder.png';

/**
 * Gets an image source with fallback for use in img tags
 * @param {Object|string} image - The image object or URL
 * @param {string} context - The context ('list', 'thumbnail', 'detail')
 * @returns {string} - The image URL
 */
export const getImageSource = (image, context = 'detail') => {
  try {
    if (!image) {
      return FALLBACK_IMAGE;
    }
    
    const imageUrl = getOptimizedImageUrl(image, context);
    return imageUrl || FALLBACK_IMAGE;
  } catch (error) {
    console.error('Error getting image source:', error);
    return FALLBACK_IMAGE;
  }
};

/**
 * Preloads an array of images
 * @param {Array<Object|string>} images - Array of image objects or URLs
 * @param {string} context - The context ('list', 'thumbnail', 'detail')
 */
export const preloadImages = (images, context = 'detail') => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return;
  }

  // Create an array of image URLs
  const imageUrls = images.map(image => getOptimizedImageUrl(image, context)).filter(Boolean);

  // Preload each image
  imageUrls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
};

/**
 * Formats a price in cents to a readable string
 * @param {number} price - The price in cents
 * @returns {string} - The formatted price
 */
export const formatPrice = (price) => {
  if (typeof price !== 'number') {
    return '₹0.00';
  }
  
  // Convert cents to rupees
  const rupees = price / 100;
  
  // Format with Indian numbering system
  return `₹${rupees.toLocaleString('en-IN')}`;
};

/**
 * Gets the first image from a product's image array
 * @param {Array} images - The product's image array
 * @param {string} context - The context ('list', 'thumbnail', 'detail')
 * @returns {string} - The image URL
 */
export const getFirstProductImage = (images, context = 'list') => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return FALLBACK_IMAGE;
  }
  
  return getImageSource(images[0], context);
};

/**
 * Checks if an image URL is valid
 * @param {string} url - The image URL to check
 * @returns {Promise<boolean>} - Whether the image URL is valid
 */
export const isImageValid = (url) => {
  return new Promise((resolve) => {
    if (!url || typeof url !== 'string') {
      resolve(false);
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

export default {
  getImageSource,
  preloadImages,
  formatPrice,
  getFirstProductImage,
  isImageValid,
  FALLBACK_IMAGE,
}; 