
import { apiClient } from '../../utils/api/client';

export interface ShippingAddress {
  id?: number;
  Fullname: string;
  Address: string;
  state: string;
  pincode: number;
  phone_no: string;
  user: number;
}

export const shippingService = {
  async saveAddress(address: ShippingAddress) {
    return apiClient.post('/shipping-infos', { data: address });
  },

  async getUserAddresses(userId: number) {
    return apiClient.get('/shipping-infos', {
      filters: {
        user: {
          id: {
            $eq: userId
          }
        }
      },
      populate: '*'
    });
  },

  async deleteAddress(addressId: number) {
    return apiClient.delete(`/shipping-infos/${addressId}`);
  }
};
