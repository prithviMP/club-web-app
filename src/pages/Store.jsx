import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { productService } from '../services';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/ui/Spinner';

const Store = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  const type = new URLSearchParams(location.search).get('type') || 'all';

  const titles = {
    new: 'New Arrivals',
    popular: 'Popular Products',
    all: 'All Products'
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let response;

        switch (type) {
          case 'new':
            response = await productService.getNewArrivals();
            break;
          case 'popular':
            response = await productService.getPopularProducts();
            break;
          default:
            response = await productService.getAllProducts();
        }

        if (response?.data) {
          setProducts(response.data);
        }
      } catch (err) {
        setError('Failed to load products');
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [type]);

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-8">{titles[type]}</h1>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Store;