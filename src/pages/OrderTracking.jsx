import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatPrice } from '../utils/imageUtils';
import * as checkoutService from '../services/checkout/checkoutService';
import Spinner from '../components/ui/Spinner';

// Order status steps
const ORDER_STATUSES = {
  pending: { step: 1, label: 'Order Placed', color: 'text-yellow-500' },
  paid: { step: 2, label: 'Payment Confirmed', color: 'text-blue-500' },
  processing: { step: 3, label: 'Processing', color: 'text-blue-500' },
  shipped: { step: 4, label: 'Shipped', color: 'text-blue-500' },
  delivered: { step: 5, label: 'Delivered', color: 'text-green-500' },
  cancelled: { step: 0, label: 'Cancelled', color: 'text-red-500' },
  failed: { step: 0, label: 'Failed', color: 'text-red-500' }
};

const OrderTracking = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Attempting to fetch order details for ID: ${orderId} (Attempt ${retryCount + 1})`);

        const orderData = await checkoutService.getOrderById(orderId);
        console.log('Order data:', orderData);

        if (orderData) {
          setOrder(orderData);
          setLoading(false);
        } else {
          throw new Error('Order data is empty or invalid');
        }
      } catch (err) {
        console.error('Error fetching order:', err);

        // If we've tried less than 3 times, retry with a delay
        if (retryCount < 2) {
          console.log(`Retrying fetch (${retryCount + 1}/3)...`);
          setRetryCount(prev => prev + 1);
          // Don't set error or loading state yet
        } else {
          setError(`We couldn't find order #${orderId}. Please check the order ID and try again.`);
          setLoading(false);
        }
      }
    };

    if (orderId) {
      // If retrying, add a delay
      if (retryCount > 0) {
        const timer = setTimeout(() => {
          fetchOrderDetails();
        }, 1000); // 1 second delay between retries
        return () => clearTimeout(timer);
      } else {
        fetchOrderDetails();
      }
    }
  }, [orderId, retryCount]);

  const handleRetry = () => {
    setRetryCount(0); // Reset retry count to trigger a fresh attempt
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-20 pb-10 px-4 flex items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="mt-4">
            {retryCount > 0 
              ? `Retrying to load order details (Attempt ${retryCount + 1}/3)...` 
              : 'Loading order details...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto bg-gray-900 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Order Tracking</h2>
          <div className="bg-red-900/30 text-white p-4 rounded-md mb-6">
            <p className="mb-4">{error}</p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={handleRetry}
                className="bg-primary text-black px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
              >
                Try Again
              </button>
              <Link 
                to="/account/orders" 
                className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                View All Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black text-white pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto bg-gray-900 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Order Tracking</h2>
          <div className="bg-yellow-200 text-black p-4 rounded-md mb-6">
            <p className="mb-4">No order found with this ID.</p>
            <Link 
              to="/account/orders" 
              className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }


  // Extract data from the API response structure
  const orderData = order.attributes || order;
  const orderDetailId = order.id;
  const createdAt = orderData.createdAt || orderData.created_at || Date.now();
  const total = orderData.total || 0;

  // Get shipping info
  const shippingInfoData = orderData.shipping_info?.data?.attributes || orderData.shipping_info || {};

  // Get order items
  const orderItems = orderData.order_items?.data || orderData.orderItems || [];

  // Get current order status
  const orderStatus = orderData.level || 'pending';
  const statusInfo = ORDER_STATUSES[orderStatus] || ORDER_STATUSES.pending;
  const currentStep = statusInfo.step;

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Order Tracking</h2>

          {/* Order Status */}
          <div className="mb-8 flex items-center justify-between"> {/* Added flex and justify-between */}
            <h3 className="text-xl font-semibold">Status: <span className={statusInfo.color}>{statusInfo.label}</span></h3>
            <p className="text-gray-400">Order ID: {orderDetailId}</p>
          </div>

          {/* Progress Bar */}
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary">
                Progress
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-primary">
                  {orderStatus === 'cancelled' || orderStatus === 'failed' 
                    ? '0%' 
                    : `${Math.min(100, (currentStep / 5) * 100)}%`}
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-800">
              <div 
                style={{ width: orderStatus === 'cancelled' || orderStatus === 'failed' 
                  ? '0%' 
                  : `${Math.min(100, (currentStep / 5) * 100)}%` 
                }} 
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                  orderStatus === 'cancelled' || orderStatus === 'failed' ? 'bg-red-500' : 'bg-primary'
                }`}
              ></div>
            </div>
          </div>

          {/* Status Steps */}
          <div className="flex justify-between items-center mt-8"> {/* Improved spacing */}
            {Object.entries(ORDER_STATUSES)
              .filter(([key]) => !['cancelled', 'failed'].includes(key))
              .sort((a, b) => a[1].step - b[1].step)
              .map(([key, { step, label }]) => (
                <div key={key} className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep >= step 
                        ? 'bg-primary text-black' 
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {step}
                  </div>
                  <span className={`text-xs mt-1 ${
                    currentStep >= step ? 'text-white' : 'text-gray-400'
                  }`}>
                    {label}
                  </span>
                </div>
              ))}
          </div>
          {/* Order Details */}
          <div className="border-t border-gray-800 pt-6 mt-6">
            <h3 className="text-xl font-semibold mb-4">Order Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-primary font-medium mb-2">Order Information</h4>
                <div className="bg-gray-800 p-4 rounded-md">
                  <p className="text-gray-400 mb-2">
                    <span className="text-white font-medium">Order ID:</span> {orderDetailId}
                  </p>
                  <p className="text-gray-400 mb-2">
                    <span className="text-white font-medium">Date:</span> {new Date(createdAt).toLocaleString()}
                  </p>
                  <p className="text-gray-400 mb-2">
                    <span className="text-white font-medium">Total:</span> {formatPrice(total)}
                  </p>
                  <p className="text-gray-400">
                    <span className="text-white font-medium">Payment Method:</span> Razorpay
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-primary font-medium mb-2">Shipping Information</h4>
                <div className="bg-gray-800 p-4 rounded-md">
                  {shippingInfoData && Object.keys(shippingInfoData).length > 0 ? (
                    <>
                      <p className="text-gray-400 mb-2">
                        <span className="text-white font-medium">Name:</span> {shippingInfoData.Fullname}
                      </p>
                      <p className="text-gray-400 mb-2">
                        <span className="text-white font-medium">Address:</span> {shippingInfoData.Address}
                      </p>
                      <p className="text-gray-400 mb-2">
                        <span className="text-white font-medium">State:</span> {shippingInfoData.state}
                      </p>
                      <p className="text-gray-400">
                        <span className="text-white font-medium">Phone:</span> {shippingInfoData.phone_no}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-400">Shipping information not available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-6">
              <h4 className="text-primary font-medium mb-2">Order Items</h4>
              <div className="bg-gray-800 rounded-md overflow-hidden">
                {orderItems && orderItems.length > 0 ? (
                  <div className="divide-y divide-gray-700">
                    {orderItems.map((item) => {
                      // Extract item data from API response structure
                      const itemData = item.attributes || item;
                      const itemId = item.id;
                      const quantity = itemData.quantity || 1;
                      const price = itemData.price || 0;

                      // Get product data
                      const productData = itemData.product?.data?.attributes || itemData.product || {};
                      const productName = productData.product_name || 'Product';
                      const productImage = productData.product_image?.[0]?.url || '';

                      return (
                        <div key={itemId} className="p-4 flex items-center">
                          <div className="w-16 h-16 bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                            {productImage && (
                              <img 
                                src={productImage} 
                                alt={productName} 
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="ml-4 flex-grow">
                            <h5 className="font-medium">{productName}</h5>
                            <p className="text-gray-400 text-sm">Quantity: {quantity}</p>
                            <p className="text-gray-400 text-sm">Price: {formatPrice(price)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatPrice(price * quantity)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="p-4 text-gray-400">No items available</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between mt-8">
            <Link 
              to="/account/orders" 
              className="bg-gray-700 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-600 transition-colors"
            >
              Back to Orders
            </Link>

            <Link 
              to="/" 
              className="bg-primary text-black px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;