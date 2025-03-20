import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faStar, faShare } from '@fortawesome/free-solid-svg-icons';
import ProductCard from '../components/product/ProductCard';
import { brandService } from '../services/brandService';
import Spinner from '../components/ui/Spinner';
import { formatPrice } from '../utils/imageUtils';
import { VITE_API_URL, MEDIA_URL } from '../utils/api/config';

const Brand = () => {
  const { brandId } = useParams();
  const [brand, setBrand] = useState(null);
  const [newArrivals, setNewArrivals] = useState([]);
  const [mostSelling, setMostSelling] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch brand details with all related data including products
        try {
          console.log('Fetching brand with ID:', brandId);
          const brandResponse = await brandService.getBrandById(brandId);

          console.log('Brand response:', brandResponse);

          if (brandResponse && brandResponse.data) {
            setBrand(brandResponse.data);

            // Extract products from the brand response if available
            const brandProducts = brandResponse.data.products || [];
            console.log('Extracted products from brand:', brandProducts);

            if (brandProducts.length > 0) {
              // Format products for display
              const formattedProducts = formatProducts(brandProducts);

              // Sort products for new arrivals (newest first based on createdAt)
              const sortedByDate = [...formattedProducts].sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
              ).slice(0, 4);
              setNewArrivals(sortedByDate);

              // Sort products for most selling (highest rating first)
              const sortedByRating = [...formattedProducts].sort((a, b) => 
                (b.rating || 0) - (a.rating || 0)
              ).slice(0, 4);
              setMostSelling(sortedByRating);

              // Extract unique categories from products
              const uniqueCategories = [];
              brandProducts.forEach(product => {
                if (product.category && !uniqueCategories.some(cat => cat.id === product.category.id)) {
                  uniqueCategories.push({
                    id: product.category.id,
                    name: product.category.name || 'Product Category',
                    image: getProductImage(product)
                  });
                }
              });

              // Use unique categories if found, otherwise use default categories
              setCategories(uniqueCategories.length > 0 ? uniqueCategories : getDefaultCategories());
            } else {
              console.warn('No products found in brand response');
              setNewArrivals([]);
              setMostSelling([]);
              setCategories(getDefaultCategories());
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
          }
        } catch (brandError) {
          console.error('Error fetching brand:', brandError);

          // Extract and display more specific error details if available
          const errorMessage = brandError?.response?.data?.error?.message || 
                              brandError?.message || 
                              'Failed to load brand data. Please try again later.';

          console.error('Error details:', {
            message: errorMessage,
            details: brandError?.response?.data?.error?.details || {}
          });

          setError(errorMessage);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error in fetchBrandData:', err);
        setError('Failed to load brand data. Please try again later.');
        setLoading(false);
      }
    };

    // Helper function to get default categories
    const getDefaultCategories = () => {
      return [
        { id: 1, name: 'Product Category', image: '/products/category1.jpg' },
        { id: 2, name: 'Product Category', image: '/products/category2.jpg' },
        { id: 3, name: 'Product Category', image: '/products/category3.jpg' },
        { id: 4, name: 'Product Category', image: '/products/category4.jpg' },
      ];
    };

    if (brandId) {
      fetchBrandData();
    }
  }, [brandId]);

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

    // Handle relative URLs by prepending the MEDIA_URL
    if (logoUrl && logoUrl.startsWith('/')) {
      console.log('Brand logo is a relative URL, prepending media URL');
      return `${MEDIA_URL}${logoUrl}`;
    } else if (logoUrl) {
      return logoUrl;
    }

    return '/brands/goat-logo.png'; // Fallback logo
  };

  // Helper function to get brand poster URL
  const getBrandPoster = () => {
    console.log('Getting brand poster from:', brand?.brand_poster);
    if (!brand || !brand.brand_poster || !brand.brand_poster.length) {
      return '/brands/goat.jpg';
    }

    // Get the first poster from the array
    const poster = brand.brand_poster[0];

    // Get the appropriate poster URL from formats or fall back to main URL
    const posterUrl = poster.formats?.large?.url || poster.formats?.medium?.url || poster.url;

    // Handle relative URLs by prepending the MEDIA_URL
    if (posterUrl && posterUrl.startsWith('/')) {
      console.log('Brand poster is a relative URL, prepending media URL');
      return `${MEDIA_URL}${posterUrl}`;
    } else if (posterUrl) {
      return posterUrl;
    }

    return '/brands/goat.jpg'; // Fallback poster
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="mt-4">Loading brand details...</p>
        </div>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="min-h-screen bg-black text-white pt-20 p-4">
        <div className="max-w-4xl mx-auto bg-gray-900 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-gray-400 mb-6">{error || 'Brand not found'}</p>
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

  const brandName = brand?.brand_name || 'Brand Name';
  const brandDescription = brand?.description || 'No description available';

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Brand Hero */}
      <div className="p-4 md:p-8 lg:p-16 max-w-7xl mx-auto">
        <div className="relative mb-6 md:mb-8">
          <img 
            src={getBrandPoster()} 
            alt={brandName} 
            className="w-full h-48 md:h-64 lg:h-96 object-cover rounded-xl"
          />
          <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 flex items-center gap-4">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-black flex items-center justify-center">
              <img src={getBrandLogo()} alt={brandName} className="h-12 w-12 md:h-16 md:w-16 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">{brandName}</h1>
              <button className="bg-primary text-white px-6 py-1 md:px-8 md:py-2 rounded-full text-sm md:text-base">
                Follow
              </button>
            </div>
          </div>
          <button className="absolute top-4 right-4 md:top-8 md:right-8 p-2 bg-black/50 rounded-full">
            <FontAwesomeIcon icon={faShare} className="text-white w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        <p className="text-gray-400 mb-8 md:text-lg md:max-w-2xl">
          {brandDescription}
        </p>

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <section className="mb-8 md:mb-12">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 className="text-lg md:text-2xl font-semibold">New Arrivals</h2>
              <Link to={`/brand/${brandId}/new-arrivals`} className="text-sm md:text-base text-gray-400 hover:text-primary transition-colors">
                See all
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Shop by Category
        {categories.length > 0 && (
          <section className="mb-8 md:mb-12">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 className="text-lg md:text-2xl font-semibold">Shop by Category</h2>
              <Link to="/categories" className="text-sm md:text-base text-gray-400 hover:text-primary transition-colors">
                See all
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categories.map(category => (
                <div key={category.id} className="bg-secondary rounded-xl p-3 hover:bg-gray-800 transition-colors">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-32 md:h-40 object-cover rounded-lg mb-2"
                  />
                  <p className="text-sm md:text-base font-medium text-primary">{category.name}</p>
                </div>
              ))}
            </div>
          </section>
        )} */}

        {/* Most Selling */}
        {mostSelling.length > 0 && (
          <section className="mb-8 md:mb-12">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 className="text-lg md:text-2xl font-semibold">Most Selling</h2>
              <Link to={`/brand/${brandId}/most-selling`} className="text-sm md:text-base text-gray-400 hover:text-primary transition-colors">
                See all
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mostSelling.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Brand;