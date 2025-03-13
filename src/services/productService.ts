import { apiClient } from '../utils/api/client';
import { ENDPOINTS } from '../utils/api/config';
import { Product } from '../types/brand';

export interface ProductsResponse {
  data: Product[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface GetProductsParams {
  populate?: string;
  page?: number;
  pageSize?: number;
  filters?: Record<string, any>;
  sort?: string[];
}

class ProductService {
  async getProducts(params: GetProductsParams = {}): Promise<ProductsResponse> {
    return apiClient.get<ProductsResponse>(ENDPOINTS.PRODUCTS, {
      populate: '*',
      ...params,
    });
  }

  async getNewArrivals(params: GetProductsParams = {}): Promise<ProductsResponse> {
    return apiClient.get<ProductsResponse>(ENDPOINTS.NEW_ARRIVALS, {
      populate: '*',
      sort: ['createdAt:desc'],
      ...params,
    });
  }

  async getPopularProducts(params: GetProductsParams = {}): Promise<ProductsResponse> {
    return apiClient.get<ProductsResponse>(ENDPOINTS.POPULAR_PRODUCTS, {
      populate: '*',
      sort: ['rating:desc'],
      ...params,
    });
  }

  async getJustForYou(params: GetProductsParams = {}): Promise<ProductsResponse> {
    return apiClient.get<ProductsResponse>(ENDPOINTS.JUST_FOR_YOU, {
      populate: '*',
      ...params,
    });
  }

  async getProductsByBrand(brandId: number | string, params: GetProductsParams = {}): Promise<ProductsResponse> {
    // Use the exact string format that works in the Strapi API
    const queryParams: Record<string, any> = {
      'populate': '*',
      'filters[brand][id][$eq]': brandId,
    };

    // Add pagination parameters in the format Strapi expects
    if (params.pageSize) {
      queryParams['pagination[pageSize]'] = params.pageSize;
    } else {
      queryParams['pagination[pageSize]'] = 10; // Default pageSize
    }
    
    if (params.page) {
      queryParams['pagination[page]'] = params.page;
    }

    // Add sort parameters in the format Strapi expects
    if (params.sort && params.sort.length > 0) {
      params.sort.forEach((sortItem, index) => {
        queryParams[`sort[${index}]`] = sortItem;
      });
    }

    console.log('Query params for Strapi:', queryParams);
    
    return apiClient.get<ProductsResponse>(ENDPOINTS.PRODUCTS, queryParams);
  }

  async getProductById(id: string): Promise<{ data: Product }> {
    return apiClient.get<{ data: Product }>(`${ENDPOINTS.PRODUCTS}/${id}`, {
      populate: '*', // Get all related data including images, sizes, brand, etc.
    });
  }

  async getRelatedProducts(brandId: number, excludeProductId?: string): Promise<ProductsResponse> {
    const endpoint = ENDPOINTS.RELATED_PRODUCTS(brandId);
    const params = excludeProductId ? { excludeProductId } : {};
    
    console.log('Fetching related products:', { brandId, excludeProductId });
    return apiClient.get<ProductsResponse>(endpoint, params);
  }
}

export const productService = new ProductService(); 