
import { useState, useEffect } from 'react';
import { brandService, productService } from '../services';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/ui/Spinner';

const Store = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    brand: '',
    priceRange: '',
    rating: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsResponse, brandsResponse] = await Promise.all([
          productService.getProducts({ populate: '*' }),
          brandService.getBrands({ populate: '*' })
        ]);
        
        setProducts(productsResponse.data);
        setBrands(brandsResponse.data);
      } catch (err) {
        console.error('Error fetching store data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = !filters.brand || product.brand?.id === parseInt(filters.brand);
    const matchesRating = !filters.rating || product.rating >= parseInt(filters.rating);
    
    return matchesSearch && matchesBrand && matchesRating;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        {/* Search and Filters */}
        <div className="sticky top-16 bg-black z-10 pb-4 border-b border-gray-800">
          <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full md:w-96 px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex gap-4 w-full md:w-auto">
              <select
                className="px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-primary"
                value={filters.brand}
                onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.brand_name}</option>
                ))}
              </select>
              <select
                className="px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-primary"
                value={filters.rating}
                onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
              >
                <option value="">All Ratings</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>
          </div>
        </div>

        {/* Top Brands */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Top Brands</h2>
          <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
            {brands.map(brand => (
              <button
                key={brand.id}
                onClick={() => setFilters(prev => ({ ...prev, brand: brand.id.toString() }))}
                className={`flex flex-col items-center min-w-[80px] ${
                  filters.brand === brand.id.toString() ? 'text-primary' : 'text-white'
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-gray-800 p-2 mb-2">
                  <img
                    src={brand.brand_logo?.url ? `${import.meta.env.VITE_MEDIA_URL}${brand.brand_logo.url}` : '/placeholder-logo.png'}
                    alt={brand.brand_name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-sm text-center">{brand.brand_name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Products Grid */}
        <section>
          <h2 className="text-xl font-semibold mb-4">All Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No products found matching your criteria.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Store;
