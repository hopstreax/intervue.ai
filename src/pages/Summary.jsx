import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services'

function RadarChart({ skills }) {
  // 5-axis radar with actual skill values
  const axes = [
    { label: 'Technical',    angle: -90,  value: skills.technical },
    { label: 'Comm.',        angle: -18,  value: skills.comm },
    { label: 'Problem Solv.',angle: 54,   value: skills.problem },
    { label: 'Confidence',   angle: 126,  value: skills.confidence },
    { label: 'Explanation',  angle: 198,  value: skills.explanation },
  ]
  const cx = 100, cy = 100, maxR = 80

  const toXY = (angle, r) => {
    const rad = (angle * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  const dataPoints = axes.map(a => {
    const r = (a.value / 100) * maxR
    const { x, y } = toXY(a.angle, r)
    return `${x},${y}`
  }).join(' ')

  const gridLevels = [0.25, 0.5, 0.75, 1.0]

  return (
    <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center mx-auto">
      <svg className="w-full h-full" viewBox="0 0 200 200">
        {/* Grid polygons */}
        {gridLevels.map((level, i) => {
          const pts = axes.map(a => {
            const { x, y } = toXY(a.angle, maxR * level)
            return `${x},${y}`
          }).join(' ')
          return <polygon key={i} points={pts} fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        })}
        {/* Axes */}
        {axes.map((a, i) => {
          const { x, y } = toXY(a.angle, maxR)
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        })}
        {/* Data polygon */}
        <polygon points={dataPoints} fill="rgba(192,193,255,0.15)" stroke="#c0c1ff" strokeWidth="2" />
        {/* Data dots */}
        {axes.map((a, i) => {
          const r = (a.value / 100) * maxR
          const { x, y } = toXY(a.angle, r)
          return <circle key={i} cx={x} cy={y} r="3" fill="#c0c1ff" />
        })}
      </svg>
      {/* Labels */}
      {axes.map((a, i) => {
        const { x, y } = toXY(a.angle, maxR + 18)
        const pct = (x / 200) * 100
        const vPct = (y / 200) * 100
        return (
          <div key={i} className="absolute text-[10px] font-mono text-on-surface-variant whitespace-nowrap"
            style={{ left: `${pct}%`, top: `${vPct}%`, transform: 'translate(-50%, -50%)' }}>
            {a.label}
          </div>
        )
      })}
    </div>
  )
}

export default function Summary() {
  const navigate = useNavigate()
  const user = authService.getUser()
  if (!user) { navigate('/login'); return null }

  const [activeTab, setActiveTab] = useState('analysis')

  const skills = { technical: 88, comm: 76, problem: 82, confidence: 70, explanation: 85 }

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
    { icon: 'security', color: 'text-tertiary',  bg: 'bg-tertiary/10',   title: 'JWT Authentication', sub: 'Focus on Refresh Tokens & Scopes',      priority: 'High' },
    { icon: 'api',      color: 'text-secondary', bg: 'bg-secondary/10',  title: 'REST API Patterns',  sub: 'HATEOAS and Versioning Strategies',     priority: 'Medium' },
    { icon: 'storage',  color: 'text-primary',   bg: 'bg-primary/10',    title: 'MongoDB Indexing',   sub: 'Compound & partial indexes',             priority: 'High' },
  ]
  const roadmap = [
    { day: 'MONDAY',    priority: 'High Priority', title: 'MongoDB Indexing Deep Dive',    desc: 'Review compound indexes, partial indexes, and explain plans to justify performance gains.' },
    { day: 'TUESDAY',   priority: null,            title: 'JWT & OAuth2 Protocols',        desc: 'Master the handshake process and security considerations for single-page applications.' },
    { day: 'WEDNESDAY', priority: null,            title: 'React Hooks Performance',       desc: 'Advanced patterns with useMemo, useCallback, and custom hooks for enterprise state management.' },
  ]

  const scoreBreakdown = [
    { label: 'Technical Depth',    score: 88, color: 'bg-primary', textColor: 'text-primary' },
    { label: 'Communication',      score: 76, color: 'bg-secondary', textColor: 'text-secondary' },
    { label: 'Problem Solving',    score: 82, color: 'bg-primary', textColor: 'text-primary' },
    { label: 'Confidence',         score: 70, color: 'bg-tertiary', textColor: 'text-tertiary' },
  ]

  return (
    <div className="bg-background text-on-background min-h-screen flex">

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 bg-surface-container-lowest border-r border-white/5 py-lg fixed left-0 top-0 z-40">
        <div className="px-lg mb-xl">
          <div className="flex items-center gap-sm mb-xs">
            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <h1 className="text-2xl font-bold font-display text-primary tracking-tighter">InterviewIQ</h1>
          </div>
          <p className="text-xs font-mono text-on-surface-variant opacity-50 uppercase tracking-widest ml-8">Premium Tier</p>
        </div>

        {/* Score summary in sidebar */}
        <div className="mx-lg mb-xl">
          <div className="glass-card rounded-xl p-md">
            <p className="text-xs font-mono text-outline-variant uppercase tracking-widest mb-sm">Session Score</p>
            <div className="flex items-baseline gap-xs mb-xs">
              <span className="text-4xl font-bold font-display text-primary tabular-nums">82</span>
              <span className="text-on-surface-variant">/100</span>
            </div>
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
              <span className="text-xs font-mono text-primary">Top 12% of applicants</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-sm space-y-xs">
          {[
            { label: 'Home',     icon: 'dashboard', to: '/dashboard' },
            { label: 'History',  icon: 'history',   to: '#', active: true },
            { label: 'Analytics',icon: 'analytics', to: '#' },
            { label: 'Settings', icon: 'settings',  to: '#' },
          ].map(item => (
            <Link key={item.label} to={item.to}
              className={`flex items-center gap-md px-md py-sm rounded-lg transition-all ${item.active ? 'nav-active' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'}`}>
              <span className="material-symbols-outlined" style={item.active ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="px-sm mt-auto pt-md border-t border-white/5 space-y-xs">
          <button onClick={() => navigate('/upload')} className="w-full py-md bg-primary text-on-primary font-bold rounded-lg active:scale-95 transition-all shadow-lg shadow-primary/20 hover:shadow-[0_0_20px_rgba(192,193,255,0.25)]">
            New Interview
          </button>
          <a href="#" className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined">help</span><span>Support</span>
          </a>
          <a href="#" className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined">logout</span><span>Sign Out</span>
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-64 px-lg md:px-xl py-xl max-w-[1280px] mx-auto w-full pb-24 md:pb-xl">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md mb-xl">
          <div>
            <div className="inline-flex items-center gap-sm px-md py-xs rounded-full border border-secondary/30 bg-secondary/10 text-xs font-mono text-secondary mb-sm">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              Session Complete
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-on-background tracking-tighter">Performance Analysis</h2>
            <p className="text-on-surface-variant mt-xs">Session #8241 · Senior Software Engineer (Full Stack)</p>
          </div>
          <div className="flex gap-sm w-full md:w-auto">
            <button className="flex-1 md:flex-none px-lg py-md border border-outline-variant/30 text-on-surface font-semibold rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center gap-xs text-sm">
              <span className="material-symbols-outlined text-base">download</span>
              Download PDF
            </button>
            <button onClick={() => navigate('/upload')} className="flex-1 md:flex-none px-lg py-md bg-primary text-on-primary font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-xs text-sm">
              <span className="material-symbols-outlined text-base">refresh</span>
              Retake
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-sm mb-xl border-b border-white/5 pb-0">
          {[
            { id: 'analysis', label: 'Analysis', icon: 'analytics' },
            { id: 'roadmap',  label: 'Roadmap',  icon: 'map' },
            { id: 'study',    label: 'Study Plan',icon: 'psychology' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-sm px-lg py-sm rounded-t-lg text-sm font-medium transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-white/3'
              }`}
            >
              <span className="material-symbols-outlined text-base" style={activeTab === tab.id ? { fontVariationSettings: "'FILL' 1" } : {}}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Analysis */}
        {activeTab === 'analysis' && (
          <div className="grid grid-cols-12 gap-lg">
            {/* Competency Matrix + Radar */}
            <section className="col-span-12 lg:col-span-7 glass-card rounded-xl p-lg relative overflow-hidden" style={{ boxShadow: '0 0 40px rgba(192,193,255,0.05)' }}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-[60px] rounded-full -mr-10 -mt-10" />
              <div className="flex justify-between items-start mb-lg">
                <div>
                  <h3 className="text-xl font-bold font-display text-primary">Competency Matrix</h3>
                  <p className="text-on-surface-variant text-sm">AI-evaluated across core pillars</p>
                </div>
                <div className="text-right">
                  <span className="text-5xl font-bold font-display text-primary tabular-nums">82<span className="text-2xl text-on-surface-variant/50">/100</span></span>
                  <p className="text-xs font-mono text-secondary uppercase tracking-widest mt-xs">Surgical Precision</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-xl">
                <RadarChart skills={skills} />
                <div className="flex-1 space-y-md w-full">
                  {/* Score breakdown bars */}
                  <div className="space-y-sm">
                    {scoreBreakdown.map(item => (
                      <div key={item.label}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-mono text-on-surface-variant">{item.label}</span>
                          <span className={`text-xs font-bold font-mono ${item.textColor} tabular-nums`}>{item.score}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-md bg-white/3 rounded-lg border border-white/5">
                    <p className="text-xs font-mono text-secondary mb-xs">AI FEEDBACK</p>
                    <p className="text-sm text-on-surface leading-relaxed">
                      Candidate demonstrates strong architectural thinking. Technical depth in MongoDB and React is evident, though security protocols (JWT) lacked specific implementation details.
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-on-surface-variant">Top 12% of applicants</span>
                    <span className="text-primary font-bold">+4pts from last session</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Skill Breakdown */}
            <section className="col-span-12 lg:col-span-5 glass-card rounded-xl p-lg">
              <h3 className="text-xl font-bold font-display mb-lg">Skill Breakdown</h3>
              <div className="space-y-xl">
                <div>
                  <p className="text-xs font-mono text-secondary uppercase tracking-widest mb-md flex items-center gap-sm">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Key Strengths
                  </p>
                  <ul className="space-y-md">
                    {strengths.map(s => (
                      <li key={s} className="flex items-start gap-sm p-sm rounded-lg hover:bg-white/3 transition-all">
                        <span className="material-symbols-outlined text-secondary text-xl mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        <span className="text-sm text-on-surface">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-mono text-error uppercase tracking-widest mb-md flex items-center gap-sm">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    Areas to Improve
                  </p>
                  <ul className="space-y-md">
                    {weaknesses.map(w => (
                      <li key={w} className="flex items-start gap-sm p-sm rounded-lg hover:bg-error/5 transition-all">
                        <span className="material-symbols-outlined text-error text-xl shrink-0">warning</span>
                        <span className="text-sm text-on-surface-variant">{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Tab: Roadmap */}
        {activeTab === 'roadmap' && (
          <section className="glass-card rounded-xl p-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32" />
            <h3 className="text-xl font-bold font-display mb-xl flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
              7-Day Improvement Roadmap
            </h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-outline-variant/30 to-transparent hidden md:block" />
              <div className="space-y-lg relative">
                {roadmap.map((item, i) => (
                  <div key={item.day} className="flex flex-col md:flex-row gap-md items-start md:items-center relative group">
                    <div className={`hidden md:flex absolute left-4 -translate-x-1/2 w-5 h-5 rounded-full border-4 border-background z-10 transition-all group-hover:scale-125 ${i === 0 ? 'bg-primary' : 'bg-outline-variant group-hover:bg-primary/50'}`}
                      style={i === 0 ? { boxShadow: '0 0 15px rgba(192,193,255,0.4)' } : {}}
                    />
                    <div className="w-full md:w-36 flex flex-col items-start md:items-end md:pr-4">
                      <span className={`text-xs font-mono font-bold uppercase ${i === 0 ? 'text-primary' : 'text-on-surface-variant'}`}>{item.day}</span>
                    </div>
                    <div className="flex-1 bg-surface-container-low p-lg rounded-xl border border-white/5 hover:border-primary/20 transition-all cursor-default group-hover:shadow-[0_0_20px_rgba(192,193,255,0.05)]">
                      <div className="flex justify-between items-start mb-sm">
                        <h4 className="font-bold text-on-surface">{item.title}</h4>
                        {item.priority && (
                          <span className="px-sm py-xs bg-primary/10 text-primary text-xs font-mono rounded-full shrink-0 ml-md">{item.priority}</span>
                        )}
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Mentor CTA */}
            <div className="mt-xl p-lg bg-primary/5 rounded-xl border border-primary/15 flex flex-col md:flex-row items-center justify-between gap-md">
              <div className="flex items-center gap-md">
                <div className="w-12 h-12 rounded-full bg-surface-container-high border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
                </div>
                <div>
                  <p className="text-on-surface font-semibold">Talk to a Mentor</p>
                  <p className="text-xs font-mono text-on-surface-variant">Book a 15-min session to review these gaps.</p>
                </div>
              </div>
              <button className="px-xl py-sm bg-primary text-on-primary rounded-full font-bold text-sm active:scale-95 transition-all hover:shadow-[0_0_20px_rgba(192,193,255,0.3)] w-full md:w-auto">
                Schedule Now
              </button>
            </div>
          </section>
        )}

        {/* Tab: Study Plan */}
        {activeTab === 'study' && (
          <section className="glass-card rounded-xl p-lg">
            <div className="flex items-center gap-sm mb-lg">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              <h3 className="text-xl font-bold font-display">Recommended Study Topics</h3>
            </div>
            <div className="space-y-md">
              {studyTopics.map(topic => (
                <div key={topic.title} className="group flex items-center justify-between p-lg border border-outline-variant/15 rounded-xl hover:border-primary/30 transition-all cursor-pointer hover:bg-white/2">
                  <div className="flex items-center gap-md">
                    <div className={`w-12 h-12 rounded-xl ${topic.bg} flex items-center justify-center ${topic.color} group-hover:scale-110 transition-transform`}>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{topic.icon}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-sm mb-xs">
                        <p className="font-bold text-on-surface">{topic.title}</p>
                        <span className={`px-sm py-0.5 text-xs font-mono rounded-full ${
                          topic.priority === 'High' ? 'bg-error/15 text-error' : 'bg-outline-variant/20 text-on-surface-variant'
                        }`}>{topic.priority}</span>
                      </div>
                      <p className="text-xs font-mono text-on-surface-variant">{topic.sub}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all">arrow_forward</span>
                </div>
              ))}
              <button className="w-full py-lg border border-primary/30 text-primary font-bold rounded-xl hover:bg-primary/10 transition-all active:scale-95 flex items-center justify-center gap-sm">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                Start Practice Session
              </button>
            </div>
          </section>
        )}

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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-md z-50">
        {[
          { icon: 'dashboard',  label: 'Home',    to: '/dashboard' },
          { icon: 'history',    label: 'History', to: '#', active: true },
          { icon: 'analytics',  label: 'Stats',   to: '#' },
          { icon: 'settings',   label: 'Settings',to: '#' },
        ].map(item => (
          <Link key={item.label} to={item.to} className={`flex flex-col items-center gap-0.5 ${item.active ? 'text-primary' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined text-xl" style={item.active ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
            <span className="text-[9px] font-mono uppercase tracking-widest">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
