import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { brandService } from '../services/brandService';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/ui/Spinner';
import { getImageSource } from '../utils/imageUtils';
import { MEDIA_URL } from '../utils/api/config';

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

  const handleViewAll = () => {
    window.location.href = `/store?brand=${brandId}`;
  };

  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching brand data for ID:', brandId);
        
        // Fetch brand details with all products
        const brandResponse = await brandService.getBrandById(brandId, {
          populate: {
            brand_logo: true,
            brand_poster: true,
            products: {
              populate: ['product_image', 'brand']
            }
          }
        });

        console.log('Brand response:', brandResponse);

        if (brandResponse && brandResponse.data) {
          setBrand(brandResponse.data);

          // Extract products from brand data
          let brandProducts = brandResponse.data.products || [];
          console.log(`Found ${brandProducts.length} products for brand`);

          if (brandProducts.length > 0) {
            // Format products to ensure consistent structure
            brandProducts = formatProducts(brandProducts);
            
            // Sort products based on page type
            if (isNewArrivals) {
              console.log('Sorting by creation date (newest first)');
              brandProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            } else if (isMostSelling) {
              console.log('Sorting by rating (highest first)');
              brandProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            }

            // Calculate pagination
            const totalItems = brandProducts.length;
            const calculatedTotalPages = Math.ceil(totalItems / pageSize);
            setTotalPages(calculatedTotalPages);

            // Get current page items
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedProducts = brandProducts.slice(startIndex, endIndex);

            console.log(`Displaying ${paginatedProducts.length} products (page ${page} of ${calculatedTotalPages})`);
            setProducts(paginatedProducts);
          } else {
            console.warn('No products found for this brand');
            setProducts([]);
          }
        } else {
          console.error('Invalid brand data received:', brandResponse);
          setError('Failed to load brand data. Please try again later.');
        }
      } catch (err) {
        console.error('Error fetching brand data:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (brandId) {
      fetchBrandData();
    } else {
      setError('Invalid brand ID');
      setLoading(false);
    }
  }, [brandId, page, isNewArrivals, isMostSelling]);

  // Format products to ensure consistent structure for ProductCard component
  const formatProducts = (products) => {
    return products.map(product => {
      return {
        id: product.id,
        documentId: product.documentId,
        name: product.name || 'Product Name',
        price: product.price || 0,
        rating: product.rating || null,
        createdAt: product.createdAt,
        in_stock: product.in_stock !== false,
        sizes: product.sizes || [],
        stock: product.stock || 10,
        product_image: product.product_image?.map(img => ({
          ...img,
          url: img.url?.startsWith('http') ? img.url : `${MEDIA_URL}${img.url}`
        })) || [],
        brand: product.brand
      };
    });
  };

  const getBrandLogo = () => {
    if (!brand?.brand_logo) return '/assets/placeholder.png';
    
    // Get the appropriate logo URL from formats or fall back to main URL
    const logo = brand.brand_logo;
    const logoUrl = logo.formats?.thumbnail?.url || logo.formats?.small?.url || logo.url;

    // Handle relative URLs by prepending the MEDIA_URL
    if (logoUrl && logoUrl.startsWith('/')) {
      return `${MEDIA_URL}${logoUrl}`;
    } else if (logoUrl) {
      return logoUrl;
    }

    return '/assets/placeholder.png';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-20 flex items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white pt-20">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="bg-red-900/30 text-white p-4 rounded-md mb-6">
            <p>{error}</p>
          </div>
          <Link 
            to="/" 
            className="bg-primary text-black px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition-colors inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="p-4 md:p-8 lg:p-16 max-w-7xl mx-auto">
        {/* Brand Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-full bg-black flex items-center justify-center overflow-hidden">
            <img src={getBrandLogo()} alt={brand?.brand_name || 'Brand'} className="h-10 w-10 object-contain" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{brand?.brand_name || 'Brand'}</h1>
            <h2 className="text-lg md:text-xl text-primary">{pageTitle}</h2>
          </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{pageTitle}</h1>
            <button 
              onClick={handleViewAll}
              className="bg-primary text-black px-4 py-2 rounded-md hover:bg-primary/90"
            >
              View All
            </button>
          </div>
        </div>

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
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No products found for this brand.</p>
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