import { apiClient } from '../utils/api/client';
import { ENDPOINTS } from '../utils/api/config';
import { BrandsResponse, Brand } from '../types/brand';
import { BrandCollabsResponse } from '../types/brandCollab';

interface GetBrandsParams {
  populate?: string | object;
  page?: number;
  pageSize?: number;
  filters?: Record<string, any>;
  sort?: string[];
}

class BrandService {
  async getBrands(params: GetBrandsParams = {}): Promise<BrandsResponse> {
    return apiClient.get<BrandsResponse>(ENDPOINTS.BRANDS, {
      populate: '*',
      ...params,
    });
  }

  async getBrandById(id: string | number, params: GetBrandsParams = {}): Promise<{ data: Brand }> {
    // Update populate structure to use the working query format
    const defaultPopulate = {
      populate: {
        brand_logo: true,
        brand_poster: true,
        products: {
          populate: ['product_image']
        }
      }
    };

    return apiClient.get<{ data: Brand }>(`${ENDPOINTS.BRANDS}/${id}`, {
      ...defaultPopulate,
      ...params,
    });
  }

  async getBrandCollabs(params: GetBrandsParams = {}): Promise<BrandCollabsResponse> {
    return apiClient.get<BrandCollabsResponse>(ENDPOINTS.BRAND_COLLABS, {
      populate: '*',
      ...params,
    });
  }
}

export const brandService = new BrandService(); 