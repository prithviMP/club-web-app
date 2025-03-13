import React from 'react';

/**
 * A reusable component for displaying social media posts in a grid
 * 
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of items to display
 * @param {string} [props.baseUrl='https://instagram.com'] - Base URL for the social media links
 * @param {string} [props.columns='grid-cols-2 md:grid-cols-4 lg:grid-cols-6'] - Grid column classes
 * @param {string} [props.gap='gap-4'] - Gap between grid items
 * @param {Function} [props.renderItem] - Custom render function for each item
 * @returns {JSX.Element} The social grid component
 */
const SocialGrid = ({ 
  items = [], 
  baseUrl = 'https://instagram.com',
  columns = 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6',
  gap = 'gap-4',
  renderItem
}) => {
  // Default render function for each item
  const defaultRenderItem = (item, index) => {
    const imageUrl = typeof item === 'string' 
      ? item 
      : item.imageUrl || `/assets/instagram-${index + 1}.jpg`;
    
    const itemUrl = typeof item === 'string'
      ? baseUrl
      : item.url || baseUrl;
      
    const alt = typeof item === 'string'
      ? `Social media post ${index + 1}`
      : item.alt || `Social media post ${index + 1}`;
    
    return (
      <a 
        key={index} 
        href={itemUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block aspect-square overflow-hidden group"
      >
        <img 
          src={imageUrl} 
          alt={alt} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://via.placeholder.com/300x300/1D2221/8FFA09?text=Post+${index + 1}`;
          }}
        />
      </a>
    );
  };

  // If no items provided, create placeholder array
  const displayItems = items.length > 0 
    ? items 
    : Array.from({ length: 6 }, (_, i) => i + 1);

  return (
    <div className={`grid ${columns} ${gap}`}>
      {displayItems.map((item, index) => (
        renderItem ? renderItem(item, index) : defaultRenderItem(item, index)
      ))}
    </div>
  );
};

export default SocialGrid; 