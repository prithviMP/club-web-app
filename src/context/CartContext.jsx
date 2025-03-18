import { createContext, useState, useEffect, useCallback } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount - This is redundant now, but kept for clarity and potential future use.
  useEffect(() => {
    setIsLoaded(true);
  }, []);


  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addItem = useCallback((item) => {
    setCartItems((prevItems) => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(
        (cartItem) => cartItem.id === item.id && 
        (typeof cartItem.size === 'object' && typeof item.size === 'object' 
          ? cartItem.size.id === item.size.id 
          : cartItem.size === item.size)
      );

      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity,
        };
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, item];
      }
    });
  }, []);

  const removeItem = useCallback((id, size) => {
    setCartItems((prevItems) => 
      prevItems.filter((item) => !(
        item.id === id && 
        (typeof item.size === 'object' && typeof size === 'object' 
          ? item.size.id === size.id 
          : item.size === size)
      ))
    );
  }, []);

  const updateQuantity = useCallback((id, size, quantity) => {
    setCartItems((prevItems) => 
      prevItems.map((item) => 
        item.id === id && 
        (typeof item.size === 'object' && typeof size === 'object' 
          ? item.size.id === size.id 
          : item.size === size)
          ? { ...item, quantity } 
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity, 
      0
    );
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        items: cartItems,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};