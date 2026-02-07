import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { Calendar, MapPin, Clock, Users, Plus, CheckCircle } from 'lucide-react'
import Loading from '../components/Loading'

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('upcoming')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [eventsRes, profileRes] = await Promise.all([
        api.get('/events'),
        api.get('/users/me')
      ])
      setEvents(eventsRes.data)
      setProfile(profileRes.data)
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const canCreateEvent = () => {
    return profile?.role === 'admin' || 
           profile?.committee_post === 'Executive Head' ||
           profile?.committee_post === 'Chair' ||
           profile?.committee_post === 'Secretary'
  }

  const filteredEvents = events.filter(e => {
    const eventDate = new Date(e.event_date)
    const now = new Date()
    
    if (filter === 'upcoming') return eventDate > now
    if (filter === 'past') return eventDate < now
    if (filter === 'draft') return e.status === 'draft'
    if (filter === 'approved') return e.status === 'approved'
    return true
  })

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Events</h1>
            <p className="text-gray-400">Upcoming club events and activities</p>
          </div>
          {canCreateEvent() && (
            <Link
              to="/events/create"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              Create Event
            </Link>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-8 border-b border-gray-800">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-6 py-3 font-medium ${
              filter === 'upcoming'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-6 py-3 font-medium ${
              filter === 'past'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Past Events
          </button>
          {canCreateEvent() && (
            <>
              <button
                onClick={() => setFilter('draft')}
                className={`px-6 py-3 font-medium ${
                  filter === 'draft'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Drafts
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-6 py-3 font-medium ${
                  filter === 'approved'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Approved
              </button>
            </>
          )}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-700" />
              <p className="text-gray-500">No events found</p>
            </div>
          ) : (
            filteredEvents.map(event => (
              <EventCard key={event.id} event={event} canManage={canCreateEvent()} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function EventCard({ event, canManage }) {
  const eventDate = new Date(event.event_date)
  const isPast = eventDate < new Date()

  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition ${
      isPast ? 'opacity-60' : ''
    }`}>
      {event.image_url && (
        <img 
          src={event.image_url} 
          alt={event.title} 
          className="w-full h-48 object-cover"
        />
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold flex-1">{event.title}</h3>
          <span className={`px-2 py-1 rounded text-xs ml-2 ${
            event.status === 'approved' ? 'bg-green-600' :
            event.status === 'ongoing' ? 'bg-blue-600' :
            event.status === 'completed' ? 'bg-purple-600' :
            'bg-yellow-600'
          }`}>
            {event.status}
          </span>
        </div>

        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{eventDate.toLocaleDateString('en-US', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{eventDate.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}</span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        {event.tasks && event.tasks.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <CheckCircle className="w-3 h-3" />
              <span>{event.tasks.filter(t => t.completed).length} / {event.tasks.length} tasks completed</span>
            </div>
          </div>
        )}

        <Link
          to={`/events/${event.id}`}
          className="block text-center bg-gray-800 hover:bg-gray-700 py-2 rounded-lg text-sm transition"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}
