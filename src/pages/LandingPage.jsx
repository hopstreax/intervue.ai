import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services'

// Exact port of Stitch HTML → React JSX
export default function LandingPage() {
  const navigate = useNavigate()
  const aiTextRef = useRef(null)
  const isLoggedIn = authService.isAuthenticated()

  useEffect(() => {
    const el = aiTextRef.current
    if (!el) return
    const fullText = el.innerText
    el.innerText = ''
    el.classList.add('typing-cursor')
    let i = 0
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const typeWriter = () => {
          if (i < fullText.length) {
            el.innerHTML += fullText.charAt(i)
            i++
            setTimeout(typeWriter, 40)
          } else {
            el.classList.remove('typing-cursor')
          }
        }
        typeWriter()
        observer.disconnect()
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="bg-background text-on-background min-h-screen overflow-x-hidden">

      {/* ── TOP NAV ─────────────────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px',
        maxWidth: '1280px', margin: '0 auto', right: 0,
        background: 'rgba(19,19,19,0.7)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontFamily: 'Geist, sans-serif', fontSize: '20px', fontWeight: 700, color: '#e5e2e1', letterSpacing: '-0.02em' }}>
            InterviewIQ AI
          </span>
          <nav style={{ display: 'flex', gap: '24px', marginLeft: '40px' }} className="hidden md:flex">
            {['Product', 'Solutions', 'Pricing', 'Resources'].map(item => (
              <a key={item} href="#" style={{ color: '#c7c4d7', fontWeight: 500, textDecoration: 'none', fontSize: '16px', transition: 'color 0.2s' }}
                onMouseOver={e => e.target.style.color = '#c0c1ff'}
                onMouseOut={e => e.target.style.color = '#c7c4d7'}>
                {item}
              </a>
            ))}
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isLoggedIn ? (
            <Link to="/dashboard" style={{
              padding: '8px 24px', background: '#c0c1ff', color: '#1000a9',
              fontWeight: 700, borderRadius: '8px', textDecoration: 'none',
              fontSize: '14px', transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" style={{ padding: '8px 16px', fontWeight: 500, color: '#c7c4d7', textDecoration: 'none', transition: 'color 0.2s' }}>
                Log In
              </Link>
              <Link to="/signup" style={{
                padding: '8px 24px', background: '#c0c1ff', color: '#1000a9',
                fontWeight: 700, borderRadius: '8px', textDecoration: 'none',
                fontSize: '14px', transition: 'opacity 0.2s'
              }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      <main style={{ position: 'relative' }}>

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section style={{
          position: 'relative', minHeight: '100vh', paddingTop: '128px', paddingBottom: '80px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', overflow: 'hidden', padding: '128px 16px 80px'
        }}>
          {/* Ambient glow */}
          <div style={{
            position: 'absolute', top: '25%', left: '50%', transform: 'translateX(-50%)',
            width: '600px', height: '600px',
            background: 'rgba(192,193,255,0.05)', borderRadius: '50%', filter: 'blur(120px)',
            pointerEvents: 'none'
          }} />

          <div style={{ position: 'relative', zIndex: 10, maxWidth: '896px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>

            {/* Badge */}
            <div className="animate-fade-in-up" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '4px 16px', borderRadius: '9999px',
              border: '1px solid #464554', background: '#1c1b1b',
              fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#c7c4d7'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c0c1ff', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              New: GPT-4o Powered Mock Interviews
            </div>

            {/* Headline */}
            <h1 className="gradient-text animate-fade-in-up delay-100" style={{
              fontFamily: 'Geist, sans-serif', fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 700, lineHeight: '1.15', letterSpacing: '-0.04em',
              margin: 0
            }}>
              Ace Interviews Tailored<br />To Your Resume
            </h1>

            {/* Subheadline */}
            <p className="animate-fade-in-up delay-200" style={{ fontSize: '18px', lineHeight: '28px', color: '#c7c4d7', maxWidth: '640px', margin: 0 }}>
              Upload your resume and let AI conduct personalized mock interviews based on your skills, projects, and experience.
            </p>

            {/* CTAs */}
            <div className="animate-fade-in-up delay-300" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', paddingTop: '16px' }}>
              <button onClick={() => navigate('/signup')}
                style={{
                  padding: '16px 40px', background: '#c0c1ff', color: '#1000a9',
                  fontWeight: 700, fontSize: '18px', borderRadius: '12px', border: 'none',
                  cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Geist, sans-serif'
                }}
                onMouseOver={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(192,193,255,0.3)'}
                onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
              >
                Start Free
              </button>
              <button style={{
                padding: '16px 40px',
                border: '1px solid #464554',
                background: 'rgba(14,14,14,0.5)',
                backdropFilter: 'blur(8px)',
                color: '#e5e2e1',
                fontWeight: 700, fontSize: '18px', borderRadius: '12px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.2s', fontFamily: 'Geist, sans-serif'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>play_circle</span>
                Watch Demo
              </button>
            </div>

            {/* Chat Preview Mockup */}
            <div className="glass-card ai-glow" style={{
              marginTop: '80px', borderRadius: '16px', padding: '24px',
              maxWidth: '768px', width: '100%', textAlign: 'left'
            }}>
              {/* Window bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(70,69,84,0.3)', paddingBottom: '16px', marginBottom: '24px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(255,180,171,0.4)' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(255,183,131,0.4)' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(76,215,246,0.4)' }} />
                <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#908fa0', opacity: 0.6 }}>
                  Mock Interview Session — Senior Frontend Dev
                </span>
              </div>

              {/* AI message */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#8083ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#0d0096', fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                </div>
                <div style={{ background: '#2a2a2a', padding: '16px', borderRadius: '12px', borderTopLeftRadius: '4px', maxWidth: '80%' }} className="ai-glow">
                  <p ref={aiTextRef} style={{ margin: 0, fontSize: '16px', color: '#e5e2e1', lineHeight: '24px' }}>
                    I see you've worked extensively with React and Tailwind at your previous role. How would you handle state management for a highly nested, complex dashboard component?
                  </p>
                </div>
              </div>

              {/* User message */}
              <div style={{ display: 'flex', gap: '16px', flexDirection: 'row-reverse' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#03b5d3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#00424e' }}>person</span>
                </div>
                <div style={{ background: 'rgba(192,193,255,0.05)', border: '1px solid rgba(192,193,255,0.2)', padding: '16px', borderRadius: '12px', borderTopRightRadius: '4px', maxWidth: '80%' }}>
                  <p style={{ margin: 0, fontSize: '16px', color: '#c0c1ff', lineHeight: '24px' }}>
                    In my last project, I preferred using the Context API combined with useReducer for localized complex state, but if the scale increased, I'd opt for Zustand...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS BAR ────────────────────────────────────────────────── */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(14,14,14,0.5)', padding: '40px 24px', position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', textAlign: 'center' }}>
              {[
                { value: '50,000+', label: 'Questions Asked', color: '#c0c1ff' },
                { value: '95%', label: 'Personalized', color: '#4cd7f6' },
                { value: '500+', label: 'Roles Supported', color: '#ffb783' },
              ].map(stat => (
                <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '32px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#c7c4d7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES BENTO GRID ──────────────────────────────────────── */}
        <section style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{ fontFamily: 'Geist, sans-serif', fontSize: '32px', fontWeight: 700, color: '#e5e2e1', margin: '0 0 16px' }}>Engineered for Success</h2>
            <p style={{ fontSize: '18px', color: '#c7c4d7', maxWidth: '576px', margin: '0 auto' }}>
              Our platform combines state-of-the-art LLMs with recruitment best practices to give you a competitive edge.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gridTemplateRows: 'auto auto', gap: '24px', minHeight: '600px' }}>
            {/* Card 1 — big */}
            <div className="glass-card" style={{ gridColumn: 'span 8', borderRadius: '16px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', overflow: 'hidden', minHeight: '280px' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', top: '24px', right: '24px', fontSize: '120px', color: '#c0c1ff', opacity: 0.15, fontVariationSettings: "'FILL' 1" }}>psychology</span>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <span className="material-symbols-outlined" style={{ color: '#c0c1ff', display: 'block', marginBottom: '16px', fontVariationSettings: "'FILL' 1" }}>grain</span>
                <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: '24px', fontWeight: 600, color: '#e5e2e1', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Resume-Aware AI Interviews</h3>
                <p style={{ fontSize: '16px', color: '#c7c4d7', margin: 0, maxWidth: '448px' }}>Our AI parses your specific projects, tech stack, and career progression to ask relevant, high-signal questions.</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="glass-card" style={{ gridColumn: 'span 4', borderRadius: '16px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', overflow: 'hidden', background: 'rgba(42,42,42,0.4)' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', top: '24px', right: '24px', fontSize: '100px', color: '#4cd7f6', opacity: 0.15 }}>forum</span>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <span className="material-symbols-outlined" style={{ color: '#4cd7f6', display: 'block', marginBottom: '16px' }}>message</span>
                <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: '24px', fontWeight: 600, color: '#e5e2e1', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Chat-Based Interface</h3>
                <p style={{ fontSize: '16px', color: '#c7c4d7', margin: 0 }}>Natural conversation flow that simulates a real recruiter or hiring manager interaction seamlessly.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="glass-card" style={{ gridColumn: 'span 4', borderRadius: '16px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', overflow: 'hidden', background: 'rgba(42,42,42,0.4)' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', top: '24px', right: '24px', fontSize: '100px', color: '#ffb783', opacity: 0.15 }}>bar_chart_4_bars</span>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <span className="material-symbols-outlined" style={{ color: '#ffb783', display: 'block', marginBottom: '16px' }}>bar_chart</span>
                <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: '24px', fontWeight: 600, color: '#e5e2e1', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Smart Feedback</h3>
                <p style={{ fontSize: '16px', color: '#c7c4d7', margin: 0 }}>Instant, actionable analysis on your answers, body language (textual cues), and technical accuracy.</p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="glass-card" style={{ gridColumn: 'span 4', borderRadius: '16px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', overflow: 'hidden' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', top: '24px', right: '24px', fontSize: '100px', color: '#c0c1ff', opacity: 0.15 }}>track_changes</span>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <span className="material-symbols-outlined" style={{ color: '#c0c1ff', display: 'block', marginBottom: '16px' }}>target</span>
                <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: '24px', fontWeight: 600, color: '#e5e2e1', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Improvement Roadmap</h3>
                <p style={{ fontSize: '16px', color: '#c7c4d7', margin: 0 }}>Personalized study guides generated based on gaps identified during your mock sessions.</p>
              </div>
            </div>

            {/* Card 5 */}
            <div className="glass-card" style={{ gridColumn: 'span 4', borderRadius: '16px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', overflow: 'hidden', background: 'rgba(42,42,42,0.4)' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', top: '24px', right: '24px', fontSize: '100px', color: '#4cd7f6', opacity: 0.15 }}>trending_up</span>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <span className="material-symbols-outlined" style={{ color: '#4cd7f6', display: 'block', marginBottom: '16px' }}>trending_up</span>
                <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: '24px', fontWeight: 600, color: '#e5e2e1', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Progress Tracking</h3>
                <p style={{ fontSize: '16px', color: '#c7c4d7', margin: 0 }}>Watch your confidence and technical scoring improve over time with visual analytics.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── IMAGE CALLOUT ─────────────────────────────────────────────── */}
        <section style={{ padding: '40px 24px' }}>
          <div className="glass-card" style={{ maxWidth: '1280px', margin: '0 auto', borderRadius: '32px', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center' }}>
            <div style={{ padding: '80px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h2 style={{ fontFamily: 'Geist, sans-serif', fontSize: '32px', fontWeight: 700, color: '#e5e2e1', margin: 0, letterSpacing: '-0.02em' }}>Your Resume is the Script.</h2>
              <p style={{ fontSize: '18px', color: '#c7c4d7', margin: 0 }}>Our AI doesn't just ask generic questions. It analyzes your career trajectory to find the specific areas a real interviewer will dig into.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {['Deep Tech-Stack Validation', 'Project-Specific Behavioral Drills', 'Cultural Fit Simulations'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#e5e2e1', fontSize: '16px' }}>
                    <span className="material-symbols-outlined" style={{ color: '#c0c1ff', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ position: 'relative', height: '500px' }}>
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDh6Tnb2xVRLDwY1i0mNDi2AEte3UsaG9Jvzh6VI1U0FM-Dr9LuhzAH8_sF3bbSk4zsmoO4kUO0ytVXJ5r3Avjtyu1Ptr5VLiHkqTFyubcyArNCE8jjcFcJcpJwqKj1vdod5mCwYI24d873j0su81XDR1RhLSMWsI8fJdeqT0MQxHtc_0kiKuh8QDtPC6vwguzq5qWt6-wIzbZphRkPhMd0mC-mpkXpXvL6E0agWShiadENTN123XOP6gdwcOeF4j8Gtf70FzWN3VH3')`,
                backgroundSize: 'cover', backgroundPosition: 'center'
              }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #131313, transparent)' }} />
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
        <section style={{ padding: '128px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(192,193,255,0.05)', filter: 'blur(120px)', borderRadius: '50%', transform: 'scale(1.5)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 10, maxWidth: '768px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'Geist, sans-serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, color: '#e5e2e1', margin: 0, letterSpacing: '-0.04em' }}>
              Stop practicing. Start performing.
            </h2>
            <p style={{ fontSize: '18px', color: '#c7c4d7', margin: 0 }}>
              Join 10,000+ professionals who landed their dream roles at FAANG, startups, and top-tier agencies.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={() => navigate('/signup')} style={{
                padding: '16px 40px', background: '#c0c1ff', color: '#1000a9',
                fontWeight: 700, fontSize: '16px', borderRadius: '12px', border: 'none',
                cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Geist, sans-serif'
              }}
                onMouseOver={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(192,193,255,0.4)'}
                onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
              >
                Get Started For Free
              </button>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#c7c4d7', margin: 0 }}>No credit card required</p>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer style={{
        padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,0.05)',
        background: '#131313', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '16px', maxWidth: '1280px', margin: '0 auto'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontFamily: 'Geist, sans-serif', fontSize: '24px', fontWeight: 700, color: '#e5e2e1' }}>InterviewIQ AI</span>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#c7c4d7', margin: 0 }}>© 2024 InterviewIQ AI. Surgical precision in every hire.</p>
        </div>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'].map(link => (
            <a key={link} href="#" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#c7c4d7', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseOver={e => e.target.style.color = '#4cd7f6'}
              onMouseOut={e => e.target.style.color = '#c7c4d7'}>
              {link}
            </a>
          ))}
        </div>
      </footer>
    </div>
  )
}
