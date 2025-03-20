
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MEDIA_URL } from '../utils/api/config';

const BrandMainCard = ({ brand }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getBrandImage = (image, format = 'thumbnail') => {
    if (!image) return '/placeholder-image.jpg';
    if (image.url?.startsWith('http')) return image.url;
    const formatUrl = image.formats?.[format]?.url || image.url;
    return formatUrl ? `${MEDIA_URL}${formatUrl}` : '/placeholder-image.jpg';
  };

  const getBrandPoster = () => {
    if (!brand.brand_poster || !Array.isArray(brand.brand_poster) || brand.brand_poster.length === 0) {
      return '/placeholder-banner.jpg';
    }
    const poster = brand.brand_poster[0];
    const posterUrl = poster.formats?.medium?.url || poster.formats?.large?.url || poster.formats?.small?.url || poster.url;
    return posterUrl ? `${MEDIA_URL}${posterUrl}` : '/placeholder-banner.jpg';
  };

  return (
    <Link 
      to={`/brand/${brand.documentId}`}
      className="flex flex-col bg-black rounded-xl overflow-hidden transition-transform hover:scale-[1.02] h-full"
    >
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center p-3 flex-shrink-0">
            <img 
              src={getBrandImage(brand.brand_logo, 'thumbnail')}
              alt={brand.brand_name}
              className="w-12 h-12 object-contain"
            />
          </div>
          <h2 className="text-2xl font-semibold text-white line-clamp-1">{brand.brand_name}</h2>
        </div>
        <div className="text-primary flex-shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      
      <div className="px-6 flex-grow">
        <div className={`text-gray-400 ${isExpanded ? '' : 'line-clamp-2'}`}>
          {brand.description}
        </div>
        {brand.description && brand.description.length > 100 && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }}
            className="text-primary text-sm mt-2 hover:underline"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>

      <div className="relative w-full h-48 mt-6 bg-gray-900 overflow-hidden">
        <img 
          src={getBrandPoster()}
          alt={`${brand.brand_name} products`}
          className="w-full h-48 object-cover"
        />
        <div className="absolute bottom-4 right-4 bg-primary text-black px-4 py-2 rounded-full text-sm font-medium">
          {brand.products?.length || 0} Products
        </div>
      </div>
    </Link>
  );
};

export default BrandMainCard;
