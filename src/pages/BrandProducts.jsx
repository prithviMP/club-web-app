import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { brandService } from '../services/brandService';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/common/Spinner';
import { getImageSource } from '../utils/imageUtils';

const BrandProducts = () => {
  const { brandId } = useParams();
  const location = useLocation();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;

  // Determine the type of products to display based on the URL
  const isNewArrivals = location.pathname.includes('new-arrivals');
  const isMostSelling = location.pathname.includes('most-selling');
  const isAllProducts = !isNewArrivals && !isMostSelling;

  const pageTitle = isNewArrivals 
    ? 'New Arrivals' 
    : isMostSelling 
      ? 'Most Selling' 
      : 'All Products';

  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch brand details with all products
        const brandResponse = await brandService.getBrandById(brandId);

        if (brandResponse && brandResponse.data) {
          setBrand(brandResponse.data);

          // Extract products from brand data
          let brandProducts = brandResponse.data.products || [];

          if (brandProducts.length > 0) {
            // Sort products based on page type
            if (isNewArrivals) {
              brandProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            } else if (isMostSelling) {
              brandProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            }

            // Calculate pagination
            const totalItems = brandProducts.length;
            const calculatedTotalPages = Math.ceil(totalItems / pageSize);
            setTotalPages(calculatedTotalPages);

            // Get current page items
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            brandProducts = brandProducts.slice(startIndex, endIndex);

            setProducts(brandProducts);
          }
        }
      } catch (err) {
        console.error('Error fetching brand data:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBrandData();
  }, [brandId, page, isNewArrivals, isMostSelling]);

  const getBrandLogo = () => {
    if (!brand?.brand_logo) return null;
    return getImageSource(brand.brand_logo, 'thumbnail');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-20 flex items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="p-4 md:p-8 lg:p-16 max-w-7xl mx-auto">
        {/* Brand Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-full bg-black flex items-center justify-center">
            <img src={getBrandLogo()} alt={brand?.brand_name} className="h-8 w-8 object-contain" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{brand?.brand_name}</h1>
            <h2 className="text-lg md:text-xl text-primary">{pageTitle}</h2>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 text-white p-4 rounded-md mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-4 py-2 rounded-md ${
                      page === pageNum
                        ? 'bg-primary text-black'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No products found.</p>
            <Link 
              to={`/brand/${brandId}`} 
              className="bg-primary text-black px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition-colors inline-block"
            >
              Back to Brand
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandProducts;