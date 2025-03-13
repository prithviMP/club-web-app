import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../../utils/imageUtils';
import Spinner from '../ui/Spinner';

const OrderConfirmation = ({ order, paymentDetails }) => {
  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();

  // Start countdown for redirection
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsRedirecting(true);
      // Redirect to order tracking page
      setTimeout(() => {
        navigate(`/account/orders/${order.id}`);
      }, 500);
    }
  }, [countdown, navigate, order.id]);

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