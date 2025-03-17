
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function PaymentFailed() {
  const location = useLocation();
  const navigate = useNavigate();
  const { error } = location.state || {};

  useEffect(() => {
    if (!error) {
      navigate('/');
    }
  }, [error, navigate]);

  if (!error) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Failed</h2>
          <p className="text-gray-600 mb-8">{error.description || 'Something went wrong with your payment.'}</p>
          
          <button 
            onClick={() => navigate('/cart')} 
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
