import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('club_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('club_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
}

// Courses APIs
export const courses = {
  getAll: () => api.get('/courses'),
  getOne: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
}

// Chat APIs
export const chat = {
  getMessages: (room) => api.get(`/chat/${room}`),
  sendMessage: (data) => api.post('/chat', data),
  deleteMessage: (id) => api.delete(`/chat/${id}`),
}

// Admin APIs
export const admin = {
  getDashboard: () => api.get('/admin/dashboard'),
  addStudent: (data) => api.post('/admin/add-student', data),
  addFaculty: (data) => api.post('/admin/add-faculty', data),
  uploadStudents: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/admin/upload-students', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  uploadFaculty: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/admin/upload-faculty', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  setRole: (data) => api.put('/admin/set-role', data),
  resetPassword: (data) => api.put('/admin/reset-password', data),
  bulkPasswords: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/admin/bulk-passwords', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
}

// Config APIs
export const config = {
  get: () => api.get('/config'),
  update: (data) => api.put('/config', data),
}

// Chatbot APIs
export const chatbot = {
  ask: (question) => api.post('/chatbot', { question }),
}

export default api
