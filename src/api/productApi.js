import axios from 'axios';


// Base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_URL; // Replace with your actual API URL
const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_URL; // Replace with your actual media URL

// For development, we'll use mock data
const mockProducts = [
  {
    id: '1',
    name: 'Classic T-Shirt',
    price: 1299,
    description: 'A comfortable and stylish t-shirt for everyday wear. Made from 100% cotton.',
    brand: { brand_name: 'ClubWear' },
    in_stock: true,
    product_image: [
      {
        url: '/images/product1.jpg',
        formats: {
          thumbnail: { url: '/images/product1-thumbnail.jpg' },
          small: { url: '/images/product1-small.jpg' },
          medium: { url: '/images/product1-medium.jpg' },
          large: { url: '/images/product1-large.jpg' },
        }
      },
      {
        url: '/images/product1-2.jpg',
        formats: {
          thumbnail: { url: '/images/product1-2-thumbnail.jpg' },
          small: { url: '/images/product1-2-small.jpg' },
          medium: { url: '/images/product1-2-medium.jpg' },
          large: { url: '/images/product1-2-large.jpg' },
        }
      }
    ],
    sizes: [
      { size: 'XS', number_of_items: 5 },
      { size: 'S', number_of_items: 10 },
      { size: 'M', number_of_items: 15 },
      { size: 'L', number_of_items: 8 },
      { size: 'XL', number_of_items: 3 },
    ],
  },
  {
    id: '2',
    name: 'Slim Fit Jeans',
    price: 2499,
    description: 'Modern slim fit jeans with a comfortable stretch. Perfect for any casual occasion.',
    brand: { brand_name: 'ClubWear' },
    in_stock: true,
    product_image: [
      {
        url: '/images/product2.jpg',
        formats: {
          thumbnail: { url: '/images/product2-thumbnail.jpg' },
          small: { url: '/images/product2-small.jpg' },
          medium: { url: '/images/product2-medium.jpg' },
          large: { url: '/images/product2-large.jpg' },
        }
      }
    ],
    sizes: [
      { size: 'XS', number_of_items: 2 },
      { size: 'S', number_of_items: 7 },
      { size: 'M', number_of_items: 12 },
      { size: 'L', number_of_items: 5 },
      { size: 'XL', number_of_items: 0 },
    ],
  },
  {
    id: '3',
    name: 'Hooded Sweatshirt',
    price: 1899,
    description: 'Warm and cozy hooded sweatshirt with kangaroo pocket. Great for cooler weather.',
    brand: { brand_name: 'UrbanStyle' },
    in_stock: true,
    product_image: [
      {
        url: '/images/product3.jpg',
        formats: {
          thumbnail: { url: '/images/product3-thumbnail.jpg' },
          small: { url: '/images/product3-small.jpg' },
          medium: { url: '/images/product3-medium.jpg' },
          large: { url: '/images/product3-large.jpg' },
        }
      }
    ],
    sizes: [
      { size: 'XS', number_of_items: 0 },
      { size: 'S', number_of_items: 5 },
      { size: 'M', number_of_items: 8 },
      { size: 'L', number_of_items: 10 },
      { size: 'XL', number_of_items: 6 },
    ],
  },
  {
    id: '4',
    name: 'Athletic Shorts',
    price: 999,
    description: 'Lightweight athletic shorts with moisture-wicking technology. Perfect for workouts.',
    brand: { brand_name: 'SportMax' },
    in_stock: true,
    product_image: [
      {
        url: '/images/product4.jpg',
        formats: {
          thumbnail: { url: '/images/product4-thumbnail.jpg' },
          small: { url: '/images/product4-small.jpg' },
          medium: { url: '/images/product4-medium.jpg' },
          large: { url: '/images/product4-large.jpg' },
        }
      }
    ],
    sizes: [
      { size: 'XS', number_of_items: 3 },
      { size: 'S', number_of_items: 8 },
      { size: 'M', number_of_items: 12 },
      { size: 'L', number_of_items: 7 },
      { size: 'XL', number_of_items: 4 },
    ],
  },
  {
    id: '5',
    name: 'Casual Shirt',
    price: 1599,
    description: 'Button-up casual shirt with a modern fit. Versatile for both casual and semi-formal occasions.',
    brand: { brand_name: 'ClubWear' },
    in_stock: true,
    product_image: [
      {
        url: '/images/product5.jpg',
        formats: {
          thumbnail: { url: '/images/product5-thumbnail.jpg' },
          small: { url: '/images/product5-small.jpg' },
          medium: { url: '/images/product5-medium.jpg' },
          large: { url: '/images/product5-large.jpg' },
        }
      }
    ],
    sizes: [
      { size: 'XS', number_of_items: 2 },
      { size: 'S', number_of_items: 6 },
      { size: 'M', number_of_items: 9 },
      { size: 'L', number_of_items: 5 },
      { size: 'XL', number_of_items: 3 },
    ],
  },
  {
    id: '6',
    name: 'Winter Jacket',
    price: 3499,
    description: 'Warm winter jacket with water-resistant outer shell and insulated lining.',
    brand: { brand_name: 'OutdoorLife' },
    in_stock: true,
    product_image: [
      {
        url: '/images/product6.jpg',
        formats: {
          thumbnail: { url: '/images/product6-thumbnail.jpg' },
          small: { url: '/images/product6-small.jpg' },
          medium: { url: '/images/product6-medium.jpg' },
          large: { url: '/images/product6-large.jpg' },
        }
      }
    ],
    sizes: [
      { size: 'XS', number_of_items: 1 },
      { size: 'S', number_of_items: 4 },
      { size: 'M', number_of_items: 7 },
      { size: 'L', number_of_items: 5 },
      { size: 'XL', number_of_items: 2 },
    ],
  },
  {
    id: '7',
    name: 'Running Shoes',
    price: 2999,
    description: 'Lightweight running shoes with responsive cushioning for maximum comfort.',
    brand: { brand_name: 'SportMax' },
    in_stock: true,
    product_image: [
      {
        url: '/images/product7.jpg',
        formats: {
          thumbnail: { url: '/images/product7-thumbnail.jpg' },
          small: { url: '/images/product7-small.jpg' },
          medium: { url: '/images/product7-medium.jpg' },
          large: { url: '/images/product7-large.jpg' },
        }
      }
    ],
    sizes: [
      { size: 'XS', number_of_items: 2 },
      { size: 'S', number_of_items: 5 },
      { size: 'M', number_of_items: 8 },
      { size: 'L', number_of_items: 6 },
      { size: 'XL', number_of_items: 3 },
    ],
  },
  {
    id: '8',
    name: 'Leather Belt',
    price: 899,
    description: 'Genuine leather belt with classic buckle. A timeless accessory for any outfit.',
    brand: { brand_name: 'ClubWear' },
    in_stock: true,
    product_image: [
      {
        url: '/images/product8.jpg',
        formats: {
          thumbnail: { url: '/images/product8-thumbnail.jpg' },
          small: { url: '/images/product8-small.jpg' },
          medium: { url: '/images/product8-medium.jpg' },
          large: { url: '/images/product8-large.jpg' },
        }
      }
    ],
    sizes: [
      { size: 'XS', number_of_items: 3 },
      { size: 'S', number_of_items: 7 },
      { size: 'M', number_of_items: 10 },
      { size: 'L', number_of_items: 6 },
      { size: 'XL', number_of_items: 4 },
    ],
  },
  {
    id: '9',
    name: 'Beanie Hat',
    price: 599,
    description: 'Soft and warm beanie hat for cold weather. One size fits most.',
    brand: { brand_name: 'UrbanStyle' },
    in_stock: true,
    product_image: [
      {
        url: '/images/product9.jpg',
        formats: {
          thumbnail: { url: '/images/product9-thumbnail.jpg' },
          small: { url: '/images/product9-small.jpg' },
          medium: { url: '/images/product9-medium.jpg' },
          large: { url: '/images/product9-large.jpg' },
        }
      }
    ],
    sizes: [
      { size: 'One Size', number_of_items: 20 },
    ],
  },
  {
    id: '10',
    name: 'Sunglasses',
    price: 1299,
    description: 'Stylish sunglasses with UV protection. Perfect for sunny days.',
    brand: { brand_name: 'UrbanStyle' },
    in_stock: true,
    product_image: [
      {
        url: '/images/product10.jpg',
        formats: {
          thumbnail: { url: '/images/product10-thumbnail.jpg' },
          small: { url: '/images/product10-small.jpg' },
          medium: { url: '/images/product10-medium.jpg' },
          large: { url: '/images/product10-large.jpg' },
        }
      }
    ],
    sizes: [
      { size: 'One Size', number_of_items: 15 },
    ],
  },
];

// Function to fetch all products
export const fetchProducts = async () => {
  try {
    // For production, uncomment this:
    // const response = await axios.get(`${API_BASE_URL}/products`);
    // return response.data;
    
    // For development, use mock data:
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockProducts);
      }, 500); // Simulate network delay
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Function to fetch a single product by ID
export const fetchProductById = async (id) => {
  try {
    // For production, uncomment this:
    // const response = await axios.get(`${API_BASE_URL}/products/${id}`);
    // return response.data;
    
    // For development, use mock data:
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const product = mockProducts.find(p => p.id === id);
        if (product) {
          resolve(product);
        } else {
          reject(new Error('Product not found'));
        }
      }, 300); // Simulate network delay
    });
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error;
  }
};

// Function to get optimized image URL based on context
export const getOptimizedImageUrl = (image, context = 'detail') => {
  try {
    if (!image) {
      return null;
    }

    // If image is just a string URL, return it
    if (typeof image === 'string') {
      return image.startsWith('http') ? image : `${MEDIA_BASE_URL}${image}`;
    }

    // Handle case where image might be an array
    if (Array.isArray(image) && image.length > 0) {
      return getOptimizedImageUrl(image[0], context);
    }

    // If image has formats, select the appropriate one based on context
    if (image.formats) {
      let selectedFormat;

      switch (context) {
        case 'thumbnail':
          selectedFormat = image.formats.thumbnail;
          break;
        case 'list':
          // For lists, prefer small format, fallback to thumbnail or medium
          selectedFormat = image.formats.small || image.formats.thumbnail || image.formats.medium;
          break;
        case 'small':
          selectedFormat = image.formats.small;
          break;
        case 'medium':
          selectedFormat = image.formats.medium;
          break;
        case 'large':
          selectedFormat = image.formats.large;
          break;
        case 'detail':
        default:
          // For detail view, prefer large format, fallback to medium or original
          selectedFormat = image.formats.large || image.formats.medium;
          break;
      }

      if (selectedFormat && selectedFormat.url) {
        return `${MEDIA_BASE_URL}${selectedFormat.url}`;
      }
    }

    // Fallback to original image URL if formats not available
    return image.url ? `${MEDIA_BASE_URL}${image.url}` : null;
  } catch (error) {
    console.error('Error getting optimized image URL:', error);
    // Fallback to original URL or null
    return image && image.url ? `${MEDIA_BASE_URL}${image.url}` : null;
  }
}; 