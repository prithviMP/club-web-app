
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
        setBrands(response.data);
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
