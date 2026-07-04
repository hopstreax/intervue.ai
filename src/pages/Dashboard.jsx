import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services'

export default function Dashboard() {
  const navigate = useNavigate()
  const user = authService.getUser()

  const navItems = [
    { id: 'dashboard', label: 'Home',      icon: 'dashboard', to: '/dashboard', active: true },
    { id: 'upload',    label: 'Resume',    icon: 'upload_file', to: '/upload' },
    { id: 'interview', label: 'Interview', icon: 'history', to: '/interview' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics', to: '#' },
    { id: 'settings',  label: 'Settings',  icon: 'settings', to: '#' },
  ]

  const stats = [
    { label: 'Sessions Completed', value: '12', icon: 'check_circle', color: 'text-primary' },
    { label: 'Avg. Score',         value: '82',  icon: 'bar_chart',    color: 'text-secondary' },
    { label: 'Study Streak',       value: '5d',  icon: 'local_fire_department', color: 'text-tertiary' },
  ]

  const features = [
    { icon: 'psychology', color: 'text-primary',   title: 'Resume-Aware AI',     desc: 'Your resume guides every question — no generic drills, only what matters.' },
    { icon: 'forum',      color: 'text-secondary',  title: 'Chat-Based Sessions', desc: 'Conversational flow simulating a real technical hiring manager.' },
    { icon: 'bar_chart',  color: 'text-tertiary',   title: 'Instant Feedback',    desc: 'Scores, strengths, and model answers after every response.' },
    { icon: 'map',        color: 'text-primary',    title: 'Improvement Roadmap', desc: 'Personalized study guide generated from your session gaps.' },
  ]

  return (
    <div className="bg-background text-on-background min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 bg-surface-container-lowest border-r border-outline-variant/20 py-lg fixed left-0 top-0 z-40">
        <div className="px-lg mb-xl">
          <h1 className="text-2xl font-bold font-display text-primary tracking-tighter">InterviewIQ</h1>
          <p className="text-xs font-mono text-on-surface-variant opacity-70 mt-xs">Premium Tier</p>
        </div>
        <nav className="flex-1 px-sm space-y-xs">
          {navItems.map(item => (
            <Link key={item.id} to={item.to}
              className={`flex items-center gap-md px-md py-sm rounded-lg transition-all ${
                item.active ? 'nav-active' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
              }`}>
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="px-md mt-lg">
          <button
            onClick={() => navigate('/upload')}
            className="w-full py-md bg-primary text-on-primary font-bold rounded-lg mb-lg active:scale-[0.98] transition-transform"
          >
            Start New Interview
          </button>
          <div className="space-y-xs mt-sm border-t border-white/5 pt-sm">
            <a href="#" className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-white/5 transition-all">
              <span className="material-symbols-outlined">help</span><span>Support</span>
            </a>
            <a href="#" className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-white/5 transition-all">
              <span className="material-symbols-outlined">logout</span><span>Sign Out</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-64 p-xl max-w-[1280px] mx-auto w-full">
        {/* Header */}
        <header className="mb-xl">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-on-background tracking-tighter">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
          </h2>
          <p className="text-lg text-on-surface-variant mt-xs">Ready to sharpen your interview skills today?</p>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
          {stats.map(stat => (
            <div key={stat.label} className="glass-card rounded-xl p-lg ai-glow flex items-center gap-md">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center">
                <span className={`material-symbols-outlined ${stat.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
              </div>
              <div>
                <div className={`text-3xl font-bold font-display ${stat.color}`}>{stat.value}</div>
                <div className="text-xs font-mono text-on-surface-variant">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-xl">
          {/* Start Interview CTA */}
          <div className="glass-card rounded-2xl p-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-xl opacity-15 group-hover:opacity-30 transition-opacity">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '120px', fontVariationSettings: "'FILL' 1" }}>psychology</span>
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-sm px-md py-xs rounded-full border border-primary/30 bg-primary/10 text-xs font-mono text-primary mb-md">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                AI Ready
              </div>
              <h3 className="font-display text-2xl font-bold text-on-background mb-sm">Start a Mock Interview</h3>
              <p className="text-on-surface-variant mb-lg">Upload your resume and get a personalized AI-powered interview session in under 60 seconds.</p>
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
          <div className="glass-card rounded-2xl p-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-xl opacity-15 group-hover:opacity-30 transition-opacity">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: '120px' }}>history</span>
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-sm px-md py-xs rounded-full border border-secondary/30 bg-secondary/10 text-xs font-mono text-secondary mb-md">
                Last Session
              </div>
              <h3 className="font-display text-2xl font-bold text-on-background mb-sm">Performance Analysis</h3>
              <p className="text-on-surface-variant mb-sm">Senior Software Engineer · Session #8241</p>
              <div className="flex items-center gap-sm mb-lg">
                <span className="text-4xl font-bold font-display text-primary">82</span>
                <span className="text-on-surface-variant text-lg">/100</span>
                <span className="ml-sm px-sm py-xs bg-primary/20 text-primary text-xs font-mono rounded-full">+4pts</span>
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

        {/* Features Bento */}
        <section>
          <h3 className="font-display text-2xl font-bold text-on-background mb-lg">Platform Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-lg">
            {features.map(f => (
              <div key={f.title} className="glass-card rounded-xl p-lg group hover:border-primary/20 transition-all">
                <span className={`material-symbols-outlined ${f.color} text-3xl mb-md block`} style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                <h4 className="font-display text-lg font-bold text-on-background mb-sm">{f.title}</h4>
                <p className="text-sm text-on-surface-variant">{f.desc}</p>
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
    </div>
  )
}
