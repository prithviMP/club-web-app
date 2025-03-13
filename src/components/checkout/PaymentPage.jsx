import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/imageUtils';

const PaymentPage = ({ 
  shippingInfo, 
  subtotal, 
  deliveryCharges = 50, 
  onPay, 
  onChangeAddress,
  currentStep = 2
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const totalAmount = subtotal + deliveryCharges - discount;

  const handleCouponChange = (e) => {
    setCouponCode(e.target.value);
    setCouponError('');
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    
    // Simulate coupon validation
    setTimeout(() => {
      // Mock coupon validation - in a real app, this would be an API call
      if (couponCode.toUpperCase() === 'WELCOME10') {
        const discountAmount = Math.round(subtotal * 0.1); // 10% discount
        setDiscount(discountAmount);
        setCouponError('');
      } else {
        setCouponError('Invalid coupon code');
        setDiscount(0);
      }
      setIsApplyingCoupon(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Checkout Steps */}
      <div className="bg-gray-900 p-4 mb-6">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary text-black' : 'bg-gray-700'}`}>
              1
            </div>
            <span className="text-sm mt-1">Shipping</span>
          </div>
          
          <div className={`flex-1 h-0.5 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-700'}`}></div>
          
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary text-black' : 'bg-gray-700'}`}>
              2
            </div>
            <span className="text-sm mt-1">Payment</span>
          </div>
          
          <div className={`flex-1 h-0.5 ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-700'}`}></div>
          
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-primary text-black' : 'bg-gray-700'}`}>
              3
            </div>
            <span className="text-sm mt-1">Receipt</span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4">
        {/* Back Button */}
        <Link to="/cart" className="flex items-center text-gray-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Payment
        </Link>

        {/* Coupon Code */}
        <div className="flex items-center mb-6 bg-gray-900 rounded-lg overflow-hidden">
          <input
            type="text"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={handleCouponChange}
            className="flex-1 bg-transparent border-none p-4 text-white focus:outline-none"
          />
          <button
            onClick={handleApplyCoupon}
            disabled={isApplyingCoupon}
            className="bg-transparent text-primary px-4 py-2 font-medium"
          >
            {isApplyingCoupon ? 'Applying...' : 'Apply Code'}
          </button>
        </div>
        {couponError && <p className="text-red-500 text-sm mb-4 -mt-4">{couponError}</p>}
        {discount > 0 && <p className="text-primary text-sm mb-4 -mt-4">Coupon applied! You saved {formatPrice(discount)}</p>}

        {/* Change Address Button */}
        <div className="flex justify-end mb-2">
          <button 
            onClick={onChangeAddress}
            className="text-primary text-sm"
          >
            Change Address
          </button>
        </div>

        {/* Shipping Information */}
        <div className="border border-primary rounded-lg p-4 mb-8">
          <h3 className="text-primary text-lg mb-2">Shipping Information</h3>
          <p className="text-white">{shippingInfo.fullName}</p>
          <p className="text-white">{shippingInfo.address}</p>
          <p className="text-white">{shippingInfo.city}</p>
          <p className="text-white">{shippingInfo.state}</p>
          <p className="text-white">{shippingInfo.postalCode}</p>
          <p className="text-white">{shippingInfo.phone}</p>
        </div>

        {/* Order Summary */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-gray-300">Subtotal</span>
            <span className="text-white">{formatPrice(subtotal)}</span>
          </div>
          
          <div className="flex justify-between mb-2">
            <span className="text-gray-300">Delivery Charges</span>
            <span className="text-white">{formatPrice(deliveryCharges)}</span>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between mb-2">
              <span className="text-gray-300">Discount</span>
              <span className="text-primary">-{formatPrice(discount)}</span>
            </div>
          )}
          
          <div className="border-t border-gray-700 my-4"></div>
          
          <div className="flex justify-between mb-2">
            <span className="text-lg font-medium">Total Amount</span>
            <span className="text-lg font-medium">{formatPrice(totalAmount)}</span>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={() => onPay(totalAmount)}
          className="w-full bg-primary text-black py-4 rounded-lg font-medium text-lg mb-8"
        >
          Pay
        </button>
      </div>
    </div>
  );
};

export default PaymentPage; 