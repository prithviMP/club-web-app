import { useState, useEffect } from 'react';
import { brandService, productService } from '../services';
import ProductCard from '../components/product/ProductCard';
import { XMarkIcon, StarIcon, FunnelIcon as FilterIcon } from '@heroicons/react/24/outline';
import { Link, useSearchParams } from 'react-router-dom';
import { MEDIA_URL } from '../utils/api/config';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="mt-4 flex justify-center">
      {currentPage > 1 && (
        <button onClick={() => onPageChange(currentPage - 1)} className="px-4 py-2 bg-gray-800 text-white rounded-md mr-2">Previous</button>
      )}
      {[...Array(totalPages)].map((_, i) => (
        <button key={i + 1} onClick={() => onPageChange(i + 1)} className={`px-4 py-2 bg-gray-800 text-white rounded-md mx-1 ${currentPage === i + 1 ? 'bg-primary text-black' : ''}`}>
          {i + 1}
        </button>
      ))}
      {currentPage < totalPages && (
        <button onClick={() => onPageChange(currentPage + 1)} className="px-4 py-2 bg-gray-800 text-white rounded-md ml-2">Next</button>
      )}
    </div>
  );
};


const Store = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [filters, setFilters] = useState({
    brands: [searchParams.get('brand')].filter(Boolean),
    ratings: []
  });
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [sortType, setSortType] = useState(''); // Added sort type state
  const itemsPerPage = 12;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsResponse, brandsResponse] = await Promise.all([
          productService.getProducts(),
          brandService.getBrands()
        ]);
        const productsData = productsResponse.data;
        setProducts(productsData);
        setFilteredProducts(productsData);
        setBrands(brandsResponse.data);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(product => {
        const searchStr = `${product.name} ${product.description} ${product.brand?.brand_name || ''}`.toLowerCase();
        return searchStr.includes(query);
      });
    }

    if (filters.brands.length > 0) {
      filtered = filtered.filter(product => filters.brands.includes(product.brand?.id));
    }

    if (selectedRatings.length > 0) {
      filtered = filtered.filter(product => selectedRatings.includes(Math.floor(product.rating || 0)));
    }

    setFilteredProducts(filtered);
  }, [products, filters, searchTerm, selectedRatings]);


  const toggleBrandFilter = (brandId) => {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brandId)
        ? prev.brands.filter(id => id !== brandId)
        : [...prev.brands, brandId]
    }));
  };

  const handleRatingChange = (rating) => {
    setSelectedRatings([rating]);
  };

  const clearFilters = () => {
    setFilters({ brands: [], ratings: [] });
    setSearchTerm('');
    setBrandSearch('');
    setSelectedRatings([]);
    setSortType(''); // Clear sort type
  };

  const clearAllFilters = () => {
    clearFilters();
  };

  const handleSort = (type) => {
    setSortType(type);
    let sorted = [...filteredProducts];

    switch (type) {
      case 'price-low-high':
        sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high-low':
        sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'rating':
        sorted.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        break;
      default:
        break;
    }

    setFilteredProducts(sorted);
  };

  const FilterSidebar = ({ isMobile = false }) => (
    <div className={`${isMobile ? 'lg:hidden' : 'hidden lg:block'} bg-gray-900 p-4 rounded-lg`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        {isMobile && (
          <button
            onClick={() => setShowMobileFilters(false)}
            className="text-gray-400 hover:text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-2"
        />
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium mb-2">Brands</h4>
        <input
          type="text"
          placeholder="Search brands..."
          value={brandSearch}
          onChange={(e) => setBrandSearch(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 mb-2"
        />
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {brands
            .filter(brand => brand.brand_name.toLowerCase().includes(brandSearch.toLowerCase()))
            .map(brand => (
              <label key={brand.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand.id)}
                  onChange={() => toggleBrandFilter(brand.id)}
                  className="form-checkbox text-primary"
                />
                <span>{brand.brand_name}</span>
              </label>
            ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium mb-2">Rating</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center space-x-2">
              <input
                type="radio"
                name="rating"
                value={rating}
                checked={selectedRatings.includes(rating)}
                onChange={() => handleRatingChange(rating)}
                className="form-radio text-primary"
              />
              <span className="flex items-center">
                {[...Array(rating)].map((_, i) => (
                  <StarIcon key={i} className="h-4 w-4 text-yellow-400" />
                ))}
              </span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={clearFilters}
        className="w-full bg-primary text-black rounded-lg px-4 py-2 hover:bg-primary/90 transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );

  const currentItems = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        {(filters.brands.length > 0 || selectedRatings.length > 0 || searchTerm) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {searchTerm && (
              <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Search: {searchTerm}
                <button onClick={() => setSearchTerm('')} className="hover:text-primary">
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            )}
            {filters.brands.map(brandId => {
              const brand = brands.find(b => b.id === brandId);
              return brand ? (
                <span key={brandId} className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {brand.brand_name}
                  <button onClick={() => toggleBrandFilter(brandId)} className="hover:text-primary">
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              ) : null;
            })}
            {selectedRatings.map(rating => (
              <span key={rating} className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                {rating} Stars
                <button onClick={() => setSelectedRatings([])} className="hover:text-primary">
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            ))}
            <button
              onClick={clearAllFilters}
              className="bg-red-600 text-white px-3 py-1 rounded-full text-sm hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              Clear All Filters
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="lg:hidden fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center space-x-2 bg-primary text-black px-4 py-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
          >
            <FilterIcon className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>

        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)} />
            <div className="absolute bottom-0 left-0 right-0 h-[35vh] bg-gray-900 rounded-t-xl p-4 transform transition-transform duration-300 ease-in-out">
              <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto mb-4" />
              <div className="h-full overflow-y-auto">
                <FilterSidebar isMobile={true} />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-6">
          <div className="hidden lg:block w-64 flex-shrink-0 sticky top-24">
            <FilterSidebar />
          </div>

          <div className="flex-1 h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="mb-4">
              <h1 className="text-2xl font-bold">All Products</h1>
              <p className="text-gray-400">{filteredProducts.length} products found</p>
            </div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Products</h2>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-800 rounded-lg h-64"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentItems.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredProducts.length / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Store;