import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/imageUtils';
import { AuthContext } from '../context/AuthContext';
import { useUserDataStore } from '../store/userData';
import * as checkoutService from '../services/checkout/checkoutService';
import Spinner from '../components/ui/Spinner';

const Orders = () => {
  const { user: authUser } = useContext(AuthContext);
  // Use both userData and getUserData for better reliability
  const userData = useUserDataStore(state => state.userData || state.user);
  const getUserData = useUserDataStore(state => state.getUserData);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug log to check userData
  useEffect(() => {
    console.log('Current userData in Orders:', userData);
    console.log('getUserData() result:', getUserData());
    console.log('Auth context user:', authUser);
  }, [userData, getUserData, authUser]);

  // Add debug log for orders state
  useEffect(() => {
    console.log('Current orders state:', orders);
    if (Array.isArray(orders) && orders.length > 0) {
      console.log('First order sample:', orders[0]);
    }
  }, [orders]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // Try to get user ID from multiple sources for reliability
        const user = getUserData();
        const userId = user?.id || userData?.id || authUser?.id;
        
        console.log('Attempting to fetch orders with userId:', userId);
        
        if (!userId) {
          console.error('User ID not available');
          setError('User information not available. Please log in again.');
          setLoading(false);
          return;
        }
        
        const response = await checkoutService.getUserOrders(userId);
        console.log('Fetched orders:', response);
        
        if (response && response.data) {
          setOrders(response.data || []);
        } else if (response && Array.isArray(response)) {
          setOrders(response);
        } else if (response && response.order_details) {
          // Handle case when orders are in an order_details field
          const orderDetails = Array.isArray(response.order_details) 
            ? response.order_details 
            : [];
          console.log('Using order_details from response:', orderDetails);
          setOrders(orderDetails);
        } else {
          console.log('No order data found in response, setting empty array');
          setOrders([]);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user data is available
    const user = getUserData();
    if (userData?.id || user?.id || authUser?.id) {
      fetchOrders();
    } else {
      console.log('Waiting for user data to be available...');
      setLoading(false);
    }
  }, [userData, getUserData, authUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-20 pb-10 px-4 flex items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="mt-4">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto bg-gray-900 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">My Orders</h2>
          <div className="bg-red-900 text-white p-4 rounded-md mb-6">
            <p>{error}</p>
          </div>
          <Link 
            to="/" 
            className="bg-primary text-black px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition-colors inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">My Orders</h2>
          
          {/* Check for empty orders in multiple ways */}
          {(orders.length === 0 && !(orders.order_details && orders.order_details.length > 0)) ? (
            <div className="text-center py-8">
              <svg 
                className="w-16 h-16 text-gray-600 mx-auto mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                />
              </svg>
              <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
              <p className="text-gray-400 mb-6">You haven't placed any orders yet.</p>
              <Link 
                to="/" 
                className="bg-primary text-black px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition-colors inline-block"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Process orders from either direct array or order_details property */}
              {(orders.order_details ? orders.order_details : orders).map((order) => {
                // Extract attributes from the API response structure
                const orderData = order.attributes || order;
                const orderId = order.id;
                const createdAt = orderData.createdAt || orderData.created_at || new Date().toISOString();
                const total = orderData.total || 0;
                const level = orderData.level || 'pending';
                const documentId = orderData.documentId || orderId;
                
                // Get order items if available
                const orderItems = orderData.order_items?.data || [];
                const itemCount = orderItems.length || 0;
                
                // Determine status color and label
                let statusColor = 'text-yellow-500';
                let statusLabel = 'Pending';
                
                switch (level) {
                  case 'paid':
                    statusColor = 'text-blue-500';
                    statusLabel = 'Payment Confirmed';
                    break;
                  case 'processing':
                    statusColor = 'text-blue-500';
                    statusLabel = 'Processing';
                    break;
                  case 'shipped':
                    statusColor = 'text-blue-500';
                    statusLabel = 'Shipped';
                    break;
                  case 'delivered':
                    statusColor = 'text-green-500';
                    statusLabel = 'Delivered';
                    break;
                  case 'cancelled':
                    statusColor = 'text-red-500';
                    statusLabel = 'Cancelled';
                    break;
                  case 'failed':
                    statusColor = 'text-red-500';
                    statusLabel = 'Failed';
                    break;
                  default:
                    break;
                }
                
                return (
                  <div key={orderId} className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="p-4 bg-gray-700 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-400">Order ID: {documentId || orderId}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(createdAt).toLocaleDateString()} at {new Date(createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className={`${statusColor} font-medium`}>
                        {statusLabel}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="font-medium">Items: {itemCount}</p>
                          <p className="text-gray-400">Total: {formatPrice(total)}</p>
                        </div>
                        <Link 
                          to={`/account/orders/${documentId}`}
                          className="bg-primary text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders; 