import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Search, Plus, Hash, Lock, Users, Phone, Video, 
  MoreVertical, Paperclip, Smile, Send, UserPlus,
  MessageSquare, Bell, Star, ChevronDown
} from 'lucide-react'
import api from '../services/api'

export default function MessagesPage() {
  const { channelId } = useParams()
  const navigate = useNavigate()
  const [channels, setChannels] = useState([])
  const [directMessages, setDirectMessages] = useState([])
  const [currentChannel, setCurrentChannel] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewDM, setShowNewDM] = useState(false)

  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    fetchChannels()
    fetchDirectMessages()
  }, [])

  useEffect(() => {
    if (channelId) {
      fetchChannel(channelId)
      fetchMessages(channelId)
    }
  }, [channelId])

  const fetchChannels = async () => {
    try {
      const { data } = await api.get('/channels')
      setChannels(data)
    } catch (error) {
      console.error('Failed to fetch channels:', error)
    }
  }

  const fetchDirectMessages = async () => {
    try {
      const { data } = await api.get('/messages/direct')
      setDirectMessages(data)
    } catch (error) {
      console.error('Failed to fetch DMs:', error)
    }
  }

  const fetchChannel = async (id) => {
    try {
      const { data } = await api.get(`/channels/${id}`)
      setCurrentChannel(data)
    } catch (error) {
      console.error('Failed to fetch channel:', error)
    }
  }

  const fetchMessages = async (id) => {
    try {
      const { data } = await api.get(`/messages/channel/${id}`)
      setMessages(data)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      const { data } = await api.post('/messages', {
        channel_id: channelId,
        content: newMessage
      })
      setMessages([...messages, data])
      setNewMessage('')
    } catch (error) {
      alert('Failed to send message')
    }
  }

  return (
    <div className="h-screen bg-black text-white flex pt-16">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Science & Tech Club</h2>
            <button className="text-gray-400 hover:text-white">
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1 mb-4">
            <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded text-sm text-gray-300">
              <MessageSquare className="w-4 h-4" />
              Threads
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded text-sm text-gray-300">
              <Bell className="w-4 h-4" />
              Mentions & reactions
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded text-sm text-gray-300">
              <Star className="w-4 h-4" />
              Saved items
            </button>
          </div>

          {/* Channels */}
          <div className="mb-4">
            <button className="w-full flex items-center justify-between px-3 py-1 hover:bg-gray-800 rounded text-sm font-semibold text-gray-400 mb-1">
              Channels
              <Plus className="w-4 h-4" />
            </button>
            
            <div className="space-y-0.5">
              {/* Committee Channel (Admin/Committee only) */}
              {(user?.role === 'admin' || user?.is_committee) && (
                <button
                  onClick={() => navigate('/messages/committee')}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm ${
                    channelId === 'committee'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  committee
                </button>
              )}

              {/* General Channels */}
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => navigate(`/messages/${channel.id}`)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm ${
                    channelId === channel.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {channel.is_private ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <Hash className="w-4 h-4" />
                  )}
                  {channel.name}
                  {channel.unread_count > 0 && (
                    <span className="ml-auto bg-red-500 px-1.5 py-0.5 rounded-full text-xs">
                      {channel.unread_count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Direct Messages */}
          <div>
            <button 
              onClick={() => setShowNewDM(true)}
              className="w-full flex items-center justify-between px-3 py-1 hover:bg-gray-800 rounded text-sm font-semibold text-gray-400 mb-1"
            >
              Direct messages
              <Plus className="w-4 h-4" />
            </button>
            
            <div className="space-y-0.5">
              {directMessages.map((dm) => (
                <button
                  key={dm.id}
                  onClick={() => navigate(`/messages/dm/${dm.id}`)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm ${
                    channelId === dm.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <div className="relative">
                    {dm.profile_photo_url ? (
                      <img src={dm.profile_photo_url} className="w-5 h-5 rounded-full" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-xs">
                        {dm.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                    {dm.is_online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900"></span>
                    )}
                  </div>
                  {dm.username}
                  {dm.unread_count > 0 && (
                    <span className="ml-auto bg-red-500 px-1.5 py-0.5 rounded-full text-xs font-semibold">
                      {dm.unread_count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChannel ? (
          <>
            {/* Chat Header */}
            <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <Hash className="w-5 h-5 text-gray-400" />
                <h2 className="font-bold">{currentChannel.name}</h2>
                {currentChannel.members_count && (
                  <span className="text-sm text-gray-400">
                    {currentChannel.members_count} members
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-800 rounded">
                  <Phone className="w-5 h-5 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-800 rounded">
                  <Video className="w-5 h-5 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-800 rounded">
                  <Users className="w-5 h-5 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-800 rounded">
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3 hover:bg-gray-900/50 -mx-6 px-6 py-2">
                  {message.sender_photo ? (
                    <img
                      src={message.sender_photo}
                      className="w-10 h-10 rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                      {message.sender_name?.[0]?.toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold">{message.sender_name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-300">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-800">
              <div className="bg-gray-800 rounded-lg border border-gray-700 focus-within:border-blue-500">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder={`Message #${currentChannel.name}`}
                  className="w-full p-3 bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none"
                  rows={3}
                />
                
                <div className="flex items-center justify-between px-3 pb-3">
                  <div className="flex gap-2">
                    <button className="p-1.5 hover:bg-gray-700 rounded">
                      <Paperclip className="w-5 h-5 text-gray-400" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-700 rounded">
                      <Smile className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                  
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed p-2 rounded transition"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-700" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                Select a channel or DM
              </h3>
              <p className="text-gray-500">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
