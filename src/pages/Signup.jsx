import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services'

export default function Signup() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [resume, setResume] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      await authService.signup({ name: form.name, email: form.email, password: form.password, resumeFile: resume })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col overflow-x-hidden">
      {/* Ambient */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
      </div>

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-lg py-md bg-background/70 backdrop-blur-xl border-b border-white/5">
        <Link to="/" className="font-display text-2xl font-bold text-on-background tracking-tighter">InterviewIQ AI</Link>
        <div className="hidden md:flex items-center gap-lg">
          {['Product', 'Solutions', 'Pricing', 'Resources'].map(item => (
            <a key={item} href="#" className="text-on-surface-variant font-medium hover:text-primary transition-colors">{item}</a>
          ))}
        </div>
        <div className="flex items-center gap-md">
          <Link to="/login" className="text-on-surface-variant font-medium hover:text-primary transition-colors">Log In</Link>
          <Link to="/signup" className="bg-primary-container text-on-primary-container px-md py-sm rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all">Sign Up</Link>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-md pt-32 pb-xl">
        <div className="w-full max-w-[480px]">
          <div className="glass-card rounded-xl p-xl flex flex-col gap-xl ai-glow">
            {/* Header */}
            <div className="text-center flex flex-col gap-sm">
              <h1 className="text-2xl font-bold font-display text-on-background">Create your account</h1>
              <p className="text-on-surface-variant opacity-80">Start your journey to surgical interview precision.</p>
            </div>

            {/* Social Auth */}
            <div className="grid grid-cols-2 gap-md">
              <button className="flex items-center justify-center gap-sm py-sm px-md border border-white/10 rounded-lg hover:bg-white/5 transition-all active:scale-[0.98]">
                <span className="material-symbols-outlined text-base">google</span>
                <span className="text-xs font-mono">Google</span>
              </button>
              <button className="flex items-center justify-center gap-sm py-sm px-md border border-white/10 rounded-lg hover:bg-white/5 transition-all active:scale-[0.98]">
                <span className="material-symbols-outlined text-base">code</span>
                <span className="text-xs font-mono">GitHub</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center gap-md">
              <div className="flex-grow h-px bg-white/5" />
              <span className="text-xs font-mono text-outline uppercase tracking-widest">or continue with email</span>
              <div className="flex-grow h-px bg-white/5" />
            </div>

            {/* Form */}
            <form className="flex flex-col gap-lg" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="flex flex-col gap-sm">
                <label className="text-xs font-mono text-on-surface-variant" htmlFor="name">Full Name</label>
                <input
                  id="name" name="name" type="text" autoComplete="name"
                  value={form.name} onChange={handleChange} placeholder="John Doe"
                  className="bg-surface-container-lowest border border-white/5 rounded-lg px-md py-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(192,193,255,0.2)] transition-all"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-sm">
                <label className="text-xs font-mono text-on-surface-variant" htmlFor="signup-email">Email Address</label>
                <input
                  id="signup-email" name="email" type="email" autoComplete="email"
                  value={form.email} onChange={handleChange} placeholder="name@company.com"
                  className="bg-surface-container-lowest border border-white/5 rounded-lg px-md py-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(192,193,255,0.2)] transition-all"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-sm">
                <label className="text-xs font-mono text-on-surface-variant" htmlFor="signup-password">Password</label>
                <div className="relative">
                  <input
                    id="signup-password" name="password"
                    type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                    value={form.password} onChange={handleChange} placeholder="••••••••"
                    className="w-full bg-surface-container-lowest border border-white/5 rounded-lg px-md py-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(192,193,255,0.2)] transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                    <span className="material-symbols-outlined text-base">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-outline font-mono">Must be at least 8 characters long.</p>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-sm">
                <label className="text-xs font-mono text-on-surface-variant" htmlFor="confirm-password">Confirm Password</label>
                <div className="relative">
                  <input
                    id="confirm-password" name="confirm"
                    type={showConfirm ? 'text' : 'password'} autoComplete="new-password"
                    value={form.confirm} onChange={handleChange} placeholder="Repeat password"
                    className="w-full bg-surface-container-lowest border border-white/5 rounded-lg px-md py-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(192,193,255,0.2)] transition-all"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                    <span className="material-symbols-outlined text-base">{showConfirm ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* Resume Upload (optional on signup) */}
              <div className="flex flex-col gap-sm">
                <label className="text-xs font-mono text-on-surface-variant">
                  Resume <span className="text-outline">(PDF, max 5MB — optional)</span>
                </label>
                {!resume ? (
                  <label htmlFor="resume-upload"
                    className="flex flex-col items-center justify-center gap-sm py-lg border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-primary/40 hover:bg-white/3 transition-all group">
                    <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">upload_file</span>
                    <span className="text-sm text-outline group-hover:text-primary transition-colors">Click to upload or drag & drop</span>
                    <span className="text-xs font-mono text-outline/60">PDF only · Max 5 MB</span>
                    <input id="resume-upload" ref={fileRef} type="file" accept=".pdf,application/pdf" onChange={handleFile} className="hidden" />
                  </label>
                ) : (
                  <div className="flex items-center justify-between gap-sm px-md py-sm rounded-lg bg-primary/10 border border-primary/30">
                    <div className="flex items-center gap-sm min-w-0">
                      <span className="material-symbols-outlined text-primary text-base">description</span>
                      <div className="min-w-0">
                        <span className="text-sm text-on-surface truncate block">{resume.name}</span>
                        <span className="text-xs font-mono text-outline">{(resume.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                    <button type="button" onClick={removeFile} className="text-outline hover:text-error transition-colors flex-shrink-0">
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="p-sm rounded-lg bg-error-container/30 border border-error/30 text-error text-sm text-center">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                id="signup-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-primary-container text-on-primary-container font-bold text-lg py-md rounded-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-md"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Footer */}
            <div className="text-center flex flex-col gap-md">
              <p className="text-[10px] text-outline font-mono leading-relaxed">
                By clicking "Create Account", you agree to our{' '}
                <a href="#" className="text-primary hover:underline">Terms of Service</a> and{' '}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
              </p>
              <div className="pt-lg border-t border-white/5">
                <span className="text-on-surface-variant">Already have an account?</span>{' '}
                <Link to="/login" className="text-primary font-bold hover:underline">Log in</Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-xl px-lg mt-auto flex flex-col md:flex-row justify-between items-center gap-md bg-background border-t border-white/5">
        <div className="flex flex-col gap-xs items-center md:items-start">
          <span className="font-display text-xl font-bold text-on-background">InterviewIQ AI</span>
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
