import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faMinus, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
import useCartStore from '../store/cartStore';
import { AuthContext } from '../context/AuthContext';
import { formatPrice } from '../utils/imageUtils';
import ShippingForm from '../components/checkout/ShippingForm';
import PaymentPage from '../components/checkout/PaymentPage';
import OrderConfirmation from '../components/checkout/OrderConfirmation';
import { loadRazorpayScript } from '../utils/razorpayUtils';
import * as checkoutService from '../services/checkout/checkoutService';
import { apiClient } from '../utils/api/client';
import Spinner from '../components/ui/Spinner';
import { MEDIA_URL } from '../utils/api/config';

// Helper function to get the image URL
const getImageUrl = (image) => {
  if (!image) return '/assets/placeholder.png';
  
  // If the image is already a full URL, return it
  if (image.url?.startsWith('http')) return image.url;
  
  // If we have formats and the thumbnail format exists, use it
  if (image.formats && image.formats.thumbnail) {
    return `${MEDIA_URL}${image.formats.thumbnail.url}`;
  }
  
  // Fallback to the original image URL
  return `${MEDIA_URL}${image.url}`;
};

const CHECKOUT_STEPS = {
  CART: 'cart',
  SHIPPING: 'shipping',
  PAYMENT: 'payment',
  CONFIRMATION: 'confirmation'
};

const Cart = () => {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [currentStep, setCurrentStep] = useState(CHECKOUT_STEPS.CART);
  const [checkoutStatus, setCheckoutStatus] = useState('');
  const [shippingInfo, setShippingInfo] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [discount, setDiscount] = useState(0);

  // Initialize Razorpay script
  useEffect(() => {
    const initRazorpay = async () => {
      console.log('Initializing Razorpay script...');
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        console.error('Failed to load Razorpay script');
        setError('Failed to load Razorpay checkout. Please try again later.');
      } else {
        console.log('Razorpay script loaded successfully, Razorpay object available:', !!window.Razorpay);
      }
    };

    initRazorpay();
  }, []);

  const handleQuantityChange = (id, size, increment, stockAvailable) => {
    // Find current item
    const currentItem = items.find(item => 
      item.id === id && 
      (typeof item.size === 'object' && typeof size === 'object' 
        ? item.size.id === size.id 
        : item.size === size)
    );
    
    if (!currentItem) return;

    // Get the available stock from the item or size
    const maxStock = size?.number_of_items || currentItem.stockAvailable || stockAvailable || 1;
    
    // Calculate new quantity
    const currentQty = currentItem.quantity;
    const newQuantity = currentQty + increment;
    
    // Show toast if trying to exceed stock
    if (newQuantity > maxStock) {
      toast?.error(`Cannot add more than ${maxStock} items`);
      return;
    }
    
    // Ensure quantity is within valid range
    const validQuantity = Math.max(1, Math.min(newQuantity, maxStock));
    
    // Only update if quantity actually changed
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
      // Set the current step to shipping
      setCurrentStep(CHECKOUT_STEPS.SHIPPING);
      
      // Step 1: Create order items for each product in cart
      const orderItemIds = [];
      
      for (const item of items) {
        const orderItemPayload = {
          product: item.id,
          quantity: item.quantity,
          price: item.price,
          locale: "en"
        };
        
        console.log('Creating order item with payload:', orderItemPayload);
        const orderItemResponse = await checkoutService.createOrderItem(orderItemPayload);
        console.log('Order item created:', orderItemResponse);
        
        // Check if the response has a data property
        const orderItemId = orderItemResponse.data ? orderItemResponse.data.id : orderItemResponse.id;
        if (!orderItemId) {
          console.error('Failed to get order item ID from response:', orderItemResponse);
          throw new Error('Failed to get order item ID');
        }
        
        orderItemIds.push(orderItemId);
      }
      
      // Step 2: Create shipping info
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
        locale: "en"
      };
      
      console.log('Creating shipping info with payload:', shippingInfoPayload);
      const shippingInfoResponse = await checkoutService.createShippingInfo(shippingInfoPayload);
      console.log('Shipping info created:', shippingInfoResponse);
      
      // Check if the response has a data property
      const shippingInfoId = shippingInfoResponse.data ? shippingInfoResponse.data.id : shippingInfoResponse.id;
      if (!shippingInfoId) {
        console.error('Failed to get shipping info ID from response:', shippingInfoResponse);
        throw new Error('Failed to get shipping info ID');
      }
      
      // Step 3: Create order details
      const orderDetailPayload = {
        orderItems: orderItemIds,
        total: finalAmount,
        level: "pending",
        shipping_info: shippingInfoId,
        user: user?.id,
        locale: "en",
        razorpayOrderId: "", // Will be updated after payment
        razorpayPaymentId: "",
        razorpaySignature: "",
        coupon: null // Add coupon ID if applied
      };
      
      console.log('Creating order details with payload:', orderDetailPayload);
      const orderDetailResponse = await checkoutService.createOrderDetail(orderDetailPayload);
      console.log('Order details created:', orderDetailResponse);
      
      // Check if the response has a data property
      const orderDetail = orderDetailResponse.data ? orderDetailResponse.data : orderDetailResponse;
      if (!orderDetail || !orderDetail.id) {
        console.error('Failed to get order detail from response:', orderDetailResponse);
        throw new Error('Failed to get order detail');
      }
      
      // Store the order data
      setOrderData(orderDetail);
      
      // Step 4: Directly display Razorpay checkout
      await displayRazorpayCheckout(orderDetail, finalAmount, shippingData);
      
    } catch (error) {
      console.error('Error processing checkout:', error);
      setError(`Failed to process checkout: ${error.message || 'Unknown error'}`);
      setIsLoading(false);
    }
  };
  
  // Display Razorpay checkout directly
  const displayRazorpayCheckout = async (orderDetail, amount, shippingData) => {
    try {
      console.log('Displaying Razorpay checkout for order:', orderDetail);
      
      // Ensure orderDetail has an id
      if (!orderDetail || !orderDetail.id) {
        console.error('Invalid order detail:', orderDetail);
        throw new Error('Invalid order detail');
      }
      
      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }
      
      // Get Razorpay key from environment variables with fallback
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_X9YfY2bGPwua8A";
      console.log('Using Razorpay key:', razorpayKey);
      
      // In a real implementation, you would get the Razorpay order ID from your backend
      // For now, we'll use a placeholder that will be replaced by the actual order ID from Razorpay
      // after payment is complete
      const razorpayOrderId = `order_${Date.now()}_${orderDetail.id}`;
      
      // IMPORTANT: In a production environment, you would need to create a Razorpay order
      // through their API before displaying the checkout. This would typically be done
      // through a backend API call. The code below is for demonstration purposes only.
      
      // Check if we're using a test environment without a valid Razorpay order ID
      const isTestMode = razorpayKey.includes('test') && !razorpayOrderId.startsWith('order_rzp');
      console.log('Is test mode:', isTestMode);
      
      // Update the order with the temporary Razorpay order ID (skip in test mode)
      if (!isTestMode) {
        try {
          // Check if we have a documentId to use for the update
          const updateId = orderDetail.documentId || orderDetail.id;
          console.log(`Updating order detail with ID: ${updateId} and Razorpay order ID: ${razorpayOrderId}`);
          
          const updateResponse = await apiClient.put(`/order-details/${updateId}`, {
            data: { razorpayOrderId }
          });
          console.log('Order detail update response:', updateResponse);
        } catch (updateError) {
          console.error('Error updating order with Razorpay order ID:', updateError);
          // Continue with checkout even if update fails
          console.log('Continuing with checkout despite update error');
        }
      } else {
        console.log('Skipping order update in test mode');
      }
      
      // Display Razorpay checkout
      const options = {
        key: razorpayKey,
        amount: amount * 100, // Convert to paise for Razorpay
        currency: 'INR',
        name: 'Club Unplugged',
        description: `Order #${orderDetail.id}`,
        image: '/logo.png',
        prefill: {
          name: shippingData.fullName,
          email: shippingData.email,
          contact: shippingData.phone,
        },
        notes: {
          address: `${shippingData.address}, ${shippingData.city}, ${shippingData.state}, ${shippingData.postalCode}`,
          order_id: orderDetail.id
        },
        theme: {
          color: '#6366F1',
        },
        // For test mode, we can use these additional options
        ...(isTestMode ? {
          callback_url: window.location.href,
          redirect: true,
          receipt: `receipt_${orderDetail.id}`
        } : {}),
        handler: function (response) {
          console.log('Razorpay payment successful:', response);
          // Handle successful payment
          handlePaymentSuccess({
            razorpayPaymentId: response.razorpay_payment_id || `pay_test_${Date.now()}`,
            razorpayOrderId: response.razorpay_order_id || razorpayOrderId,
            razorpaySignature: response.razorpay_signature || `sig_test_${Date.now()}`,
            orderId: orderDetail.id,
          });
        },
        modal: {
          ondismiss: function() {
            console.log('Razorpay checkout closed');
            handlePaymentError({
              description: 'Payment cancelled by user',
              orderId: orderDetail.id,
              reason: 'Payment window closed'
            });
          }
        }
      };
      
      try {
        const paymentObject = new window.Razorpay(options);
        console.log('Razorpay object created successfully:', paymentObject);
        
        paymentObject.on('payment.failed', function (response) {
          console.log('Razorpay payment failed:', response);
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
        console.error('Error opening Razorpay:', error);
        throw new Error(`Failed to open Razorpay: ${error.message}`);
      }
      
    } catch (error) {
      console.error('Error displaying Razorpay checkout:', error);
      setError(`Failed to display payment: ${error.message || 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async (response) => {
    try {
      setIsLoading(true);
      console.log('Payment successful:', response);
      
      // Update order with Razorpay payment details
      const updatePayload = {
        razorpayOrderId: response.razorpayOrderId,
        razorpayPaymentId: response.razorpayPaymentId,
        razorpaySignature: response.razorpaySignature,
        level: "paid"
      };
      
      try {
        // Get the order detail to find the documentId
        const orderDetail = orderData || await checkoutService.getOrderById(response.orderId);
        const updateId = orderDetail.documentId || response.orderId;
        
        console.log(`Updating order detail with ID: ${updateId} and payment info:`, updatePayload);
        const updateResponse = await apiClient.put(`/order-details/${updateId}`, {
          data: updatePayload
        });
        console.log('Order update response:', updateResponse);
      } catch (updateError) {
        console.error('Error updating order with payment details:', updateError);
        // Continue with payment processing even if update fails
      }
      
      // Create payment detail record
      const paymentDetailData = {
        orderId: response.orderId,
        amount: getTotalPrice() + 50, // Total amount including shipping
        razorpayOrderId: response.razorpayOrderId,
        razorpayPaymentId: response.razorpayPaymentId,
        razorpaySignature: response.razorpaySignature
      };
      
      const paymentDetailResponse = await checkoutService.createPaymentDetail(paymentDetailData);
      console.log('Payment detail created:', paymentDetailResponse);
      
      // Fetch the complete order details
      try {
        const updatedOrderResponse = await checkoutService.getOrderById(response.orderId);
        console.log('Updated order details:', updatedOrderResponse);
        
        const updatedOrder = updatedOrderResponse.data ? updatedOrderResponse.data : updatedOrderResponse;
        setOrderData(updatedOrder);
      } catch (fetchError) {
        console.error('Error fetching updated order details:', fetchError);
        // Use the existing order data if fetch fails
      }
      
      // Update state
      setPaymentDetails(response);
      setIsLoading(false);
      setCurrentStep(CHECKOUT_STEPS.CONFIRMATION);
      
      // Clear the cart
      clearCart();
      
    } catch (error) {
      console.error('Error processing payment:', error);
      setError(`Payment verification failed: ${error.message || 'Unknown error'}. Please contact support with your payment ID.`);
      setIsLoading(false);
    }
  };

  const handlePaymentError = async (errorData) => {
    console.error('Payment failed:', errorData);
    
    try {
      // Update order with error details
      const updatePayload = {
        level: "failed",
        errorDetails: JSON.stringify(errorData)
      };
      
      try {
        // Get the order detail to find the documentId
        const orderDetail = orderData || await checkoutService.getOrderById(errorData.orderId);
        const updateId = orderDetail.documentId || errorData.orderId;
        
        console.log(`Updating order detail with ID: ${updateId} for payment failure:`, updatePayload);
        const updateResponse = await apiClient.put(`/order-details/${updateId}`, {
          data: updatePayload
        });
        console.log('Order update response for failed payment:', updateResponse);
      } catch (updateError) {
        console.error('Error updating order with failure details:', updateError);
        // Continue even if update fails
      }
      
    } catch (error) {
      console.error('Error handling payment failure:', error);
    }
    
    setError(`Payment failed: ${errorData.description || errorData.reason || 'Unknown error'}. Please try again or contact support.`);
    setIsLoading(false);
    setCurrentStep(CHECKOUT_STEPS.CART);
  };

  const handleCheckout = () => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      // Save cart state and redirect to login
      window.location.href = '/login?redirect=cart';
      return;
    }
    
    setCurrentStep(CHECKOUT_STEPS.SHIPPING);
  };

  // Render different steps based on current step
  const renderCheckoutStep = () => {
    switch (currentStep) {
      case CHECKOUT_STEPS.CART:
        return renderCartItems();
      
      case CHECKOUT_STEPS.SHIPPING:
        return (
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="bg-gray-900 p-6 sm:p-8 rounded-lg">
              <h2 className="text-xl sm:text-2xl font-semibold mb-6">Shipping Information</h2>
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

  const renderCartItems = () => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12 px-4">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-gray-400 mb-6 sm:text-lg">Looks like you haven't added any items to your cart yet.</p>
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
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6">Your Cart ({items.length} items)</h2>
            
            <div className="space-y-4 sm:space-y-6">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="bg-gray-900 rounded-lg p-4 sm:p-6 flex">
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
                        <h3 className="font-medium text-base sm:text-lg mb-1">{item.product_name}</h3>
                        <p className="text-sm sm:text-base text-gray-400 mb-2">
                          Size: {typeof item.size === 'object' ? item.size.name : item.size}
                        </p>
                      </div>
                      <span className="font-medium text-base sm:text-lg">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4">
                      <div className="flex items-center mb-4 sm:mb-0">
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.size, item.quantity - 1, item.stock)}
                          className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                        >
                          <FontAwesomeIcon icon={faMinus} className="text-sm sm:text-base" />
                        </button>
                        
                        <span className="mx-4 sm:mx-6 text-base sm:text-lg">{item.quantity}</span>
                        
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.size, item.quantity + 1, item.stock)}
                          className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                        >
                          <FontAwesomeIcon icon={faPlus} className="text-sm sm:text-base" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeItem(item.id, item.size)}
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

          {/* Order Summary */}
          <div className="mt-8 lg:mt-0">
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-6">Order Summary</h3>
              
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

  // If checkout confirmation
  if (currentStep === CHECKOUT_STEPS.CONFIRMATION && orderData && paymentDetails) {
    return (
      <div className="min-h-screen pt-20 pb-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <OrderConfirmation 
            order={orderData} 
            paymentDetails={paymentDetails}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-10">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 sm:p-8 rounded-lg text-center max-w-sm w-full mx-4">
            <Spinner size="large" />
            <p className="mt-4 text-base sm:text-lg">Processing your order...</p>
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