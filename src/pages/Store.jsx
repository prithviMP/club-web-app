import { useState, useEffect } from 'react';
import { brandService, productService } from '../services';
import ProductCard from '../components/product/ProductCard';
import { Link } from 'react-router-dom';
import { MEDIA_URL } from '../utils/api/config';

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
  const [filteredProducts, setFilteredProducts] = useState([]);
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

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        {/* Brands List */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Popular Brands</h2>
          <div className="grid grid-cols-6 sm:flex sm:justify-between items-center gap-2 sm:gap-4">
            {brands.slice(0, 6).map((brand) => (
              <Link 
                key={brand.id} 
                to={`/brand/${brand.documentId}`} 
                className="group transition-transform hover:scale-105 flex flex-col items-center"
              >
                <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-gray-700 transition-colors p-2 sm:p-3">
                  <img 
                    src={brand?.brand_logo?.url ? `${MEDIA_URL}${brand.brand_logo.url}` : '/placeholder-image.jpg'} 
                    alt={brand.brand_name} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-center text-[10px] sm:text-sm mt-1 sm:mt-2 group-hover:text-primary transition-colors">
                  {brand.brand_name}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Store;