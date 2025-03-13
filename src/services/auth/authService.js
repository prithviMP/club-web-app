import { apiClient } from '../../utils/api/client';
import userEndpoints from '../../utils/api/userEndpoints';
import { saveToken, saveUserId, deleteToken, clearAuthData } from '../../utils/storage';
import { useUserDataStore } from '../../store/userData';

// Login function
export const login = async (email, password) => {
  try {
    // Make login API call
    const data = await apiClient.post(userEndpoints.login, {
      identifier: email,
      password,
    });

    console.log("Login response data:", data);

    // Check if data exists
    if (!data) {
      throw new Error("No data received from login API");
    }

    // Check if jwt and user exist in the response
    if (!data.jwt || !data.user) {
      console.error("Invalid response format:", data);
      throw new Error("Invalid response format from login API");
    }

    // Destructure JWT and user object from the response
    const { jwt, user } = data;

    // Create user data object with all available user data
    const userData = {
      id: user.id,
      documentId: user.documentId || "",
      username: user.username,
      email: user.email,
      provider: user.provider,
      confirmed: user.confirmed,
      blocked: user.blocked,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.role,
      // Add any other available user fields here
    };

    console.log("Saving user data to store:", userData);

    // Save JWT token and user ID
    saveToken(jwt);
    saveUserId(user.id);

    // Get store function
    const addUser = useUserDataStore.getState().addUser;
    const currentUserData = useUserDataStore.getState().userData;
    const currentUser = useUserDataStore.getState().user;

    console.log("Current userData in store before update:", currentUserData);
    console.log("Current user in store before update:", currentUser);

    // Update user data store with complete user data
    addUser(userData);

    // Verify the data was properly set
    const updatedUserData = useUserDataStore.getState().userData;
    const updatedUser = useUserDataStore.getState().user;

    console.log("Updated userData in store after update:", updatedUserData);
    console.log("Updated user in store after update:", updatedUser);

    return data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error;
  }
};

// Signup function
export const signup = async (username, email, password) => {
  try {
    const data = await apiClient.post(userEndpoints.createUser, {
      username,
      email,
      password,
    });

    console.log("Signup response data:", data);

    // Check if data exists
    if (!data) {
      throw new Error("No data received from signup API");
    }

    // Check if jwt and user exist in the response
    if (!data.jwt || !data.user) {
      console.error("Invalid response format:", data);
      throw new Error("Invalid response format from signup API");
    }

    // Destructure JWT and user from response
    const { jwt, user } = data;

    // Save JWT token and user ID
    saveToken(jwt);
    saveUserId(user.id);

    // Get store function and update user data
    const addUser = useUserDataStore.getState().addUser;
    addUser(user);

    return data;
  } catch (error) {
    console.error("Signup error:", error.response?.data || error.message);
    throw error;
  }
};

// Change password function
export const changePassword = async (currentPassword, password, passwordConfirmation) => {
  try {
    const response = await apiClient.post(userEndpoints.changePassword, {
      currentPassword,
      password,
      passwordConfirmation,
    });

    return response.data;
  } catch (error) {
    console.error("Change password error:", error.response?.data || error.message);
    throw error;
  }
};

// Forgot password function
export const forgotPassword = async (email) => {
  try {
    const response = await apiClient.post(userEndpoints.forgotPassword, {
      email,
    });

    return response.data;
  } catch (error) {
    console.error("Forgot password error:", error);
    throw error;
  }
};

// Reset password function
export const resetPassword = async (data) => {
  try {
    const response = await apiClient.post(userEndpoints.resetPassword, {
      password: data.password,
      passwordConfirmation: data.passwordConfirm,
      code: data.code
    });

    return response.data;
  } catch (error) {
    console.error("Reset password error:", error);
    throw error;
  }
};

// Logout function
export const logout = () => {
  try {
    // Clear auth data from storage
    clearAuthData();

    // Clear user data from Zustand store
    const clearUserData = useUserDataStore.getState().clearUserData;
    clearUserData();
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

// Get current user profile
export const getCurrentUserProfile = async (userId) => {
  try {
    const response = await apiClient.get(userEndpoints.getUserProfile(userId));
    return response.data;
  } catch (error) {
    console.error("Get user profile error:", error);
    throw error;
  }
};

// Get user order history
export const getUserOrderHistory = async (userId) => {
  try {
    // If userId is not provided, try to get it from the store
    if (!userId) {
      const userData = useUserDataStore.getState().userData;
      const user = useUserDataStore.getState().user;
      userId = userData?.id || user?.id;
      
      console.log('getUserOrderHistory - Getting userId from store:', userId, 'userData:', userData, 'user:', user);
      
      if (!userId) {
        console.error("User ID not available for fetching order history");
        return [];
      }
    }
    
    console.log(`Fetching order history for user ${userId} with endpoint:`, userEndpoints.getUserWithOrderDetails(userId));
    
    const response = await apiClient.get(userEndpoints.getUserWithOrderDetails(userId));
    
    console.log('Order history API response:', response);
    
    // Check if response is empty or doesn't have the expected structure
    if (!response || !response.data) {
      console.log("Empty or invalid response from order history API:", response);
      return [];
    }
    
    // The response structure might be different than expected
    // Try to extract order details from different possible structures
    let orderDetails = [];
    
    if (Array.isArray(response.data)) {
      // If response.data is already an array, use it directly
      orderDetails = response.data;
    } else if (response.data.order_details) {
      // If order_details exists in the response
      if (Array.isArray(response.data.order_details)) {
        orderDetails = response.data.order_details;
      } else if (response.data.order_details.data && Array.isArray(response.data.order_details.data)) {
        orderDetails = response.data.order_details.data;
      }
    }
    
    console.log('Extracted order details:', orderDetails);
    
    return orderDetails;
  } catch (error) {
    console.error("Get user order history error:", error);
    // Return empty array instead of throwing to prevent component errors
    return [];
  }
}; 