import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { 
  Sparkles, ArrowRight, ChevronLeft, ChevronRight, 
  BookOpen, Award, Calendar, Users, Code, Lightbulb,
  Trophy, GraduationCap, ExternalLink 
} from 'lucide-react' // Fixed: Changed from 'lucide-center' to 'lucide-react'

// FeatureCard component must be defined or imported
function FeatureCard({ icon, title, description, items }) {
  return (
    <div className="group bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-white transition-all duration-500">
      <div className="w-12 h-12 border border-zinc-700 rounded-lg flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-all">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-zinc-400 mb-6 text-sm leading-relaxed">{description}</p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-zinc-500 flex items-center gap-2">
            <span className="w-1 h-1 bg-zinc-500 rounded-full"></span> {item}
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
    if (!container) return // Fixed: Added safety check
    
    const scrollAmount = 300
    const newPosition = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount
    
    container.scrollTo({ left: newPosition, behavior: 'smooth' })
    setScrollPosition(newPosition)
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-xl border-b border-zinc-800 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="https://i.ibb.co" 
                alt="Logo" 
                className="w-10 h-10 rounded-lg grayscale invert"
              />
              <div>
                <div className="text-lg font-bold tracking-tighter">S&T Club</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Matrusri</div>
              </div>
            </div>
            <div className="hidden md:flex gap-8">
              {['Home', 'About', 'Features', 'Team'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition">
                  {item}
                </a>
              ))}
            </div>
            <Link to="/login" className="bg-white text-black hover:bg-zinc-200 px-5 py-2 rounded-full font-bold text-xs transition">
              Login
            </Link>
          </div>
        </div>
      </nav>

      <section id="home" className="min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Innovation In Progress</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter uppercase">
            Science & <br/>
            <span className="text-zinc-600">Technology</span>
          </h1>

          <p className="text-lg text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            Empowering students through innovation and cutting-edge technology at MECS.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="bg-white text-black hover:bg-zinc-200 px-10 py-4 rounded-full font-bold transition flex items-center justify-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#about" className="border border-zinc-700 hover:bg-zinc-900 px-10 py-4 rounded-full font-bold transition">
              Learn More
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-4 bg-[#050505]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FeatureCard 
              icon={<Code />}
              title="Project Development"
              description="Work on real-world projects using the latest tech stacks."
              items={['Industry-relevant projects', 'Faculty mentorship', 'Team collaboration']}
            />
            <FeatureCard 
              icon={<BookOpen />}
              title="Learning Courses"
              description="Access structured courses on web dev, AI/ML, and more."
              items={['Expert-led courses', 'Hands-on tutorials', 'Certifications']}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
