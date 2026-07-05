import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { authService } from '../services'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }
  })
}

const shake = {
  shake: { x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.5 } }
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
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">

      {/* Ambient glows */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.04, 0.06, 0.04] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary/4 rounded-full blur-[140px]"
        />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/4 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_60%,rgba(0,0,0,0.8)_100%)]" />
      </div>

      {/* Nav */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-lg py-md bg-background/60 backdrop-blur-xl border-b border-white/5"
      >
        <Link to="/" className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          <span className="font-display text-xl font-bold text-on-background tracking-tighter">InterviewIQ AI</span>
        </Link>
        <div className="hidden md:flex items-center gap-lg">
          {['Product', 'Solutions', 'Pricing', 'Resources'].map(item => (
            <a key={item} href="#" className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-300 text-sm">{item}</a>
          ))}
        </div>
        <div className="flex items-center gap-md">
          <Link to="/login" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm">Log In</Link>
          <Link to="/signup" className="bg-primary text-on-primary px-md py-sm rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all text-sm">Sign Up Free</Link>
        </div>
      </motion.header>

      {/* Main */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-md pt-28 pb-xl">
        <motion.div
          className="w-full max-w-[460px]"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        >
          {/* Card */}
          <motion.div
            key={shakeKey}
            variants={error && shakeKey > 0 ? shake : {}}
            animate={error && shakeKey > 0 ? 'shake' : ''}
            className="glass-card rounded-2xl p-xl flex flex-col gap-lg"
            style={{ boxShadow: '0 0 60px rgba(192,193,255,0.08), 0 0 120px rgba(192,193,255,0.04)' }}
          >

            {/* Header */}
            <motion.div variants={fadeUp} custom={0} className="text-center flex flex-col gap-xs">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-sm"
              >
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>lock_open</span>
              </motion.div>
              <h1 className="text-2xl font-bold font-display text-on-background">Welcome back</h1>
              <p className="text-on-surface-variant text-sm">Sign in to continue your interview prep journey.</p>
            </motion.div>

            {/* Social Auth */}
            <motion.div variants={fadeUp} custom={1} className="grid grid-cols-2 gap-md">
              <motion.button
                whileHover={{ scale: 1.03, borderColor: 'rgba(255,255,255,0.15)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => window.location.href = authService.getOAuthUrl('google')}
                className="flex items-center justify-center gap-sm py-sm px-md border border-white/8 rounded-xl hover:bg-white/5 transition-all text-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-on-surface">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-xs font-medium">Google</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, borderColor: 'rgba(255,255,255,0.15)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => window.location.href = authService.getOAuthUrl('github')}
                className="flex items-center justify-center gap-sm py-sm px-md border border-white/8 rounded-xl hover:bg-white/5 transition-all text-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-on-surface">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-xs font-medium">GitHub</span>
              </motion.button>
            </motion.div>

            {/* Divider */}
            <motion.div variants={fadeUp} custom={2} className="relative flex items-center gap-md">
              <div className="flex-grow h-px bg-white/5" />
              <span className="text-xs font-mono text-outline uppercase tracking-widest">or continue with email</span>
              <div className="flex-grow h-px bg-white/5" />
            </motion.div>

            {/* Form */}
            <motion.form variants={fadeUp} custom={3} className="flex flex-col gap-md" onSubmit={handleSubmit}>
              {/* Email */}
              <div className="flex flex-col gap-xs">
                <label className="text-xs font-mono text-on-surface-variant" htmlFor="email">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-base">mail</span>
                  <input
                    id="email" name="email" type="email" autoComplete="email"
                    value={form.email} onChange={handleChange} placeholder="name@company.com"
                    className="w-full bg-surface-container-lowest border border-white/5 rounded-xl pl-10 pr-md py-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_rgba(192,193,255,0.15)] transition-all text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-on-surface-variant" htmlFor="password">Password</label>
                  <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-base">lock</span>
                  <input
                    id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                    value={form.password} onChange={handleChange} placeholder="••••••••"
                    className="w-full bg-surface-container-lowest border border-white/5 rounded-xl pl-10 pr-10 py-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_rgba(192,193,255,0.15)] transition-all text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                    <span className="material-symbols-outlined text-base">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-sm">
                <input id="remember" name="remember" type="checkbox" checked={form.remember} onChange={handleChange}
                  className="w-4 h-4 rounded border-white/20 bg-surface-container-lowest text-primary cursor-pointer accent-primary" />
                <label htmlFor="remember" className="text-sm text-on-surface-variant cursor-pointer">Remember me for 30 days</label>
              </div>

              {/* Error */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="p-sm rounded-xl bg-error-container/20 border border-error/30 text-error text-sm flex items-center gap-sm overflow-hidden"
                  >
                    <span className="material-symbols-outlined text-base">error</span>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                id="login-btn"
                type="submit"
                disabled={loading}
                whileHover={{ boxShadow: '0 0 30px rgba(192,193,255,0.3)' }}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-primary text-on-primary font-bold text-base py-md rounded-xl hover:shadow-[0_0_30px_rgba(192,193,255,0.3)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-sm mt-xs"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>
                    Log In
                  </>
                )}
              </motion.button>
            </motion.form>

            {/* Footer */}
            <motion.div variants={fadeUp} custom={4} className="text-center flex flex-col gap-md">
              <p className="text-xs text-outline font-mono leading-relaxed">
                By signing in, you agree to our{' '}
                <a href="#" className="text-primary hover:underline">Terms</a> and{' '}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
              </p>
              <div className="pt-md border-t border-white/5">
                <span className="text-on-surface-variant text-sm">Don't have an account?{' '}</span>
                <Link to="/signup" className="text-primary font-bold hover:underline">Sign up free</Link>
              </div>
            </motion.div>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-xl flex items-center justify-center gap-md text-xs font-mono text-on-surface-variant"
          >
            <div className="flex -space-x-2">
              {['#c0c1ff', '#4cd7f6', '#ffb783', '#c0c1ff'].map((color, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.6 + i * 0.08 }}
                  className="w-6 h-6 rounded-full border-2 border-background"
                  style={{ background: color, opacity: 0.8 }}
                />
              ))}
            </div>
            <span>10,000+ professionals trust InterviewIQ</span>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-lg px-lg mt-auto flex flex-col md:flex-row justify-between items-center gap-md border-t border-white/5">
        <div className="flex flex-col gap-xs items-center md:items-start">
          <span className="font-display text-base font-bold text-on-background">InterviewIQ AI</span>
          <p className="text-xs font-mono text-on-surface-variant">© 2024 InterviewIQ AI. Surgical precision in every hire.</p>
        </div>
        <div className="flex gap-lg">
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'].map(link => (
            <a key={link} href="#" className="text-xs font-mono text-on-surface-variant hover:text-secondary transition-colors">{link}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
