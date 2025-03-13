import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHand, faBars, faStar, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faFacebookF, faTwitter } from '@fortawesome/free-brands-svg-icons';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/carousel.css";
import ProductCard from '../components/product/ProductCard';
import { brandService, productService } from '../services';
import Spinner from '../components/ui/Spinner';
import { MEDIA_URL } from '../utils/api/config';

// Custom arrow components for the slider
const NextArrow = ({ onClick }) => (
  <button
    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
    onClick={onClick}
  >
    <FontAwesomeIcon icon={faChevronRight} />
  </button>
);

const PrevArrow = ({ onClick }) => (
  <button
    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
    onClick={onClick}
  >
    <FontAwesomeIcon icon={faChevronLeft} />
  </button>
);

const getImageUrl = (image, format = 'thumbnail') => {
  if (!image) return '/placeholder-image.jpg';
  
  // If the image is already a full URL, return it
  if (image.url?.startsWith('http')) return image.url;
  
  // If we have formats and the requested format exists, use it
  if (image.formats && image.formats[format]) {
    return `${MEDIA_URL}${image.formats[format].url}`;
  }
  
  // Fallback to the original image URL
  return `${MEDIA_URL}${image.url}`;
};

const Home = () => {
  const [brands, setBrands] = useState([]);
  const [brandCollabs, setBrandCollabs] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState({
    brands: true,
    collabs: true,
    newArrivals: true,
    popular: true
  });
  const [error, setError] = useState({
    brands: null,
    collabs: null,
    newArrivals: null,
    popular: null
  });

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    customPaging: (i) => (
      <div className="w-2 h-2 mx-1 rounded-full bg-white/50 hover:bg-white transition-colors" />
    ),
    dotsClass: "slick-dots custom-dots"
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch brands
        const brandsResponse = await brandService.getBrands();
        console.log('Brands response:', brandsResponse); // Debug log
        setBrands(brandsResponse.data);
        setLoading(prev => ({ ...prev, brands: false }));
      } catch (err) {
        console.error('Error fetching brands:', err); // Debug log
        setError(prev => ({ ...prev, brands: err.message }));
        setLoading(prev => ({ ...prev, brands: false }));
      }

      try {
        // Fetch brand collaborations
        const collabsResponse = await brandService.getBrandCollabs();
        console.log('Collabs response:', collabsResponse); // Debug log
        setBrandCollabs(collabsResponse.data);
        setLoading(prev => ({ ...prev, collabs: false }));
      } catch (err) {
        console.error('Error fetching collabs:', err); // Debug log
        setError(prev => ({ ...prev, collabs: err.message }));
        setLoading(prev => ({ ...prev, collabs: false }));
      }

      try {
        // Fetch new arrivals
        setLoading(prev => ({ ...prev, newArrivals: true }));
        const newArrivalsResponse = await productService.getNewArrivals();
        if (newArrivalsResponse?.data) {
          setNewArrivals(formatProducts(newArrivalsResponse.data));
        }
        setLoading(prev => ({ ...prev, newArrivals: false }));

        // Fetch popular products
        setLoading(prev => ({ ...prev, popular: true }));
        const popularResponse = await productService.getPopularProducts();
        if (popularResponse?.data) {
          setPopularProducts(formatProducts(popularResponse.data));
        }
        setLoading(prev => ({ ...prev, popular: false }));

      } catch (err) {
        console.error('Error fetching products:', err);
        setError(prev => ({
          ...prev,
          newArrivals: 'Failed to load new arrivals',
          popular: 'Failed to load popular products'
        }));
      }
    };

    fetchData();
  }, []);

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

  const renderLoadingOrError = (section, content) => {
    if (loading[section]) {
      return (
        <div className="flex justify-center items-center py-8">
          <Spinner />
        </div>
      );
    }

    if (error[section]) {
      return (
        <div className="text-center py-8 text-red-500">
          {error[section]}
        </div>
      );
    }

    return content;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        {/* Create Your Own Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl p-6 mb-8 sm:mb-12">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2">Create Your Own</h3>
              <p className="text-sm sm:text-base mb-2">Brand Exclusive</p>
              <p className="text-sm sm:text-base mb-4">Offer for Influencers</p>
              <a 
                href="https://wa.me/919902669555" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 mt-2 bg-[#25D366] text-white px-6 py-2 rounded-full text-sm sm:text-base hover:bg-opacity-90 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contact Us
              </a>
            </div>
            {/* <img 
              src={`${MEDIA_URL}/uploads/small_Fluid_Line_x_Pound_for_Pound_Back_OS_Tees_Black_8c0a647d36.jpg`} 
              alt="T-shirt Preview" 
              className="h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40 object-contain" 
            /> */}
          </div>
        </div>

        {/* Explore Brands */}
        <section className="mb-8 sm:mb-12">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-6">Explore Brands</h3>
          {renderLoadingOrError('brands', (
            <div className="grid grid-cols-6 sm:flex sm:justify-between items-center gap-2 sm:gap-4">
              {brands.slice(0, 6).map((brand) => (
                <Link 
                  key={brand.id} 
                  to={`/brand/${brand.documentId}`} 
                  className="group transition-transform hover:scale-105 flex flex-col items-center"
                >
                  <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-gray-700 transition-colors p-2 sm:p-3">
                    <img 
                      src={getImageUrl(brand.brand_logo, 'thumbnail')}
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
          ))}
        </section>

        <style jsx>{`
          .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
          .no-scrollbar::-webkit-scrollbar {
            display: none;  /* Chrome, Safari and Opera */
          }
        `}</style>

        {/* Brand Collaborations */}
        <section className="mb-8 sm:mb-12">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-6">Brand Collaborations</h3>
          {renderLoadingOrError('collabs', (
            <div className="relative">
              <Slider {...{
                ...sliderSettings,
                responsive: [
                  {
                    breakpoint: 1024,
                    settings: {
                      slidesToShow: 1,
                      slidesToScroll: 1,
                    }
                  },
                  {
                    breakpoint: 768,
                    settings: {
                      slidesToShow: 1,
                      slidesToScroll: 1,
                    }
                  },
                  {
                    breakpoint: 480,
                    settings: {
                      slidesToShow: 1,
                      slidesToScroll: 1,
                      arrows: false,
                    }
                  }
                ]
              }}>
                {brandCollabs.map((collab) => (
                  <div key={collab.id} className="px-1">
                    <Link 
                      to={`/collab/${collab.documentId}`}
                      className="block relative aspect-[16/9] rounded-xl overflow-hidden group"
                    >
                      <img 
                        src={getImageUrl(collab.collab_image?.[0], 'medium')}
                        alt="Brand Collaboration"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent flex items-end p-4 sm:p-6">
                        <span className="text-white font-medium text-sm sm:text-base lg:text-lg">View Collection</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </Slider>
            </div>
          ))}
        </section>

        {/* New Arrivals */}
        <section className="mb-8 sm:mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold">New Arrivals</h3>
            <Link to="/products/new" className="text-primary text-sm sm:text-base hover:underline">
              View All
            </Link>
          </div>
          {renderLoadingOrError('newArrivals', (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ))}
        </section>

        {/* Popular Products */}
        <section className="mb-8 sm:mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold">Popular Products</h3>
            <Link to="/products/popular" className="text-primary text-sm sm:text-base hover:underline">
              View All
            </Link>
          </div>
          {renderLoadingOrError('popular', (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {popularProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Home; 