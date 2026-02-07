import { useState } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import api from '../services/api'

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const handleAsk = async (e) => {
    e.preventDefault()
    if (!question.trim()) return

    const userMessage = { role: 'user', content: question }
    setMessages([...messages, userMessage])
    setQuestion('')
    setLoading(true)

    try {
      const { data } = await api.post('/chatbot', { question })
      const botMessage = { role: 'bot', content: data.answer }
      setMessages(prev => [...prev, botMessage])
    } catch (err) {
      const errorMessage = { role: 'bot', content: 'Sorry, I encountered an error. Please try again.' }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 via-cyan-400 to-purple-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 via-cyan-400 to-purple-500 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Club Chatbot</h3>
                <p className="text-xs text-neutral-500">Ask me anything</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-neutral-800 rounded-lg transition"
            >
              <X className="w-5 h-5 text-neutral-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-neutral-500 text-sm mt-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-neutral-700" />
                <p>Ask me about courses, events, or tech topics!</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-900 text-neutral-200 border border-neutral-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleAsk} className="p-4 border-t border-neutral-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 rounded-xl bg-black border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="rounded-xl bg-white text-black px-3 py-2 hover:bg-neutral-200 disabled:opacity-50 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
