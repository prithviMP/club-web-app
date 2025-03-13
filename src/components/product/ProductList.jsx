import { useState, useEffect } from 'react';
import { productService } from '../../services';
import ProductCard from './ProductCard';
import Spinner from '../ui/Spinner';

const ProductList = ({ 
  title, 
  type = 'new-arrivals',
  limit,
  filters = {},
  sort = [],
  className = ''
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let response;

        const params = {
          populate: '*',
          pageSize: limit,
          filters,
          sort
        };

        switch (type) {
          case 'new-arrivals':
            response = await productService.getNewArrivals(params);
            break;
          case 'popular':
            response = await productService.getPopularProducts(params);
            break;
          case 'recommendations':
            response = await productService.getJustForYou(params);
            break;
          default:
            throw new Error('Invalid product list type');
        }

        setProducts(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [type, limit, JSON.stringify(filters), JSON.stringify(sort)]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button 
          className="mt-4 bg-primary text-black px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No products found.</p>
      </div>
    );
  }

  return (
    <div className={`py-8 ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold text-light mb-6">{title}</h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={{
              ...product,
              image: product.images?.[0]?.formats.small.url,
              rating: product.rating || 0
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductList; 