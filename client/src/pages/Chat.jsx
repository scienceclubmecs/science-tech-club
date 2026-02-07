import { useEffect, useState, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import { chat } from '../services/api'
import socketService from '../services/socket'
import { Send, Trash2, Users, MessageSquare } from 'lucide-react'

export default function Chat() {
  const { user, token } = useAuthStore()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [currentRoom, setCurrentRoom] = useState('general')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  const rooms = [
    { id: 'general', name: 'General', icon: MessageSquare },
    { id: 'committee', name: 'Committee', icon: Users, requireCommittee: true },
    { id: 'developers', name: 'Developers', icon: MessageSquare, requireDev: true },
  ]

  const availableRooms = rooms.filter(room => {
    if (room.requireCommittee && !user.is_committee && user.role !== 'admin') return false
    if (room.requireDev && !user.is_developer && user.role !== 'admin') return false
    return true
  })

  useEffect(() => {
    // Connect socket
    socketService.connect(token)
    loadMessages()

    // Join room
    socketService.joinRoom(currentRoom)

    // Listen for new messages
    socketService.onMessage((message) => {
      setMessages(prev => [...prev, message])
    })

    return () => {
      socketService.leaveRoom(currentRoom)
      socketService.offMessage()
    }
  }, [currentRoom, token])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    setLoading(true)
    try {
      const { data } = await chat.getMessages(currentRoom)
      setMessages(data)
    } catch (err) {
      console.error('Load messages error:', err)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const messageData = {
      room: currentRoom,
      message: newMessage.trim(),
      username: user.username,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    }

    try {
      // Send via API and Socket
      await chat.sendMessage({ room: currentRoom, message: newMessage.trim() })
      socketService.sendMessage(messageData)
      setNewMessage('')
    } catch (err) {
      console.error('Send message error:', err)
      alert('Failed to send message')
    }
  }

  const handleDelete = async (messageId) => {
    if (!confirm('Delete this message?')) return

    try {
      await chat.deleteMessage(messageId)
      setMessages(prev => prev.filter(m => m.id !== messageId))
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed')
    }
  }

  const switchRoom = (roomId) => {
    socketService.leaveRoom(currentRoom)
    setCurrentRoom(roomId)
  }

  return (
    <div className="min-h-screen bg-darker">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">
          {/* Sidebar - Rooms */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="card h-full">
              <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <MessageSquare className="text-primary" size={24} />
                <span>Rooms</span>
              </h2>
              <div className="space-y-2">
                {availableRooms.map((room) => {
                  const Icon = room.icon
                  return (
                    <button
                      key={room.id}
                      onClick={() => switchRoom(room.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        currentRoom === room.id
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-gray-400 hover:text-gray-100 hover:bg-dark-card'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{room.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 card flex flex-col">
            {/* Header */}
            <div className="pb-4 border-b border-border mb-4">
              <h2 className="text-2xl font-bold gradient-text capitalize">
                #{currentRoom}
              </h2>
              <p className="text-gray-400 text-sm">{messages.length} messages</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {loading ? (
                <div className="text-center text-gray-400 py-8">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <MessageSquare className="mx-auto mb-2 text-gray-600" size={48} />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwn={msg.user?.id === user.id || msg.user_id === user.id}
                    onDelete={handleDelete}
                    canDelete={user.role === 'admin' || msg.user?.id === user.id || msg.user_id === user.id}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="flex space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message #${currentRoom}...`}
                className="input flex-1"
                maxLength={500}
              />
              <button type="submit" disabled={!newMessage.trim()} className="btn-primary">
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message, isOwn, onDelete, canDelete }) {
  const username = message.user?.username || message.username || 'Unknown'
  const role = message.user?.role || 'student'
  const timestamp = new Date(message.created_at || message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-sm font-semibold text-gray-300">{username}</span>
          <span className="text-xs text-gray-500 capitalize">{role}</span>
          <span className="text-xs text-gray-600">{timestamp}</span>
        </div>
        <div className={`rounded-lg px-4 py-2 ${
          isOwn 
            ? 'bg-primary text-black' 
            : 'bg-dark-card text-gray-100'
        }`}>
          <p className="break-words">{message.message}</p>
        </div>
        {canDelete && (
          <button
            onClick={() => onDelete(message.id)}
            className="text-red-500 text-xs hover:underline mt-1"
          >
            <Trash2 size={12} className="inline mr-1" />
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
