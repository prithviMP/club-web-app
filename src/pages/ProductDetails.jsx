import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { WishlistContext } from "../context/WishlistContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faArrowLeft,
  faPlus,
  faMinus,
  faHeart as faHeartSolid,
  faChevronRight,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import useCartStore from "../store/cartStore";
import { toast } from "react-hot-toast";
import { formatPrice } from "../utils/imageUtils";
import Header from "../components/layout/Header";
import ProductCard from "../components/product/ProductCard";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/carousel.css";
import { productService } from "../services";
import { MEDIA_URL } from "../utils/api/config";
import Spinner from "../components/ui/Spinner";

const getImageUrl = (image, format = "medium") => {
  if (!image) return "/placeholder-image.jpg";

  // If the image is already a full URL, return it
  if (image.url?.startsWith("http")) return image.url;

  // If we have formats and the requested format exists, use it
  if (image.formats && image.formats[format]) {
    return `${MEDIA_URL}${image.formats[format].url}`;
  }

  // Fallback to the original image URL
  return `${MEDIA_URL}${image.url}`;
};

// Custom arrow components for the slider
const NextArrow = ({ onClick }) => (
  <button
    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
    onClick={onClick}
  >
    <FontAwesomeIcon icon={faChevronRight} />
  </button>
);

const PrevArrow = ({ onClick }) => (
  <button
    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
    onClick={onClick}
  >
    <FontAwesomeIcon icon={faChevronLeft} />
  </button>
);

const ProductDetails = () => {
  const { id } = useParams();
  const { addItem } = useCartStore();
  const { wishlist, addToWishlist, removeFromWishlist } =
    useContext(WishlistContext);

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [brandProducts, setBrandProducts] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingBrandProducts, setLoadingBrandProducts] = useState(false);
  const [loadingRelatedProducts, setLoadingRelatedProducts] = useState(false);

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    customPaging: (i) => (
      <div className="w-2 h-2 mx-1 rounded-full bg-white/50 hover:bg-white transition-colors" />
    ),
    dotsClass: "slick-dots custom-dots",
  };

  // Check if product is in wishlist
  const isInWishlist = product
    ? wishlist.some((item) => item.id === product.id)
    : false;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log("Fetching product with ID:", id);
        const response = await productService.getProductById(id);
        console.log("Product details response:", response);
        setProduct(response.data);

        // Set default selected size if available
        if (response.data.sizes && response.data.sizes.length > 0) {
          setSelectedSize(response.data.sizes[0]);
        }

        // Fetch brand products if we have a brand ID
        if (response.data?.brand?.id) {
          await fetchBrandProducts(response.data.brand.id, response.data.id);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message || "Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchBrandProducts = async (brandId, currentProductId) => {
    setLoadingBrandProducts(true);
    try {
      console.log("Fetching related products for brand:", brandId);
      const response = await productService.getRelatedProducts(
        brandId,
        currentProductId,
      );

      console.log("Related products response:", response);
      if (response?.data) {
        setBrandProducts(response.data);
      } else {
        console.error("Invalid response format:", response);
        setBrandProducts([]);
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
      setBrandProducts([]);
    } finally {
      setLoadingBrandProducts(false);
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleQuantityChange = (increment) => {
    setQuantity((prev) => Math.max(1, prev + increment));
  };

  const handleAddToCart = () => {
    if (!selectedSize && product?.sizes?.length > 0) {
      showPopupMessage("Please select a size");
      return;
    }

    const cartItem = {
      id: product.id,
      product_name: product.name,
      price: product.price,
      quantity: quantity,
      size: selectedSize,
      stockAvailable: product?.stock || 10,
      product_image: product?.product_image || [],
    };

    addItem(cartItem);
    showPopupMessage("Added to cart!");
  };

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      removeFromWishlist(product.id);
      showPopupMessage("Removed from wishlist");
    } else {
      const wishlistItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product?.images?.[0] || "/placeholder-image.jpg",
        in_stock: product?.in_stock !== false,
      };

      addToWishlist(wishlistItem);
      showPopupMessage("Added to wishlist!");
    }
  };

  const showPopupMessage = (message) => {
    setPopupMessage(message);
    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };

  const moreFromBrand = [
    {
      id: 1,
      name: "Product Name",
      price: "$250",
      rating: 5,
      image: "/products/product2.jpg",
    },
    {
      id: 2,
      name: "Product Name",
      price: "$250",
      rating: 5,
      image: "/products/product3.jpg",
    },
  ];

  const reviews = [
    {
      id: 1,
      name: "Consumer name",
      rating: 4.0,
      comment:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus felis justo, lacinia ac accumsan ut, efficitur elit.",
      avatar: "/avatars/user1.jpg",
    },
  ];

  const brandStats = {
    successfulOrders: "30K+",
    averageRating: "4.5",
    customersRated: "3K+",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 pb-10 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-light mb-6">{error}</p>
          <Link
            to="/"
            className="bg-primary text-black px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition-colors inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-20 pb-10 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-2xl font-bold text-light mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-400 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/"
            className="bg-primary text-black px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition-colors inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main Content */}
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            {/* Image Carousel */}
            <div className="relative mb-6 lg:mb-0">
              <Slider
                {...{
                  ...sliderSettings,
                  responsive: [
                    {
                      breakpoint: 1024,
                      settings: {
                        arrows: true,
                      },
                    },
                    {
                      breakpoint: 768,
                      settings: {
                        arrows: true,
                      },
                    },
                    {
                      breakpoint: 480,
                      settings: {
                        arrows: false,
                      },
                    },
                  ],
                }}
              >
                {product.product_image?.map((image, index) => (
                  <div key={index} className="aspect-square">
                    <img
                      src={getImageUrl(image, "large")}
                      alt={`${product.name} - View ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </Slider>
            </div>

            {/* Product Info */}
            <div className="lg:pl-8">
              <div className="mb-6">
                <div className="flex justify-between items-start mb-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-1">
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-yellow-400"
                      />
                      <span className="ml-1">{product?.rating || "0.0"}</span>
                    </div>
                    <span className="text-sm text-gray-400">
                      ({product?.totalRatings || "0"})
                    </span>
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-primary mb-4">
                  ₹{product.price.toFixed(2)}
                </p>
                <p className="text-gray-400 text-sm sm:text-base mb-4">
                  {product.description}
                </p>
              </div>

              {/* Size Selection */}
              {product?.sizes?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm sm:text-base mb-3">Size</h3>
                  <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size.id}
                        className={`py-2 sm:py-3 rounded-lg text-sm font-medium transition-colors
                          ${
                            selectedSize?.id === size.id
                              ? "bg-primary text-white"
                              : "bg-secondary text-white hover:bg-gray-700"
                          }`}
                        onClick={() => handleSizeSelect(size)}
                        disabled={size.number_of_items === 0}
                      >
                        {size.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="text-sm sm:text-base mb-3">Quantity</h3>
                <div className="flex items-center gap-3 bg-secondary rounded-lg p-2 w-fit">
                  <button
                    className="text-primary text-xl w-10 h-10 flex items-center justify-center hover:bg-gray-700 rounded-lg transition-colors"
                    onClick={() => handleQuantityChange(-1)}
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-lg">{quantity}</span>
                  <button
                    className="text-primary text-xl w-10 h-10 flex items-center justify-center hover:bg-gray-700 rounded-lg transition-colors"
                    onClick={() => handleQuantityChange(1)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-8">
                <button
                  className="flex-1 bg-primary text-white py-3 sm:py-4 rounded-lg font-medium text-sm sm:text-base hover:bg-opacity-90 transition-colors"
                  onClick={handleAddToCart}
                  disabled={
                    !product.in_stock ||
                    (product.sizes?.length > 0 && !selectedSize)
                  }
                >
                  {!product.in_stock ? "Out of Stock" : "Add to Cart"}
                </button>

                <button
                  className={`flex-1 py-3 sm:py-4 rounded-lg font-medium text-sm sm:text-base transition-colors ${
                    isInWishlist
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                  onClick={handleWishlistToggle}
                >
                  {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                </button>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">
                Product Details
              </h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
                felis justo, lacinia ac accumsan ut, efficitur elit.
              </p>
            </div>

            {/* About Brand */}
            {product.brand && (
              <div className="sm:col-span-2 lg:col-span-1">
                <div className="bg-secondary rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold">
                      About {product.brand.brand_name}
                    </h3>
                  </div>
                  <p className="text-gray-400 text-sm sm:text-base mb-6">
                    {product.brand.description}
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xl sm:text-2xl font-semibold">
                        {product.brand.successfulOrders || "30K+"}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">Orders</p>
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-semibold">
                        {product.rating || "4.5"}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">Rating</p>
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-semibold">
                        {product.brand.totalCustomers || "3K+"}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Customers
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg sm:text-xl font-semibold">Reviews</h3>
              <button className="text-sm sm:text-base text-primary">
                See all reviews
              </button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-secondary rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{review.name}</p>
                      <div className="flex items-center">
                        <span className="text-primary font-semibold mr-2">
                          {review.rating}
                        </span>
                        <FontAwesomeIcon
                          icon={faStar}
                          className="text-yellow-400 w-4 h-4"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm sm:text-base">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* More from Brand */}
          {product?.brand && (
            <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg sm:text-xl font-semibold">
                  More from {product.brand.brand_name}
                </h3>
                <Link
                  to={`/brands/${product.brand.id}`}
                  className="text-sm sm:text-base text-primary hover:underline"
                >
                  See all
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {loadingBrandProducts ? (
                  <div className="col-span-full text-center py-8">
                    <Spinner size="medium" />
                  </div>
                ) : brandProducts.length > 0 ? (
                  brandProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={{
                        ...product,
                        product_image: product.product_image?.map((img) => ({
                          ...img,
                          url: img.url?.startsWith("http")
                            ? img.url
                            : `${MEDIA_URL}${img.url}`,
                        })),
                      }}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center text-gray-400 py-8">
                    No other products from this brand
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Related Products */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg sm:text-xl font-semibold">
                Related Products
              </h3>
              <Link
                to="/products"
                className="text-sm sm:text-base text-primary hover:underline"
              >
                See all
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {loadingRelatedProducts ? (
                <div className="col-span-full text-center py-8">
                  <Spinner size="medium" />
                </div>
              ) : relatedProducts.length > 0 ? (
                relatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      product_image: product.product_image?.map((img) => ({
                        ...img,
                        url: img.url?.startsWith("http")
                          ? img.url
                          : `${MEDIA_URL}${img.url}`,
                      })),
                    }}
                  />
                ))
              ) : (
                <div className="col-span-full text-center text-gray-400 py-8">
                  No related products found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Popup Message */}
      <div
        className={`fixed bottom-4 right-4 bg-gray-800 text-light px-6 py-3 rounded-md shadow-lg transition-opacity duration-300 ${
          showPopup ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {popupMessage}
      </div>
    </div>
  );
};

export default ProductDetails;
