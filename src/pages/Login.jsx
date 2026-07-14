import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiExclamationCircle, HiArrowRight } from 'react-icons/hi'
import { HiSparkles } from 'react-icons/hi2'
import { authService } from '../services'

const EASE = [0.16, 1, 0.3, 1]

const shake = {
  shake: { x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.5 } }
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: EASE }
  })
}

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.login({ email: form.email, password: form.password })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
      setShakeKey(prev => prev + 1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f5f0', fontFamily: "'Inter', 'DM Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .lp-input { width: 100%; padding: 12px 14px 12px 40px; border: 1.5px solid #d5d0c8; border-radius: 12px; font-size: 14px; font-family: Inter, sans-serif; background: #fff; color: #1a1a1a; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .lp-input:focus { border-color: #ff7557; box-shadow: 0 0 0 3px rgba(255,117,87,0.12); }
        .lp-input::placeholder { color: #aaa8a2; }
        .coral-solid { background: #ff7557; color: #1a0a04; border: none; cursor: pointer; font-weight: 800; border-radius: 99px; transition: background 0.2s, transform 0.15s; }
        .coral-solid:hover { background: #ff5e3a; }
        .coral-solid:active { transform: scale(0.97); }
        .oauth-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 16px; border: 1.5px solid #d5d0c8; border-radius: 12px; background: #fff; color: #1a1a1a; font-size: 13px; font-weight: 600; cursor: pointer; transition: border-color 0.2s, background 0.2s; }
        .oauth-btn:hover { border-color: #1a1a1a; background: #f0ede8; }
      `}</style>

      {/* NAV */}
      <motion.nav
        initial={{ y: -48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: EASE }}
        style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(247,245,240,0.9)', backdropFilter: 'blur(18px)', borderBottom: '1.5px solid #1a1a1a', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, background: '#1a1a1a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#ff7557', fontSize: 16, fontWeight: 900, fontFamily: 'Space Grotesk' }}>IQ</span>
          </div>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#1a1a1a', letterSpacing: '-0.03em' }}>InterviewIQ</span>
        </Link>
        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{ fontSize: 13, color: '#666', alignSelf: 'center' }}>No account?</span>
          <Link to="/signup" style={{ textDecoration: 'none', padding: '7px 18px', borderRadius: 99, background: '#ff7557', color: '#1a0a04', fontSize: 13, fontWeight: 800, letterSpacing: '-0.01em' }}>
            Sign up free
          </Link>
        </div>
      </motion.nav>

      {/* MAIN */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <motion.div
          style={{ width: '100%', maxWidth: 440 }}
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        >
          {/* Header */}
          <motion.div variants={fadeUp} custom={0} style={{ textAlign: 'center', marginBottom: 28 }}>
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.05 }}
              style={{ width: 52, height: 52, borderRadius: 16, background: '#1a1a1a', border: '1.5px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}
            >
              <HiSparkles size={22} color="#ff7557" />
            </motion.div>
            <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.04em', marginBottom: 6 }}>Welcome back</h1>
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>Sign in to continue your interview prep journey.</p>
          </motion.div>

          {/* Card */}
          <motion.div
            key={shakeKey}
            variants={error && shakeKey > 0 ? shake : {}}
            animate={error && shakeKey > 0 ? 'shake' : ''}
            style={{ background: '#fff', border: '1.5px solid #1a1a1a', borderRadius: 24, padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '0 8px 40px rgba(26,26,26,0.08)' }}
          >
            {/* OAuth */}
            <motion.div variants={fadeUp} custom={1} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button className="oauth-btn" onClick={() => window.location.href = authService.getOAuthUrl('google')}>
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button className="oauth-btn" onClick={() => window.location.href = authService.getOAuthUrl('github')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1a1a1a">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </button>
            </motion.div>

            {/* Divider */}
            <motion.div variants={fadeUp} custom={2} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: '#e8e5de' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>or continue with email</span>
              <div style={{ flex: 1, height: 1, background: '#e8e5de' }} />
            </motion.div>

            {/* Form */}
            <motion.form variants={fadeUp} custom={3} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', letterSpacing: '0.02em' }} htmlFor="email">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', color: '#aaa' }}><HiMail size={16} /></span>
                  <input id="email" name="email" type="email" autoComplete="email"
                    value={form.email} onChange={handleChange} placeholder="name@company.com"
                    className="lp-input" />
                </div>
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }} htmlFor="password">Password</label>
                  <a href="#" style={{ fontSize: 12, color: '#ff7557', textDecoration: 'none', fontWeight: 600 }}>Forgot password?</a>
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', color: '#aaa' }}><HiLockClosed size={16} /></span>
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                    value={form.password} onChange={handleChange} placeholder="••••••••"
                    className="lp-input" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#aaa', padding: 2 }}>
                    {showPassword ? <HiEyeOff size={16} /> : <HiEye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input id="remember" name="remember" type="checkbox" checked={form.remember} onChange={handleChange}
                  style={{ width: 16, height: 16, accentColor: '#ff7557', cursor: 'pointer' }} />
                <label htmlFor="remember" style={{ fontSize: 13, color: '#555', cursor: 'pointer' }}>Remember me for 30 days</label>
              </div>

              {/* Error */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div key="err"
                    initial={{ opacity: 0, height: 0, y: -8 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ background: '#fff0ed', border: '1.5px solid #ff7557', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#c0392b', display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                    <HiExclamationCircle size={14} style={{ flexShrink: 0 }} /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                id="login-btn" type="submit" disabled={loading}
                whileHover={{ scale: 1.02, boxShadow: '0 6px 24px rgba(255,117,87,0.28)' }}
                whileTap={{ scale: 0.97 }}
                className="coral-solid"
                style={{ width: '100%', padding: '13px', fontSize: 15, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      style={{ width: 16, height: 16, border: '2px solid rgba(26,10,4,0.2)', borderTopColor: '#1a0a04', borderRadius: '50%' }}
                    />
                    Signing in...
                  </>
                ) : <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Log In <HiArrowRight size={16} /></span>}
              </motion.button>
            </motion.form>

            {/* Footer */}
            <motion.div variants={fadeUp} custom={4} style={{ textAlign: 'center', borderTop: '1px solid #e8e5de', paddingTop: 16 }}>
              <span style={{ fontSize: 13, color: '#666' }}>Don't have an account? </span>
              <Link to="/signup" style={{ fontSize: 13, color: '#ff7557', fontWeight: 800, textDecoration: 'none' }}>Sign up free</Link>
            </motion.div>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 24, fontSize: 12, color: '#888' }}
          >
            <div style={{ display: 'flex', gap: -4 }}>
              {['#ff7557', '#4285f4', '#34a853', '#fbbc05'].map((c, i) => (
                <div key={i} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: '2px solid #f7f5f0', marginLeft: i ? -6 : 0 }} />
              ))}
            </div>
            <span>10,000+ professionals trust InterviewIQ</span>
          </motion.div>
        </motion.div>
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: '1.5px solid #e8e5de', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontSize: 12, color: '#aaa', fontFamily: 'monospace' }}>© 2024 InterviewIQ AI. All rights reserved.</span>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy Policy', 'Terms', 'Security'].map(l => (
            <a key={l} href="#" style={{ fontSize: 12, color: '#aaa', textDecoration: 'none', fontFamily: 'monospace' }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
