import { useState, useContext, memo } from "react";
import { Link } from "react-router-dom";
import { WishlistContext } from "../../context/WishlistContext";
import { getImageSource, formatPrice } from "../../utils/imageUtils";
import useCartStore from "../../store/cartStore";

const ProductCard = ({ product }) => {
  const { addItem, items } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } =
    useContext(WishlistContext);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [cartQuantity, setCartQuantity] = useState(0);

  // Get current quantity in cart for this product
  const currentCartQuantity =
    items.find((item) => item.id === product.id)?.quantity || 0;
  const maxStock = product.stock || 10;

  // Check if product is in wishlist
  const productInWishlist = isInWishlist(product.id);

  // Get optimized image for list view
  const imageUrl = getImageSource(product.product_image[0], "list");

  const handleAddToCart = () => {
    // If product is out of stock
    if (!product?.in_stock) {
      setPopupMessage("Product is out of stock");
      return;
    }

    // Handle size selection if product has sizes
    const size = product?.sizes?.length > 0 ? product.sizes[0] : null;

    // Check if adding would exceed stock
    if (currentCartQuantity + 1 > maxStock) {
      setPopupMessage(`Cannot add more than ${maxStock} items to cart`);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
      return;
    }

    if (!size && product.sizes?.length > 0) {
      setPopupMessage("No sizes available");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
      return;
    }

    setCartQuantity((prev) => prev + 1);

    // Create a complete cart item with all necessary product information
    const cartItem = {
      id: product.id,
      documentId: product.documentId,
      name: product.name,
      price: product.price,
      brand: product.brand,
      product_image: product.product_image,
      in_stock: product.in_stock,
      stock: product.stock,
      sizes: product.sizes,
      size: size,
      quantity: 1,
      rating: product.rating
    };

    console.log("Adding product to cart:", cartItem);
    addItem(cartItem);
    setPopupMessage("Added to cart!");
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2000);
  };

  const handleWishlist = () => {
    if (productInWishlist) {
      removeFromWishlist(product.id);
      setPopupMessage("Removed from wishlist!");
    } else {
      const item = {
        id: product.id,
        documentId: product.documentId,
        name: product.name,
        price: product.price,
        image: imageUrl,
        in_stock: product.in_stock,
      };

      addToWishlist(item);
      setPopupMessage("Added to wishlist!");
    }

    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2000);
  };

  return (
    <div className="card relative overflow-hidden">
      {/* Popup Message */}
      {showPopup && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up">
          {popupMessage}
        </div>
      )}

      {/* Wishlist Button */}
      <button
        className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 rounded-full p-2"
        onClick={handleWishlist}
      >
        {productInWishlist ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-primary"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        )}
      </button>

      {/* Product Image */}
      <Link to={`/product/${product.documentId}`} className="block">
        <div className="aspect-square overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/assets/placeholder.png";
            }}
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/product/${product.documentId}`} className="block">
          <h3 className="text-light font-medium text-md mb-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-primary text-sm mb-2">
          {product.brand?.brand_name || "CLUB"}
        </p>

        <div className="mt-2">
          <span className="text-light font-bold block mb-2">
            {formatPrice(product.price)}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={!product.in_stock}
            className={`w-full py-2 rounded-lg text-sm font-medium ${
              product.in_stock
                ? "bg-primary text-black hover:bg-opacity-90"
                : "bg-gray-600 text-gray-300 cursor-not-allowed"
            }`}
          >
            {product.in_stock ? (
              <div className="flex items-center justify-center gap-1">
                Add to Cart
                {cartQuantity > 0 && (
                  <span className="ml-1">++{cartQuantity}</span>
                )}
              </div>
            ) : (
              "Out of Stock"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(ProductCard);