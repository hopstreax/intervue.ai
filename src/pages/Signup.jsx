import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Upload, Brain, Sun, Moon, FileText, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { authService } from '../services'

export default function Signup() {
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
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
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are accepted')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5 MB')
      return
    }
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

    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await authService.signup({
        name: form.name,
        email: form.email,
        password: form.password,
        resumeFile: resume,
      })
      navigate('/')
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex flex-col transition-colors duration-300">
      {/* Background decorations */}
      <div className="fixed inset-0 bg-grid opacity-100 pointer-events-none" />
      <div className="fixed top-10 right-20 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 left-10 w-72 h-72 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-base font-bold text-gray-900 dark:text-white">
            Intervue<span className="text-cyan-500">.AI</span>
          </span>
        </Link>
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200
            bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10
            text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400
            shadow-sm hover:shadow-neon-sm"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white dark:bg-dark-700/80 border border-gray-200 dark:border-white/10 rounded-3xl shadow-lg dark:shadow-none backdrop-blur-sm p-8 transition-colors duration-300">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create your account</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Start your AI-powered interview prep journey</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm
                      bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10
                      text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600
                      focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50
                      transition-all duration-200"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm
                      bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10
                      text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600
                      focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50
                      transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    id="signup-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    className="w-full pl-10 pr-10 py-3 rounded-xl text-sm
                      bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10
                      text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600
                      focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50
                      transition-all duration-200"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    id="confirm-password"
                    name="confirm"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.confirm}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-10 py-3 rounded-xl text-sm
                      bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10
                      text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600
                      focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50
                      transition-all duration-200"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Resume Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Upload Resume <span className="text-gray-400 dark:text-gray-500 font-normal">(PDF only, max 5MB)</span>
                </label>
                {!resume ? (
                  <label
                    htmlFor="resume-upload"
                    className="flex flex-col items-center justify-center gap-2 w-full py-6 px-4 rounded-xl cursor-pointer
                      border-2 border-dashed border-gray-300 dark:border-white/15
                      bg-gray-50 dark:bg-white/3
                      hover:border-cyan-500/50 hover:bg-cyan-500/5 dark:hover:bg-cyan-500/5
                      transition-all duration-200 group"
                  >
                    <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-cyan-500 transition-colors" />
                    <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-600">PDF only • Max 5 MB</span>
                    <input
                      id="resume-upload"
                      ref={fileRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFile}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl
                    bg-cyan-500/10 border border-cyan-500/30 dark:border-cyan-500/20">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm text-gray-700 dark:text-gray-200 truncate block">{resume.name}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{(resume.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                    <button type="button" onClick={removeFile} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2.5">
                <input
                  id="agree"
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 dark:border-white/20 text-cyan-500 focus:ring-cyan-500 cursor-pointer flex-shrink-0"
                />
                <label htmlFor="agree" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-cyan-500 hover:text-cyan-400 font-medium">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-cyan-500 hover:text-cyan-400 font-medium">Privacy Policy</a>
                </label>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm text-center">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                id="signup-btn"
                type="submit"
                disabled={!agreed || loading}
                className="w-full py-3 px-4 rounded-xl font-semibold text-white text-sm mt-2
                  bg-cyan-500 enabled:hover:bg-cyan-400
                  shadow-neon-sm enabled:hover:shadow-neon
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300 active:scale-95"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Divider / Back to login */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-cyan-500 hover:text-cyan-400 font-semibold transition-colors">
                Back to Login
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
            © 2026 Intervue.AI. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  )
}
