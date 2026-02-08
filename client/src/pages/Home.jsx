import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { 
  Sparkles, ArrowRight, ChevronLeft, ChevronRight, 
  BookOpen, Award, Calendar, Users, Code, Lightbulb,
  Trophy, GraduationCap, ExternalLink
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
          <h2 className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
              Innovation In Progress
            </span>
          </h2>

          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
            Empowering students through innovation, collaboration, and cutting-edge technology. 
            Join MECS's premier tech community where ideas transform into reality.
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
              title="Tech Events"
              description="Participate in hackathons, workshops, seminars, and guest lectures by industry leaders."
              color="from-orange-600 to-red-600"
              items={['Regular hackathons', 'Technical workshops', 'Industry visits', 'Guest speaker sessions']}
            />
            <FeatureCard 
              icon={<Award />}
              title="Skill Assessment"
              description="Test your knowledge with quizzes and coding challenges. Earn certificates for achievements."
              color="from-green-600 to-teal-600"
              items={['Interactive quizzes', 'Coding challenges', 'Progress tracking', 'Skill certification']}
            />
            <FeatureCard 
              icon={<Users />}
              title="Community"
              description="Connect with peers, seniors, alumni, and industry professionals in our thriving community."
              color="from-indigo-600 to-purple-600"
              items={['Peer learning', 'Alumni network', 'Discussion forums', 'Study groups']}
            />
            <FeatureCard 
              icon={<Trophy />}
              title="Competitions"
              description="Participate in national-level competitions and represent MECS on bigger platforms."
              color="from-yellow-600 to-orange-600"
              items={['Hackathons', 'Coding contests', 'Project exhibitions', 'Paper presentations']}
            />
          </div>
        </div>
      </section>

      {/* Committee Section */}
      <section id="team" className="py-20 px-4 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Our Committee
            </h2>
            <p className="text-gray-400 text-lg">Meet the dedicated team leading MECS tech initiatives</p>
          </div>

          {committee.length > 0 ? (
            <div className="relative">
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-900 hover:bg-gray-800 border border-gray-800 p-3 rounded-full transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div
                id="committee-scroll"
                className="flex gap-6 overflow-x-auto scrollbar-hide px-12 py-4"
              >
                {committee.map((member) => (
                  <CommitteeMemberCard key={member.id} member={member} />
                ))}
              </div>

              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-900 hover:bg-gray-800 border border-gray-800 p-3 rounded-full transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-700" />
              <p className="text-gray-500">Committee members will be displayed here</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section with NDLI Button */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-black via-zinc-800 to-gray-600 rounded-2xl p-12 text-center text-white
">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Join MECS Science & Tech Club Today</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Be part of the most innovative tech community at Matrusri Engineering College. 
              Transform your ideas into reality and build your tech career with us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login" className="bg-white text-black hover:bg-gray-100 px-8 py-4 rounded-lg font-medium transition inline-flex items-center justify-center gap-2 shadow-lg">
                Login to Portal
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a 
                href="https://club.ndl.iitkgp.ac.in/sign-in" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 px-8 py-4 rounded-lg font-medium transition inline-flex items-center justify-center gap-2 shadow-lg"
              >
                Visit NDLI Portal
                <ExternalLink className="w-5 h-5" />
              </a>
              <a 
                href="mailto:scienceclubmecs@gmail.com" 
                className="bg-transparent border-2 border-white hover:bg-white/10 px-8 py-4 rounded-lg font-medium transition"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-900 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="https://i.ibb.co/v6WM95xK/2.jpg" 
                  alt="Science & Tech Club" 
                  className="w-10 h-10 rounded-lg object-contain"
                />
                <div>
                  <div className="font-bold">Science & Tech Club</div>
                  <div className="text-xs text-gray-500">MECS</div>
                </div>
              </div>
              <p className="text-gray-500 text-sm">
                Matrusri Engineering College<br />
                Hyderabad, Telangana
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <a href="#about" className="block text-gray-500 hover:text-white transition">About Us</a>
                <a href="#features" className="block text-gray-500 hover:text-white transition">Features</a>
                <a href="#team" className="block text-gray-500 hover:text-white transition">Our Team</a>
                <Link to="/login" className="block text-gray-500 hover:text-white transition">Login</Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Email: scienceclubmecs@gmail.com</p>
                <p>Campus: MECS, Hyderabad</p>
                <p>Website: <a href="https://matrusri.edu.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">matrusri.edu.in</a></p>
                <div className="flex items-center gap-2 mt-4">
                  <img 
                    src="https://i.ibb.co/sptF2qvk/mecs-logo.jpg" 
                    alt="MECS" 
                    className="w-8 h-8 rounded object-contain"
                  />
                  <span className="text-xs">Matrusri Engineering College</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-900 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2025 Science & Tech Club, MECS. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-6 mt-4">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
              <a href="mailto:scienceclubmecs@gmail.com" className="hover:text-white transition">Contact</a>
              <a href="https://matrusri.edu.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">MECS Website</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, color, items }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 hover:border-gray-700 transition group">
      <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed mb-4">{description}</p>
      <ul className="space-y-2 text-sm text-gray-500">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            {item}
          </li>
        ))}
      </ul>
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
    <div className="flex-shrink-0 w-72 bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition">
      {member.profile_photo_url ? (
        <img
          src={member.profile_photo_url}
          alt={member.username}
          className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-gray-800"
        />
      ) : (
        <div className={`w-24 h-24 rounded-full mx-auto mb-4 bg-gradient-to-br ${getPostColor(member.committee_post)} flex items-center justify-center text-3xl font-bold`}>
          {member.username[0].toUpperCase()}
        </div>
      )}
      
      <h3 className="font-bold text-xl text-center mb-2">{member.username}</h3>
      <div className="text-center mb-3">
        <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r ${getPostColor(member.committee_post)}`}>
          {member.committee_post}
        </span>
      </div>
      {member.department && (
        <p className="text-sm text-gray-400 text-center">{member.department}</p>
      )}
    </div>
  )
}
