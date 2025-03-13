// Load the Razorpay script dynamically
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Check if the script is already loaded
    if (window.Razorpay) {
      console.log('Razorpay script already loaded');
      resolve(true);
      return;
    }
    
    console.log('Loading Razorpay script');
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      resolve(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Display Razorpay payment form
export const displayRazorpay = (paymentData, onSuccess, onError) => {
  console.log('Displaying Razorpay checkout with data:', paymentData);
  
  // Ensure we have all required data
  if (!paymentData.razorpayOrderId) {
    console.error('Missing Razorpay order ID');
    onError({
      description: 'Missing Razorpay order ID',
      orderId: paymentData.orderId
    });
    return;
  }
  
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Razorpay Dashboard
    amount: paymentData.amount,
    currency: paymentData.currency,
    name: 'Club Unplugged',
    description: `Order #${paymentData.orderId}`,
    order_id: paymentData.razorpayOrderId,
    image: '/logo.png',
    prefill: {
      name: paymentData.customerName,
      email: paymentData.customerEmail,
      contact: paymentData.customerPhone,
    },
    theme: {
      color: '#6366F1',
    },
    handler: function (response) {
      console.log('Razorpay payment successful:', response);
      // Handle successful payment
      onSuccess({
        razorpayPaymentId: response.razorpay_payment_id,
        razorpayOrderId: response.razorpay_order_id,
        razorpaySignature: response.razorpay_signature,
        orderId: paymentData.orderId,
      });
    },
  };

  try {
    const paymentObject = new window.Razorpay(options);
    paymentObject.on('payment.failed', function (response) {
      console.log('Razorpay payment failed:', response);
      onError({
        code: response.error.code,
        description: response.error.description,
        source: response.error.source,
        step: response.error.step,
        reason: response.error.reason,
        orderId: paymentData.orderId,
        metadata: response.error.metadata,
      });
    });
    
    paymentObject.open();
  } catch (error) {
    console.error('Error opening Razorpay:', error);
    onError({
      description: error.message || 'Failed to open Razorpay checkout',
      orderId: paymentData.orderId
    });
  }
}; 