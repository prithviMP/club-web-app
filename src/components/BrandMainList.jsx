
import { useState, useEffect } from 'react';
import { fetchBrands } from '../services/api';
import BrandMainCard from './BrandMainCard';

const BrandMainList = ({ className = '' }) => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        setLoading(true);
        const response = await fetchBrands();
        if (response?.data) {
          const formattedBrands = response.data.map(brand => ({
            ...brand,
            brand_logo: brand.brand_logo || brand.attributes?.brand_logo,
            brand_poster: brand.brand_poster || brand.attributes?.brand_poster,
            poster_image: brand.poster_image || brand.attributes?.poster_image
          }));
          setBrands(formattedBrands);
        }
      } catch (err) {
        console.error('Error loading brands:', err);
        setError('Failed to load brands');
      } finally {
        setLoading(false);
      }
    };

    loadBrands();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  if (!brands.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        No brands available.
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {brands.map((brand) => (
        <BrandMainCard key={brand.id} brand={brand} />
      ))}
    </div>
  );
};

export default BrandMainList;
