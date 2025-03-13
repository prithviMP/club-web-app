const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;

export const getImageUrl = (path, size = 'original') => {
  if (!path) return null;
  return `${MEDIA_URL}/${size}/${path}`;
};

const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

const handleResponse = async (response) => {
  if (response.status === 403) {
    // Handle forbidden error
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Access denied. Please check your authentication.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'An error occurred');
  }

  return response.json();
};

const createHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...createHeaders(),
        ...options.headers,
      },
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

export const fetchBrands = async () => {
  return apiRequest('/brands');
};

export const fetchCollaborations = async () => {
  return apiRequest('/collaborations');
};

export const fetchNewArrivals = async () => {
  return apiRequest('/products/new-arrivals');
};

export const fetchPopularProducts = async () => {
  return apiRequest('/products/popular');
};

export const fetchProductById = async (id) => {
  return apiRequest(`/products/${id}`);
};

export const fetchProductsByBrand = async (brandId) => {
  return apiRequest(`/brands/${brandId}/products`);
};

// Authentication endpoints
export const login = async (credentials) => {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const register = async (userData) => {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const refreshToken = async () => {
  return apiRequest('/auth/refresh', {
    method: 'POST',
  });
};

// Error logging
export const logError = async (error) => {
  console.error('API Error:', error);
  // You can implement additional error logging here
  // For example, sending to a logging service
};