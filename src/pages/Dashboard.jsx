import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services'

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
    { label: 'Sessions Completed', value: '12', icon: 'check_circle',         color: 'text-primary',   glow: 'rgba(192,193,255,0.15)',  bg: 'bg-primary/10' },
    { label: 'Avg. Score',         value: '82',  icon: 'bar_chart',            color: 'text-secondary', glow: 'rgba(76,215,246,0.15)',   bg: 'bg-secondary/10' },
    { label: 'Study Streak',       value: '5d',  icon: 'local_fire_department', color: 'text-tertiary', glow: 'rgba(255,183,131,0.15)',  bg: 'bg-tertiary/10' },
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
    <div className="bg-background text-on-background min-h-screen flex">

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
          <button
            onClick={() => navigate('/upload')}
            className="w-full py-md bg-primary text-on-primary font-bold rounded-lg mb-sm active:scale-[0.98] transition-transform hover:shadow-[0_0_20px_rgba(192,193,255,0.2)]"
          >
            Start New Interview
          </button>
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
      <main className="flex-1 md:ml-64 px-lg md:px-xl py-xl max-w-[1280px] mx-auto w-full pb-24 md:pb-xl">

        {/* Header */}
        <header className="mb-xl">
          <div className="inline-flex items-center gap-sm px-md py-xs rounded-full border border-primary/30 bg-primary/10 text-xs font-mono text-primary mb-md">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            AI Ready — Session slot available
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-on-background tracking-tighter">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
          </h2>
          <p className="text-lg text-on-surface-variant mt-xs">Ready to sharpen your interview skills today?</p>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className="glass-card rounded-xl p-lg flex items-center gap-md transition-all hover-lift group animate-fade-in-up"
              style={{
                boxShadow: `0 0 30px ${stat.glow}`,
                animationDelay: `${idx * 100}ms`
              }}
            >
              <div className={`w-14 h-14 rounded-xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <span className={`material-symbols-outlined ${stat.color} text-2xl`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
              </div>
              <div>
                <div className={`text-4xl font-bold font-display ${stat.color} tabular-nums`}>{stat.value}</div>
                <div className="text-xs font-mono text-on-surface-variant mt-xs">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-xl">
          {/* Start Interview CTA */}
          <div className="glass-card rounded-2xl p-xl relative overflow-hidden group hover:border-primary/20 transition-all hover-lift animate-fade-in-up delay-100" style={{ boxShadow: '0 0 40px rgba(192,193,255,0.08)' }}>
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
              <button
                onClick={() => navigate('/upload')}
                className="px-xl py-md bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_30px_rgba(192,193,255,0.3)] active:scale-95 transition-all flex items-center gap-sm"
              >
                <span className="material-symbols-outlined">upload_file</span>
                Upload Resume & Begin
              </button>
            </div>
          </div>

          {/* Last Session */}
          <div className="glass-card rounded-2xl p-xl relative overflow-hidden group hover:border-secondary/20 transition-all hover-lift animate-fade-in-up delay-200">
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
              <button
                onClick={() => navigate('/summary')}
                className="px-xl py-md border border-outline-variant/30 text-on-surface font-bold rounded-xl hover:bg-white/5 active:scale-95 transition-all flex items-center gap-sm"
              >
                <span className="material-symbols-outlined">analytics</span>
                View Full Report
              </button>
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <section className="mb-xl">
          <div className="flex items-center justify-between mb-lg">
            <h3 className="font-display text-2xl font-bold text-on-background">Recent Sessions</h3>
            <button className="text-xs font-mono text-primary hover:underline">View all →</button>
          </div>
          <div className="glass-card rounded-xl overflow-hidden">
            {recentSessions.map((session, i) => (
              <div key={i} className={`flex items-center justify-between px-lg py-md hover:bg-white/3 transition-all cursor-pointer group ${i !== recentSessions.length - 1 ? 'border-b border-white/5' : ''}`}>
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
              </div>
            ))}
          </div>
        </section>

        {/* Features Bento */}
        <section>
          <h3 className="font-display text-2xl font-bold text-on-background mb-lg">Platform Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-lg">
            {features.map(f => (
              <div key={f.title} className={`glass-card rounded-xl p-lg group hover:${f.border} transition-all cursor-default`}>
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                  <span className={`material-symbols-outlined ${f.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                </div>
                <h4 className="font-display text-base font-bold text-on-background mb-sm">{f.title}</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

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
      </main>

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
