import axios from 'axios'

// Get API base from environment variable
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000, // 30 seconds
})

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('club_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized (token expired/invalid)
    if (error.response?.status === 401) {
      localStorage.removeItem('club_token')
      window.location.href = '/login'
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// ==================== AUTH APIs ====================
export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  
  register: (userData) => api.post('/auth/register', userData),
  
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token, password) => 
    api.post('/auth/reset-password', { token, password }),
  
  verifyToken: () => api.get('/auth/verify'),
}

// ==================== COURSES APIs ====================
export const courses = {
  // Get all courses
  getAll: () => api.get('/courses'),
  
  // Get single course by ID
  getOne: (id) => api.get(`/courses/${id}`),
  
  // Create new course (admin/committee only)
  create: (data) => api.post('/courses', data),
  
  // Update course
  update: (id, data) => api.put(`/courses/${id}`, data),
  
  // Delete course (admin only)
  delete: (id) => api.delete(`/courses/${id}`),
  
  // Get courses by category
  getByCategory: (category) => 
    api.get('/courses', { params: { category } }),
}

// ==================== CHAT APIs ====================
export const chat = {
  // Get messages for a room
  getMessages: (room) => api.get(`/chat/${room}`),
  
  // Send message
  sendMessage: (data) => api.post('/chat', data),
  
  // Delete message (admin/sender only)
  deleteMessage: (id) => api.delete(`/chat/${id}`),
  
  // Get available rooms
  getRooms: () => api.get('/chat/rooms'),
}

// ==================== ADMIN APIs ====================
export const admin = {
  // Get dashboard statistics
  getDashboard: () => api.get('/admin/dashboard'),
  
  // Add single student manually
  addStudent: (data) => api.post('/admin/add-student', data),
  
  // Add single faculty manually
  addFaculty: (data) => api.post('/admin/add-faculty', data),
  
  // Upload students CSV
  uploadStudents: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/admin/upload-students', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  
  // Upload faculty CSV
  uploadFaculty: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/admin/upload-faculty', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  
  // Set user role
  setRole: (data) => api.put('/admin/set-role', data),
  
  // Reset single user password
  resetPassword: (data) => api.put('/admin/reset-password', data),
  
  // Bulk password reset from CSV
  bulkPasswords: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/admin/bulk-passwords', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  
  // Promote all students
  promoteStudents: () => api.post('/admin/promote'),
  
  // Get all users
  getUsers: (params) => api.get('/admin/users', { params }),
  
  // Delete user
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
}

// ==================== CONFIG APIs ====================
export const config = {
  // Get site configuration
  get: () => api.get('/config'),
  
  // Update site configuration (admin only)
  update: (data) => api.put('/config', data),
}

// ==================== CHATBOT APIs ====================
export const chatbot = {
  // Ask chatbot a question
  ask: (question) => api.post('/chatbot', { question }),
}

// ==================== USER APIs ====================
export const users = {
  // Get current user profile
  getProfile: () => api.get('/users/profile'),
  
  // Update profile
  updateProfile: (data) => api.put('/users/profile', data),
  
  // Change password
  changePassword: (data) => api.put('/users/change-password', data),
  
  // Get user by ID
  getUser: (id) => api.get(`/users/${id}`),
}

// ==================== EVENTS APIs (Future) ====================
export const events = {
  getAll: () => api.get('/events'),
  getOne: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  register: (eventId) => api.post(`/events/${eventId}/register`),
}

// ==================== PROJECTS APIs (Future) ====================
export const projects = {
  getAll: () => api.get('/projects'),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
}

// Export default axios instance for custom requests
export default api
