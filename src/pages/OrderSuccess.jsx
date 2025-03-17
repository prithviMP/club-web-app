
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { order, paymentDetails } = location.state || {};

  useEffect(() => {
    if (!order || !paymentDetails) {
      navigate('/');
    }
  }, [order, paymentDetails, navigate]);

  if (!order || !paymentDetails) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
          <p className="text-gray-600 mb-8">Your order has been placed successfully.</p>
          
          <div className="text-left bg-gray-50 p-4 rounded-md mb-6">
            <p className="mb-2"><span className="font-semibold">Order ID:</span> {order.id}</p>
            <p className="mb-2"><span className="font-semibold">Payment ID:</span> {paymentDetails.razorpayPaymentId}</p>
            <p className="mb-2"><span className="font-semibold">Amount:</span> ₹{order.totalAmount}</p>
          </div>

          <button 
            onClick={() => navigate('/orders')} 
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          >
            View Orders
          </button>
        </div>
      </div>
    </div>
  );
}
