
import { apiClient } from '../../utils/api/client';

export const shippingService = {
  saveAddress: async (addressData) => {
    try {
      const response = await apiClient.post('/shipping-infos', {
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
      const response = await apiClient.put(`/shipping-infos/${addressId}`, {
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
      await apiClient.delete(`/shipping-infos/${addressId}`);
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  },

  getSavedAddresses: async (userId) => {
    try {
      const response = await apiClient.get(`/shipping-infos?populate=*&filters[user]=${userId}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching addresses:', error);
      return [];
    }
  }
};
