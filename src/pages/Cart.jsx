import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-hot-toast";
import useCartStore from "../store/cartStore";
import { AuthContext } from "../context/AuthContext";
import { formatPrice } from "../utils/imageUtils";
import ShippingForm from "../components/checkout/ShippingForm";
import PaymentPage from "../components/checkout/PaymentPage";
import OrderConfirmation from "../components/checkout/OrderConfirmation";
import { loadRazorpayScript } from "../utils/razorpayUtils";
import * as checkoutService from "../services/checkout/checkoutService";
import { apiClient } from "../utils/api/client";
import Spinner from "../components/ui/Spinner";
import { MEDIA_URL } from "../utils/api/config";

const CHECKOUT_STEPS = {
  CART: "cart",
  SHIPPING: "shipping",
  PAYMENT: "payment",
  CONFIRMATION: "confirmation",
};

// Helper function to get the image URL
const getImageUrl = (image) => {
  if (!image) return "/assets/placeholder.png";
  if (image.url?.startsWith("http")) return image.url;
  if (image.formats && image.formats.thumbnail) {
    return `${MEDIA_URL}${image.formats.thumbnail.url}`;
  }
  return `${MEDIA_URL}${image.url}`;
};

const Cart = () => {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } =
    useCartStore();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [currentStep, setCurrentStep] = useState(CHECKOUT_STEPS.CART);
  const [checkoutStatus, setCheckoutStatus] = useState("");
  const [shippingInfo, setShippingInfo] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initialize Razorpay script
  useEffect(() => {
    const initRazorpay = async () => {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setError("Failed to load Razorpay checkout. Please try again later.");
      }
    };
    initRazorpay();
  }, []);

  const handleQuantityChange = (id, size, newValue, stockAvailable) => {
    const currentItem = items.find(
      (item) =>
        item.id === id &&
        (typeof item.size === "object" && typeof size === "object"
          ? item.size.id === size.id
          : item.size === size),
    );

    if (!currentItem) return;

    const maxStock =
      size?.number_of_items ||
      currentItem.stockAvailable ||
      stockAvailable ||
      1;
    const currentQty = currentItem.quantity;
    const newQuantity = newValue === -1 ? currentQty - 1 : currentQty + 1;

    if (newQuantity > maxStock) {
      toast?.error(`Cannot add more than ${maxStock} items`);
      return;
    }

    const validQuantity = Math.max(1, Math.min(newQuantity, maxStock));
    if (validQuantity !== currentQty) {
      updateQuantity(id, size, validQuantity);
    }
  };

  const handleShippingSubmit = (formData) => {
    setShippingInfo(formData);
    setCurrentStep(CHECKOUT_STEPS.PAYMENT);
  };

  const handlePayButtonClick = (totalAmount) => {
    setIsLoading(true);
    processCheckout(shippingInfo, totalAmount);
  };

  const handleChangeAddress = () => {
    setCurrentStep(CHECKOUT_STEPS.SHIPPING);
  };

  const processCheckout = async (shippingData, finalAmount) => {
    setIsLoading(true);
    setError(null);

    try {
      const orderItemIds = [];
      for (const item of items) {
        const orderItemPayload = {
          product: item.id,
          quantity: item.quantity,
          price: item.price,
          locale: "en",
        };
        const orderItemResponse =
          await checkoutService.createOrderItem(orderItemPayload);
        const orderItemId = orderItemResponse.data
          ? orderItemResponse.data.id
          : orderItemResponse.id;
        if (!orderItemId) {
          throw new Error("Failed to get order item ID");
        }
        orderItemIds.push(orderItemId);
      }

      const shippingInfoPayload = {
        fullName: shippingData.fullName,
        address: shippingData.address,
        city: shippingData.city,
        state: shippingData.state,
        postalCode: shippingData.postalCode,
        country: shippingData.country,
        phone: shippingData.phone,
        email: shippingData.email,
        user: user?.id,
        locale: "en",
      };

      const shippingInfoResponse =
        await checkoutService.createShippingInfo(shippingInfoPayload);
      const shippingInfoId = shippingInfoResponse.data
        ? shippingInfoResponse.data.id
        : shippingInfoResponse.id;
      if (!shippingInfoId) {
        throw new Error("Failed to get shipping info ID");
      }

      const orderDetailPayload = {
        orderItems: orderItemIds,
        total: finalAmount,
        level: "pending",
        shipping_info: shippingInfoId,
        user: user?.id,
        locale: "en",
        razorpayOrderId: "",
        razorpayPaymentId: "",
        razorpaySignature: "",
        coupon: null,
      };

      const orderDetailResponse =
        await checkoutService.createOrderDetail(orderDetailPayload);
      const orderDetail = orderDetailResponse.data
        ? orderDetailResponse.data
        : orderDetailResponse;
      if (!orderDetail || !orderDetail.id) {
        throw new Error("Failed to get order detail");
      }

      setOrderData(orderDetail);
      await displayRazorpayCheckout(orderDetail, finalAmount, shippingData);
    } catch (error) {
      console.error("Error processing checkout:", error);
      setError(
        `Failed to process checkout: ${error.message || "Unknown error"}`,
      );
      setIsLoading(false);
    }
  };

  const displayRazorpayCheckout = async (orderDetail, amount, shippingData) => {
    try {
      if (!orderDetail || !orderDetail.id) {
        throw new Error("Invalid order detail");
      }

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error("Failed to load Razorpay script");
      }

      const razorpayKey =
        import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_X9YfY2bGPwua8A";
      const razorpayOrderId = `order_${Date.now()}_${orderDetail.id}`;
      const isTestMode =
        razorpayKey.includes("test") &&
        !razorpayOrderId.startsWith("order_rzp");

      if (!isTestMode) {
        try {
          const updateId = orderDetail.documentId || orderDetail.id;
          await apiClient.put(`/order-details/${updateId}`, {
            data: { razorpayOrderId },
          });
        } catch (updateError) {
          console.error(
            "Error updating order with Razorpay order ID:",
            updateError,
          );
        }
      }

      const options = {
        key: razorpayKey,
        amount: amount * 100,
        currency: "INR",
        name: "Club Unplugged",
        description: `Order #${orderDetail.id}`,
        image: "/logo.png",
        prefill: {
          name: shippingData.fullName,
          email: shippingData.email,
          contact: shippingData.phone,
        },
        notes: {
          address: `${shippingData.address}, ${shippingData.city}, ${shippingData.state}, ${shippingData.postalCode}`,
          order_id: orderDetail.id,
        },
        theme: {
          color: "#6366F1",
        },
        ...(isTestMode
          ? {
              callback_url: window.location.href,
              redirect: true,
              receipt: `receipt_${orderDetail.id}`,
            }
          : {}),
        handler: function (response) {
          handlePaymentSuccess({
            razorpayPaymentId:
              response.razorpay_payment_id || `pay_test_${Date.now()}`,
            razorpayOrderId: response.razorpay_order_id || razorpayOrderId,
            razorpaySignature:
              response.razorpay_signature || `sig_test_${Date.now()}`,
            orderId: orderDetail.id,
          });
        },
        modal: {
          ondismiss: function () {
            handlePaymentError({
              description: "Payment cancelled by user",
              orderId: orderDetail.id,
              reason: "Payment window closed",
            });
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response) {
        handlePaymentError({
          code: response.error.code,
          description: response.error.description,
          source: response.error.source,
          step: response.error.step,
          reason: response.error.reason,
          orderId: orderDetail.id,
          metadata: response.error.metadata,
        });
      });

      paymentObject.open();
      setIsLoading(false);
    } catch (error) {
      console.error("Error displaying Razorpay checkout:", error);
      setError(
        `Failed to display payment: ${error.message || "Unknown error"}`,
      );
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async (response) => {
    try {
      setIsLoading(true);

      const updatePayload = {
        razorpayOrderId: response.razorpayOrderId,
        razorpayPaymentId: response.razorpayPaymentId,
        razorpaySignature: response.razorpaySignature,
        level: "paid",
      };

      try {
        const orderDetail =
          orderData || (await checkoutService.getOrderById(response.orderId));
        const updateId = orderDetail.documentId || response.orderId;
        await apiClient.put(`/order-details/${updateId}`, {
          data: updatePayload,
        });
      } catch (updateError) {
        console.error(
          "Error updating order with payment details:",
          updateError,
        );
      }

      const paymentDetailData = {
        orderId: response.orderId,
        amount: getTotalPrice() + 50,
        razorpayOrderId: response.razorpayOrderId,
        razorpayPaymentId: response.razorpayPaymentId,
        razorpaySignature: response.razorpaySignature,
      };

      await checkoutService.createPaymentDetail(paymentDetailData);

      try {
        const updatedOrderResponse = await checkoutService.getOrderById(
          response.orderId,
        );
        const updatedOrder = updatedOrderResponse.data
          ? updatedOrderResponse.data
          : updatedOrderResponse;
        setOrderData(updatedOrder);
      } catch (fetchError) {
        console.error("Error fetching updated order details:", fetchError);
      }

      setPaymentDetails(response);
      setIsLoading(false);
      setCurrentStep(CHECKOUT_STEPS.CONFIRMATION);
      clearCart();
    } catch (error) {
      console.error("Error processing payment:", error);
      setError(
        `Payment verification failed: ${error.message || "Unknown error"}. Please contact support with your payment ID.`,
      );
      setIsLoading(false);
    }
  };

  const handlePaymentError = async (errorData) => {
    console.error("Payment failed:", errorData);
    setError(errorData.description || "Payment failed");
    navigate("/payment-failed", { state: { errorData } });
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      window.location.href = "/login?redirect=cart";
      return;
    }
    setCurrentStep(CHECKOUT_STEPS.SHIPPING);
  };

  const renderCartItems = () => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12 px-4">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-400 mb-6 sm:text-lg">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/"
            className="inline-block bg-primary text-black px-8 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors text-base sm:text-lg"
          >
            Continue Shopping
          </Link>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold">
                Your Cart ({items.length} items)
              </h2>
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-400 text-sm flex items-center"
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
                  Clear Cart
                </button>
              )}
            </div>
            <div className="space-y-4 sm:space-y-6">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.size}`}
                  className="bg-gray-900 rounded-lg p-4 sm:p-6 flex"
                >
                  <div className="w-20 h-20 sm:w-32 sm:h-32 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={getImageUrl(item.product_image?.[0])}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-4 sm:ml-6 flex-grow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                      <div>
                        <h3 className="font-medium text-base sm:text-lg mb-1">
                          {item.product_name}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-400 mb-2">
                          Size:{" "}
                          {typeof item.size === "object"
                            ? item.size
                            : item.size}
                        </p>
                      </div>
                      <span className="font-medium text-base sm:text-lg">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4">
                      <div className="flex items-center mb-4 sm:mb-0">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              item.size,
                              -1,
                              item.stock,
                            )
                          }
                          className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                        >
                          <FontAwesomeIcon
                            icon={faMinus}
                            className="text-sm sm:text-base"
                          />
                        </button>
                        <span className="mx-4 sm:mx-6 text-base sm:text-lg">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              item.size,
                              item.quantity + 1,
                              item.stock,
                            )
                          }
                          className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                        >
                          <FontAwesomeIcon
                            icon={faPlus}
                            className="text-sm sm:text-base"
                          />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item, item?.id, item.size)}
                        className="text-red-500 text-sm sm:text-base hover:text-red-400 transition-colors flex items-center"
                      >
                        <FontAwesomeIcon icon={faTrash} className="mr-2" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 lg:mt-0">
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-6">
                Order Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-base sm:text-lg">
                  <span className="text-gray-400">Subtotal</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg">
                  <span className="text-gray-400">Shipping</span>
                  <span>{formatPrice(50)}</span>
                </div>
                <div className="border-t border-gray-800 my-4"></div>
                <div className="flex justify-between text-lg sm:text-xl font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(getTotalPrice() + 50)}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-primary text-black py-4 rounded-lg font-medium text-base sm:text-lg mt-6 hover:bg-opacity-90 transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCheckoutStep = () => {
    switch (currentStep) {
      case CHECKOUT_STEPS.SHIPPING:
        return (
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="bg-gray-900 p-6 sm:p-8 rounded-lg">
              <h2 className="text-xl sm:text-2xl font-semibold mb-6">
                Shipping Information
              </h2>
              <ShippingForm onSubmit={handleShippingSubmit} />
            </div>
          </div>
        );
      case CHECKOUT_STEPS.PAYMENT:
        return (
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <PaymentPage
              shippingInfo={shippingInfo}
              subtotal={getTotalPrice()}
              deliveryCharges={50}
              onPay={handlePayButtonClick}
              onChangeAddress={handleChangeAddress}
              currentStep={2}
            />
          </div>
        );
      case CHECKOUT_STEPS.CONFIRMATION:
        return (
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <OrderConfirmation
              order={orderData}
              paymentDetails={paymentDetails}
            />
          </div>
        );
      default:
        return renderCartItems();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-10">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 sm:p-8 rounded-lg text-center max-w-sm w-full mx-4">
            <Spinner size="large" />
            <p className="mt-4 text-base sm:text-lg">
              Processing your order...
            </p>
          </div>
        </div>
      )}
      {error && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-6">
          <div className="bg-red-900 text-white p-4 sm:p-6 rounded-lg">
            <p className="text-base sm:text-lg">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-sm sm:text-base underline mt-2 hover:text-red-200 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      {renderCheckoutStep()}
    </div>
  );
};

export default Cart;
