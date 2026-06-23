import { Link } from 'react-router-dom'
import {
  ArrowRight, Upload, FileSearch, MessageSquare, BarChart3,
  Star, Zap, Shield, ChevronRight, Play, CheckCircle2
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const features = [
  {
    icon: FileSearch,
    title: 'Resume Analysis',
    desc: 'Upload your CV, let our AI extract your skills, technologies, projects, and experience level automatically.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: MessageSquare,
    title: 'Adaptive Simulations',
    desc: 'Practice with questions tailored to your background. The AI adapts based on your previous answers in real-time.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: BarChart3,
    title: 'Detailed Feedback',
    desc: 'Get instant scores out of 10, strengths analysis, missing points, and improved model answers after each response.',
    color: 'from-emerald-500 to-teal-500',
  },
]

const reasons = [
  {
    icon: Zap,
    title: 'Reduce Interview Anxiety',
    desc: 'Consistent practice in a judgment-free environment builds the confidence you need to ace real interviews.',
  },
  {
    icon: Star,
    title: 'Personalized Feedback',
    desc: 'Receive tailored suggestions and model answers—not generic advice—based on your actual responses.',
  },
  {
    icon: Shield,
    title: 'Simulate Real Interviewers',
    desc: 'Our AI mimics professional interviewers across domains: DSA, System Design, Behavioral, and more.',
  },
]

const steps = [
  { step: '01', title: 'Upload Resume', desc: 'Upload your PDF/DOCX resume.' },
  { step: '02', title: 'AI Analysis', desc: 'We extract your skills and experience.' },
  { step: '03', title: 'Start Interview', desc: 'Answer questions one at a time.' },
  { step: '04', title: 'Get Report', desc: 'Receive your full performance report.' },
]

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />

      {/* ─── HERO SECTION ────────────────────────────────── */}
      <section className="relative pt-28 pb-20 px-4 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-grid opacity-100" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-32 right-10 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 text-sm font-medium mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            Powered by Google Gemini AI
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight mb-6 text-balance">
            Master Your{' '}
            <span className="gradient-text">AI Interview</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your resume and let our AI generate personalized interview questions, conduct adaptive mock interviews, and provide actionable feedback to accelerate your career.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/interview"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white
                bg-cyan-500 hover:bg-cyan-400 shadow-neon hover:shadow-neon-lg
                transition-all duration-300 text-base"
            >
              <Play className="w-4 h-4" />
              Take Interview
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/upload"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold
                border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-200
                hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-400
                hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-300 text-base"
            >
              <Upload className="w-4 h-4" />
              Upload Resume
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex justify-center items-center gap-6 mt-12 text-sm text-gray-500 dark:text-gray-400">
            {[['10K+', 'Interviews Conducted'], ['95%', 'User Satisfaction'], ['500+', 'Companies Covered']].map(([num, label]) => (
              <div key={label} className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">{num}</div>
                <div className="text-xs">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-dark-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Three powerful pillars designed to transform you from a nervous candidate to a confident professional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="neon-card p-6 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS SECTION ───────────────────────── */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400">Four simple steps to interview mastery</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ step, title, desc }, i) => (
              <div key={step} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-cyan-500/40 to-transparent z-10" />
                )}
                <div className="neon-card p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4">
                    <span className="text-lg font-black text-cyan-500">{step}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY SECTION ────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-dark-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why <span className="gradient-text">Intervue.AI?</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Designed by engineers who've been through hundreds of interviews—and know exactly what it takes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reasons.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-6 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/3 transition-colors duration-200">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative inline-block w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded-3xl blur-xl" />
            <div className="relative border border-cyan-500/30 dark:border-cyan-500/20 rounded-3xl p-12 bg-white/50 dark:bg-dark-700/50 backdrop-blur-sm">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to <span className="gradient-text">Ace Your Interview?</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Join thousands of candidates who leveled up their skills with Intervue.AI
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {[
                  'Resume-Tailored Questions',
                  'Instant AI Feedback',
                  'Performance Dashboard',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <Link
                to="/signup"
                id="take-interview"
                className="mt-8 inline-flex items-center gap-2 px-10 py-4 rounded-xl font-semibold text-white
                  bg-cyan-500 hover:bg-cyan-400 shadow-neon hover:shadow-neon-lg
                  transition-all duration-300 text-base"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
