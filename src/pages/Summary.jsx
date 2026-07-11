import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useInView, animate } from 'framer-motion'
import { authService, interviewService } from '../services'

const EASE = [0.16, 1, 0.3, 1]

/* ── Radar Chart ──────────────────────────────────────────────────────── */
function RadarChart({ skills }) {
  const axes = [
    { label: 'Technical',    angle: -90,  value: skills.technical },
    { label: 'Comm.',        angle: -18,  value: skills.comm },
    { label: 'Problem Solv.',angle: 54,   value: skills.problem },
    { label: 'Confidence',   angle: 126,  value: skills.confidence },
    { label: 'Explanation',  angle: 198,  value: skills.explanation },
  ]
  const cx = 100, cy = 100, maxR = 78
  const toXY = (angle, r) => ({ x: cx + r * Math.cos((angle * Math.PI) / 180), y: cy + r * Math.sin((angle * Math.PI) / 180) })
  const dataPoints = axes.map(a => { const r = (a.value / 100) * maxR; const { x, y } = toXY(a.angle, r); return `${x},${y}` }).join(' ')
  const gridLevels = [0.25, 0.5, 0.75, 1.0]

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 260, aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
      <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 200 200">
        {gridLevels.map((level, i) => {
          const pts = axes.map(a => { const { x, y } = toXY(a.angle, maxR * level); return `${x},${y}` }).join(' ')
          return <polygon key={i} points={pts} fill="transparent" stroke="rgba(26,26,26,0.08)" strokeWidth="1" />
        })}
        {axes.map((a, i) => { const { x, y } = toXY(a.angle, maxR); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(26,26,26,0.08)" strokeWidth="1" /> })}
        <motion.polygon
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          points={dataPoints}
          fill="rgba(255,117,87,0.15)"
          stroke="#ff7557"
          strokeWidth="2"
          style={{ transformOrigin: '100px 100px' }}
        />
        {axes.map((a, i) => {
          const r = (a.value / 100) * maxR
          const { x, y } = toXY(a.angle, r)
          return (
            <motion.circle
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + i * 0.08, type: 'spring' }}
              cx={x} cy={y} r="4"
              fill="#ff7557"
            />
          )
        })}
      </svg>
      {axes.map((a, i) => {
        const { x, y } = toXY(a.angle, maxR + 18)
        return (
          <div key={i} style={{ position: 'absolute', fontSize: 9, fontWeight: 700, color: '#888', whiteSpace: 'nowrap', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', left: `${(x / 200) * 100}%`, top: `${(y / 200) * 100}%`, transform: 'translate(-50%,-50%)' }}>
            {a.label}
          </div>
        )
      })}
    </div>
  )
}

/* ── Score Ring ───────────────────────────────────────────────────────── */
function ScoreRing({ score, size = 110 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [progress, setProgress] = useState(0)
  const circumference = 2 * Math.PI * 40

  useEffect(() => {
    if (!isInView) return
    const ctrl = animate(0, score, { duration: 1.5, ease: EASE, onUpdate: v => setProgress(v) })
    return ctrl.stop
  }, [isInView, score])

  return (
    <div ref={ref} style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r="40" fill="none" stroke="#e8e5de" strokeWidth="7" />
        <motion.circle
          cx="50" cy="50" r="40" fill="none"
          stroke="#ff7557" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (progress / 100) * circumference}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'Space Grotesk', fontSize: size > 90 ? 26 : 20, fontWeight: 900, color: '#1a1a1a', lineHeight: 1 }}>{Math.round(progress)}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</span>
      </div>
    </div>
  )
}

/* ── Score Bar ────────────────────────────────────────────────────────── */
function ScoreBar({ item, idx }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <div ref={ref}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#555', marginBottom: 5 }}>
        <span style={{ fontWeight: 600 }}>{item.label}</span>
        <span style={{ fontFamily: 'monospace', fontWeight: 800, color: item.color }}>{item.score}%</span>
      </div>
      <div style={{ height: 6, background: '#e8e5de', borderRadius: 99, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${item.score}%` } : {}}
          transition={{ duration: 1.1, ease: EASE, delay: idx * 0.1 }}
          style={{ height: '100%', background: item.color, borderRadius: 99 }}
        />
      </div>
    </div>
  )
}


function Sidebar({ overallScore, onSignOut, onNewInterview }) {
  return (
    <aside style={{ flexDirection: 'column', height: '100vh', width: 240, background: '#fff', borderRight: '1.5px solid #1a1a1a', padding: 0, position: 'fixed', left: 0, top: 0, zIndex: 40 }} className="sum-sidebar">
      <style>{`.sum-sidebar { display: none; } @media (min-width: 769px) { .sum-sidebar { display: flex; } }`}</style>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #e8e5de' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, background: '#1a1a1a', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#ff7557', fontSize: 14, fontWeight: 900, fontFamily: 'Space Grotesk' }}>IQ</span>
          </div>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#1a1a1a', letterSpacing: '-0.03em' }}>InterviewIQ</span>
        </Link>
      </div>

      {/* Score */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8e5de' }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Session Score</p>
        <div style={{ background: '#f7f5f0', border: '1px solid #e8e5de', borderRadius: 14, padding: '14px 16px', textAlign: 'center' }}>
          <ScoreRing score={overallScore} size={90} />
          <div style={{ marginTop: 8, fontSize: 11, color: '#ff7557', fontWeight: 700, fontFamily: 'monospace' }}>↑ Top 12% of applicants</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[
          { label: 'Home', icon: '🏠', to: '/dashboard' },
          { label: 'History', icon: '📋', to: '#', active: true },
          { label: 'Analytics', icon: '📊', to: '#' },
          { label: 'Settings', icon: '⚙', to: '#' },
        ].map(item => (
          <Link key={item.label} to={item.to} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, textDecoration: 'none', fontSize: 14, fontWeight: 600, background: item.active ? '#1a1a1a' : 'transparent', color: item.active ? '#ff7557' : '#555', transition: 'background 0.2s, color 0.2s' }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px', borderTop: '1px solid #e8e5de' }}>
        <button onClick={onNewInterview}
          style={{ display: 'block', width: '100%', textAlign: 'center', padding: '11px', background: '#ff7557', color: '#1a0a04', borderRadius: 99, fontWeight: 800, fontSize: 13, textDecoration: 'none', border: 'none', cursor: 'pointer', marginBottom: 10, letterSpacing: '-0.01em', fontFamily: 'Space Grotesk' }}>
          + New Interview
        </button>
        <button onClick={onSignOut}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 12, width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#888', fontWeight: 600 }}>
          🚪 Sign Out
        </button>
      </div>
    </aside>
  )
}

/* ── Main Summary Component ───────────────────────────────────────────── */
export default function Summary() {
  const navigate = useNavigate()
  const user = authService.getUser()
  const [evalData, setEvalData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('analysis')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    async function loadSummary() {
      try {
        const res = await interviewService.getSummary()
        if (res && res.success && res.data) setEvalData(res.data)
      } catch (err) {
        console.warn('Failed to load real summary, using mock:', err.message)
      } finally {
        setLoading(false)
      }
    }
    loadSummary()
  }, [user?._id, navigate])

  if (!user) return null

  const handleSignOut = () => { authService.logout(); navigate('/login') }
  const handleNewInterview = () => navigate('/upload')

  const skills = evalData ? {
    technical: evalData.technicalDepth || 80,
    comm: evalData.communication || 75,
    problem: evalData.problemSolving || 80,
    confidence: evalData.confidence || 75,
    explanation: evalData.explanation || 80
  } : { technical: 88, comm: 76, problem: 82, confidence: 70, explanation: 85 }

  const overallScore = evalData ? (evalData.overallScore || 80) : 82

  const strengths = evalData?.strengths?.length > 0 ? evalData.strengths : [
    'Clear articulation of complex system architecture',
    'Expert knowledge of React hook lifecycle optimization',
    'Strong debugging methodology demonstration',
  ]

  const weaknesses = evalData?.weaknesses?.length > 0 ? evalData.weaknesses : [
    'Vague explanation of database indexing strategies',
    'Over-reliance on standard library for security',
  ]

  const studyTopics = evalData?.studyTopics?.length > 0 ? evalData.studyTopics : [
    { icon: '🔒', title: 'JWT Authentication', sub: 'Focus on Refresh Tokens & Scopes', priority: 'High', accent: '#ef4444' },
    { icon: '🔗', title: 'REST API Patterns', sub: 'HATEOAS and Versioning Strategies', priority: 'Medium', accent: '#f59e0b' },
    { icon: '🗄', title: 'MongoDB Indexing', sub: 'Compound & partial indexes', priority: 'High', accent: '#ef4444' },
  ]

  const roadmap = evalData?.roadmap?.length > 0 ? evalData.roadmap : [
    { day: 'MONDAY', priority: 'High Priority', title: 'MongoDB Indexing Deep Dive', desc: 'Review compound indexes, partial indexes, and explain plans to justify performance gains.' },
    { day: 'TUESDAY', priority: null, title: 'JWT & OAuth2 Protocols', desc: 'Master the handshake process and security considerations for single-page applications.' },
    { day: 'WEDNESDAY', priority: null, title: 'React Hooks Performance', desc: 'Advanced patterns with useMemo, useCallback, and custom hooks for enterprise state management.' },
  ]

  const aiFeedback = evalData?.aiFeedback || 'Candidate demonstrates strong architectural thinking. Technical depth in MongoDB and React is evident, though security protocols (JWT) lacked specific implementation details.'

  const scoreBreakdown = [
    { label: 'Technical Depth', score: skills.technical, color: '#ff7557' },
    { label: 'Communication', score: skills.comm, color: '#4285f4' },
    { label: 'Problem Solving', score: skills.problem, color: '#22c55e' },
    { label: 'Confidence', score: skills.confidence, color: '#f59e0b' },
  ]

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7f5f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #e8e5de', borderTopColor: '#ff7557' }} />
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.03em', marginBottom: 6 }}>Loading Performance Report</h2>
          <p style={{ fontSize: 13, color: '#888' }}>Fetching your latest interview insights...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f5f0', fontFamily: "'Inter', 'DM Sans', sans-serif", display: 'flex' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .coral-btn-sm { background: #ff7557; color: #1a0a04; border: none; cursor: pointer; font-weight: 800; border-radius: 99px; transition: background 0.2s; }
        .coral-btn-sm:hover { background: #ff5e3a; }
        .sum-tab { padding: 10px 18px; border-radius: 12px 12px 0 0; border: none; cursor: pointer; font-size: 14px; font-weight: 700; background: transparent; transition: background 0.2s, color 0.2s; font-family: Space Grotesk, sans-serif; border-bottom: 2px solid transparent; }
        .sum-tab.active { color: #ff7557; border-bottom-color: #ff7557; background: #fff6f4; }
        .sum-tab:not(.active) { color: #888; }
        .sum-tab:not(.active):hover { background: rgba(26,26,26,0.04); color: #555; }
        .bento-sm { background: #fff; border: 1.5px solid #1a1a1a; border-radius: 20px; }
      `}</style>

      <Sidebar overallScore={overallScore} onSignOut={handleSignOut} onNewInterview={handleNewInterview} />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ flex: 1, padding: '32px 24px 80px', maxWidth: 1200, width: '100%' }}
        className="sum-main"
      >
        <style>{`@media (min-width: 769px) { .sum-main { margin-left: 240px; } }`}</style>

        {/* Header */}
        <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 32 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0f9f4', border: '1.5px solid #22c55e', borderRadius: 99, padding: '5px 14px', marginBottom: 14 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#15803d', letterSpacing: '0.04em', fontFamily: 'Space Grotesk' }}>Session Complete</span>
            </div>
            <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.04em', marginBottom: 6, lineHeight: 1.1 }}>Performance Analysis</h1>
            <p style={{ fontSize: 14, color: '#888' }}>Session #8241 · Senior Software Engineer (Full Stack)</p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button style={{ padding: '10px 18px', border: '1.5px solid #1a1a1a', borderRadius: 99, background: '#fff', color: '#1a1a1a', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              ⬇ Download PDF
            </button>
            <motion.button onClick={() => navigate('/upload')}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="coral-btn-sm"
              style={{ padding: '10px 20px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              🔄 Retake
            </motion.button>
          </div>
        </header>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1.5px solid #1a1a1a', marginBottom: 28 }}>
          {[
            { id: 'analysis', label: '📊 Analysis' },
            { id: 'roadmap', label: '🗺 Roadmap' },
            { id: 'study', label: '🧠 Study Plan' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`sum-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="tabUnder"
                  style={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: 2, background: '#ff7557', borderRadius: 99 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">

          {/* ANALYSIS TAB */}
          {activeTab === 'analysis' && (
            <motion.div key="analysis"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.4, ease: EASE }}
              style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 20 }}
              className="analysis-grid"
            >
              <style>{`@media (max-width: 900px) { .analysis-grid { grid-template-columns: 1fr !important; } }`}</style>

              {/* Left: Competency + Radar */}
              <div className="bento-sm" style={{ padding: 28, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'radial-gradient(circle, rgba(255,117,87,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                    <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.03em', marginBottom: 4 }}>Competency Matrix</h3>
                    <p style={{ fontSize: 12, color: '#888' }}>AI-evaluated across core pillars</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Space Grotesk', fontSize: 42, fontWeight: 900, color: '#ff7557', lineHeight: 1, letterSpacing: '-0.04em' }}>
                      {overallScore}<span style={{ fontSize: 20, color: '#ccc' }}>/100</span>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#ff7557', fontFamily: 'monospace' }}>SURGICAL PRECISION</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
                  <RadarChart skills={skills} />
                  <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 16 }}>
                     {scoreBreakdown.map((item, idx) => (
                        <ScoreBar key={item.label} item={item} idx={idx} />
                      ))}

                    <div style={{ padding: '12px 14px', background: '#f7f5f0', border: '1px solid #e8e5de', borderRadius: 12, marginTop: 4 }}>
                      <p style={{ fontSize: 10, fontWeight: 800, color: '#ff7557', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5, fontFamily: 'monospace' }}>AI FEEDBACK</p>
                      <p style={{ fontSize: 12, color: '#444', lineHeight: 1.65 }}>{aiFeedback}</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888', fontFamily: 'monospace' }}>
                      <span>Top 12% of applicants</span>
                      <span style={{ color: '#22c55e', fontWeight: 700 }}>+4pts from last</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Skill Breakdown */}
              <div className="bento-sm" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.02em', marginBottom: 22 }}>Skill Breakdown</h3>

                <div style={{ marginBottom: 22 }}>
                  <p style={{ fontSize: 10, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>✓</span> Key Strengths
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {strengths.map((s, idx) => (
                      <motion.div key={s}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08, duration: 0.3 }}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: '#f0f9f4', borderRadius: 12, border: '1px solid #bbf7d0' }}
                      >
                        <span style={{ color: '#22c55e', fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
                        <span style={{ fontSize: 13, color: '#1a1a1a', lineHeight: 1.5 }}>{s}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <p style={{ fontSize: 10, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>⚠</span> Areas to Improve
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {weaknesses.map((w, idx) => (
                      <motion.div key={w}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (idx + strengths.length) * 0.08, duration: 0.3 }}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: '#fff0ed', borderRadius: 12, border: '1px solid #ffd4c8' }}
                      >
                        <span style={{ color: '#ef4444', fontSize: 14, flexShrink: 0, marginTop: 1 }}>⚠</span>
                        <span style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>{w}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ROADMAP TAB */}
          {activeTab === 'roadmap' && (
            <motion.section key="roadmap"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="bento-sm"
              style={{ padding: 32 }}
            >
              <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.04em', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
                🗺 7-Day Improvement Roadmap
              </h3>

              <div style={{ position: 'relative', paddingLeft: 28 }}>
                <div style={{ position: 'absolute', left: 10, top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom, #ff7557, #e8e5de)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {roadmap.map((item, i) => (
                    <motion.div key={item.day}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.4, ease: EASE }}
                      style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}
                    >
                      <div style={{ position: 'absolute', left: 6, width: 10, height: 10, borderRadius: '50%', background: i === 0 ? '#ff7557' : '#d5d0c8', border: `2px solid ${i === 0 ? '#ff7557' : '#d5d0c8'}`, boxShadow: i === 0 ? '0 0 0 4px rgba(255,117,87,0.15)' : 'none', marginTop: 4 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: i === 0 ? '#ff7557' : '#aaa', fontFamily: 'monospace', letterSpacing: '0.08em' }}>{item.day}</span>
                          {item.priority && (
                            <span style={{ fontSize: 10, fontWeight: 800, color: '#ff7557', background: '#fff6f4', border: '1px solid #ffd4c8', borderRadius: 99, padding: '2px 10px', fontFamily: 'monospace' }}>{item.priority}</span>
                          )}
                        </div>
                        <div style={{ background: '#f7f5f0', border: '1px solid #e8e5de', borderRadius: 14, padding: '14px 18px' }}>
                          <h4 style={{ fontSize: 15, fontWeight: 800, color: '#1a1a1a', marginBottom: 6 }}>{item.title}</h4>
                          <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{item.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Mentor CTA */}
              <div style={{ marginTop: 28, padding: '20px 24px', background: '#f7f5f0', border: '1.5px solid #1a1a1a', borderRadius: 18, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ width: 48, height: 48, borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    🧑‍💼
                  </motion.div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 800, color: '#1a1a1a', marginBottom: 3 }}>Talk to a Mentor</p>
                    <p style={{ fontSize: 12, color: '#888' }}>Book a 15-min session to review these gaps.</p>
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="coral-btn-sm"
                  style={{ padding: '11px 24px', fontSize: 14, letterSpacing: '-0.01em' }}>
                  Schedule Now →
                </motion.button>
              </div>
            </motion.section>
          )}

          {/* STUDY PLAN TAB */}
          {activeTab === 'study' && (
            <motion.section key="study"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="bento-sm"
              style={{ padding: 32 }}
            >
              <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.04em', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                🧠 Recommended Study Topics
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {studyTopics.map((topic, idx) => (
                  <motion.div key={topic.title}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.35, ease: EASE }}
                    whileHover={{ x: 4, borderColor: '#1a1a1a' }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#f7f5f0', border: '1.5px solid #e8e5de', borderRadius: 16, cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', border: '1.5px solid #e8e5de', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                        {topic.icon}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <p style={{ fontSize: 15, fontWeight: 800, color: '#1a1a1a' }}>{topic.title}</p>
                          <span style={{ fontSize: 10, fontWeight: 800, color: (topic.accent || (topic.priority === 'High' ? '#ef4444' : '#f59e0b')), background: topic.priority === 'High' ? '#fff0ed' : '#fefce8', border: `1px solid ${topic.priority === 'High' ? '#ffd4c8' : '#fde68a'}`, borderRadius: 99, padding: '2px 8px', fontFamily: 'monospace' }}>
                            {topic.priority}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: '#888', fontFamily: 'monospace' }}>{topic.sub}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: 18, color: '#ccc' }}>→</span>
                  </motion.div>
                ))}

                <motion.button
                  whileHover={{ scale: 1.01, borderColor: '#ff7557' }}
                  whileTap={{ scale: 0.99 }}
                  style={{ width: '100%', padding: '14px', border: '1.5px dashed #d5d0c8', borderRadius: 16, background: 'transparent', color: '#ff7557', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, fontFamily: 'Space Grotesk', transition: 'border-color 0.2s', letterSpacing: '-0.01em' }}
                >
                  ▶ Start Practice Session
                </motion.button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer style={{ marginTop: 40, borderTop: '1.5px solid #e8e5de', paddingTop: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div>
            <span style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.02em' }}>InterviewIQ AI</span>
            <p style={{ fontSize: 11, color: '#aaa', fontFamily: 'monospace', marginTop: 2 }}>© 2024 InterviewIQ AI. Surgical precision in every interview.</p>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy', 'Terms', 'Security'].map(l => <a key={l} href="#" style={{ fontSize: 11, color: '#aaa', textDecoration: 'none', fontFamily: 'monospace' }}>{l}</a>)}
          </div>
        </footer>
      </motion.main>

      {/* Mobile Bottom Nav */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 64, background: 'rgba(247,245,240,0.96)', backdropFilter: 'blur(18px)', borderTop: '1.5px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 50 }} className="sum-mobile-nav">
        <style>{`@media (min-width: 769px) { .sum-mobile-nav { display: none !important; } }`}</style>
        {[
          { icon: '🏠', label: 'Home', to: '/dashboard' },
          { icon: '📋', label: 'History', to: '#', active: true },
          { icon: '📊', label: 'Stats', to: '#' },
          { icon: '⚙', label: 'Settings', to: '#' },
        ].map(item => (
          <Link key={item.label} to={item.to} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', color: item.active ? '#ff7557' : '#888' }}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'monospace' }}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
