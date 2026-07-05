import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import { authService } from '../services'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
}

/* ── Animated Counter Component ───────────────────────────────── */
function AnimatedCounter({ value, suffix = '', duration = 1.5 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const motionVal = useMotionValue(0)
  const rounded = useTransform(motionVal, Math.round)
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (!isInView) return
    const numericValue = parseInt(value, 10)
    const controls = animate(motionVal, numericValue, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    })
    const unsub = rounded.on('change', v => setDisplay(String(v)))
    return () => { controls.stop(); unsub() }
  }, [isInView, value])

  return <span ref={ref}>{display}{suffix}</span>
}

export default function Dashboard() {
  const navigate = useNavigate()
  const user = authService.getUser()
  const [activeNav, setActiveNav] = useState('dashboard')

  const navItems = [
    { id: 'dashboard', label: 'Home',      icon: 'dashboard',   to: '/dashboard' },
    { id: 'upload',    label: 'Resume',    icon: 'upload_file', to: '/upload' },
    { id: 'interview', label: 'Interview', icon: 'history',     to: '/interview' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics',   to: '#' },
    { id: 'settings',  label: 'Settings',  icon: 'settings',    to: '#' },
  ]

  const stats = [
    { label: 'Sessions Completed', value: '12', icon: 'check_circle',         color: 'text-primary',   glow: 'rgba(192,193,255,0.12)',  bg: 'bg-primary/10' },
    { label: 'Avg. Score',         value: '82',  icon: 'bar_chart',            color: 'text-secondary', glow: 'rgba(76,215,246,0.12)',   bg: 'bg-secondary/10' },
    { label: 'Study Streak',       value: '5',   suffix: 'd',                  icon: 'local_fire_department', color: 'text-tertiary', glow: 'rgba(255,183,131,0.12)',  bg: 'bg-tertiary/10' },
  ]

  const features = [
    { icon: 'psychology', color: 'text-primary',   border: 'border-primary/20',   title: 'Resume-Aware AI',     desc: 'Your resume guides every question — no generic drills, only what matters.' },
    { icon: 'forum',      color: 'text-secondary', border: 'border-secondary/20', title: 'Chat-Based Sessions', desc: 'Conversational flow simulating a real technical hiring manager.' },
    { icon: 'bar_chart',  color: 'text-tertiary',  border: 'border-tertiary/20',  title: 'Instant Feedback',    desc: 'Scores, strengths, and model answers after every response.' },
    { icon: 'map',        color: 'text-primary',   border: 'border-primary/20',   title: 'Improvement Roadmap', desc: 'Personalized study guide generated from your session gaps.' },
  ]

  const recentSessions = [
    { role: 'Senior Frontend Dev', score: 82, date: '2 days ago',  trend: '+4' },
    { role: 'Full Stack Engineer',  score: 78, date: '5 days ago',  trend: '+6' },
    { role: 'React Developer',      score: 72, date: '1 week ago',  trend: '-2' },
  ]

  const handleSignOut = () => {
    authService.logout?.()
    navigate('/login')
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex overflow-hidden">

      {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col h-screen w-64 bg-surface-container-lowest border-r border-white/5 py-lg fixed left-0 top-0 z-40">
        <div className="px-lg mb-xl">
          <div className="flex items-center gap-sm mb-xs">
            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <h1 className="text-2xl font-bold font-display text-primary tracking-tighter">InterviewIQ</h1>
          </div>
          <p className="text-xs font-mono text-on-surface-variant opacity-50 uppercase tracking-widest ml-8">Premium Tier</p>
        </div>

        <nav className="flex-1 px-sm space-y-xs overflow-y-auto custom-scrollbar">
          {navItems.map(item => (
            <Link
              key={item.id}
              to={item.to}
              onClick={() => setActiveNav(item.id)}
              className={`flex items-center gap-md px-md py-sm rounded-lg transition-all ${
                item.id === 'dashboard' ? 'nav-active' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined" style={item.id === 'dashboard' ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="px-sm mt-auto pt-md border-t border-white/5 space-y-xs">
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(192,193,255,0.2)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/upload')}
            className="w-full py-md bg-primary text-on-primary font-bold rounded-lg mb-sm active:scale-[0.98] transition-transform"
          >
            Start New Interview
          </motion.button>
          <div className="flex items-center gap-md px-md py-sm rounded-xl hover:bg-white/5 transition-all cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold truncate text-on-surface">{user?.name || 'User'}</span>
              <span className="text-xs font-mono text-outline-variant truncate">{user?.email || ''}</span>
            </div>
          </div>
          <a href="#" className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined text-base">help</span><span>Support</span>
          </a>
          <button onClick={handleSignOut} className="w-full flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-error/5 hover:text-error transition-all">
            <span className="material-symbols-outlined text-base">logout</span><span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 md:ml-64 px-lg md:px-xl py-xl max-w-[1280px] mx-auto w-full pb-24 md:pb-xl"
      >
        {/* Header */}
        <motion.header variants={cardVariants} className="mb-xl">
          <div className="inline-flex items-center gap-sm px-md py-xs rounded-full border border-primary/30 bg-primary/10 text-xs font-mono text-primary mb-md">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            AI Ready — Session slot available
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-on-background tracking-tighter">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
          </h2>
          <p className="text-lg text-on-surface-variant mt-xs">Ready to sharpen your interview skills today?</p>
        </motion.header>

        {/* Stats Row */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              variants={cardVariants}
              whileHover={{ scale: 1.03, borderColor: 'rgba(255,255,255,0.1)' }}
              className="glass-card rounded-xl p-lg flex items-center gap-md transition-all group cursor-default"
              style={{
                boxShadow: `0 0 30px ${stat.glow}`
              }}
            >
              <div className={`w-14 h-14 rounded-xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <span className={`material-symbols-outlined ${stat.color} text-2xl`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
              </div>
              <div>
                <div className={`text-4xl font-bold font-display ${stat.color} tabular-nums`}>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix || ''} />
                </div>
                <div className="text-xs font-mono text-on-surface-variant mt-xs">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-xl">
          {/* Start Interview CTA */}
          <motion.div
            variants={cardVariants}
            whileHover={{ scale: 1.02, borderColor: 'rgba(192,193,255,0.2)' }}
            className="glass-card rounded-2xl p-xl relative overflow-hidden group transition-all"
            style={{ boxShadow: '0 0 40px rgba(192,193,255,0.08)' }}
          >
            <div className="absolute top-0 right-0 p-xl opacity-10 group-hover:opacity-25 transition-opacity duration-500 group-hover:scale-110 origin-top-right transition-transform">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '130px', fontVariationSettings: "'FILL' 1" }}>psychology</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-sm px-md py-xs rounded-full border border-primary/30 bg-primary/10 text-xs font-mono text-primary mb-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                AI Ready
              </div>
              <h3 className="font-display text-2xl font-bold text-on-background mb-sm">Start a Mock Interview</h3>
              <p className="text-on-surface-variant mb-xl leading-relaxed">Upload your resume and get a personalized AI-powered interview session in under 60 seconds.</p>
              <motion.button
                onClick={() => navigate('/upload')}
                whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(192,193,255,0.3)' }}
                whileTap={{ scale: 0.98 }}
                className="px-xl py-md bg-primary text-on-primary font-bold rounded-xl active:scale-95 transition-all flex items-center gap-sm"
              >
                <span className="material-symbols-outlined">upload_file</span>
                Upload Resume & Begin
              </motion.button>
            </div>
          </motion.div>

          {/* Last Session */}
          <motion.div
            variants={cardVariants}
            whileHover={{ scale: 1.02, borderColor: 'rgba(76,215,246,0.2)' }}
            className="glass-card rounded-2xl p-xl relative overflow-hidden group transition-all"
          >
            <div className="absolute top-0 right-0 p-xl opacity-10 group-hover:opacity-25 transition-opacity duration-500">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: '130px' }}>history</span>
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-sm px-md py-xs rounded-full border border-secondary/30 bg-secondary/10 text-xs font-mono text-secondary mb-lg">
                Last Session
              </div>
              <h3 className="font-display text-2xl font-bold text-on-background mb-xs">Performance Analysis</h3>
              <p className="text-on-surface-variant mb-sm text-sm">Senior Software Engineer · Session #8241</p>
              <div className="flex items-baseline gap-sm mb-xl">
                <span className="text-5xl font-bold font-display text-primary tabular-nums">82</span>
                <span className="text-on-surface-variant text-lg">/100</span>
                <span className="ml-xs px-sm py-xs bg-primary/20 text-primary text-xs font-mono rounded-full font-bold">+4pts</span>
              </div>
              <motion.button
                onClick={() => navigate('/summary')}
                whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.08)' }}
                whileTap={{ scale: 0.98 }}
                className="px-xl py-md border border-outline-variant/30 text-on-surface font-bold rounded-xl active:scale-95 transition-all flex items-center gap-sm"
              >
                <span className="material-symbols-outlined">analytics</span>
                View Full Report
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Recent Sessions */}
        <motion.section variants={cardVariants} className="mb-xl">
          <div className="flex items-center justify-between mb-lg">
            <h3 className="font-display text-2xl font-bold text-on-background">Recent Sessions</h3>
            <button className="text-xs font-mono text-primary hover:underline">View all →</button>
          </div>
          <div className="glass-card rounded-xl overflow-hidden">
            {recentSessions.map((session, i) => (
              <motion.div
                key={i}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                className={`flex items-center justify-between px-lg py-md transition-all cursor-pointer group ${i !== recentSessions.length - 1 ? 'border-b border-white/5' : ''}`}
                onClick={() => navigate('/summary')}
              >
                <div className="flex items-center gap-md">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant text-base" style={{ fontVariationSettings: "'FILL' 1" }}>work_history</span>
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface text-sm">{session.role}</p>
                    <p className="text-xs font-mono text-on-surface-variant">{session.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-md">
                  <div className="text-right">
                    <span className="text-2xl font-bold font-display text-on-surface tabular-nums">{session.score}</span>
                    <span className="text-xs text-on-surface-variant">/100</span>
                  </div>
                  <span className={`px-sm py-xs text-xs font-mono rounded-full font-bold ${
                    session.trend.startsWith('+') ? 'bg-primary/20 text-primary' : 'bg-error/20 text-error'
                  }`}>{session.trend}pts</span>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-base">arrow_forward</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Features Bento */}
        <motion.section variants={cardVariants}>
          <h3 className="font-display text-2xl font-bold text-on-background mb-lg">Platform Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-lg">
            {features.map(f => (
              <motion.div
                key={f.title}
                whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.12)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
                className={`glass-card rounded-xl p-lg group transition-all cursor-default`}
              >
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                  <span className={`material-symbols-outlined ${f.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                </div>
                <h4 className="font-display text-base font-bold text-on-background mb-sm">{f.title}</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="w-full py-xl mt-20 flex flex-col md:flex-row justify-between items-center gap-md border-t border-white/5">
          <div>
            <span className="font-display text-lg font-bold text-on-background tracking-tighter">InterviewIQ AI</span>
            <p className="text-xs font-mono text-on-surface-variant mt-xs">© 2024 InterviewIQ AI. Surgical precision in every hire.</p>
          </div>
          <div className="flex gap-lg">
            {['Privacy Policy', 'Terms of Service', 'Security'].map(link => (
              <a key={link} href="#" className="text-xs font-mono text-on-surface-variant hover:text-secondary transition-colors">{link}</a>
            ))}
          </div>
        </footer>
      </motion.main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-md z-50">
        {navItems.slice(0, 4).map(item => (
          <Link
            key={item.id}
            to={item.to}
            className={`flex flex-col items-center gap-0.5 transition-colors ${item.id === 'dashboard' ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-xl" style={item.id === 'dashboard' ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
            <span className="text-[9px] font-mono uppercase tracking-widest">{item.label}</span>
          </Link>
        ))}
        <button onClick={handleSignOut} className="flex flex-col items-center gap-0.5 text-on-surface-variant">
          <span className="material-symbols-outlined text-xl">logout</span>
          <span className="text-[9px] font-mono uppercase tracking-widest">Sign Out</span>
        </button>
      </nav>
    </div>
  )
}
