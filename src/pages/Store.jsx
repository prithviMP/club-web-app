import { useState, useEffect } from 'react';
import { brandService, productService } from '../services';
import ProductCard from '../components/product/ProductCard';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Store = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    brands: [],
    ratings: []
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsRes, brandsRes] = await Promise.all([
          productService.getProducts({ populate: '*' }),
          brandService.getBrands({ populate: '*' })
        ]);
        setProducts(productsRes.data || []);
        setBrands(brandsRes.data || []);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleBrandChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => ({
      id: option.value,
      name: option.label
    }));
    setFilters(prev => ({ ...prev, brands: value }));
  };

  const handleRatingChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => ({
      value: option.value,
      label: option.label
    }));
    setFilters(prev => ({ ...prev, ratings: value }));
  };

  const removeFilter = (type, itemToRemove) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].filter(item => 
        type === 'brands' ? item.id !== itemToRemove.id : item.value !== itemToRemove.value
      )
    }));
  };

  const clearAllFilters = () => {
    setFilters({ brands: [], ratings: [] });
    setSearchTerm('');
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = filters.brands.length === 0 || filters.brands.some(b => b.id === product.brand?.id?.toString());
    const matchesRating = filters.ratings.length === 0 || filters.ratings.some(r => product.rating >= parseInt(r.value));
    return matchesSearch && matchesBrand && matchesRating;
  });

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        {/* Search and Filters */}
        <div className="sticky top-16 bg-black z-10 pb-4 border-b border-gray-800">
          <div className="flex flex-col md:flex-row gap-4 items-start mb-6">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full md:w-96 px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <select
                multiple
                className="px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-primary min-h-[120px]"
                value={filters.brands.map(b => b.id)}
                onChange={handleBrandChange}
              >
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.brand_name}</option>
                ))}
              </select>
              <select
                multiple
                className="px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-primary min-h-[120px]"
                value={filters.ratings.map(r => r.value)}
                onChange={handleRatingChange}
              >
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>
          </div>

          {/* Selected Filters */}
          {(filters.brands.length > 0 || filters.ratings.length > 0 || searchTerm) && (
            <div className="flex flex-wrap gap-2 items-center mb-4">
              <span className="text-gray-400">Filters:</span>
              {filters.brands.map(brand => (
                <span
                  key={brand.id}
                  className="px-3 py-1 bg-gray-800 rounded-full text-sm flex items-center gap-2"
                >
                  {brand.name}
                  <button
                    onClick={() => removeFilter('brands', brand)}
                    className="text-gray-400 hover:text-white"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              ))}
              {filters.ratings.map(rating => (
                <span
                  key={rating.value}
                  className="px-3 py-1 bg-gray-800 rounded-full text-sm flex items-center gap-2"
                >
                  {rating.label}
                  <button
                    onClick={() => removeFilter('ratings', rating)}
                    className="text-gray-400 hover:text-white"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              ))}
              {(filters.brands.length > 0 || filters.ratings.length > 0 || searchTerm) && (
                <button
                  onClick={clearAllFilters}
                  className="text-primary text-sm hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No products found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default Store;