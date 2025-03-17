
import { useState, useEffect } from 'react';
import { fetchBrands } from '../services/api';
import Brand from './Brand';

const BrandsList = ({ limit, showCount = true, className = '' }) => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        setLoading(true);
        const response = await fetchBrands();
        const brandsData = limit ? response.data.slice(0, limit) : response.data;
        setBrands(brandsData);
      } catch (err) {
        setError('Failed to load brands');
        console.error('Error loading brands:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBrands();
  }, [limit]);

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

  return (
    <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 md:gap-6 ${className}`}>
      {brands.map((brand) => (
        <Brand key={brand.id} brand={brand} />
      ))}
    </div>
  );
};

export default BrandsList;
