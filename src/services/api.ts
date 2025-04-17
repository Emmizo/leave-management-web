import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5456/api', // Your API base URL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Important for CORS with credentials
});

// Interceptor to add the token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api; 