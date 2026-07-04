import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services'

function RadarChart() {
  return (
    <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center mx-auto">
      <svg className="w-full h-full" viewBox="0 0 200 200">
        {/* Grid */}
        <polygon className="fill-transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="1" points="100,20 176,75 147,165 53,165 24,75" />
        <polygon className="fill-transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="1" points="100,40 157,81 135,148 65,148 43,81" />
        <polygon className="fill-transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="1" points="100,60 138,87 123,132 77,132 62,87" />
        {/* Data Area */}
        <polygon fill="rgba(192,193,255,0.2)" stroke="#c0c1ff" strokeWidth="2" points="100,30 155,85 140,155 70,140 45,85" />
        {/* Axis Lines */}
        {[
          [100,100,100,20], [100,100,176,75], [100,100,147,165],
          [100,100,53,165], [100,100,24,75]
        ].map(([x1,y1,x2,y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        ))}
      </svg>
      {/* Labels */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-xs font-mono text-on-surface-variant bg-background px-xs">Technical</div>
      <div className="absolute top-1/4 right-0 translate-x-2 text-xs font-mono text-on-surface-variant bg-background px-xs">Comm.</div>
      <div className="absolute bottom-4 right-8 text-xs font-mono text-on-surface-variant bg-background px-xs">Problem Solving</div>
      <div className="absolute bottom-4 left-8 text-xs font-mono text-on-surface-variant bg-background px-xs">Confidence</div>
      <div className="absolute top-1/4 left-0 -translate-x-2 text-xs font-mono text-on-surface-variant bg-background px-xs">Explanation</div>
    </div>
  )
}

export default function Summary() {
  const navigate = useNavigate()
  const user = authService.getUser()
  if (!user) { navigate('/login'); return null }

  const strengths = [
    'Clear articulation of complex system architecture',
    'Expert knowledge of React hook lifecycle optimization',
    'Strong debugging methodology demonstration',
  ]
  const weaknesses = [
    'Vague explanation of database indexing strategies',
    'Over-reliance on standard library for security',
  ]
  const studyTopics = [
    { icon: 'security', color: 'text-tertiary', bg: 'bg-tertiary-container/20', title: 'JWT Authentication', sub: 'Focus on Refresh Tokens & Scopes' },
    { icon: 'api',      color: 'text-secondary', bg: 'bg-secondary-container/20', title: 'REST API Patterns', sub: 'HATEOAS and Versioning Strategies' },
    { icon: 'storage',  color: 'text-primary',   bg: 'bg-primary/10', title: 'MongoDB Indexing', sub: 'Compound & partial indexes' },
  ]
  const roadmap = [
    { day: 'MONDAY',    priority: 'High Priority', title: 'MongoDB Indexing Deep Dive', desc: 'Review compound indexes, partial indexes, and explain plans to justify performance gains.' },
    { day: 'TUESDAY',   priority: null,            title: 'JWT & OAuth2 Protocols', desc: 'Master the handshake process and security considerations for single-page applications.' },
    { day: 'WEDNESDAY', priority: null,            title: 'React Hooks Performance', desc: 'Advanced patterns with useMemo, useCallback, and custom hooks for enterprise state management.' },
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
          {[
            { label: 'Home', icon: 'dashboard', to: '/dashboard' },
            { label: 'History', icon: 'history', to: '#', active: true },
            { label: 'Analytics', icon: 'analytics', to: '#' },
            { label: 'Settings', icon: 'settings', to: '#' },
          ].map(item => (
            <Link key={item.label} to={item.to}
              className={`flex items-center gap-md px-md py-sm rounded-lg transition-all ${item.active ? 'nav-active' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'}`}>
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="px-md mt-lg">
          <button
            onClick={() => navigate('/interview')}
            className="w-full py-md bg-primary text-on-primary font-bold rounded-lg active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            Start New Interview
          </button>
        </div>
        <div className="mt-auto px-sm space-y-xs pt-md border-t border-white/5 mt-lg">
          <a href="#" className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined">help</span>
            <span>Support</span>
          </a>
          <a href="#" className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined">logout</span>
            <span>Sign Out</span>
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-64 p-lg md:p-xl max-w-[1280px] mx-auto w-full pb-20">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md mb-xl">
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-on-background tracking-tighter">Performance Analysis</h2>
            <p className="text-on-surface-variant">Session #8241: Senior Software Engineer (Full Stack)</p>
          </div>
          <div className="flex gap-sm w-full md:w-auto">
            <button className="flex-1 md:flex-none px-lg py-md border border-outline-variant/30 text-on-surface font-semibold rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center gap-xs">
              <span className="material-symbols-outlined text-xl">download</span>
              Download PDF
            </button>
            <button
              onClick={() => navigate('/interview')}
              className="flex-1 md:flex-none px-lg py-md bg-white text-black font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-xs"
            >
              <span className="material-symbols-outlined text-xl">refresh</span>
              Retake Interview
            </button>
          </div>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-lg">
          {/* Competency Matrix + Radar */}
          <section className="col-span-12 lg:col-span-7 glass-card rounded-xl p-lg ai-glow overflow-hidden relative">
            <div className="flex justify-between items-start mb-lg">
              <div>
                <h3 className="text-xl font-bold font-display text-primary">Competency Matrix</h3>
                <p className="text-on-surface-variant text-sm">AI-evaluated performance across core pillars</p>
              </div>
              <div className="text-right">
                <span className="text-5xl font-bold font-display text-primary">82<span className="text-2xl text-on-surface-variant/50">/100</span></span>
                <p className="text-xs font-mono text-secondary uppercase tracking-widest">Surgical Precision</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-xl">
              <RadarChart />
              <div className="flex-1 space-y-md w-full">
                <div className="p-md bg-white/5 rounded-lg border border-white/5">
                  <p className="text-xs font-mono text-secondary mb-xs">AI FEEDBACK</p>
                  <p className="text-sm text-on-surface leading-relaxed">
                    Candidate demonstrates strong architectural thinking. Technical depth in MongoDB and React is evident, though security protocols (JWT) lacked specific implementation details.
                  </p>
                </div>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-on-surface-variant">Top 12% of applicants</span>
                  <span className="text-primary">+4pts from last session</span>
                </div>
              </div>
            </div>
          </section>

          {/* Study Topics */}
          <section className="col-span-12 lg:col-span-5 glass-card rounded-xl p-lg">
            <div className="flex items-center gap-sm mb-lg">
              <span className="material-symbols-outlined text-primary">psychology</span>
              <h3 className="text-xl font-bold font-display">Study Topics</h3>
            </div>
            <div className="space-y-md">
              {studyTopics.map(topic => (
                <div key={topic.title} className="group flex items-center justify-between p-md border border-outline-variant/20 rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-md">
                    <div className={`w-10 h-10 rounded ${topic.bg} flex items-center justify-center ${topic.color}`}>
                      <span className="material-symbols-outlined">{topic.icon}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface">{topic.title}</p>
                      <p className="text-xs font-mono text-on-surface-variant">{topic.sub}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">arrow_forward</span>
                </div>
              ))}
              <button className="w-full py-md border border-primary/30 text-primary font-bold rounded-lg hover:bg-primary/10 transition-all active:scale-95">
                Start Practice Session
              </button>
            </div>
          </section>

          {/* Skill Breakdown */}
          <section className="col-span-12 lg:col-span-4 glass-card rounded-xl p-lg">
            <h3 className="text-xl font-bold font-display mb-lg">Skill Breakdown</h3>
            <div className="space-y-xl">
              <div>
                <p className="text-xs font-mono text-secondary uppercase tracking-widest mb-md">Key Strengths</p>
                <ul className="space-y-md">
                  {strengths.map(s => (
                    <li key={s} className="flex items-start gap-sm">
                      <span className="material-symbols-outlined text-secondary text-xl mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span className="text-sm text-on-surface">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-mono text-error uppercase tracking-widest mb-md">Weaknesses</p>
                <ul className="space-y-md">
                  {weaknesses.map(w => (
                    <li key={w} className="flex items-start gap-sm">
                      <span className="material-symbols-outlined text-error text-xl">warning</span>
                      <span className="text-sm text-on-surface-variant">{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Improvement Roadmap */}
          <section className="col-span-12 lg:col-span-8 glass-card rounded-xl p-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32" />
            <h3 className="text-xl font-bold font-display mb-xl flex items-center gap-sm">
              <span className="material-symbols-outlined">map</span>
              Improvement Roadmap
            </h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-outline-variant/30 hidden md:block" />
              <div className="space-y-lg relative">
                {roadmap.map((item, i) => (
                  <div key={item.day} className="flex flex-col md:flex-row gap-md items-start md:items-center relative">
                    <div className={`hidden md:flex absolute left-4 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-background z-10 ${i === 0 ? 'bg-primary ai-glow' : 'bg-outline-variant'}`} />
                    <div className="w-full md:w-32 flex flex-col items-start md:items-end">
                      <span className={`text-xs font-mono ${i === 0 ? 'text-primary' : 'text-on-surface-variant'}`}>{item.day}</span>
                    </div>
                    <div className="flex-1 bg-surface-container-low p-md rounded-lg border border-white/5 hover:border-primary/30 transition-all cursor-default">
                      <div className="flex justify-between items-center mb-xs">
                        <h4 className="font-bold text-on-surface">{item.title}</h4>
                        {item.priority && (
                          <span className="px-sm py-xs bg-primary-container/20 text-primary text-xs font-mono rounded">{item.priority}</span>
                        )}
                      </div>
                      <p className="text-sm text-on-surface-variant">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Mentor CTA */}
            <div className="mt-xl p-md bg-primary/5 rounded-xl border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-md">
              <div className="flex items-center gap-md">
                <div className="w-12 h-12 rounded-full bg-surface-container-high border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">support_agent</span>
                </div>
                <div>
                  <p className="text-on-surface font-semibold">Talk to a Mentor</p>
                  <p className="text-xs font-mono text-on-surface-variant">Book a 15-min session to review these gaps.</p>
                </div>
              </div>
              <button className="px-lg py-sm bg-primary text-on-primary rounded-full font-bold text-sm active:scale-95 transition-all">
                Schedule Now
              </button>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="w-full py-xl mt-10 flex flex-col md:flex-row justify-between items-center gap-md border-t border-white/5">
          <div className="flex flex-col gap-xs items-center md:items-start">
            <h4 className="font-display text-lg font-bold text-on-background">InterviewIQ</h4>
            <p className="text-xs font-mono text-on-surface-variant">© 2024 InterviewIQ AI. Surgical precision in every hire.</p>
          </div>
          <div className="flex gap-lg">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'].map(link => (
              <a key={link} href="#" className="text-xs font-mono text-on-surface-variant hover:text-secondary transition-colors">{link}</a>
            ))}
          </div>
        </footer>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest border-t border-white/5 flex items-center justify-around px-md z-50">
        {[
          { icon: 'dashboard', label: 'Home', to: '/dashboard' },
          { icon: 'history', label: 'History', to: '#', active: true },
          { icon: 'analytics', label: 'Analytics', to: '#' },
          { icon: 'settings', label: 'Settings', to: '#' },
        ].map(item => (
          <Link key={item.label} to={item.to} className={`flex flex-col items-center gap-1 ${item.active ? 'text-primary' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined" style={item.active ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
            <span className="text-[10px] font-mono">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
