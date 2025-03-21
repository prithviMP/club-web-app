import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Create a store with persistence
const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      // Add item to cart
      addItem: (item) => {
        set((state) => {
          // Check if item already exists in cart
          const existingItemIndex = state.items.findIndex(
            (cartItem) => cartItem.id === item.id && 
            (typeof cartItem.size === 'object' && typeof item.size === 'object' 
              ? cartItem.size.id === item.size.id 
              : cartItem.size === item.size)
          );

          if (existingItemIndex !== -1) {
            // Update quantity if item exists
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + item.quantity,
            };
            return { items: updatedItems };
          } else {
            // Add new item
            return { items: [...state.items, item] };
          }
        });
      },
      
      // Remove item from cart
      removeItem: (id, size) => {
        set((state) => ({
          items: state.items.filter((item) => !(
            item.id === id && 
            (typeof item.size === 'object' && typeof size === 'object' 
              ? item.size.id === size.id 
              : item.size === size)
          ))
        }));
      },
      
      // Update item quantity
      updateQuantity: (id, size, quantity) => {
        set((state) => ({
          items: state.items.map((item) => 
            item.id === id && 
            (typeof item.size === 'object' && typeof size === 'object' 
              ? item.size.id === size.id 
              : item.size === size)
              ? { ...item, quantity } 
              : item
          )
        }));
      },
      
      // Clear cart
      clearCart: () => set({ items: [] }),
      
      // Get total items count
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      // Get total price
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity, 
          0
        );
      }
    }),
    {
      name: 'cart-storage', // unique name for localStorage
      getStorage: () => localStorage, // Use localStorage
    }
  )
);

export default useCartStore; 