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
  const [step, setStep] = useState(1) // multi-step UX
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
    if (!form.name || !form.email) { setError('Please fill in your name and email'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
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
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = () => {
    if (!form.password) return { level: 0, label: '', color: '' }
    if (form.password.length < 6) return { level: 1, label: 'Weak', color: 'bg-error' }
    if (form.password.length < 10) return { level: 2, label: 'Fair', color: 'bg-tertiary' }
    return { level: 3, label: 'Strong', color: 'bg-secondary' }
  }
  const strength = passwordStrength()

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">

      {/* Ambient glows */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-primary/4 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/4 rounded-full blur-[100px]" />
        <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-tertiary/3 rounded-full blur-[80px]" />
      </div>

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-lg py-md bg-background/60 backdrop-blur-xl border-b border-white/5">
        <Link to="/" className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          <span className="font-display text-xl font-bold text-on-background tracking-tighter">InterviewIQ AI</span>
        </Link>
        <div className="hidden md:flex items-center gap-lg">
          {['Product', 'Solutions', 'Pricing', 'Resources'].map(item => (
            <a key={item} href="#" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm">{item}</a>
          ))}
        </div>
        <div className="flex items-center gap-md">
          <Link to="/login" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm">Log In</Link>
          <Link to="/signup" className="bg-primary text-on-primary px-md py-sm rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all text-sm">Sign Up Free</Link>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-md pt-28 pb-xl">
        <div className="w-full max-w-[480px]">

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-md mb-xl">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-sm">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  s <= step ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                }`}
                  style={s <= step ? { boxShadow: '0 0 15px rgba(192,193,255,0.3)' } : {}}
                >{s < step ? <span className="material-symbols-outlined text-sm">check</span> : s}</div>
                <span className={`text-xs font-mono ${s <= step ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {s === 1 ? 'Account' : 'Resume'}
                </span>
                {s < 2 && <div className={`w-10 h-px ${step > s ? 'bg-primary' : 'bg-white/10'} transition-colors`} />}
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="glass-card rounded-2xl p-xl flex flex-col gap-lg" style={{ boxShadow: '0 0 60px rgba(192,193,255,0.08)' }}>

            {step === 1 && (
              <>
                {/* Header */}
                <div className="text-center flex flex-col gap-xs">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-sm">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
                  </div>
                  <h1 className="text-2xl font-bold font-display text-on-background">Create your account</h1>
                  <p className="text-on-surface-variant text-sm">Start your journey to surgical interview precision.</p>
                </div>

                {/* Social Auth */}
                <div className="grid grid-cols-2 gap-md">
                  <button
                    onClick={() => window.location.href = authService.getOAuthUrl('google')}
                    className="flex items-center justify-center gap-sm py-sm px-md border border-white/8 rounded-xl hover:bg-white/5 hover:border-white/15 transition-all active:scale-[0.98] text-sm"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span className="text-xs font-medium">Google</span>
                  </button>
                  <button
                    onClick={() => window.location.href = authService.getOAuthUrl('github')}
                    className="flex items-center justify-center gap-sm py-sm px-md border border-white/8 rounded-xl hover:bg-white/5 hover:border-white/15 transition-all active:scale-[0.98] text-sm"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-on-surface">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span className="text-xs font-medium">GitHub</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center gap-md">
                  <div className="flex-grow h-px bg-white/5" />
                  <span className="text-xs font-mono text-outline uppercase tracking-widest">or continue with email</span>
                  <div className="flex-grow h-px bg-white/5" />
                </div>

                {/* Form Step 1 */}
                <form className="flex flex-col gap-md" onSubmit={handleNextStep}>
                  <div className="flex flex-col gap-xs">
                    <label className="text-xs font-mono text-on-surface-variant" htmlFor="name">Full Name</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-base">badge</span>
                      <input id="name" name="name" type="text" autoComplete="name"
                        value={form.name} onChange={handleChange} placeholder="John Doe"
                        className="w-full bg-surface-container-lowest border border-white/5 rounded-xl pl-10 pr-md py-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_rgba(192,193,255,0.15)] transition-all text-sm" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-xs">
                    <label className="text-xs font-mono text-on-surface-variant" htmlFor="signup-email">Email Address</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-base">mail</span>
                      <input id="signup-email" name="email" type="email" autoComplete="email"
                        value={form.email} onChange={handleChange} placeholder="name@company.com"
                        className="w-full bg-surface-container-lowest border border-white/5 rounded-xl pl-10 pr-md py-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_rgba(192,193,255,0.15)] transition-all text-sm" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-xs">
                    <label className="text-xs font-mono text-on-surface-variant" htmlFor="signup-password">Password</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-base">lock</span>
                      <input id="signup-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                        value={form.password} onChange={handleChange} placeholder="Min. 8 characters"
                        className="w-full bg-surface-container-lowest border border-white/5 rounded-xl pl-10 pr-10 py-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_rgba(192,193,255,0.15)] transition-all text-sm" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                        <span className="material-symbols-outlined text-base">{showPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                    {form.password && (
                      <div className="flex items-center gap-sm">
                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${strength.color} rounded-full transition-all`} style={{ width: `${(strength.level / 3) * 100}%` }} />
                        </div>
                        <span className={`text-xs font-mono ${strength.level === 3 ? 'text-secondary' : strength.level === 2 ? 'text-tertiary' : 'text-error'}`}>{strength.label}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-xs">
                    <label className="text-xs font-mono text-on-surface-variant" htmlFor="confirm-password">Confirm Password</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-base">lock_reset</span>
                      <input id="confirm-password" name="confirm" type={showConfirm ? 'text' : 'password'} autoComplete="new-password"
                        value={form.confirm} onChange={handleChange} placeholder="Repeat password"
                        className="w-full bg-surface-container-lowest border border-white/5 rounded-xl pl-10 pr-10 py-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_rgba(192,193,255,0.15)] transition-all text-sm" />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                        <span className="material-symbols-outlined text-base">{showConfirm ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                    {form.confirm && form.password !== form.confirm && (
                      <p className="text-xs text-error font-mono flex items-center gap-xs">
                        <span className="material-symbols-outlined text-xs">error</span> Passwords don't match
                      </p>
                    )}
                    {form.confirm && form.password === form.confirm && form.confirm.length >= 8 && (
                      <p className="text-xs text-secondary font-mono flex items-center gap-xs">
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Passwords match
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className="p-sm rounded-xl bg-error-container/20 border border-error/30 text-error text-sm flex items-center gap-sm">
                      <span className="material-symbols-outlined text-base">error</span>{error}
                    </div>
                  )}

                  <button type="submit"
                    className="w-full bg-primary text-on-primary font-bold text-base py-md rounded-xl hover:shadow-[0_0_30px_rgba(192,193,255,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-sm mt-xs">
                    Continue
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </form>
              </>
            )}

            {step === 2 && (
              <>
                {/* Header */}
                <div className="text-center flex flex-col gap-xs">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/20 border border-secondary/30 flex items-center justify-center mx-auto mb-sm">
                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>upload_file</span>
                  </div>
                  <h2 className="text-2xl font-bold font-display text-on-background">Upload Your Resume</h2>
                  <p className="text-on-surface-variant text-sm">Optional — upload now or later from your dashboard.</p>
                </div>

                {/* Resume Upload */}
                <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-xs">
                    {!resume ? (
                      <label htmlFor="resume-upload"
                        className="flex flex-col items-center justify-center gap-md py-xl border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-primary/40 hover:bg-white/2 transition-all group">
                        <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-2xl">upload_file</span>
                        </div>
                        <div className="text-center">
                          <span className="text-sm text-on-surface-variant group-hover:text-primary transition-colors block font-medium">Click to upload or drag & drop</span>
                          <span className="text-xs font-mono text-outline/70">PDF only · Max 5 MB</span>
                        </div>
                        <input id="resume-upload" ref={fileRef} type="file" accept=".pdf,application/pdf" onChange={handleFile} className="hidden" />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between gap-sm px-md py-md rounded-xl bg-primary/8 border border-primary/25">
                        <div className="flex items-center gap-sm min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm text-on-surface truncate block font-medium">{resume.name}</span>
                            <span className="text-xs font-mono text-outline">{(resume.size / 1024).toFixed(1)} KB</span>
                          </div>
                        </div>
                        <button type="button" onClick={removeFile} className="text-outline hover:text-error transition-colors flex-shrink-0">
                          <span className="material-symbols-outlined text-base">close</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Trust signals */}
                  <div className="flex items-center gap-sm p-sm rounded-lg bg-surface-container-low border border-white/5 text-xs font-mono text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                    Your data is encrypted and used only for generating interview questions.
                  </div>

                  {error && (
                    <div className="p-sm rounded-xl bg-error-container/20 border border-error/30 text-error text-sm flex items-center gap-sm">
                      <span className="material-symbols-outlined text-base">error</span>{error}
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full bg-primary text-on-primary font-bold text-base py-md rounded-xl hover:shadow-[0_0_30px_rgba(192,193,255,0.3)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-sm">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
                        {resume ? 'Create Account & Upload Resume' : 'Create Account'}
                      </>
                    )}
                  </button>

                  <button type="button" onClick={() => setStep(1)} className="text-sm text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center gap-xs">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Back to account details
                  </button>
                </form>
              </>
            )}

            {/* Footer */}
            <div className="text-center flex flex-col gap-md pt-xs border-t border-white/5">
              <p className="text-[10px] text-outline font-mono leading-relaxed">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-primary hover:underline">Terms of Service</a> and{' '}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
              </p>
              <div>
                <span className="text-on-surface-variant text-sm">Already have an account?{' '}</span>
                <Link to="/login" className="text-primary font-bold hover:underline">Log in</Link>
              </div>
            </div>
          </div>
        </div>
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
