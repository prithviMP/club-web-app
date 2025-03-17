
import { Link } from 'react-router-dom';
import { MEDIA_URL } from '../utils/api/config';

const BrandMainCard = ({ brand }) => {
  const getBrandImage = (image, format = 'thumbnail') => {
    if (!image) return '/placeholder-image.jpg';
    if (image.url?.startsWith('http')) return image.url;
    
    // Get format URL if available
    const formatUrl = image.formats?.[format]?.url || image.url;
    return formatUrl ? `${MEDIA_URL}${formatUrl}` : '/placeholder-image.jpg';
  };

  const getBrandPoster = () => {
    if (!brand.brand_poster || !Array.isArray(brand.brand_poster) || brand.brand_poster.length === 0) {
      return '/placeholder-banner.jpg';
    }
    const poster = brand.brand_poster[0];
    // Try to get medium format, fall back to largest available format
    const posterUrl = poster.formats?.medium?.url || poster.formats?.large?.url || poster.formats?.small?.url || poster.url;
    return posterUrl ? `${MEDIA_URL}${posterUrl}` : '/placeholder-banner.jpg';
  };
  return (
    <Link 
      to={`/brand/${brand.documentId}`}
      className="flex flex-col bg-black rounded-xl overflow-hidden transition-transform hover:scale-[1.02]"
    >
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center p-3">
            <img 
              src={getBrandImage(brand.brand_logo, 'thumbnail')}
              alt={brand.brand_name}
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-2xl font-semibold text-white">{brand.brand_name}</h2>
        </div>
        <div className="text-primary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      
      <p className="px-6 text-gray-400 mb-6">
        {brand.description}
      </p>

      <div className="relative w-full aspect-[16/9] bg-gray-900">
        <img 
          src={getBrandPoster()}
          alt={`${brand.brand_name} products`}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-4 right-4 bg-primary text-black px-4 py-2 rounded-full text-sm font-medium">
          {brand.products?.length || 0} Products
        </div>
      </div>
    </Link>
  );
};

export default BrandMainCard;
