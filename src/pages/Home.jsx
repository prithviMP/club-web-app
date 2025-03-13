import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../styles/carousel.css';

import ProductGrid from '../components/product/ProductGrid';
import { fetchBrands, fetchCollaborations, fetchNewArrivals, fetchPopularProducts, getImageUrl } from '../services/api';

const CustomArrow = ({ className, onClick, icon }) => (
  <button className={className} onClick={onClick}>
    <FontAwesomeIcon icon={icon} />
  </button>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-40">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="flex items-center justify-center h-40 text-red-500">
    <p>{message}</p>
  </div>
);

const Home = () => {
  const [brands, setBrands] = useState([]);
  const [collaborations, setCollaborations] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState({
    brands: true,
    collaborations: true,
    newArrivals: true,
    popularProducts: true,
  });
  const [error, setError] = useState({
    brands: null,
    collaborations: null,
    newArrivals: null,
    popularProducts: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const brandsData = await fetchBrands();
        setBrands(Array.isArray(brandsData?.data) ? brandsData.data : []);
        setLoading(prev => ({ ...prev, brands: false }));
      } catch (err) {
        console.error('Error fetching brands:', err);
        setError(prev => ({ ...prev, brands: err.message || 'Failed to load brands' }));
        setLoading(prev => ({ ...prev, brands: false }));
      }

      try {
        const collaborationsData = await fetchCollaborations();
        setCollaborations(Array.isArray(collaborationsData?.data) ? collaborationsData.data : []);
        setLoading(prev => ({ ...prev, collaborations: false }));
      } catch (err) {
        console.error('Error fetching collaborations:', err);
        setError(prev => ({ ...prev, collaborations: err.message || 'Failed to load collaborations' }));
        setLoading(prev => ({ ...prev, collaborations: false }));
      }

      try {
        const newArrivalsData = await fetchNewArrivals();
        setNewArrivals(Array.isArray(newArrivalsData?.data) ? newArrivalsData.data : []);
        setLoading(prev => ({ ...prev, newArrivals: false }));
      } catch (err) {
        console.error('Error fetching new arrivals:', err);
        setError(prev => ({ ...prev, newArrivals: err.message || 'Failed to load new arrivals' }));
        setLoading(prev => ({ ...prev, newArrivals: false }));
      }

      try {
        const popularProductsData = await fetchPopularProducts();
        setPopularProducts(Array.isArray(popularProductsData?.data) ? popularProductsData.data : []);
        setLoading(prev => ({ ...prev, popularProducts: false }));
      } catch (err) {
        console.error('Error fetching popular products:', err);
        setError(prev => ({ ...prev, popularProducts: err.message || 'Failed to load popular products' }));
        setLoading(prev => ({ ...prev, popularProducts: false }));
      }
    };

    fetchData();
  }, []);

  const renderLoadingOrError = (key, content) => {
    if (loading[key]) {
      return <LoadingSpinner />;
    }

    if (error[key]) {
      return <ErrorMessage message={error[key]} />;
    }

    if (!content || (Array.isArray(content) && content.length === 0)) {
      return <ErrorMessage message={`No ${key} available`} />;
    }

    return content;
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    prevArrow: <CustomArrow icon={faChevronLeft} />,
    nextArrow: <CustomArrow icon={faChevronRight} />,
  };

  const renderBrands = () => {
    if (!Array.isArray(brands) || brands.length === 0) {
      return null;
    }

    return (
      <div className="flex justify-between items-center overflow-x-auto no-scrollbar">
        {brands.slice(0, 6).map((brand) => (
          <Link 
            key={brand.id} 
            to={`/brand/${brand.documentId}`} 
            className="group transition-transform hover:scale-105 flex-shrink-0 mx-4 sm:mx-0"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-gray-700 transition-colors p-3">
              <img 
                src={getImageUrl(brand.brand_logo, 'thumbnail')}
                alt={brand.brand_name} 
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-center text-xs sm:text-sm mt-2 group-hover:text-primary transition-colors">
              {brand.brand_name}
            </p>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12">
        {renderLoadingOrError('collaborations', (
          <Slider {...sliderSettings}>
            {collaborations.map((collab) => (
              <div key={collab.id} className="relative aspect-[21/9] rounded-lg overflow-hidden">
                <img
                  src={getImageUrl(collab.banner_image)}
                  alt={collab.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6 sm:p-8">
                  <div className="text-white">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">{collab.title}</h2>
                    <p className="text-sm sm:text-base mb-4">{collab.description}</p>
                    <Link
                      to={`/collection/${collab.documentId}`}
                      className="inline-block bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        ))}
      </section>

      {/* Explore Brands */}
      <section className="mb-8 sm:mb-12">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-6">Explore Brands</h3>
        {renderLoadingOrError('brands', renderBrands())}
      </section>

      {/* New Arrivals */}
      <section className="mb-8 sm:mb-12">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-6">New Arrivals</h3>
        {renderLoadingOrError('newArrivals', (
          <ProductGrid products={newArrivals} />
        ))}
      </section>

      {/* Popular Products */}
      <section className="mb-8 sm:mb-12">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-6">Popular Products</h3>
        {renderLoadingOrError('popularProducts', (
          <ProductGrid products={popularProducts} />
        ))}
      </section>

      {/* Contact Section */}
      <section className="bg-gray-800 rounded-lg p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Need Help?</h3>
          <p className="text-gray-400 mb-4 sm:mb-0">Contact us on WhatsApp for quick support</p>
        </div>
        <a
          href="https://wa.me/1234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-medium hover:bg-[#22c35e] transition-colors"
        >
          <FontAwesomeIcon icon={faWhatsapp} className="text-xl" />
          <span>Chat with Us</span>
        </a>
      </section>
    </div>
  );
};

export default Home;