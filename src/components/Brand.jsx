
import { Link } from 'react-router-dom';
import { getImageUrl } from '../services/api';

const Brand = ({ brand }) => {
  return (
    <Link 
      to={`/brand/${brand.documentId}`}
      className="group flex flex-col items-center space-y-2 transition-transform hover:scale-105"
    >
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-800 flex items-center justify-center p-3 group-hover:bg-gray-700 transition-colors">
        <img 
          src={getImageUrl(brand.brand_logo, 'thumbnail')}
          alt={brand.brand_name}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="text-center">
        <h3 className="text-sm md:text-base font-medium group-hover:text-primary transition-colors">
          {brand.brand_name}
        </h3>
        {brand.products_count && (
          <p className="text-xs md:text-sm text-gray-400">
            {brand.products_count} Products
          </p>
        )}
      </div>
    </Link>
  );
};

export default Brand;
