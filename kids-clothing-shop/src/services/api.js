import axios from 'axios';

// Create an axios instance with default configurations
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // cookie
});

apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add debug logging
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
      headers: config.headers
    });
    
    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
  response => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {

      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');

      if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default {

  login(credentials) {
    console.log('Attempting login with credentials:', credentials);
    return apiClient.post('/token/', credentials);
  },
  
  refreshToken(refreshToken) {
    return apiClient.post('/token/refresh/', { refresh: refreshToken });
  },
  
  register(userData) {
    console.log('Attempting registration with data:', userData);
    return apiClient.post('/auth/users/', userData);
  },

  getUserProfile() {
    return apiClient.get('/profiles/me/');
  },
  
  updateUserProfile(profileData) {
    return apiClient.put('/profiles/update_me/', profileData);
  },

  getProducts(params = {}) {
    return apiClient.get('/products/', { params });
  },
  
  getProductById(id) {
    return apiClient.get(`/products/${id}/`);
  },
  
  getProductBySlug(slug) {
    return apiClient.get(`/products/${slug}/`);
  },
  
  getBoysProducts(params = {}) {
    return apiClient.get('/products/boys/', { params });
  },
  
  getGirlsProducts(params = {}) {
    return apiClient.get('/products/girls/', { params });
  },

  getCategories() {
    return apiClient.get('/categories/');
  },
  
  getBoysCategories() {
    return apiClient.get('/categories/boys/');
  },
  
  getGirlsCategories() {
    return apiClient.get('/categories/girls/');
  },

  getFavorites() {
    return apiClient.get('/favorites/');
  },
  
  toggleFavorite(productId) {
    return apiClient.post('/favorites/toggle/', { product_id: productId });
  },

  getCurrentCart() {
    return apiClient.get('/carts/current/');
  },
  
  addToCart(data) {
    return apiClient.post('/cart-items/', data);
  },
  
  updateCartItem(id, data) {
    return apiClient.put(`/cart-items/${id}/`, data);
  },
  
  removeCartItem(id) {
    return apiClient.delete(`/cart-items/${id}/`);
  },
  
  mergeCart() {
  return apiClient.post('/carts/merge/');
  },

  getOrders() {
    return apiClient.get('/orders/');
  },
  
  getOrderById(id) {
    return apiClient.get(`/orders/${id}/`);
  },
  
  createOrder(orderData) {
    return apiClient.post('/orders/', orderData);
  },

  search(query) {
    return apiClient.get('/products/', { params: { search: query } });
  }
};