import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { 
  Sparkles, Calendar, Award, Users, ArrowRight, BookOpen, 
  Rocket, ChevronLeft, ChevronRight, Code, Lightbulb, Target
} from 'lucide-react'

export default function Home() {
  const [committee, setCommittee] = useState([])
  const [stats, setStats] = useState({ students: 0, faculty: 0, projects: 0 })
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [committeeRes, usersRes, projectsRes] = await Promise.all([
        api.get('/public/committee'),
        api.get('/public/stats'),
        api.get('/projects')
      ])
      
      // Filter out admin role from committee
      const filteredCommittee = committeeRes.data.filter(member => member.role !== 'admin')
      setCommittee(filteredCommittee)
      
      setStats({
        students: usersRes.data.students || 0,
        faculty: usersRes.data.faculty || 0,
        projects: projectsRes.data.length || 0
      })
    } catch (error) {
      console.error('Failed to fetch data:', error)
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-pulse">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm">Welcome to Science & Technology Club</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Build. Learn. Innovate.
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Join hundreds of students exploring technology, working on innovative projects,
              and shaping the future of engineering.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/login"
                className="group flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-full font-medium transition"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              
              <a
                href="#features"
                className="flex items-center justify-center gap-2 border border-white/20 backdrop-blur-sm bg-white/5 px-8 py-4 rounded-full font-medium hover:bg-white/10 transition"
              >
                Explore More
              </a>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="text-3xl font-bold text-blue-400">{stats.students}</div>
                <div className="text-sm text-gray-400">Students</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="text-3xl font-bold text-purple-400">{stats.faculty}</div>
                <div className="text-sm text-gray-400">Faculty</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="text-3xl font-bold text-pink-400">{stats.projects}</div>
                <div className="text-sm text-gray-400">Projects</div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Join Us?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Everything you need to excel in technology and innovation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Award className="w-8 h-8" />}
              title="Real Projects"
              description="Work on industry-relevant projects with faculty guidance and peer collaboration"
              gradient="from-blue-600 to-cyan-600"
            />
            
            <FeatureCard
              icon={<Lightbulb className="w-8 h-8" />}
              title="Learn & Grow"
              description="Access workshops, courses, and mentorship programs on cutting-edge technologies"
              gradient="from-purple-600 to-pink-600"
            />
            
            <FeatureCard
              icon={<Target className="w-8 h-8" />}
              title="Tech Events"
              description="Participate in hackathons, competitions, tech talks, and networking events"
              gradient="from-orange-600 to-red-600"
            />

            <FeatureCard
              icon={<Code className="w-8 h-8" />}
              title="Skill Building"
              description="Master programming, AI/ML, web development, IoT, and emerging technologies"
              gradient="from-green-600 to-teal-600"
            />
            
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Community"
              description="Connect with like-minded students, alumni, and industry professionals"
              gradient="from-indigo-600 to-blue-600"
            />
            
            <FeatureCard
              icon={<Rocket className="w-8 h-8" />}
              title="Research"
              description="Engage in research projects and publish papers with faculty mentors"
              gradient="from-yellow-600 to-orange-600"
            />
          </div>
        </div>
      </section>

      {/* Committee Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Meet Our Committee</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Dedicated student leaders driving the club's vision and activities
            </p>
          </div>

          {/* Committee Carousel */}
          {committee.length > 0 ? (
            <div className="relative max-w-6xl mx-auto">
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700 p-3 rounded-full transition"
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
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700 p-3 rounded-full transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Committee members will be displayed here</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center">
            <Rocket className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Join {stats.students} students already building amazing projects and learning together
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
          <p>&copy; 2026 Science & Tech Club. All rights reserved.</p>
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
    if (post?.includes('Chair')) return 'from-yellow-500 to-orange-500'
    if (post?.includes('Secretary')) return 'from-blue-500 to-cyan-500'
    if (post?.includes('Head')) return 'from-orange-500 to-red-500'
    if (post?.includes('Executive')) return 'from-purple-500 to-pink-500'
    if (post?.includes('Representative')) return 'from-green-500 to-teal-500'
    if (post?.includes('Developer')) return 'from-indigo-500 to-purple-500'
    return 'from-gray-500 to-gray-700'
  }

  return (
    <div className="flex-shrink-0 w-64 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-gray-600 hover:bg-gray-800 transition">
      {member.profile_photo_url ? (
        <img
          src={member.profile_photo_url}
          alt={member.username}
          className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-gray-700"
        />
      ) : (
        <div className={`w-20 h-20 rounded-full mx-auto mb-4 bg-gradient-to-br ${getPostColor(member.committee_post)} flex items-center justify-center text-2xl font-bold border-2 border-gray-700`}>
          {member.username[0].toUpperCase()}
        </div>
      )}
      
      <h3 className="font-bold text-center mb-2 text-white">{member.username}</h3>
      <div className={`w-full text-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r ${getPostColor(member.committee_post)}`}>
        {member.committee_post}
      </div>
      {member.department && (
        <p className="text-xs text-gray-400 text-center mt-2">{member.department}</p>
      )}
    </div>
  )
}

function FeatureCard({ icon, title, description, gradient }) {
  return (
    <div className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 hover:border-gray-700 hover:bg-gray-900 transition">
      <div className={`inline-flex p-4 rounded-lg bg-gradient-to-br ${gradient} mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}
