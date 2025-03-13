import { apiClient } from '../../utils/api/client';

// Create an order with all details
export const createOrder = async (orderData) => {
  try {
    const response = await apiClient.post('/orders', { data: orderData });
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Create order items
export const createOrderItems = async (orderItemsData) => {
  try {
    const response = await apiClient.post('/order-items', { data: orderItemsData });
    return response.data;
  } catch (error) {
    console.error('Error creating order items:', error);
    throw error;
  }
};

// Create order detail
export const createOrderDetail = async (orderDetailData) => {
  try {
    const response = await apiClient.post('/order-details', { data: orderDetailData });
    return response.data;
  } catch (error) {
    console.error('Error creating order detail:', error);
    throw error;
  }
};

// Create payment detail after successful Razorpay payment
export const createPaymentDetail = async (paymentData) => {
  try {
    console.log('Creating payment detail with data:', paymentData);
    
    // Try to get the order detail to ensure we have the correct ID
    let orderDetailId = paymentData.orderId;
    
    try {
      // Check if we need to get the order detail first
      if (isNaN(orderDetailId) || orderDetailId.includes('_')) {
        const orderDetail = await getOrderById(orderDetailId);
        orderDetailId = orderDetail.id || orderDetail.documentId;
        console.log(`Resolved order detail ID: ${orderDetailId}`);
      }
    } catch (orderError) {
      console.error('Error resolving order detail ID:', orderError);
      // Continue with the original ID if we can't resolve it
    }
    
    // Format the payment data for the API
    const formattedData = {
      data: {
        order_detail: orderDetailId,
        amount: paymentData.amount,
        level: "completed",
        paymentDate: new Date().toISOString(),
        razorpay_order_id: paymentData.razorpayOrderId,
        razorpay_payment_id: paymentData.razorpayPaymentId,
        razorpay_signature: paymentData.razorpaySignature,
        locale: "en"
      }
    };
    
    console.log('Formatted payment detail data:', formattedData);
    const response = await apiClient.post('/payment-details', formattedData);
    console.log('Payment detail created:', response);
    
    return response.data;
  } catch (error) {
    console.error('Error creating payment detail:', error);
    throw error;
  }
};

// Create an order item
export const createOrderItem = async (orderItemData) => {
  try {
    const response = await apiClient.post('/order-items', { data: orderItemData });
    return response.data;
  } catch (error) {
    console.error('Error creating order item:', error);
    throw error;
  }
};

// Create shipping information
export const createShippingInfo = async (shippingData) => {
  try {
    // Map frontend field names to backend field names
    const mappedData = {
      Fullname: shippingData.fullName,
      Address: shippingData.address,
      state: shippingData.state,
      pincode: parseInt(shippingData.postalCode),
      phone_no: shippingData.phone,
      user: shippingData.user,
      locale: shippingData.locale || 'en'
    };

    const response = await apiClient.post('/shipping-infos', { data: mappedData });
    return response.data;
  } catch (error) {
    console.error('Error creating shipping info:', error);
    throw error;
  }
};

// Initialize Razorpay payment
export const initializePayment = async (amount, orderId, currency = 'INR') => {
  try {
    console.log(`Initializing payment for order ${orderId} with amount ${amount} ${currency}`);
    const response = await apiClient.post('/payment-initiate', {
      amount: amount,
      currency: currency,
      orderId: orderId
    });
    
    console.log('Payment initialization response:', response);
    
    // Check if the response has the expected structure
    if (!response.data) {
      console.error('Invalid response from payment-initiate:', response);
      throw new Error('Invalid response from payment initialization');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error initializing payment:', error);
    throw error;
  }
};

// Verify Razorpay payment
export const verifyPayment = async (paymentData) => {
  try {
    console.log('Verifying payment with data:', paymentData);
    const response = await apiClient.post('/payment-verify', paymentData);
    
    console.log('Payment verification response:', response);
    
    // Check if the response has the expected structure
    if (!response.data) {
      console.error('Invalid response from payment-verify:', response);
      throw new Error('Invalid response from payment verification');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await apiClient.put(`/order-details/${orderId}`, {
      data: { level: status }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Get order by ID
export const getOrderById = async (orderId) => {
  try {
    console.log(`Fetching order details for order ${orderId}`);
    
    // Try to fetch by ID first
    try {
      const response = await apiClient.get(`/order-details/${orderId}?[populate][orderItems][populate][product][populate]=*`);
      console.log('Order details response:', response);
      
      if (response && response.data) {
        return response.data;
      }
    } catch (idError) {
      console.log(`Could not find order by ID ${orderId}, trying alternative methods`);
    }
    
    // If ID fetch fails, try to fetch by documentId
    try {
      const response = await apiClient.get(`/order-details/${orderId}?[populate][orderItems][populate][product][populate]=*`);
      console.log('Order details by documentId response:', response);
      
      if (response && response.data && response.data.length > 0) {
        return response.data[0];
      }
    } catch (documentIdError) {
      console.log(`Could not find order by documentId ${orderId}`);
    }
    
    // Try to fetch from orders endpoint
    try {
      const response = await apiClient.get(`/orders/${orderId}?populate=*`);
      console.log('Orders endpoint response:', response);
      
      if (response && response.data) {
        return response.data;
      }
    } catch (ordersError) {
      console.log(`Could not find order in orders endpoint with ID ${orderId}`);
    }
    
    // Try to fetch from orders with filter
    try {
      const response = await apiClient.get(`/orders?filters[id]=${orderId}&populate=*`);
      console.log('Orders with filter response:', response);
      
      if (response && response.data && response.data.length > 0) {
        return response.data[0];
      }
    } catch (ordersFilterError) {
      console.log(`Could not find order in orders with filter ID ${orderId}`);
    }
    
    // Try to fetch from user orders
    try {
      const response = await apiClient.get(`/users?populate[order_details][filters][id]=${orderId}&populate[order_details][populate]=*`);
      console.log('User orders response:', response);
      
      if (response && response.data && response.data.length > 0) {
        const user = response.data[0];
        if (user.order_details && user.order_details.length > 0) {
          return user.order_details.find(order => order.id == orderId || order.documentId == orderId);
        }
      }
    } catch (userOrdersError) {
      console.log(`Could not find order in user orders with ID ${orderId}`);
    }
    
    throw new Error(`Could not find order with ID or documentId: ${orderId}`);
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

// Get all orders for a user
export const getUserOrders = async (userId) => {
  try {
    console.log(`Fetching orders for user ${userId}`);
    
    try {
      // First try the standard order-details endpoint
      const response = await apiClient.get(`/order-details?filters[user]=${userId}&populate=*&sort=createdAt:desc`);
      console.log('User orders response from order-details:', response);
      
      if (response && response.data && response.data.length > 0) {
        return response.data;
      }
    } catch (error) {
      console.log('Error fetching from order-details endpoint:', error);
    }
    
    try {
      // If no results from order-details, try the users endpoint with populated orders
      const response = await apiClient.get(`/users/${userId}?populate[order_details][populate]=*`);
      console.log('User orders response from users endpoint:', response);
      
      if (response && response.data && response.data.order_details) {
        return response.data;
      }
    } catch (error) {
      console.log('Error fetching from users endpoint:', error);
    }
    
    // Return empty array if no orders found
    return [];
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
}; 