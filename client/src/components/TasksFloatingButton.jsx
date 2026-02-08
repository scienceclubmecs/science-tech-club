import { useState } from 'react'
import { CheckSquare } from 'lucide-react'
import TasksModal from './TasksModal'

export default function TasksFloatingButton() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      {/* Positioned to the left of chatbot */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-24 z-40 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 group"
        title="My Tasks"
      >
        <CheckSquare className="w-6 h-6 text-white" />
        {/* Task count badge */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
          3
        </div>
      </button>

      <TasksModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}
