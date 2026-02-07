import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

class SocketService {
  constructor() {
    this.socket = null
  }

  connect(token) {
    if (this.socket?.connected) return this.socket

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  joinRoom(room) {
    if (this.socket) {
      this.socket.emit('join-room', room)
    }
  }

  leaveRoom(room) {
    if (this.socket) {
      this.socket.emit('leave-room', room)
    }
  }

  sendMessage(data) {
    if (this.socket) {
      this.socket.emit('send-message', data)
    }
  }

  onMessage(callback) {
    if (this.socket) {
      this.socket.on('receive-message', callback)
    }
  }

  offMessage() {
    if (this.socket) {
      this.socket.off('receive-message')
    }
  }
}

export default new SocketService()
