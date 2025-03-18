// Add type declaration for import.meta.env
interface ImportMetaEnv {
  VITE_API_URL?: string;
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Get API URL from environment or use default
const getApiBaseUrl = () => {
  // @ts-ignore - Vite specific environment variable
  return import.meta.env?.VITE_API_URL || "https://api.club-unplugged.com/api";
};

export const API_BASE_URL = getApiBaseUrl();

// Export for use in components
export const VITE_API_URL = API_BASE_URL;

// Create a separate URL for media/images that doesn't contain '/api'
export const MEDIA_URL = (() => {
  const url = new URL(API_BASE_URL);

  // // Remove 'api.' from hostname if present
  // if (url.hostname.startsWith("api.")) {
  //   url.hostname = url.hostname.replace(/^api\./, "");
  // }

  // Remove '/api' path segment if present
  url.pathname = url.pathname.replace(/\/api\/?$/, "/");

  return url.toString().replace(/\/$/, ""); // Remove trailing slash
})();

export const DEFAULT_HEADERS = {
  Accept: "application/json, text/plain, */*",
  "Content-Type": "application/json",
};

export const ENDPOINTS = {
  BRANDS: "/brands",
  BRAND_COLLABS: "/brand-collabs",
  PRODUCTS: "/products",
  NEW_ARRIVALS: "/products/new-arrivals",
  POPULAR_PRODUCTS: "/products/popular",
  JUST_FOR_YOU: "/products/recommendations",
  RELATED_PRODUCTS: (brandId: string | number) =>
    `/products/brand/${brandId}/related`,
} as const;

export const createQueryString = (params: Record<string, any>): string => {
  if (!params || Object.keys(params).length === 0) {
    return "";
  }

  // Use URLSearchParams for proper encoding of special characters
  const searchParams = new URLSearchParams();

  // Flatten nested objects for Strapi format
  const flattenParams = (obj: any, prefix = ""): Record<string, string> => {
    const result: Record<string, string> = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}[${key}]` : key;

        if (
          value !== null &&
          typeof value === "object" &&
          !Array.isArray(value)
        ) {
          // Recursively flatten nested objects
          Object.assign(result, flattenParams(value, newKey));
        } else if (Array.isArray(value)) {
          // Handle arrays like sort[0]=name:asc
          value.forEach((item, index) => {
            result[`${newKey}[${index}]`] = String(item);
          });
        } else if (value !== undefined && value !== null) {
          // Add simple key-value pair
          result[newKey] = String(value);
        }
      }
    }

    return result;
  };

  // Flatten params to Strapi format and add to searchParams
  const flatParams = flattenParams(params);
  for (const [key, value] of Object.entries(flatParams)) {
    searchParams.append(key, value);
  }

  return `?${searchParams.toString()}`;
};
