import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, MessageCircle, BookOpen, Users } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-gray-200">
      {/* Top nav */}
      <header className="fixed top-0 inset-x-0 z-30 border-b border-neutral-800 bg-black/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 via-cyan-400 to-purple-500" />
            <span className="font-semibold text-white">Science & Tech Club</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm rounded-full border border-neutral-700 hover:border-neutral-500 hover:bg-neutral-900 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="pt-28 pb-20">
        <section className="max-w-6xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1 mb-6 text-xs text-neutral-300">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>Campus Science & Tech Community</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-4">
              Where ideas meet{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                engineering.
              </span>
            </h1>

            <p className="text-neutral-400 text-base md:text-lg max-w-xl mb-8">
              Learn, build and collaborate with students who love hardware, software and research.
              Watch curated courses, join live discussions and ask doubts to our AI assistant.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-10">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2.5 text-sm font-medium hover:bg-neutral-200 transition"
              >
                Get started
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/chatbot"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:border-neutral-500 hover:bg-neutral-900 transition"
              >
                <MessageCircle className="w-4 h-4 text-cyan-400" />
                Ask the club chatbot
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 text-xs text-neutral-500">
              <div>
                <div className="text-white font-semibold text-lg">Courses</div>
                <div>Video sessions, roadmaps, projects.</div>
              </div>
              <div>
                <div className="text-white font-semibold text-lg">Community</div>
                <div>Events, talks, project collabs.</div>
              </div>
              <div>
                <div className="text-white font-semibold text-lg">Chatbot</div>
                <div>Quick answers to tech & club queries.</div>
              </div>
            </div>
          </div>

          {/* Right side cards */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
                <BookOpen className="w-6 h-6 text-blue-400 mb-3" />
                <div className="text-sm font-semibold text-white mb-1">Learning tracks</div>
                <div className="text-xs text-neutral-400">
                  Hand‑picked videos and notes for AI, Web, Embedded, RF and more.
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
                <MessageCircle className="w-6 h-6 text-cyan-400 mb-3" />
                <div className="text-sm font-semibold text-white mb-1">Realtime chat</div>
                <div className="text-xs text-neutral-400">
                  Discuss ideas with committee and members in focused channels.
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
                <Users className="w-6 h-6 text-purple-400 mb-3" />
                <div className="text-sm font-semibold text-white mb-1">Events & projects</div>
                <div className="text-xs text-neutral-400">
                  Hackathons, workshops and long‑term club projects to join.
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-gradient-to-br from-blue-600/20 via-cyan-500/10 to-purple-600/20 p-5">
                <Sparkles className="w-6 h-6 text-blue-300 mb-3" />
                <div className="text-sm font-semibold text-white mb-1">AI assistant</div>
                <div className="text-xs text-neutral-300">
                  Ask doubts about courses, events or tech. Available 24/7 on the chatbot page.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Simple footer */}
      <footer className="border-t border-neutral-900 py-6 text-xs text-neutral-500 text-center">
        Science & Tech Club · {new Date().getFullYear()}
      </footer>
    </div>
  )
}
