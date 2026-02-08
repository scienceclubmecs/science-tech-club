import axios from 'axios'

// Determine API URL based on environment
const getApiUrl = () => {
  // 1. Check environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // 2. In production, use relative path (same domain)
  if (import.meta.env.PROD) {
    return '/api'
  }
  
  // 3. In development, use localhost
  return 'http://localhost:5000/api'
}

const API_URL = getApiUrl()

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000, // 30 second timeout
  withCredentials: false
})

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🔵 ${config.method.toUpperCase()} ${config.url}`)
    }
    
    return config
  },
  (error) => {
    console.error('❌ Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url}`)
    }
    return response
  },
  (error) => {
    // Network error (no response from server)
    if (!error.response) {
      console.error('❌ Network error - Server might be down:', error.message)
      
      // Show user-friendly message
      if (error.code === 'ERR_NETWORK') {
        console.error('Cannot connect to server. Please check your internet connection.')
      }
      
      return Promise.reject(error)
    }

    const { status, data, config } = error.response
    const currentPath = window.location.pathname

    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`❌ ${status} ${config.method.toUpperCase()} ${config.url}`, data)
    }

    switch (status) {
      case 401:
        // Unauthorized - Token expired or invalid
        console.log('🔒 Unauthorized - Token expired or invalid')
        
        // Don't redirect if already on public pages
        if (!['/login', '/register', '/'].includes(currentPath)) {
          console.log('Redirecting to login...')
          
          // Clear authentication
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          
          // Redirect to login with return URL
          const returnUrl = encodeURIComponent(currentPath)
          window.location.href = `/login?returnUrl=${returnUrl}`
        }
        break

      case 403:
        // Forbidden - Insufficient permissions
        console.error('🚫 Access denied:', data.message || 'Insufficient permissions')
        
        // Optionally redirect to dashboard or show error
        if (data.message) {
          alert(`Access Denied: ${data.message}`)
        }
        break

      case 404:
        // Not Found
        console.error('🔍 Resource not found:', config.url)
        break

      case 422:
        // Validation error
        console.error('⚠️ Validation error:', data.message || data.errors)
        break

      case 429:
        // Too many requests
        console.error('⏱️ Too many requests. Please slow down.')
        alert('Too many requests. Please wait a moment and try again.')
        break

      case 500:
        // Internal Server Error
        console.error('💥 Server error:', data.message || 'Internal server error')
        
        // Show generic error message
        if (import.meta.env.PROD) {
          alert('Something went wrong. Please try again later.')
        }
        break

      case 503:
        // Service Unavailable
        console.error('🔧 Service temporarily unavailable')
        alert('Service is temporarily unavailable. Please try again later.')
        break

      default:
        console.error(`❌ HTTP ${status}:`, data.message || 'Unknown error')
    }

    return Promise.reject(error)
  }
)

// Helper functions for common API calls
export const apiHelpers = {
  // Get with error handling
  async get(url, config = {}) {
    try {
      const response = await api.get(url, config)
      return { data: response.data, error: null }
    } catch (error) {
      return { data: null, error: error.response?.data?.message || error.message }
    }
  },

  // Post with error handling
  async post(url, data, config = {}) {
    try {
      const response = await api.post(url, data, config)
      return { data: response.data, error: null }
    } catch (error) {
      return { data: null, error: error.response?.data?.message || error.message }
    }
  },

  // Put with error handling
  async put(url, data, config = {}) {
    try {
      const response = await api.put(url, data, config)
      return { data: response.data, error: null }
    } catch (error) {
      return { data: null, error: error.response?.data?.message || error.message }
    }
  },

  // Delete with error handling
  async delete(url, config = {}) {
    try {
      const response = await api.delete(url, config)
      return { data: response.data, error: null }
    } catch (error) {
      return { data: null, error: error.response?.data?.message || error.message }
    }
  }
}

export default api
