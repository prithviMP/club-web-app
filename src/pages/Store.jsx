
import { useState, useEffect } from 'react';
import { brandService, productService } from '../services';
import ProductCard from '../components/product/ProductCard';
import { XMarkIcon, StarIcon, FunnelIcon as FilterIcon } from '@heroicons/react/24/outline';

const Store = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [ratingSearch, setRatingSearch] = useState('');
  const [filters, setFilters] = useState({
    brands: [],
    ratings: []
  });
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.brand-dropdown')) {
        setShowBrandDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsResponse, brandsResponse] = await Promise.all([
          productService.getProducts(),
          brandService.getBrands()
        ]);
        setProducts(productsResponse.data);
        setBrands(brandsResponse.data);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleBrandChange = (brand) => {
    const isSelected = filters.brands.some(b => b.id === brand.id);
    if (isSelected) {
      setFilters(prev => ({
        ...prev,
        brands: prev.brands.filter(b => b.id !== brand.id)
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        brands: [...prev.brands, brand]
      }));
    }
  };

  const handleRatingChange = (rating) => {
    const isSelected = filters.ratings.some(r => r.value === rating.value);
    if (isSelected) {
      setFilters(prev => ({
        ...prev,
        ratings: prev.ratings.filter(r => r.value !== rating.value)
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        ratings: [...prev.ratings, rating]
      }));
    }
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
    setBrandSearch('');
    setRatingSearch('');
  };

  const ratings = [
    { value: '5', label: '⭐⭐⭐⭐⭐' },
    { value: '4', label: '⭐⭐⭐⭐' },
    { value: '3', label: '⭐⭐⭐' },
    { value: '2', label: '⭐⭐' },
    { value: '1', label: '⭐' }
  ];

  const FilterSection = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );

  const FiltersContent = () => (
    <>
      <FilterSection title="Search">
        <input
          type="text"
          placeholder="Search products..."
          className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </FilterSection>

      <FilterSection title="Brands">
        <input
          type="text"
          placeholder="Search brands..."
          className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-primary mb-2"
          value={brandSearch}
          onChange={(e) => setBrandSearch(e.target.value)}
        />
        <div className="max-h-48 overflow-y-auto">
          {brands
            .filter(brand => brand.brand_name.toLowerCase().includes(brandSearch.toLowerCase()))
            .map(brand => (
              <label key={brand.id} className="flex items-center gap-2 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.brands.some(b => b.id === brand.id)}
                  onChange={() => handleBrandChange(brand)}
                  className="form-checkbox h-4 w-4 text-primary rounded border-gray-600 bg-gray-700"
                />
                <span>{brand.brand_name}</span>
              </label>
            ))}
        </div>
      </FilterSection>

      <FilterSection title="Rating">
        {ratings.map(rating => (
          <label key={rating.value} className="flex items-center gap-2 py-1 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.ratings.some(r => r.value === rating.value)}
              onChange={() => handleRatingChange(rating)}
              className="form-checkbox h-4 w-4 text-primary rounded border-gray-600 bg-gray-700"
            />
            <span>{rating.label}</span>
          </label>
        ))}
      </FilterSection>
    </>
  );

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Mobile filter button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="bg-primary text-black p-4 rounded-full shadow-lg"
        >
          <FilterIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile filter drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-gray-900 p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)}>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <FiltersContent />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <FiltersContent />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {/* Selected filters */}
            {(filters.brands.length > 0 || filters.ratings.length > 0) && (
              <div className="flex flex-wrap gap-2 items-center mb-4">
                <span className="text-gray-400">Active filters:</span>
                {filters.brands.map(brand => (
                  <span
                    key={brand.id}
                    className="px-3 py-1 bg-gray-800 rounded-full text-sm flex items-center gap-2"
                  >
                    {brand.brand_name}
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
                <button
                  onClick={clearAllFilters}
                  className="text-primary text-sm hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Products grid */}
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Store;
