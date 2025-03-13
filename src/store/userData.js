import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Create a store with persistence
const useUserDataStore = create(
  persist(
    (set, get) => ({
      user: null,
      userData: null, // Add a separate userData field for clarity
      isAuthenticated: false,
      
      // Add user data to store
      addUser: (userData) => {
        console.log('Adding user data to store:', userData);
        set({ 
          user: userData,
          userData: userData, // Set both user and userData
          isAuthenticated: true 
        });
      },
      
      // Update user data
      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData },
        userData: { ...state.userData, ...userData } // Update both user and userData
      })),
      
      // Clear user data (for logout)
      clearUserData: () => set({ 
        user: null,
        userData: null, // Clear both user and userData
        isAuthenticated: false 
      }),
      
      // Get current user data
      getUserData: () => get().userData || get().user
    }),
    {
      name: 'user-storage', // unique name for localStorage
      getStorage: () => localStorage, // Use localStorage
    }
  )
);

// Export as both named and default export
export { useUserDataStore };
export default useUserDataStore; 