import { createContext, useState, useEffect, useCallback } from 'react';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const storedWishlist = localStorage.getItem('wishlist');
    if (storedWishlist) {
      try {
        setWishlist(JSON.parse(storedWishlist));
      } catch (error) {
        console.error('Error parsing wishlist from localStorage:', error);
        setWishlist([]);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isLoaded]);

  const addToWishlist = useCallback((item) => {
    setWishlist((prevWishlist) => {
      // Check if item already exists in wishlist
      const existingItem = prevWishlist.find(
        (wishlistItem) => wishlistItem.id === item.id
      );

      if (existingItem) {
        return prevWishlist;
      } else {
        return [...prevWishlist, item];
      }
    });
  }, []);

  const removeFromWishlist = useCallback((id) => {
    setWishlist((prevWishlist) => 
      prevWishlist.filter((item) => item.id !== id)
    );
  }, []);

  const isInWishlist = useCallback((id) => {
    return wishlist.some((item) => item.id === id);
  }, [wishlist]);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}; 