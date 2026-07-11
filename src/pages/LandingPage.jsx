import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useInView, useMotionValue, useSpring, useTransform, animate, AnimatePresence } from 'framer-motion'
import { authService } from '../services'

/* ─────────────────────────────────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────────────────────────────────── */
const EASE_SPRING = [0.16, 1, 0.3, 1]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
}

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: EASE_SPRING } }
}

const textReveal = {
  hidden: { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0, y: 20 },
  visible: (i = 0) => ({
    clipPath: 'inset(0% 0% 0% 0%)',
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.09, ease: EASE_SPRING }
  })
}

/* ─────────────────────────────────────────────────────────────────────
   WORD-BY-WORD TEXT REVEAL
───────────────────────────────────────────────────────────────────── */
function WordReveal({ text, className, baseDelay = 0, as = 'span' }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const words = text.split(' ')
  const Tag = motion[as] || motion.span

  return (
    <Tag ref={ref} className={className} aria-label={text}
      style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25em' }}>
      {words.map((word, i) => (
        <motion.span key={i} style={{ overflow: 'hidden', display: 'inline-block' }}>
          <motion.span
            style={{ display: 'inline-block' }}
            initial={{ y: '110%', opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.55, delay: baseDelay + i * 0.07, ease: EASE_SPRING }}
          >
            {word}
          </motion.span>
        </motion.span>
      ))}
    </Tag>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   MAGNETIC BUTTON EFFECT
───────────────────────────────────────────────────────────────────── */
function MagneticBtn({ children, className, onClick, href }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 300, damping: 20 })
  const sy = useSpring(y, { stiffness: 300, damping: 20 })

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    x.set((e.clientX - cx) * 0.28)
    y.set((e.clientY - cy) * 0.28)
  }

  const handleLeave = () => { x.set(0); y.set(0) }

  const Tag = href ? motion.a : motion.button
  return (
    <Tag
      ref={ref}
      href={href}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.95 }}
      className={className}
    >
      {children}
    </Tag>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   ANIMATED STAT COUNTER
───────────────────────────────────────────────────────────────────── */
function StatCounter({ end, suffix = '', prefix = '', duration = 1.8 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const mv = useMotionValue(0)
  const [disp, setDisp] = useState('0')

  useEffect(() => {
    if (!isInView) return
    const ctrl = animate(mv, end, { duration, ease: EASE_SPRING })
    const unsub = mv.on('change', v => setDisp(Math.round(v).toLocaleString()))
    return () => { ctrl.stop(); unsub() }
  }, [isInView])

  return <span ref={ref}>{prefix}{disp}{suffix}</span>
}

/* ─────────────────────────────────────────────────────────────────────
   FLOATING ORBITING ELEMENT
───────────────────────────────────────────────────────────────────── */
function Floater({ children, duration = 5, yRange = 12, delay = 0, className }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -yRange, 0], rotate: [0, 2, -2, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   MESH GRADIENT BLOB
───────────────────────────────────────────────────────────────────── */
function MeshBlob({ colors, className }) {
  return (
    <motion.div
      className={className}
      animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        background: `radial-gradient(ellipse at 30% 40%, ${colors[0]} 0%, ${colors[1]} 40%, ${colors[2]} 75%, transparent 100%)`,
      }}
    />
  )
}

/* ─────────────────────────────────────────────────────────────────────
   BENTO CARD WITH SPRING HOVER
───────────────────────────────────────────────────────────────────── */
function BentoCard({ children, className, style, delay = 0 }) {
  return (
    <motion.div
      variants={cardVariants}
      custom={delay}
      whileHover={{ y: -5, boxShadow: '0 20px 60px rgba(0,0,0,0.12)', transition: { type: 'spring', stiffness: 300, damping: 18 } }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   INTERVIEW CHAT PREVIEW (Decorative animated element)
───────────────────────────────────────────────────────────────────── */
function ChatPreview() {
  const msgs = [
    { role: 'ai', text: 'Tell me about a complex state management challenge you solved recently.' },
    { role: 'user', text: 'In my last role, I redesigned our Redux architecture to use RTK Query...' },
    { role: 'ai', text: 'Excellent. How did you handle cache invalidation across shared queries?' },
  ]
  const [visible, setVisible] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setVisible(v => (v + 1) % (msgs.length + 1)), 1800)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="space-y-3">
      {msgs.slice(0, Math.max(visible, 1)).map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: m.role === 'ai' ? -12 : 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: EASE_SPRING }}
          className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
        >
          <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold mt-0.5 ${m.role === 'ai' ? 'bg-black text-white' : 'bg-[#ff7557] text-white'}`}>
            {m.role === 'ai' ? 'AI' : 'U'}
          </div>
          <div className={`text-[11px] leading-snug px-2.5 py-1.5 rounded-xl max-w-[75%] ${m.role === 'ai' ? 'bg-gray-100 text-gray-700 rounded-tl-none' : 'bg-black text-white rounded-tr-none'}`}>
            {m.text}
          </div>
        </motion.div>
      ))}
      {visible >= msgs.length && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1 pl-8">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
        </motion.div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   SCORE RING (decorative)
───────────────────────────────────────────────────────────────────── */
function ScoreRing({ score = 87, size = 100 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const circumference = 2 * Math.PI * 38
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const ctrl = animate(0, score, { duration: 1.5, ease: EASE_SPRING, onUpdate: v => setProgress(v) })
    return ctrl.stop
  }, [isInView])

  return (
    <div ref={ref} className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r="38" fill="none" stroke="#e5e7eb" strokeWidth="7" />
        <motion.circle
          cx="50" cy="50" r="38" fill="none"
          stroke="#ff7557" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (progress / 100) * circumference}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black text-black leading-none">{Math.round(progress)}</span>
        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Score</span>
      </div>
    </div>
  )
}

/* ═════════════════════════════════════════════════════════════════════
   MAIN LANDING PAGE COMPONENT
═════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate()
  const isLoggedIn = authService.isAuthenticated()
  const heroRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = ['Product', 'Features', 'Pricing', 'Testimonials']

  return (
    <div className="min-h-screen" style={{ background: '#f7f5f0', fontFamily: "'Inter', 'DM Sans', sans-serif" }}>
      {/* ─ Google Fonts ─ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .landing-hero-text { font-family: 'Space Grotesk', 'Inter', sans-serif; }
        .bento-border { border: 1.5px solid #1a1a1a; }
        .coral-btn { background: #ff7557; }
        .coral-btn:hover { background: #ff5e3a; }
        .bento-grid-main { display: grid; grid-template-columns: repeat(12, 1fr); grid-auto-rows: auto; gap: 16px; }
        @media (max-width: 768px) {
          .bento-grid-main { grid-template-columns: 1fr; }
          .col-span-7-d { grid-column: span 1; }
          .col-span-5-d { grid-column: span 1; }
          .col-span-4-d { grid-column: span 1; }
          .col-span-6-d { grid-column: span 1; }
          .col-span-8-d { grid-column: span 1; }
          .col-span-12-d { grid-column: span 1; }
        }
        @media (min-width: 769px) {
          .col-span-7-d { grid-column: span 7; }
          .col-span-5-d { grid-column: span 5; }
          .col-span-4-d { grid-column: span 4; }
          .col-span-6-d { grid-column: span 6; }
          .col-span-8-d { grid-column: span 8; }
          .col-span-12-d { grid-column: span 12; }
        }
        .mesh-gradient-1 {
          background: radial-gradient(ellipse at 20% 50%, #ffb347 0%, #ff7557 35%, #c84b9e 65%, #7a5af8 100%);
        }
        .noise-overlay::after {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 200px;
          pointer-events: none;
          border-radius: inherit;
        }
        .marquee-track { display: flex; width: max-content; animation: marquee 28s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>

      {/* ══════════════════════════════════════════════
          NAVIGATION BAR
      ══════════════════════════════════════════════ */}
      <motion.nav
        initial={{ y: -56, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE_SPRING }}
        style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(247,245,240,0.88)', backdropFilter: 'blur(20px)',
          borderBottom: '1.5px solid #1a1a1a',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 34, height: 34, background: '#1a1a1a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#ff7557', fontSize: 18, fontWeight: 900, lineHeight: 1, fontFamily: 'Space Grotesk' }}>IQ</span>
            </div>
            <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 20, color: '#1a1a1a', letterSpacing: '-0.03em' }}>
              InterviewIQ
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', gap: 8, alignItems: 'center' }} className="hidden md:flex">
            {navLinks.map(link => (
              <motion.a
                key={link}
                href={`#${link.toLowerCase()}`}
                whileHover={{ backgroundColor: 'rgba(26,26,26,0.07)' }}
                style={{ padding: '7px 16px', borderRadius: 99, fontSize: 14, fontWeight: 500, color: '#1a1a1a', textDecoration: 'none', transition: 'background 0.2s' }}
              >
                {link}
              </motion.a>
            ))}
            {isLoggedIn ? (
              <MagneticBtn
                onClick={() => navigate('/dashboard')}
                className="coral-btn"
                style={{ marginLeft: 8, padding: '8px 22px', borderRadius: 99, fontSize: 14, fontWeight: 800, color: '#1a0a04', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, letterSpacing: '-0.01em' }}
              >
                Dashboard →
              </MagneticBtn>
            ) : (
              <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
                <motion.button
                  whileHover={{ backgroundColor: 'rgba(26,26,26,0.07)' }}
                  onClick={() => navigate('/login')}
                  style={{ padding: '8px 18px', borderRadius: 99, fontSize: 14, fontWeight: 600, color: '#1a1a1a', background: 'transparent', border: '1.5px solid #1a1a1a', cursor: 'pointer' }}
                >
                  Log in
                </motion.button>
                <MagneticBtn
                  onClick={() => navigate('/signup')}
                  className="coral-btn"
                  style={{ padding: '8px 22px', borderRadius: 99, fontSize: 14, fontWeight: 800, color: '#1a0a04', border: 'none', cursor: 'pointer', letterSpacing: '-0.01em' }}
                >
                  Get started
                </MagneticBtn>
              </div>
            )}
          </nav>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: '1.5px solid #1a1a1a', borderRadius: 8, width: 38, height: 38, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5 }}
          >
            <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }} style={{ display: 'block', width: 18, height: 1.5, background: '#1a1a1a', transformOrigin: 'center' }} />
            <motion.span animate={{ opacity: menuOpen ? 0 : 1 }} style={{ display: 'block', width: 18, height: 1.5, background: '#1a1a1a' }} />
            <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }} style={{ display: 'block', width: 18, height: 1.5, background: '#1a1a1a', transformOrigin: 'center' }} />
          </button>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden', borderTop: '1.5px solid #1a1a1a', padding: '0 24px' }}
            >
              {navLinks.map(link => (
                <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setMenuOpen(false)}
                  style={{ display: 'block', padding: '14px 0', fontSize: 16, fontWeight: 600, color: '#1a1a1a', textDecoration: 'none', borderBottom: '1px solid rgba(26,26,26,0.1)' }}>
                  {link}
                </a>
              ))}
              <div style={{ padding: '16px 0', display: 'flex', gap: 12 }}>
                <button onClick={() => navigate('/login')}
                  style={{ flex: 1, padding: '12px', borderRadius: 99, fontSize: 14, fontWeight: 600, color: '#1a1a1a', background: 'transparent', border: '1.5px solid #1a1a1a', cursor: 'pointer' }}>
                  Log in
                </button>
                <button onClick={() => navigate('/signup')}
                  style={{ flex: 1, padding: '12px', borderRadius: 99, fontSize: 14, fontWeight: 700, color: '#fff', background: '#ff7557', border: 'none', cursor: 'pointer' }}>
                  Get started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ══════════════════════════════════════════════
          MAIN BENTO GRID
      ══════════════════════════════════════════════ */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bento-grid-main"
        >

          {/* ─── CARD 1: HERO HEADLINE ─────────────────────────────────── */}
          <BentoCard
            className="col-span-7-d bento-border noise-overlay"
            style={{ borderRadius: 24, background: '#1a1a1a', padding: '52px 48px', minHeight: 420, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}
            delay={0}
          >
            {/* Background glow */}
            <MeshBlob
              colors={['rgba(255,117,87,0.25)', 'rgba(124,58,237,0.12)', 'transparent']}
              className="absolute top-0 right-0 w-80 h-80 rounded-full"
              style={{ filter: 'blur(60px)' }}
            />

            <div style={{ position: 'relative', zIndex: 2 }}>
              {/* Tag */}
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,117,87,0.15)', border: '1px solid rgba(255,117,87,0.3)', borderRadius: 99, padding: '5px 14px', marginBottom: 28 }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff7557', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#ff7557', fontFamily: 'Space Grotesk', letterSpacing: '0.04em' }}>AI-Powered Interview Prep</span>
              </motion.div>

              {/* Headline — word-by-word reveal */}
              <div style={{ fontSize: 'clamp(34px, 3.8vw, 52px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.04em', color: '#f7f5f0', fontFamily: 'Space Grotesk', marginBottom: 24 }}>
                <WordReveal text="Master Every" className="" baseDelay={0.15} />
                <br />
                <WordReveal text="Interview Question." className="" baseDelay={0.3} />
              </div>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.55, ease: EASE_SPRING }}
                style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(247,245,240,0.62)', maxWidth: 380, marginBottom: 36 }}
              >
                Upload your resume. Let AI extract your skills and run a personalized mock interview — then score your performance with surgical precision.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.68, duration: 0.5 }}
                style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
              >
                <MagneticBtn
                  onClick={() => navigate('/signup')}
                  className="coral-btn"
                  style={{ padding: '13px 30px', borderRadius: 99, fontSize: 15, fontWeight: 800, color: '#1a0a04', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, letterSpacing: '-0.01em' }}
                >
                  Start Free <span style={{ fontSize: 18 }}>→</span>
                </MagneticBtn>
                <motion.button
                  whileHover={{ backgroundColor: 'rgba(247,245,240,0.08)', borderColor: 'rgba(247,245,240,0.4)' }}
                  onClick={() => navigate('/login')}
                  style={{ padding: '13px 28px', borderRadius: 99, fontSize: 15, fontWeight: 600, color: 'rgba(247,245,240,0.8)', background: 'transparent', border: '1.5px solid rgba(247,245,240,0.18)', cursor: 'pointer' }}
                >
                  Log in
                </motion.button>
              </motion.div>
            </div>

            {/* Bottom stats row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.82, duration: 0.5 }}
              style={{ display: 'flex', gap: 32, paddingTop: 32, borderTop: '1px solid rgba(247,245,240,0.08)', position: 'relative', zIndex: 2 }}
            >
              {[{ n: 50000, s: '+', l: 'Questions asked' }, { n: 95, s: '%', l: 'Personalized' }, { n: 500, s: '+', l: 'Roles covered' }].map((st, i) => (
                <div key={i}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#f7f5f0', fontFamily: 'Space Grotesk', letterSpacing: '-0.03em' }}>
                    <StatCounter end={st.n} suffix={st.s} />
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(247,245,240,0.42)', fontWeight: 500, marginTop: 2, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{st.l}</div>
                </div>
              ))}
            </motion.div>
          </BentoCard>

          {/* ─── CARD 2: LIVE CHAT PREVIEW ─────────────────────────────── */}
          <BentoCard
            className="col-span-5-d bento-border"
            style={{ borderRadius: 24, background: '#fff', padding: 32, minHeight: 420, display: 'flex', flexDirection: 'column', gap: 20, position: 'relative', overflow: 'hidden' }}
            delay={0.08}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', fontFamily: 'Space Grotesk', letterSpacing: '-0.01em' }}>Live Mock Session</span>
              <div style={{ display: 'flex', gap: 5 }}>
                {['#ff5f57', '#febc2e', '#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              </div>
            </div>

            {/* Simulated session header */}
            <div style={{ background: '#f7f5f0', borderRadius: 14, padding: '12px 16px', border: '1px solid #e8e5de', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#ff7557' }}>IQ</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>InterviewIQ AI</div>
                <div style={{ fontSize: 10, color: '#888', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                  Analyzing your resume...
                </div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'monospace', color: '#888', background: '#eee', borderRadius: 6, padding: '3px 8px' }}>Q 3/12</div>
            </div>

            <div style={{ flex: 1 }}>
              <ChatPreview />
            </div>

            {/* Input area */}
            <div style={{ borderTop: '1px solid #e8e5de', paddingTop: 14 }}>
              <div style={{ background: '#f7f5f0', borderRadius: 12, border: '1px solid #e8e5de', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: '#aaa', flex: 1 }}>Type your answer...</span>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#ff7557', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* ─── CARD 3: SCORE / ANALYTICS ─────────────────────────────── */}
          <BentoCard
            className="col-span-4-d bento-border"
            style={{ borderRadius: 24, background: '#fff', padding: 32, minHeight: 260, position: 'relative', overflow: 'hidden' }}
            delay={0.14}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', fontFamily: 'Space Grotesk', marginBottom: 20 }}>Session Performance</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <ScoreRing score={87} size={96} />
              <div style={{ flex: 1 }}>
                {[
                  { label: 'Technical Depth', val: 88, color: '#7a5af8' },
                  { label: 'Communication', val: 76, color: '#ff7557' },
                  { label: 'Confidence', val: 82, color: '#22c55e' },
                ].map((item, i) => {
                  const ref = useRef(null)
                  const inView = useInView(ref, { once: true })
                  return (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#555', marginBottom: 4 }}>
                        <span>{item.label}</span>
                        <span style={{ fontWeight: 700, color: '#1a1a1a' }}>{item.val}%</span>
                      </div>
                      <div ref={ref} style={{ height: 5, background: '#f0ede8', borderRadius: 99, overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={inView ? { width: `${item.val}%` } : {}}
                          transition={{ duration: 1.2, delay: i * 0.12, ease: EASE_SPRING }}
                          style={{ height: '100%', borderRadius: 99, background: item.color }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ marginTop: 16, background: '#f7f5f0', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#555', lineHeight: 1.6 }}>
              <span style={{ fontWeight: 700, color: '#1a1a1a' }}>AI Verdict: </span>
              Strong architectural reasoning. Sharpen JWT & database indexing for top-tier roles.
            </div>
          </BentoCard>

          {/* ─── CARD 4: VIBRANT GRADIENT / ABSTRACT ──────────────────── */}
          <BentoCard
            className="col-span-4-d noise-overlay"
            style={{ borderRadius: 24, border: '1.5px solid #1a1a1a', minHeight: 260, position: 'relative', overflow: 'hidden', background: '#1a1a1a' }}
            delay={0.18}
          >
            {/* Mesh gradient fill */}
            <div className="mesh-gradient-1" style={{ position: 'absolute', inset: 0, opacity: 0.95 }} />
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
              style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.12)' }}
            />
            <motion.div
              animate={{ rotate: [360, 0] }}
              transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
              style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.08)' }}
            />

            <div style={{ position: 'relative', zIndex: 2, padding: 36, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>AI Engine</div>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                  Gemini<br />& GPT-4o
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Resume Parse', 'Smart Q&A', 'Deep Score'].map(tag => (
                  <span key={tag} style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', borderRadius: 99, padding: '5px 12px', fontSize: 11, fontWeight: 600, color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </BentoCard>

          {/* ─── CARD 5: SOCIAL PROOF / TESTIMONIAL ───────────────────── */}
          <BentoCard
            className="col-span-4-d bento-border"
            style={{ borderRadius: 24, background: '#fff', padding: 32, minHeight: 260, position: 'relative', overflow: 'hidden' }}
            delay={0.22}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', fontFamily: 'Space Grotesk', marginBottom: 16 }}>What candidates say</div>

            <div style={{ display: 'flex', gap: 1, marginBottom: 14 }}>
              {[...Array(5)].map((_, i) => (
                <motion.span key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.07, type: 'spring', stiffness: 400 }}
                  style={{ fontSize: 16, color: '#ff7557' }}>★</motion.span>
              ))}
            </div>

            <p style={{ fontSize: 14, lineHeight: 1.7, color: '#444', marginBottom: 20 }}>
              "The AI asked me exactly the questions a real Google interviewer would. I got the L5 offer after 3 sessions."
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid #f0ede8', paddingTop: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #ff7557 0%, #c84b9e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>A</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>Arjun Mehta</div>
                <div style={{ fontSize: 11, color: '#888' }}>Software Engineer, Google · L5</div>
              </div>
            </div>

            {/* Floating tag */}
            <Floater yRange={8} duration={4} delay={0.5}
              className="absolute top-5 right-5"
              style={{ background: '#1a1a1a', borderRadius: 99, padding: '4px 10px' }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, color: '#ff7557' }}>✓ FAANG Offer</span>
            </Floater>
          </BentoCard>

          {/* ─── CARD 6: HOW IT WORKS (STEPS) ─────────────────────────── */}
          <BentoCard
            className="col-span-8-d bento-border"
            style={{ borderRadius: 24, background: '#fff', padding: '36px 40px', minHeight: 200 }}
            delay={0.26}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', fontFamily: 'Space Grotesk', marginBottom: 28, textTransform: 'uppercase', letterSpacing: '0.06em' }}>How it works</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24 }}>
              {[
                { num: '01', title: 'Upload Resume', desc: 'PDF analyzed in seconds. Skills & experience extracted instantly.', icon: '📄' },
                { num: '02', title: 'AI Interviews You', desc: 'Personalized questions based on your exact background & target role.', icon: '🤖' },
                { num: '03', title: 'Review Your Score', desc: 'Detailed scorecard with shortcomings map and study roadmap.', icon: '📊' },
                { num: '04', title: 'Level Up', desc: 'Iterate with unlimited sessions until you\'re ready to ace it.', icon: '🚀' },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease: EASE_SPRING }}
                  whileHover={{ y: -3, transition: { type: 'spring', stiffness: 300 } }}
                  style={{ cursor: 'default' }}
                >
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#bbb', fontFamily: 'Space Grotesk', letterSpacing: '0.08em', marginBottom: 10 }}>{step.num}</div>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{step.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 6, letterSpacing: '-0.01em' }}>{step.title}</div>
                  <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>{step.desc}</div>
                </motion.div>
              ))}
            </div>
          </BentoCard>

          {/* ─── CARD 7: CTA BANNER ─────────────────────────────────────── */}
          <BentoCard
            className="col-span-4-d"
            style={{ borderRadius: 24, background: '#ff7557', border: '1.5px solid #d85f42', padding: '32px 28px', minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}
            delay={0.3}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.4) 0%, transparent 60%)', pointerEvents: 'none' }}
            />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Floater yRange={6} duration={3.5} className="text-3xl mb-3" style={{ display: 'inline-block' }}>🎯</Floater>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 900, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: 10 }}>
                Ready for your<br />dream job?
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: 20 }}>
                Join 10,000+ professionals who cracked their interviews with InterviewIQ.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.04, backgroundColor: '#1a1a1a' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/signup')}
              style={{ position: 'relative', zIndex: 1, background: '#fff', color: '#ff7557', border: 'none', borderRadius: 99, padding: '12px 20px', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.2s, color 0.2s' }}
            >
              Start Free Trial →
            </motion.button>
          </BentoCard>

          {/* ─── CARD 8: FEATURES MARQUEE ROW ─────────────────────────── */}
          <BentoCard
            className="col-span-12-d bento-border"
            style={{ borderRadius: 24, background: '#1a1a1a', padding: '24px 0', overflow: 'hidden' }}
            delay={0.34}
          >
            <div className="marquee-track">
              {[...Array(2)].map((_, copyIdx) => (
                <div key={copyIdx} style={{ display: 'flex', gap: 0 }}>
                  {[
                    'Resume Intelligence', '✦', 'Gemini & GPT-4o', '✦', 'Personalized Q&A', '✦',
                    'Score Breakdown', '✦', 'Study Roadmap', '✦', 'Voice Mode Soon', '✦',
                    'Unlimited Practice', '✦', 'FAANG-Ready', '✦', 'Auth via Google & GitHub', '✦',
                  ].map((item, i) => (
                    <span key={i} style={{ fontSize: 13, fontWeight: item === '✦' ? 400 : 600, color: item === '✦' ? '#ff7557' : 'rgba(247,245,240,0.55)', whiteSpace: 'nowrap', padding: '0 18px', fontFamily: 'Space Grotesk', letterSpacing: item === '✦' ? '0' : '0.01em' }}>
                      {item}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </BentoCard>

          {/* ─── CARD 9: DUAL MODEL PICKER ─────────────────────────────── */}
          <BentoCard
            className="col-span-6-d bento-border"
            style={{ borderRadius: 24, background: '#fff', padding: '32px 36px', minHeight: 220, position: 'relative', overflow: 'hidden' }}
            delay={0.38}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', fontFamily: 'Space Grotesk', marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your AI Engine</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { name: 'Google Gemini', tag: '1.5 Flash', desc: 'Fast & free-tier friendly. Perfect for daily practice.', accent: '#4285f4', icon: '✦' },
                { name: 'OpenAI GPT', tag: '4o-mini', desc: 'Precision reasoning. Best for technical & system design roles.', accent: '#10a37f', icon: '⊕' },
              ].map((model, i) => (
                <motion.div key={i}
                  whileHover={{ y: -3, borderColor: model.accent, boxShadow: `0 8px 30px ${model.accent}22` }}
                  style={{ border: `1.5px solid ${i === 0 ? '#1a1a1a' : '#e8e5de'}`, borderRadius: 16, padding: '18px 16px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 18, color: model.accent }}>{model.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#1a1a1a' }}>{model.name}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: model.accent, background: `${model.accent}18`, borderRadius: 99, padding: '1px 7px', display: 'inline-block' }}>{model.tag}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: '#666', lineHeight: 1.6 }}>{model.desc}</p>
                </motion.div>
              ))}
            </div>
          </BentoCard>

          {/* ─── CARD 10: STUDY ROADMAP PREVIEW ───────────────────────── */}
          <BentoCard
            className="col-span-6-d bento-border"
            style={{ borderRadius: 24, background: '#fff', padding: '32px 36px', minHeight: 220 }}
            delay={0.42}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', fontFamily: 'Space Grotesk', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Study Roadmap</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { day: 'MON', topic: 'MongoDB Indexing', priority: 'High', color: '#ff7557' },
                { day: 'TUE', topic: 'JWT & OAuth2', priority: 'High', color: '#ff7557' },
                { day: 'WED', topic: 'React Hook Perf.', priority: 'Med', color: '#f59e0b' },
                { day: 'THU', topic: 'System Design Basics', priority: 'Med', color: '#f59e0b' },
              ].map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4, ease: EASE_SPRING }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px', background: '#f7f5f0', borderRadius: 12, border: '1px solid #ece9e2' }}
                >
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#bbb', width: 28 }}>{item.day}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{item.topic}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: item.color, background: `${item.color}18`, borderRadius: 99, padding: '2px 8px' }}>{item.priority}</span>
                </motion.div>
              ))}
            </div>
          </BentoCard>

        </motion.div>
      </main>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer style={{ borderTop: '1.5px solid #1a1a1a', background: '#1a1a1a', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 30, height: 30, background: '#ff7557', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: 14, fontWeight: 900, fontFamily: 'Space Grotesk' }}>IQ</span>
              </div>
              <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#f7f5f0', letterSpacing: '-0.02em' }}>InterviewIQ AI</span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(247,245,240,0.4)', fontFamily: 'monospace' }}>© 2024 InterviewIQ AI. Surgical precision in every interview.</p>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'].map(link => (
              <a key={link} href="#" style={{ fontSize: 12, color: 'rgba(247,245,240,0.45)', textDecoration: 'none', fontFamily: 'monospace', transition: 'color 0.2s' }}
                onMouseOver={e => e.target.style.color = '#ff7557'}
                onMouseOut={e => e.target.style.color = 'rgba(247,245,240,0.45)'}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
