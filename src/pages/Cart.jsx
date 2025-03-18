import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { checkoutService } from '../services/checkoutService';
import { toast } from 'react-hot-toast';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [finalAmount, setFinalAmount] = useState(0);
  const [orderItemIds, setOrderItemIds] = useState([]);
  const [orderData, setOrderData] = useState(null);
  const [shippingData, setShippingData] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    const total = cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    setFinalAmount(total);
  }, [cartItems]);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  const handleShippingInputChange = (e) => {
    const { name, value } = e.target;
    setShippingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to proceed with checkout');
      navigate('/login');
      return;
    }

    try {
      const orderItems = await Promise.all(cartItems.map(async (item) => {
        const orderItemPayload = {
          product: item.id,
          quantity: item.quantity,
          size: item.size || 'M',
          color: item.color || 'default',
          user: user?.id,
          locale: "en"
        };

        const response = await checkoutService.createOrderItem(orderItemPayload);
        return response.data ? response.data.id : response.id;
      }));

      setOrderItemIds(orderItems);

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

      const shippingInfoResponse = await checkoutService.createShippingInfo(shippingInfoPayload);
      const shippingInfoId = shippingInfoResponse.data ? shippingInfoResponse.data.id : shippingInfoResponse.id;

      const orderDetailPayload = {
        orderItems,
        total: finalAmount,
        level: "pending",
        shipping_info: shippingInfoId,
        user: user?.id,
        locale: "en"
      };

      const orderDetailResponse = await checkoutService.createOrderDetail(orderDetailPayload);
      setOrderData(orderDetailResponse.data || orderDetailResponse);

      // Redirect to payment page or handle payment flow
      navigate('/checkout/payment', { 
        state: { 
          orderId: orderDetailResponse.data?.id || orderDetailResponse.id,
          amount: finalAmount 
        }
      });

    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process checkout. Please try again.');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>
        <p>Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center border-b py-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 object-cover mr-4"
              />
              <div className="flex-grow">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-600">₹{item.price}</p>
                <div className="flex items-center mt-2">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    className="bg-gray-200 px-2 py-1 rounded"
                  >
                    -
                  </button>
                  <span className="mx-2">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="bg-gray-200 px-2 py-1 rounded"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="ml-4 text-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="md:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>₹{finalAmount}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{finalAmount}</span>
              </div>
            </div>
            <form onSubmit={handleCheckout} className="mt-4">
              <div className="space-y-4">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={shippingData.fullName}
                  onChange={handleShippingInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={shippingData.address}
                  onChange={handleShippingInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={shippingData.city}
                  onChange={handleShippingInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={shippingData.state}
                  onChange={handleShippingInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="postalCode"
                  placeholder="Postal Code"
                  value={shippingData.postalCode}
                  onChange={handleShippingInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={shippingData.country}
                  onChange={handleShippingInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={shippingData.phone}
                  onChange={handleShippingInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={shippingData.email}
                  onChange={handleShippingInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded mt-4 hover:bg-blue-700 transition-colors"
              >
                Proceed to Checkout
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}