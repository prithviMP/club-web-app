import React from 'react';
import { Link } from 'react-router-dom';

/**
 * A reusable content block component with image and text
 * 
 * @param {Object} props - Component props
 * @param {string} props.subtitle - The subtitle text
 * @param {string} props.title - The main title text
 * @param {string} props.content - The main content text
 * @param {string} props.image - The image URL
 * @param {string} [props.imageAlt=''] - Alt text for the image
 * @param {string} [props.buttonText=''] - Text for the button/link
 * @param {string} [props.buttonUrl=''] - URL for the button/link
 * @param {string} [props.imagePosition='right'] - Position of the image ('right' or 'left')
 * @param {string} [props.fallbackImage=''] - Fallback image URL if the main image fails to load
 * @returns {JSX.Element} The content block component
 */
const ContentBlock = ({ 
  subtitle, 
  title, 
  content, 
  image, 
  imageAlt = '', 
  buttonText = '', 
  buttonUrl = '',
  imagePosition = 'right',
  fallbackImage = ''
}) => {
  // Default fallback image if none provided
  const defaultFallback = `https://via.placeholder.com/600x600/1D2221/8FFA09?text=${encodeURIComponent(title)}`;
  
  // Determine order classes based on image position
  const textOrderClass = imagePosition === 'right' ? 'order-2 md:order-1' : 'order-2 md:order-2';
  const imageOrderClass = imagePosition === 'right' ? 'order-1 md:order-2' : 'order-1 md:order-1';
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div className={textOrderClass}>
        <h4 className="text-primary uppercase tracking-widest text-sm mb-2">{subtitle}</h4>
        <h2 className="text-3xl md:text-4xl font-bold text-light mb-6">{title}</h2>
        <p className="text-gray-300 mb-8 leading-relaxed">
          {content}
        </p>
        {buttonText && buttonUrl && (
          <Link 
            to={buttonUrl} 
            className="inline-block bg-primary text-black px-8 py-3 rounded-md font-medium hover:bg-opacity-90 transition-colors"
          >
            {buttonText}
          </Link>
        )}
      </div>
      <div className={imageOrderClass}>
        <div className="relative">
          <div className="aspect-square rounded-lg overflow-hidden">
            <img 
              src={image} 
              alt={imageAlt || title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackImage || defaultFallback;
              }}
            />
          </div>
          <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary rounded-lg -z-10"></div>
        </div>
      </div>
    </div>
  );
};

export default ContentBlock; 