import React from 'react';
import { Link } from 'react-router-dom';

/**
 * A reusable category card component with image, title, and link
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - The category title
 * @param {string} props.image - The image URL
 * @param {string} props.linkUrl - The URL to navigate to when clicked
 * @param {string} [props.fallbackImage] - Fallback image URL if the main image fails to load
 * @param {string} [props.height='h-80'] - Height class for the card
 * @returns {JSX.Element} The category card component
 */
const CategoryCard = ({ 
  title, 
  image, 
  linkUrl, 
  fallbackImage = '', 
  height = 'h-80' 
}) => {
  // Default fallback image if none provided
  const defaultFallback = `https://via.placeholder.com/600x800/1D2221/8FFA09?text=${encodeURIComponent(title)}`;
  
  return (
    <div className={`relative overflow-hidden rounded-lg group ${height}`}>
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = fallbackImage || defaultFallback;
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          <Link 
            to={linkUrl} 
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            <span className="mr-2 font-medium">Shop Now</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard; 