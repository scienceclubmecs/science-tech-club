import { Link } from 'react-router-dom'
import { BookOpen, Users, MessageCircle, Sparkles, ArrowRight, Github } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-lg border-b border-gray-800 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold text-white">Science & Tech Club</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Welcome to the Future of Learning</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Science & Tech Club
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Join our community of innovators, learners, and tech enthusiasts. 
            Access courses, connect with peers, and build the future together.
          </p>

          <div className="flex items-center justify-center space-x-4">
            <Link
              to="/login"
              className="flex items-center space-x-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg transition transform hover:scale-105"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <a
              href="https://github.com/scienceclubmecs/science-tech-club"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white border border-gray-800 rounded-lg font-medium text-lg transition"
            >
              <Github className="w-5 h-5" />
              <span>View on GitHub</span>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Everything You Need to Learn & Connect
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl hover:border-blue-500 transition group">
              <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition">
                <BookOpen className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Video Courses</h3>
              <p className="text-gray-400">
                Access a library of curated video courses on programming, AI, robotics, and more.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl hover:border-purple-500 transition group">
              <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition">
                <MessageCircle className="w-7 h-7 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Real-time Chat</h3>
              <p className="text-gray-400">
                Connect with committee members and peers in dedicated chat rooms.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl hover:border-green-500 transition group">
              <div className="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition">
                <Users className="w-7 h-7 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Community</h3>
              <p className="text-gray-400">
                Join a vibrant community of students, faculty, and tech enthusiasts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-blue-500 mb-2">500+</div>
              <div className="text-gray-400">Active Members</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-purple-500 mb-2">50+</div>
              <div className="text-gray-400">Video Courses</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-green-500 mb-2">24/7</div>
              <div className="text-gray-400">Community Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Join hundreds of students and faculty already learning and growing together.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg transition transform hover:scale-105"
          >
            <span>Sign In Now</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800 bg-black">
        <div className="container mx-auto text-center text-gray-500">
          <p>&copy; 2026 Science & Tech Club. Built with ❤️ by the community.</p>
        </div>
      </footer>
    </div>
  )
}
