import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { formatPrice } from '../../utils/imageUtils';
import Spinner from '../ui/Spinner';
import * as checkoutService from '../../services/checkout/checkoutService';
import toast from 'react-hot-toast';

const OrderConfirmation = ({ order: propOrder, paymentDetails: propPaymentDetails }) => {
  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState(propOrder || null);
  const [paymentDetails, setPaymentDetails] = useState(propPaymentDetails || null);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse URL parameters
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const orderId = params.get('order_id');
        const paymentId = params.get('razorpay_payment_id');
        const paymentStatus = params.get('status') || params.get('razorpay_status');
        
        // If we have order data from props, use that
        if (propOrder && propPaymentDetails) {
          setOrder(propOrder);
          setPaymentDetails(propPaymentDetails);
          setIsLoading(false);
          return;
        }
        
        // If we have orderId from URL, fetch order details
        if (orderId) {
          const orderData = await checkoutService.getOrderById(orderId);
          setOrder(orderData.data || orderData);
          
          if (paymentId) {
            // Payment was successful
            const paymentData = {
              orderId: orderId,
              razorpayPaymentId: paymentId,
              razorpayOrderId: params.get('razorpay_order_id') || `order_${Date.now()}`,
              razorpaySignature: params.get('razorpay_signature') || `sig_${Date.now()}`,
            };
            
            setPaymentDetails(paymentData);
            
            // If this is a callback from Razorpay, handle the payment verification
            if (paymentStatus === 'success' || paymentStatus === 'authorized') {
              await checkoutService.createPaymentDetail({
                ...paymentData,
                amount: orderData.total || orderData.totalAmount,
              });
              
              toast.success('Payment successful!');
            } else if (paymentStatus === 'failed' || paymentStatus === 'failure') {
              setError('Payment failed. Please try again.');
              toast.error('Payment failed. Please try again.');
              setTimeout(() => navigate('/cart'), 3000);
              return;
            }
          } else {
            // No payment data, redirect to cart
            setError('No payment details found.');
            toast.error('No payment details found.');
            setTimeout(() => navigate('/cart'), 3000);
            return;
          }
        } else {
          // No order ID, redirect to cart
          setError('Order information not found.');
          toast.error('Order information not found.');
          setTimeout(() => navigate('/cart'), 3000);
          return;
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error processing order confirmation:', err);
        setError('Failed to process order confirmation.');
        toast.error('Failed to process order confirmation.');
        setIsLoading(false);
        setTimeout(() => navigate('/cart'), 3000);
      }
    };
    
    fetchOrderDetails();
  }, [location.search, navigate, propOrder, propPaymentDetails]);
  
  // Start countdown for redirection
  useEffect(() => {
    if (!isLoading && !error && order && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!isLoading && !error && order && countdown === 0) {
      setIsRedirecting(true);
      // Redirect to order tracking page
      setTimeout(() => {
        navigate(`/account/orders/${order.id}`);
      }, 500);
    }
  }, [countdown, navigate, order, isLoading, error]);

  if (isLoading) {
    return (
      <div className="bg-secondary rounded-lg p-8 text-center">
        <Spinner />
        <p className="text-gray-400 mt-4">Processing your order...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-secondary rounded-lg p-8 text-center">
        <svg 
          className="w-16 h-16 text-red-500 mx-auto mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M6 18L18 6M6 6l12 12" 
          />
        </svg>
        
        <h2 className="text-2xl font-bold text-light mb-4">Payment Failed</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/cart" 
            className="bg-primary text-black px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition-colors inline-block"
          >
            Return to Cart
          </Link>
          
          <Link 
            to="/" 
            className="bg-gray-700 text-light px-6 py-3 rounded-md font-medium hover:bg-gray-600 transition-colors inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }
  
  if (!order || !paymentDetails) {
    return (
      <div className="bg-secondary rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-light mb-4">Order Information Not Found</h2>
        <p className="text-gray-400 mb-6">We couldn't find your order information. Please contact customer support.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/cart" 
            className="bg-primary text-black px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition-colors inline-block"
          >
            Return to Cart
          </Link>
          
          <Link 
            to="/" 
            className="bg-gray-700 text-light px-6 py-3 rounded-md font-medium hover:bg-gray-600 transition-colors inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-secondary rounded-lg p-8 text-center">
      <svg 
        className="w-16 h-16 text-primary mx-auto mb-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 13l4 4L19 7" 
        />
      </svg>
      
      <h2 className="text-2xl font-bold text-light mb-4">Order Placed Successfully!</h2>
      
      <div className="text-left mb-6 bg-gray-800 p-4 rounded-md">
        <p className="text-gray-400 mb-2">
          <span className="text-light font-medium">Order ID:</span> {order.id}
        </p>
        <p className="text-gray-400 mb-2">
          <span className="text-light font-medium">Payment ID:</span> {paymentDetails.razorpayPaymentId}
        </p>
        <p className="text-gray-400 mb-2">
          <span className="text-light font-medium">Order Date:</span> {new Date(order.createdAt || Date.now()).toLocaleString()}
        </p>
        <p className="text-gray-400">
          <span className="text-light font-medium">Total Amount:</span> {formatPrice(order.total || order.totalAmount)}
        </p>
      </div>
      
      <p className="text-gray-400 mb-6">
        Thank you for your purchase. Your order has been placed successfully and a confirmation 
        has been sent to your email address.
      </p>
      
      {isRedirecting ? (
        <div className="flex flex-col items-center justify-center mb-6">
          <Spinner />
          <p className="text-gray-400 mt-2">Redirecting to order tracking...</p>
        </div>
      ) : (
        <div className="bg-primary bg-opacity-10 text-primary p-4 rounded-md mb-6">
          <p>Redirecting to order tracking in <span className="font-bold">{countdown}</span> seconds...</p>
          <p className="text-sm mt-2">You can also click the button below to track your order now.</p>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          to="/" 
          className="bg-gray-700 text-light px-6 py-3 rounded-md font-medium hover:bg-gray-600 transition-colors inline-block"
        >
          Continue Shopping
        </Link>
        
        <Link 
          to={`/account/orders/${order.id}`}
          className="bg-primary text-black px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition-colors inline-block"
        >
          Track My Order
        </Link>
        
        <Link 
          to="/account/orders"
          className="bg-gray-700 text-light px-6 py-3 rounded-md font-medium hover:bg-gray-600 transition-colors inline-block"
        >
          View All Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation; 