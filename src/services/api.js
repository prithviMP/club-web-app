const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.club-unplugged.com/api';
export const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || 'https://media.club-unplugged.com';

export const getImageUrl = (path, size = 'original') => {
  if (!path) return '/placeholder-image.jpg';
  return `${MEDIA_URL}/${size}/${path}`;
};

const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

const handleResponse = async (response) => {
  if (response.status === 403) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Access denied. Please check your authentication.');
  }

  if (response.status === 404) {
    return { data: [] }; // Return empty array for 404 responses
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'An error occurred');
  }

  const data = await response.json();
  return { data: Array.isArray(data) ? data : data.data || [] };
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
    return { data: [] }; // Return empty array for failed requests
  }
};

export const fetchBrands = async () => {
  return apiRequest('/brands?pupulate=*');
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