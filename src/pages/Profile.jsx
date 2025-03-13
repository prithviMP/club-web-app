import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useUserDataStore } from '../store/userData';
import { authService } from '../services/auth';

const Profile = () => {
  const { logout } = useContext(AuthContext);
  // Use both userData and getUserData for better reliability
  const userData = useUserDataStore(state => state.userData || state.user);
  const getUserData = useUserDataStore(state => state.getUserData);
  const [activeTab, setActiveTab] = useState('profile');
  const [orderHistory, setOrderHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debug log to check userData
  useEffect(() => {
    console.log('Current userData in Profile:', userData);
    console.log('getUserData() result:', getUserData());
  }, [userData, getUserData]);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      if (activeTab === 'orders') {
        try {
          setIsLoading(true);
          setError(null);
          
          // Try to get user ID from multiple sources for reliability
          const user = getUserData();
          const userId = user?.id || userData?.id;
          
          console.log('Attempting to fetch order history with userId:', userId);
          
          if (!userId) {
            console.error('User ID not available');
            setError('User information not available. Please log in again.');
            setIsLoading(false);
            return;
          }
          
          const orders = await authService.getUserOrderHistory(userId);
          console.log('Fetched order history:', orders);
          
          // getUserOrderHistory now returns an empty array instead of throwing
          setOrderHistory(orders || []);
        } catch (err) {
          console.error('Failed to fetch order history:', err);
          setError('Failed to load your order history. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    // Only fetch if userData is available and we're on the orders tab
    const user = getUserData();
    if ((userData?.id || user?.id) && activeTab === 'orders') {
      fetchOrderHistory();
    }
  }, [activeTab, userData, getUserData]);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gray-800 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-16 h-16 bg-primary text-black rounded-full flex items-center justify-center text-2xl font-bold">
                {userData?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-white">{userData?.username || 'User'}</h1>
                <p className="text-gray-400">{userData?.email || 'email@example.com'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Profile Navigation */}
        <div className="border-b border-gray-700">
          <nav className="flex overflow-x-auto">
            <button
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('orders')}
            >
              Order History
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                  <div className="bg-gray-800 p-3 rounded-md text-white">
                    {userData?.username || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <div className="bg-gray-800 p-3 rounded-md text-white">
                    {userData?.email || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Member Since</label>
                  <div className="bg-gray-800 p-3 rounded-md text-white">
                    {userData?.createdAt 
                      ? new Date(userData.createdAt).toLocaleDateString() 
                      : 'Not available'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Order History</h2>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="bg-red-900/30 text-red-200 p-4 rounded-md">
                  {error}
                </div>
              ) : orderHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">You haven't placed any orders yet.</p>
                  <Link to="/" className="bg-primary text-black px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-end mb-4">
                    <Link 
                      to="/account/orders" 
                      className="bg-primary text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 transition-colors"
                    >
                      View All Orders
                    </Link>
                  </div>
                  {orderHistory.map((order) => (
                    <div key={order.id} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex flex-wrap justify-between items-center mb-3">
                        <div>
                          <span className="text-gray-400 text-sm">Order ID:</span>
                          <span className="ml-2 font-mono">{order.id}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-400">Date:</span>
                          <span className="ml-2">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-700 pt-3 mt-3">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-400">Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'completed' 
                              ? 'bg-green-900/30 text-green-200' 
                              : order.status === 'processing' 
                              ? 'bg-blue-900/30 text-blue-200'
                              : 'bg-yellow-900/30 text-yellow-200'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total:</span>
                          <span className="font-semibold">${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Change Password</h3>
                  <Link 
                    to="/change-password" 
                    className="inline-block bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Change Password
                  </Link>
                </div>
                
                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-medium mb-3 text-red-400">Danger Zone</h3>
                  <button 
                    className="bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-600/30 px-4 py-2 rounded-md transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 