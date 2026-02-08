import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://science-tech-club-iju0.onrender.com/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle response errors globally
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname
      
      // Don't redirect if already on login page or home page
      if (currentPath !== '/login' && currentPath !== '/') {
        console.log('Token expired or invalid, redirecting to login')
        
        // Clear local storage
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        
        // Redirect to login
        window.location.href = '/login'
      }
    }
    
    // Handle 403 Forbidden - insufficient permissions
    if (error.response?.status === 403) {
      console.error('Access denied:', error.response.data.message)
    }
    
    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('Resource not found:', error.config.url)
    }
    
    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data.message || 'Internal server error')
    }
    
    return Promise.reject(error)
  }
)

export default api
