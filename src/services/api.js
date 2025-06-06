import axios from 'axios';

// Create axios instance with base URL for local development
const API = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for debugging
API.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging and error handling
API.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Backend server is not running');
    } else if (error.response) {
      console.error(`❌ API Error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
    } else {
      console.error('❌ Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Food API calls
export const foodAPI = {
  // Get all foods
  getAllFoods: (category = '') => {
    const url = category ? `/foods?category=${category}` : '/foods';
    return API.get(url);
  },

  // Get featured foods
  getFeaturedFoods: () => API.get('/foods/featured'),

  // Get food by ID
  getFoodById: (id) => API.get(`/foods/${id}`),

  // Create food (admin function)
  createFood: (foodData) => API.post('/foods', foodData),

  // Update food (admin function)
  updateFood: (id, foodData) => API.put(`/foods/${id}`, foodData),

  // Delete food (admin function)
  deleteFood: (id) => API.delete(`/foods/${id}`),
};

// Order API calls
export const orderAPI = {
  // Create order
  createOrder: (orderData) => API.post('/orders', orderData),

  // Get order by ID
  getOrderById: (id) => API.get(`/orders/${id}`),

  // Update order status
  updateOrderStatus: (id, status) => API.put(`/orders/${id}/status`, { orderStatus: status }),

  // Cancel order
  cancelOrder: (id) => API.put(`/orders/${id}/cancel`),

  // Get all orders
  getAllOrders: () => API.get('/orders'),
};

// Upload API calls
export const uploadAPI = {
  // Upload image
  uploadImage: (formData) => {
    return axios.post('http://localhost:3001/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 seconds for file upload
    });
  },
};

export default API; 
