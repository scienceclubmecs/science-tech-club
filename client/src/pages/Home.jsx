import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { 
  Sparkles, Calendar, Award, Users, ArrowRight, BookOpen, 
  Rocket, ChevronLeft, ChevronRight 
} from 'lucide-react'

export default function Home() {
  const [committee, setCommittee] = useState([])
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    fetchCommittee()
  }, [])

  const fetchCommittee = async () => {
    try {
      const { data } = await api.get('/public/committee')
      setCommittee(data)
    } catch (error) {
      console.error('Failed to fetch committee:', error)
    }
  }

  const scroll = (direction) => {
    const container = document.getElementById('committee-scroll')
    const scrollAmount = 300
    const newPosition = direction === 'left' 
      ? scrollPosition - scrollAmount 
      : scrollPosition + scrollAmount
    
    container.scrollTo({ left: newPosition, behavior: 'smooth' })
    setScrollPosition(newPosition)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm">Science & Technology Club</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Innovate. Create. Inspire.
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Join the premier tech community. Build projects, attend workshops, and shape the future.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="group flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              
              <a
                href="#about"
                className="flex items-center justify-center gap-2 border border-white/20 px-8 py-4 rounded-full font-medium hover:bg-white/10 transition"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </section>

      {/* Committee Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Meet Our Committee</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Passionate leaders driving innovation and excellence
            </p>
          </div>

          {/* Committee Carousel */}
          <div className="relative max-w-6xl mx-auto">
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 p-3 rounded-full transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div
              id="committee-scroll"
              className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-12"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {committee.map((member) => (
                <CommitteeMemberCard key={member.id} member={member} />
              ))}
            </div>

            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 p-3 rounded-full transition"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What We Offer</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A comprehensive platform for tech enthusiasts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Award className="w-8 h-8" />}
              title="Build Projects"
              description="Work on real-world projects with peers and faculty mentors"
              color="from-blue-600 to-blue-800"
            />
            
            <FeatureCard
              icon={<BookOpen className="w-8 h-8" />}
              title="Learn & Grow"
              description="Access courses, quizzes, and workshops on cutting-edge technologies"
              color="from-purple-600 to-purple-800"
            />
            
            <FeatureCard
              icon={<Calendar className="w-8 h-8" />}
              title="Tech Events"
              description="Participate in hackathons, talks, and networking events"
              color="from-pink-600 to-pink-800"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatCard number="500+" label="Active Members" />
            <StatCard number="100+" label="Projects" />
            <StatCard number="50+" label="Events" />
            <StatCard number="20+" label="Workshops" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center">
            <Rocket className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Join hundreds of students building the future of technology
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition"
            >
              Join Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2026 Science & Tech Club MECS. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="mailto:scienceclubmecs@gmail.com" className="hover:text-white transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function CommitteeMemberCard({ member }) {
  const getPostColor = (post) => {
    if (post?.includes('Chair')) return 'from-yellow-600 to-yellow-800'
    if (post?.includes('Secretary')) return 'from-blue-600 to-blue-800'
    if (post?.includes('Head')) return 'from-orange-600 to-orange-800'
    if (post?.includes('Executive')) return 'from-purple-600 to-purple-800'
    if (post?.includes('Representative')) return 'from-green-600 to-green-800'
    return 'from-gray-600 to-gray-800'
  }

  return (
    <div className="flex-shrink-0 w-64 bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition">
      {member.profile_photo_url ? (
        <img
          src={member.profile_photo_url}
          alt={member.username}
          className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
        />
      ) : (
        <div className={`w-20 h-20 rounded-full mx-auto mb-4 bg-gradient-to-br ${getPostColor(member.committee_post)} flex items-center justify-center text-2xl font-bold`}>
          {member.username[0].toUpperCase()}
        </div>
      )}
      
      <h3 className="font-bold text-center mb-2">{member.username}</h3>
      <div className={`inline-block w-full text-center px-3 py-1 rounded-full text-xs bg-gradient-to-r ${getPostColor(member.committee_post)}`}>
        {member.committee_post}
      </div>
      {member.department && (
        <p className="text-xs text-gray-400 text-center mt-2">{member.department}</p>
      )}
    </div>
  )
}

function FeatureCard({ icon, title, description, color }) {
  return (
    <div className="group bg-gray-900 border border-gray-800 rounded-xl p-8 hover:border-gray-700 transition">
      <div className={`inline-flex p-4 rounded-lg bg-gradient-to-br ${color} mb-4 group-hover:scale-110 transition`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}

function StatCard({ number, label }) {
  return (
    <div>
      <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
        {number}
      </div>
      <div className="text-gray-400">{label}</div>
    </div>
  )
}
