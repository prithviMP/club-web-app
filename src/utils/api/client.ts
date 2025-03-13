import { API_BASE_URL, DEFAULT_HEADERS, createQueryString } from './config';
import { getToken } from '../storage';

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

const handleResponse = async (response: Response) => {
  // Log the request URL for debugging
  console.log('\n GET', response.url, response.status, response.statusText);

  if (!response.ok) {
    // Get more detailed error information if available
    let errorData;
    try {
      const errorText = await response.text();
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        // If we can't parse the error as JSON, use the raw text
        errorData = { message: errorText };
      }
    } catch (e) {
      // If we can't get the error text, use the status text
      errorData = { message: response.statusText };
    }
    
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      errorData
    });
    
    throw new ApiError(response.status, response.statusText, errorData);
  }

  // Check if the response is empty
  const text = await response.text();
  if (!text) {
    console.log('Empty response received');
    return null;
  }

  try {
    // Try to parse the response as JSON
    const data = JSON.parse(text);
    return data;
  } catch (error) {
    console.error("Error parsing JSON response:", error);
    console.error("Response text:", text.substring(0, 200) + (text.length > 200 ? '...' : ''));
    return null;
  }
};

// Get headers with auth token if available
const getHeaders = () => {
  const headers = { ...DEFAULT_HEADERS };
  const token = getToken();
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const apiClient = {
  async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    // For specific Strapi endpoints, ensure params are in expected format
    if (endpoint === '/products' && params.filters && typeof params.filters === 'object') {
      // Log the Strapi-specific format for debugging
      console.log('Strapi query parameters (before processing):', params);
    }
    
    const queryString = createQueryString(params);
    const url = `${API_BASE_URL}${endpoint}${queryString}`;
    
    // Display the final URL that will be requested
    console.log('Making API request to:', url);
    
    // For debugging, show the URL with decoded parameters for better readability
    try {
      console.log('Decoded URL:', decodeURIComponent(url));
    } catch (e) {
      console.log('Could not decode URL for logging');
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Network error in API request:', error);
      throw error;
    }
  },

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  },

  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    return handleResponse(response);
  },
}; 