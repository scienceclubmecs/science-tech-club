import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { 
  Sparkles, ArrowRight, ChevronLeft, ChevronRight, 
  BookOpen, Award, Calendar, Users, Code, Lightbulb,
  Trophy, GraduationCap, ExternalLink
} from 'lucide-react'

// FeatureCard Component
function FeatureCard({ icon, title, description, color, items }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 hover:border-gray-700 transition group">
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 mb-6 leading-relaxed">{description}</p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-gray-500 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

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
    if (!container) return
    
    const scrollAmount = 300
    const newPosition = direction === 'left' 
      ? scrollPosition - scrollAmount 
      : scrollPosition + scrollAmount
    
    container.scrollTo({ left: newPosition, behavior: 'smooth' })
    setScrollPosition(newPosition)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-md border-b border-gray-800 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="https://i.ibb.co/v6WM95xK/2.jpg" 
                alt="Science & Tech Club" 
                className="w-12 h-12 rounded-lg object-contain"
              />
              <div>
                <div className="text-xl font-bold">Science & Tech Club</div>
                <div className="text-xs text-gray-500">MATRUSRI ENGINEERING COLLEGE</div>
              </div>
            </div>
            <div className="hidden md:flex gap-6">
              <a href="#home" className="text-gray-400 hover:text-white transition">Home</a>
              <a href="#about" className="text-gray-400 hover:text-white transition">About</a>
              <a href="#features" className="text-gray-400 hover:text-white transition">Features</a>
              <a href="#team" className="text-gray-400 hover:text-white transition">Team</a>
            </div>
            <div className="flex items-center gap-4">
              <img 
                src="https://i.ibb.co/sptF2qvk/mecs-logo.jpg" 
                alt="MECS" 
                className="w-10 h-10 rounded-lg object-contain hidden md:block"
              />
              <Link to="/login" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-gray-900 border border-gray-800 px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-gray-400">WELCOME TO INNOVATION</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              SCIENCE AND TECHNOLOGY CLUB
            </span>
          </h1>
          
          <h2 className="text-2xl text-gray-400 mb-8">
            Innovation In Progress
          </h2>

          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">Greetings from the MECS Tech Community
where every idea has the potential to become a reality and innovation meets opportunity.
Our community was founded by Mathsa Naveen Kumar, a 2022 batch BE ECE student, and is dedicated to empowering the next generation of technology leaders through practical innovation, teamwork, and access to cutting-edge technology.
You're in the right place whether you're a novice making your first foray into the tech industry or an experienced inventor hoping to develop the next big thing. Come along with us as we shape the future, one innovation and project at a time.
          </p>
          

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/login" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-lg font-medium transition inline-flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30">
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#about" className="bg-gray-900 hover:bg-gray-800 border border-gray-800 px-8 py-4 rounded-lg font-medium transition">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              About Our Club
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Building tomorrow's innovators at Matrusri Engineering College
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 hover:border-blue-600 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Our Mission</h3>
              <p className="text-gray-400 leading-relaxed">
                To cultivate a vibrant ecosystem of innovation and technical excellence at MECS, 
                empowering students to become industry-ready professionals through hands-on learning, 
                collaborative projects, and exposure to cutting-edge technologies.
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 hover:border-purple-600 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Our Vision</h3>
              <p className="text-gray-400 leading-relaxed">
                To establish MECS Science & Tech Club as the leading student technology community 
                in the region, fostering innovation, entrepreneurship, and technical leadership 
                among aspiring engineers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              What We Offer
            </h2>
            <p className="text-gray-400 text-lg">Comprehensive platform for MECS students</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Code />}
              title="Project Development"
              description="Work on real-world projects using latest technologies. Get mentorship from faculty and industry experts."
              color="from-blue-600 to-cyan-600"
              items={['Industry-relevant projects', 'Faculty mentorship', 'Team collaboration', 'Git & DevOps training']}
            />
            <FeatureCard 
              icon={<BookOpen />}
              title="Learning Courses"
              description="Access structured courses on web dev, AI/ML, cloud computing, and emerging technologies."
              color="from-purple-600 to-pink-600"
              items={['Expert-led courses', 'Hands-on tutorials', 'Certification programs', 'Career guidance']}
            />
            <FeatureCard 
              icon={<Calendar />}
              title="Events & Workshops"
              description="Participate in hackathons, workshops, tech talks, and networking events throughout the year."
              color="from-green-600 to-teal-600"
              items={['Weekly workshops', 'Hackathons', 'Guest lectures', 'Networking opportunities']}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <FeatureCard 
              icon={<Users />}
              title="Community"
              description="Join a vibrant community of tech enthusiasts, collaborate on projects, and grow together."
              color="from-orange-600 to-red-600"
              items={['Peer learning', 'Mentorship programs', 'Discussion forums', 'Team projects']}
            />
            <FeatureCard 
              icon={<Trophy />}
              title="Competitions"
              description="Showcase your skills in coding competitions, hackathons, and innovation challenges."
              color="from-yellow-600 to-orange-600"
              items={['Coding contests', 'Innovation challenges', 'Prizes & recognition', 'Certificate rewards']}
            />
            <FeatureCard 
              icon={<GraduationCap />}
              title="Career Support"
              description="Get placement preparation, resume building, interview guidance, and industry connections."
              color="from-indigo-600 to-purple-600"
              items={['Mock interviews', 'Resume reviews', 'Industry connections', 'Placement assistance']}
            />
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 px-4 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Meet Our Team
            </h2>
            <p className="text-gray-400 text-lg">The talented individuals leading our club forward</p>
          </div>

          {committee.length > 0 ? (
            <div className="relative">
              <div 
                id="committee-scroll"
                className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {committee.map((member) => (
                  <div
                    key={member.id}
                    className="flex-shrink-0 w-80 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-600 transition group"
                  >
                    {member.profile_photo_url ? (
                      <img
                        src={member.profile_photo_url}
                        alt={member.full_name || member.username}
                        className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-80 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <span className="text-6xl font-bold">
                          {(member.full_name || member.username)?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-1">{member.full_name || member.username}</h3>
                      <p className="text-blue-400 text-sm mb-3">{member.committee_post || 'Committee Member'}</p>
                      {member.bio && (
                        <p className="text-sm text-gray-500 line-clamp-2">{member.bio}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {committee.length > 3 && (
                <>
                  <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-900 hover:bg-gray-800 border border-gray-800 p-3 rounded-full transition"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-900 hover:bg-gray-800 border border-gray-800 p-3 rounded-full transition"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-700" />
              <p className="text-gray-500">Committee members will be announced soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Ready to Join Us?
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            Start your journey with the Science & Tech Club today and be part of something amazing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-10 py-4 rounded-lg font-medium transition inline-flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
            >
              Register Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/login" 
              className="bg-gray-900 hover:bg-gray-800 border border-gray-800 px-10 py-4 rounded-lg font-medium transition"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="https://i.ibb.co/v6WM95xK/2.jpg" 
                  alt="Logo" 
                  className="w-10 h-10 rounded-lg"
                />
                <div>
                  <div className="font-bold">S&T Club</div>
                  <div className="text-xs text-gray-500">Matrusri Engineering College</div>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Saidabad
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-3 text-sm">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#home" className="hover:text-white transition">Home</a></li>
                <li><a href="#about" className="hover:text-white transition">About</a></li>
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#team" className="hover:text-white transition">Team</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-3 text-sm">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/projects" className="hover:text-white transition">Projects</Link></li>
                <li><Link to="/courses" className="hover:text-white transition">Courses</Link></li>
                <li><Link to="/events" className="hover:text-white transition">Events</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-3 text-sm">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>scienceclubmecs@gmail.com</li>
                <li>Matrusri Engineering College Campus</li>
                <li>www.matrusri.edu.in</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2026 Science & Tech Club - MECS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
