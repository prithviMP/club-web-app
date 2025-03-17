
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import { productService } from '../services';
import Spinner from '../components/ui/Spinner';

const ViewAll = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || 'all';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let response;
        
        switch (category) {
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
        console.error('Error loading products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  const getPageTitle = () => {
    switch (category) {
      case 'new':
        return 'New Arrivals';
      case 'popular':
        return 'Popular Products';
      default:
        return 'All Products';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
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
    <div className="min-h-screen bg-black text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-8">{getPageTitle()}</h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No products found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAll;
