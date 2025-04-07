
import { apiClient } from '../../utils/api/client';

export const shippingService = {
  saveAddress: async (addressData) => {
    try {
      const response = await apiClient.post('/shipping-addresses', {
        data: addressData
      });
      return response.data;
    } catch (error) {
      console.error('Error saving address:', error);
      throw error;
    }
  },

  updateAddress: async (addressId, addressData) => {
    try {
      const response = await apiClient.put(`/shipping-addresses/${addressId}`, {
        data: addressData
      });
      return response.data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  },

  deleteAddress: async (addressId) => {
    try {
      await apiClient.delete(`/shipping-addresses/${addressId}`);
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  },

  getSavedAddresses: async (userId) => {
    try {
      const response = await apiClient.get(`/shipping-addresses?filters[user][id][$eq]=${userId}&populate=*`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching addresses:', error);
      return [];
    }
  }
};
