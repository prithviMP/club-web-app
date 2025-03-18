import { create } from "zustand";
import { persist } from "zustand/middleware";

// Create a store with persistence
const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Add item to cart
      addItem: (item) => {
        if (!item || !item.id) {
          console.error('Invalid item being added to cart:', item);
          return;
        }

        const cartItem = {
          id: item.id,
          name: item.name || '',
          price: item.price || 0,
          size: item.size || null,
          image: item.image || null,
          quantity: 1
        };

        console.log('Adding item to cart:', cartItem);

        set((state) => {
          // Check if item already exists in cart
          const existingItemIndex = state.items.findIndex(
            (cartItem) =>
              cartItem?.id === item.id &&
              (typeof cartItem?.size === "object" &&
              typeof item?.size === "object"
                ? cartItem?.size?.id === item?.size?.id
                : cartItem?.size === item?.size),
          );

          if (existingItemIndex !== -1) {
            // Update quantity if item exists
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity:
                updatedItems[existingItemIndex].quantity + cartItem.quantity,
            };
            return { items: updatedItems };
          } else {
            // Add new item
            return { items: [...state.items, cartItem] };
          }
        });
      },

      // Remove item from cart
      removeItem: (item, id, size) => {
        console.log("Removing item from cart:", item);
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.id === id &&
                (typeof item.size === "object" && typeof size === "object"
                  ? item.size.id === size.id
                  : item.size === size)
              ),
          ),
        }));
      },

      // Update item quantity
      updateQuantity: (id, size, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id &&
            (typeof item.size === "object" && typeof size === "object"
              ? item.size.id === size.id
              : item.size === size)
              ? { ...item, quantity }
              : item,
          ),
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
          0,
        );
      },
    }),
    {
      name: "cart-storage", // unique name for localStorage
      getStorage: () => localStorage, // Use localStorage
    },
  ),
);

export default useCartStore;