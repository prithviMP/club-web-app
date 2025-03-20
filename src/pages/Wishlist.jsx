import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { WishlistContext } from '../context/WishlistContext';
import { CartContext } from '../context/CartContext';
import { formatPrice } from '../utils/imageUtils';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useContext(WishlistContext);
  const { addItem } = useContext(CartContext);

  const handleAddToCart = (item) => {
    // Create a cart item from the wishlist item
    const cartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      size: 'M', // Default size, in a real app you'd want to select this
      stockAvailable: 10, // Default stock, in a real app you'd get this from the API
      image: item.image,
    };

    addItem(cartItem);
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen pt-20 pb-10 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold text-light mb-8">Your Wishlist</h1>
          <div className="bg-secondary rounded-lg p-8 text-center">
            <svg 
              className="w-16 h-16 text-gray-500 mx-auto mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
            <h2 className="text-xl font-semibold text-light mb-4">Your wishlist is empty</h2>
            <p className="text-gray-400 mb-6">
              Looks like you haven't added any products to your wishlist yet.
            </p>
            <Link 
              to="/" 
              className="bg-primary text-black px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition-colors inline-block"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-light">Your Wishlist</h1>
          <button 
            className="text-red-500 hover:text-red-400 text-sm flex items-center"
            onClick={clearWishlist}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
              />
            </svg>
            Clear Wishlist
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {wishlist.map((item) => (
            <div key={item.id} className="bg-secondary rounded-lg overflow-hidden">
              {/* Product Image */}
              <Link to={`/product/${item.documentId}`} className="block">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/assets/placeholder.png';
                    }}
                  />
                </div>
              </Link>

              {/* Product Info */}
              <div className="p-4">
                <Link to={`/product/${item.id}`} className="block">
                  <h3 className="text-light font-medium text-lg mb-1 hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                </Link>

                <p className="text-primary font-bold mb-4">
                  {formatPrice(item.price)}
                </p>

                <div className="flex space-x-2">
                  <button 
                    className="w-10 h-10 bg-primary text-black rounded-md flex items-center justify-center hover:bg-opacity-90 transition-colors"
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.in_stock}
                  >
                    {item.in_stock ? '+' : '×'}
                  </button>

                  <button 
                    className="w-10 h-10 flex items-center justify-center bg-gray-700 text-red-500 rounded-md hover:bg-gray-600 transition-colors"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link 
            to="/" 
            className="bg-gray-700 text-light px-6 py-3 rounded-md font-medium hover:bg-gray-600 transition-colors inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;