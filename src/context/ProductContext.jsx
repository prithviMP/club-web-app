import React, { createContext, useState, useEffect, useCallback } from 'react';
import { fetchProducts, fetchProductById } from '../api/productApi';

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productDetails, setProductDetails] = useState(null);

  // Fetch all products on mount
  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        
        if (data && data.length > 0) {
          setProducts(data);
          
          // Set featured products (first 4 products)
          setFeaturedProducts(data.slice(0, 4));
          
          // Set new arrivals (next 6 products)
          setNewArrivals(data.slice(4, 10));
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  // Function to get product by ID
  const getProductById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulated API call - replace with actual API call
      const mockProduct = {
        id: id,
        name: 'Sample Product',
        description: 'This is a sample product description.',
        price: '$199.99',
        images: ['/products/product1.jpg', '/products/product2.jpg', '/products/product3.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        rating: 4.5,
        totalRatings: 128,
        stock: 10,
        in_stock: true,
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLoading(false);
      return mockProduct;
    } catch (err) {
      setError('Failed to fetch product details');
      setLoading(false);
      return null;
    }
  }, []);

  // Function to set product details directly (for navigation from product list)
  const setProductDetailsDirectly = useCallback((product) => {
    setProductDetails(product);
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        featuredProducts,
        newArrivals,
        loading,
        error,
        productDetails,
        getProductById,
        setProductDetailsDirectly,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export default ProductProvider; 