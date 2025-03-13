import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import ProductCard from '../components/product/ProductCard';
import { brandService } from '../services/brandService';
import Spinner from '../components/ui/Spinner';
import { formatPrice } from '../utils/imageUtils';
import { VITE_API_URL, MEDIA_URL } from '../utils/api/config';

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
        console.log('Fetching brand data for products display:', brandId);
        const brandResponse = await brandService.getBrandById(brandId);
        
        if (brandResponse && brandResponse.data) {
          console.log('Brand response received:', brandResponse);
          setBrand(brandResponse.data);
          
          // Extract products from brand data
          const brandProducts = brandResponse.data.products || [];
          console.log(`Found ${brandProducts.length} products in brand data`);
          
          if (brandProducts.length > 0) {
            // Format products for display
            let formattedProducts = formatProducts(brandProducts);
            
            // Sort products based on page type
            if (isNewArrivals) {
              console.log('Sorting products by newest first');
              formattedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            } else if (isMostSelling) {
              console.log('Sorting products by rating');
              formattedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            }
            
            // Calculate pagination
            const totalItems = formattedProducts.length;
            const calculatedTotalPages = Math.ceil(totalItems / pageSize);
            setTotalPages(calculatedTotalPages);
            
            // Paginate the products
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedProducts = formattedProducts.slice(startIndex, endIndex);
            
            console.log(`Displaying products ${startIndex + 1}-${Math.min(endIndex, totalItems)} of ${totalItems}`);
            setProducts(paginatedProducts);
          } else {
            console.warn('No products found for brand');
            setProducts([]);
            setTotalPages(1);
          }
        } else {
          console.error('Invalid brand response:', brandResponse);
          
          // Handle both null data and error responses
          if (brandResponse && brandResponse.error) {
            console.error('API error details:', brandResponse.error);
            setError(`Failed to load brand data: ${brandResponse.error.message || 'Unknown error'}`);
          } else {
            setError('Failed to load brand data. Please try again later.');
          }
          
          setProducts([]);
          setTotalPages(1);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching brand data:', err);
        
        // Extract and display more specific error details if available
        const errorMessage = err?.response?.data?.error?.message || 
                            err?.message || 
                            'Failed to load brand data. Please try again later.';
        
        console.error('Error details:', {
          message: errorMessage,
          details: err?.response?.data?.error?.details || {}
        });
        
        setError(errorMessage);
        setLoading(false);
        setProducts([]);
        setTotalPages(1);
      }
    };
    
    if (brandId) {
      fetchBrandData();
    }
  }, [brandId, isNewArrivals, isMostSelling, page]);
  
  // Helper function to format product data for ProductCard component
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
  
  // Helper function to get product image URL
  const getProductImage = (product) => {
    if (!product) return '';
    
    // More robust check for product media in Strapi format
    // Check for images in multiple possible locations in the response structure
    
    // Option 1: Check for product.images (standard Strapi array format)
    if (product.images && Array.isArray(product.images.data) && product.images.data.length > 0) {
      const media = product.images.data[0];
      if (media.attributes && media.attributes.url) {
        const imageUrl = media.attributes.url;
        return imageUrl.startsWith('/') ? `${MEDIA_URL}${imageUrl}` : imageUrl;
      }
    }
    
    // Option 2: Check for product.thumbnail (standard Strapi single media format)
    if (product.thumbnail && product.thumbnail.data) {
      const thumb = product.thumbnail.data;
      if (thumb.attributes && thumb.attributes.url) {
        const imageUrl = thumb.attributes.url;
        return imageUrl.startsWith('/') ? `${MEDIA_URL}${imageUrl}` : imageUrl;
      }
    }
    
    // Option 3: Check for product.image (alternate field name)
    if (product.image && product.image.data) {
      const img = product.image.data;
      if (img.attributes && img.attributes.url) {
        const imageUrl = img.attributes.url;
        return imageUrl.startsWith('/') ? `${MEDIA_URL}${imageUrl}` : imageUrl;
      }
    }
    
    // Option 4: Check for legacy formats (for backward compatibility)
    if (product.product_image && product.product_image.length > 0) {
      const img = product.product_image[0];
      const imageUrl = img.url || (img.formats && (img.formats.medium?.url || img.formats.small?.url));
      if (imageUrl) {
        return imageUrl.startsWith('/') ? `${MEDIA_URL}${imageUrl}` : imageUrl;
      }
    }
    
    // Option 5: Check for flat structure (simple URL field)
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      if (typeof product.images[0] === 'string') {
        return product.images[0].startsWith('/') ? `${MEDIA_URL}${product.images[0]}` : product.images[0];
      }
      
      const img = product.images[0];
      const imageUrl = img.url || (img.formats && (img.formats.medium?.url || img.formats.small?.url));
      if (imageUrl) {
        return imageUrl.startsWith('/') ? `${MEDIA_URL}${imageUrl}` : imageUrl;
      }
    }
    
    // Default image if no product images found
    return '/img/product-placeholder.png';
  };
  
  // Helper function to get brand logo URL
  const getBrandLogo = () => {
    console.log('Getting brand logo from:', brand?.brand_logo);
    if (!brand || !brand.brand_logo) return '/brands/goat-logo.png';
    
    // Get the appropriate logo URL from formats or fall back to main URL
    const logo = brand.brand_logo;
    const logoUrl = logo.formats?.thumbnail?.url || logo.formats?.small?.url || logo.url;
    
    // Handle relative URLs by prepending the media URL
    if (logoUrl && logoUrl.startsWith('/')) {
      console.log('Brand logo is a relative URL, prepending media URL');
      return `${MEDIA_URL}${logoUrl}`;
    } else if (logoUrl) {
      return logoUrl;
    }
    
    return '/brands/goat-logo.png'; // Fallback logo
  };
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo(0, 0);
    }
  };
  
  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-black text-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="mt-4">Loading products...</p>
        </div>
      </div>
    );
  }
  
  const brandName = brand?.brand_name || 'Brand';

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="p-4 md:p-8 lg:p-16 max-w-7xl mx-auto">
        {/* Brand Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-full bg-black flex items-center justify-center">
            <img src={getBrandLogo()} alt={brandName} className="h-8 w-8 object-contain" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{brandName}</h1>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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
        
        {/* Loading more indicator */}
        {loading && page > 1 && (
          <div className="flex justify-center mt-8">
            <Spinner />
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handlePageChange(page - 1)} 
                disabled={page === 1}
                className={`px-4 py-2 rounded-md ${
                  page === 1 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                  .map((p, i, arr) => (
                    <React.Fragment key={p}>
                      {i > 0 && arr[i - 1] !== p - 1 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(p)}
                        className={`w-10 h-10 rounded-md ${
                          p === page 
                            ? 'bg-primary text-black' 
                            : 'bg-gray-800 text-white hover:bg-gray-700'
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
              </div>
              
              <button 
                onClick={() => handlePageChange(page + 1)} 
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-md ${
                  page === totalPages 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandProducts; 