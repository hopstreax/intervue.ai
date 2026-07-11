import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { authService } from '../services'

const EASE = [0.16, 1, 0.3, 1]

const shake = {
  shake: { x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.5 } }
}

const slideOver = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: EASE }
  })
}

export default function Signup() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [resume, setResume] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [shakeKey, setShakeKey] = useState(0)
  const fileRef = useRef()

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleFile = e => {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') { setError('Only PDF files are accepted'); return }
    if (file.size > 5 * 1024 * 1024) { setError('File size must be under 5 MB'); return }
    setError('')
    setResume(file)
  }

  const removeFile = () => {
    setResume(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleNextStep = (e) => {
    e.preventDefault()
    if (!form.name || !form.email) { setError('Please fill in your name and email'); setShakeKey(prev => prev + 1); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); setShakeKey(prev => prev + 1); return }
    if (form.password !== form.confirm) { setError('Passwords do not match'); setShakeKey(prev => prev + 1); return }
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.signup({ name: form.name, email: form.email, password: form.password, resumeFile: resume })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Signup failed')
      setShakeKey(prev => prev + 1)
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = () => {
    if (!form.password) return { level: 0, label: '', color: '' }
    if (form.password.length < 6) return { level: 1, label: 'Weak', color: '#ef4444' }
    if (form.password.length < 10) return { level: 2, label: 'Fair', color: '#f59e0b' }
    return { level: 3, label: 'Strong', color: '#22c55e' }
  }
  const strength = passwordStrength()

  return (
    <div style={{ minHeight: '100vh', background: '#f7f5f0', fontFamily: "'Inter', 'DM Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .lp-input { width: 100%; padding: 12px 14px 12px 40px; border: 1.5px solid #d5d0c8; border-radius: 12px; font-size: 14px; font-family: Inter, sans-serif; background: #fff; color: #1a1a1a; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .lp-input:focus { border-color: #ff7557; box-shadow: 0 0 0 3px rgba(255,117,87,0.12); }
        .lp-input::placeholder { color: #aaa8a2; }
        .lp-input-no-icon { padding-left: 14px; }
        .coral-solid { background: #ff7557; color: #1a0a04; border: none; cursor: pointer; font-weight: 800; border-radius: 99px; transition: background 0.2s, transform 0.15s; }
        .coral-solid:hover { background: #ff5e3a; }
        .coral-solid:active { transform: scale(0.97); }
        .coral-solid:disabled { opacity: 0.55; cursor: not-allowed; }
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
          <span style={{ fontSize: 13, color: '#666', alignSelf: 'center' }}>Have an account?</span>
          <Link to="/login" style={{ textDecoration: 'none', padding: '7px 18px', borderRadius: 99, border: '1.5px solid #1a1a1a', color: '#1a1a1a', fontSize: 13, fontWeight: 700 }}>
            Log in
          </Link>
        </div>
      </motion.nav>

      {/* MAIN */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 460 }}>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 28 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <motion.div
                  animate={{
                    scale: s === step ? 1.1 : 1,
                    background: s <= step ? '#1a1a1a' : '#e8e5de',
                    color: s <= step ? '#ff7557' : '#aaa',
                    boxShadow: s === step ? '0 0 0 4px rgba(255,117,87,0.18)' : 'none'
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, fontFamily: 'Space Grotesk' }}
                >
                  {s < step ? '✓' : s}
                </motion.div>
                <span style={{ fontSize: 12, fontWeight: 700, color: s <= step ? '#1a1a1a' : '#aaa', letterSpacing: '0.02em' }}>
                  {s === 1 ? 'Account' : 'Resume'}
                </span>
                {s < 2 && <div style={{ width: 36, height: 1.5, background: step > s ? '#1a1a1a' : '#d5d0c8', borderRadius: 99, transition: 'background 0.4s' }} />}
              </div>
            ))}
          </div>

          {/* Card */}
          <motion.div
            key={shakeKey}
            variants={error && shakeKey > 0 ? shake : {}}
            animate={error && shakeKey > 0 ? 'shake' : ''}
            style={{ background: '#fff', border: '1.5px solid #1a1a1a', borderRadius: 24, padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '0 8px 40px rgba(26,26,26,0.08)' }}
          >
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div key="step1" variants={slideOver} initial="initial" animate="animate" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {/* Header */}
                  <div style={{ textAlign: 'center' }}>
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                      style={{ width: 52, height: 52, borderRadius: 16, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}
                    >
                      <span style={{ fontSize: 22 }}>🚀</span>
                    </motion.div>
                    <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.04em', marginBottom: 6 }}>Create your account</h1>
                    <p style={{ fontSize: 13, color: '#666' }}>Start your journey to interview mastery.</p>
                  </div>

                  {/* OAuth */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <button className="oauth-btn" onClick={() => window.location.href = authService.getOAuthUrl('google')}>
                      <svg width="16" height="16" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Google
                    </button>
                    <button className="oauth-btn" onClick={() => window.location.href = authService.getOAuthUrl('github')}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#1a1a1a">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      GitHub
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, height: 1, background: '#e8e5de' }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>or email</span>
                    <div style={{ flex: 1, height: 1, background: '#e8e5de' }} />
                  </div>

                  <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={handleNextStep}>
                    {/* Name */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }} htmlFor="name">Full Name</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}>👤</span>
                        <input id="name" name="name" type="text" autoComplete="name" value={form.name} onChange={handleChange} placeholder="John Doe" className="lp-input" />
                      </div>
                    </div>
                    {/* Email */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }} htmlFor="signup-email">Email</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}>✉</span>
                        <input id="signup-email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} placeholder="name@company.com" className="lp-input" />
                      </div>
                    </div>
                    {/* Password */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }} htmlFor="signup-password">Password</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}>🔒</span>
                        <input id="signup-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={handleChange} placeholder="Min. 8 characters" className="lp-input" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#aaa' }}>
                          {showPassword ? '🙈' : '👁'}
                        </button>
                      </div>
                      {form.password && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 4, background: '#e8e5de', borderRadius: 99, overflow: 'hidden' }}>
                            <motion.div
                              animate={{ width: `${(strength.level / 3) * 100}%` }}
                              transition={{ duration: 0.4 }}
                              style={{ height: '100%', background: strength.color, borderRadius: 99 }}
                            />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: strength.color }}>{strength.label}</span>
                        </div>
                      )}
                    </div>
                    {/* Confirm */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }} htmlFor="confirm-password">Confirm Password</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}>🔑</span>
                        <input id="confirm-password" name="confirm" type={showConfirm ? 'text' : 'password'} autoComplete="new-password" value={form.confirm} onChange={handleChange} placeholder="Repeat password" className="lp-input" />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#aaa' }}>
                          {showConfirm ? '🙈' : '👁'}
                        </button>
                      </div>
                      {form.confirm && form.password !== form.confirm && (
                        <p style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>⚠ Passwords don't match</p>
                      )}
                      {form.confirm && form.password === form.confirm && form.confirm.length >= 8 && (
                        <p style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>✓ Passwords match</p>
                      )}
                    </div>

                    <AnimatePresence mode="wait">
                      {error && (
                        <motion.div key="err"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{ background: '#fff0ed', border: '1.5px solid #ff7557', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#c0392b', overflow: 'hidden' }}>
                          ⚠ {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      className="coral-solid"
                      style={{ width: '100%', padding: '13px', fontSize: 15, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                      Continue →
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                <motion.div key="step2" variants={slideOver} initial="initial" animate="animate" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ textAlign: 'center' }}>
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                      style={{ width: 52, height: 52, borderRadius: 16, background: '#ff7557', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}
                    >
                      <span style={{ fontSize: 22 }}>📄</span>
                    </motion.div>
                    <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.04em', marginBottom: 6 }}>Upload Your Resume</h2>
                    <p style={{ fontSize: 13, color: '#666' }}>Optional — upload now or later from your dashboard.</p>
                  </div>

                  <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={handleSubmit}>
                    {!resume ? (
                      <label htmlFor="resume-upload"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '32px 20px', border: '2px dashed #d5d0c8', borderRadius: 16, cursor: 'pointer', background: '#f7f5f0', transition: 'border-color 0.2s, background 0.2s' }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = '#ff7557'; e.currentTarget.style.background = '#fff6f4'; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = '#d5d0c8'; e.currentTarget.style.background = '#f7f5f0'; }}
                      >
                        <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fff', border: '1.5px solid #e8e5de', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📤</div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>Click to upload or drag & drop</div>
                          <div style={{ fontSize: 12, color: '#888', fontFamily: 'monospace' }}>PDF only · Max 5 MB</div>
                        </div>
                        <input id="resume-upload" ref={fileRef} type="file" accept=".pdf,application/pdf" onChange={handleFile} style={{ display: 'none' }} />
                      </label>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px', borderRadius: 16, background: '#fff6f4', border: '1.5px solid #ff7557' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#ff7557', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 16 }}>📄</span>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resume.name}</div>
                            <div style={{ fontSize: 11, color: '#888', fontFamily: 'monospace' }}>{(resume.size / 1024).toFixed(1)} KB</div>
                          </div>
                        </div>
                        <button type="button" onClick={removeFile} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#888', flexShrink: 0 }}>✕</button>
                      </motion.div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#f0f9f4', borderRadius: 12, border: '1px solid #bbf7d0' }}>
                      <span style={{ fontSize: 16 }}>🛡</span>
                      <span style={{ fontSize: 12, color: '#15803d', fontWeight: 500 }}>Your data is encrypted and used only for generating interview questions.</span>
                    </div>

                    <AnimatePresence mode="wait">
                      {error && (
                        <motion.div key="err"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{ background: '#fff0ed', border: '1.5px solid #ff7557', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#c0392b', overflow: 'hidden' }}>
                          ⚠ {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      type="submit" disabled={loading}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      className="coral-solid"
                      style={{ width: '100%', padding: '13px', fontSize: 15, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                      {loading ? (
                        <>
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                            style={{ width: 16, height: 16, border: '2px solid rgba(26,10,4,0.2)', borderTopColor: '#1a0a04', borderRadius: '50%' }} />
                          Creating Account...
                        </>
                      ) : resume ? '🚀 Create Account & Upload Resume' : '🚀 Create Account'}
                    </motion.button>

                    <button type="button" onClick={() => setStep(1)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '4px 0' }}>
                      ← Back to account details
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div style={{ textAlign: 'center', borderTop: '1px solid #e8e5de', paddingTop: 16 }}>
              <p style={{ fontSize: 11, color: '#aaa', marginBottom: 10, fontFamily: 'monospace' }}>
                By creating an account, you agree to our{' '}
                <a href="#" style={{ color: '#ff7557', textDecoration: 'none' }}>Terms</a> and{' '}
                <a href="#" style={{ color: '#ff7557', textDecoration: 'none' }}>Privacy Policy</a>.
              </p>
              <span style={{ fontSize: 13, color: '#666' }}>Already have an account? </span>
              <Link to="/login" style={{ fontSize: 13, color: '#ff7557', fontWeight: 800, textDecoration: 'none' }}>Log in</Link>
            </div>
          </motion.div>
        </div>
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
