import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { API_BASE, authService } from '../services'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
}

function Sidebar({ active = 'upload' }) {
  const navigate = useNavigate()
  const user = authService.getUser()
  const navItems = [
    { id: 'dashboard', label: 'Home',      icon: 'dashboard',   to: '/dashboard' },
    { id: 'upload',    label: 'Resume',    icon: 'upload_file', to: '/upload' },
    { id: 'interview', label: 'Interview', icon: 'history',     to: '/interview' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics',   to: '#' },
    { id: 'settings',  label: 'Settings',  icon: 'settings',    to: '#' },
  ]
  return (
    <aside className="hidden md:flex flex-col h-screen w-64 bg-surface-container-lowest border-r border-white/5 py-lg fixed left-0 top-0 z-40">
      <div className="px-lg mb-xl">
        <div className="flex items-center gap-sm mb-xs">
          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          <h1 className="text-2xl font-bold font-display text-primary tracking-tighter">InterviewIQ</h1>
        </div>
        <p className="text-xs font-mono text-on-surface-variant opacity-50 uppercase tracking-widest ml-8">Premium Tier</p>
      </div>

      <nav className="flex-1 px-sm space-y-xs overflow-y-auto custom-scrollbar">
        {navItems.map(item => (
          <Link key={item.id} to={item.to}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all ${
              active === item.id ? 'nav-active' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
            }`}>
            <span className="material-symbols-outlined" style={active === item.id ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
            <span className="text-base">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="px-sm mt-auto pt-md border-t border-white/5 space-y-xs">
        <Link to="/upload"
          className="w-full py-md bg-primary text-on-primary font-bold rounded-lg mb-sm active:scale-[0.98] transition-all hover:shadow-[0_0_20px_rgba(192,193,255,0.2)] block text-center">
          Start New Interview
        </Link>
        <div className="flex items-center gap-md px-md py-sm rounded-xl hover:bg-white/5 transition-all cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold truncate">{user?.name || 'User'}</span>
            <span className="text-xs font-mono text-outline-variant truncate">{user?.email || ''}</span>
          </div>
        </div>
        <a href="#" className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-white/5 transition-all text-sm">
          <span className="material-symbols-outlined text-base">help</span>
          <span>Support</span>
        </a>
        <button
          onClick={() => { authService.logout(); navigate('/login') }}
          className="w-full flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-error/5 hover:text-error transition-all text-sm">
          <span className="material-symbols-outlined text-base">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

export default function ResumeUpload() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('intervue_model') || 'gemini')

  const user = authService.getUser()
  if (!user) { navigate('/login'); return null }

  const handleModelChange = (model) => {
    setSelectedModel(model)
    localStorage.setItem('intervue_model', model)
  }

  const handleFile = (f) => {
    setError(''); setResult(null)
    if (!f) return
    if (f.type !== 'application/pdf') { setError('Only PDF files are accepted'); return }
    if (f.size > 5 * 1024 * 1024) { setError('File size must be under 5 MB'); return }
    setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragActive(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const removeFile = () => { setFile(null); setError(''); setResult(null); setUploadProgress(0) }

  const handleUpload = async () => {
    if (!file) { setError('Please select a PDF file first'); return }
    setLoading(true); setError(''); setUploadProgress(0)
    // Simulate progress for UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) { clearInterval(progressInterval); return prev }
        return prev + Math.random() * 15
      })
    }, 200)
    try {
      const token = localStorage.getItem('intervue_token')
      const formData = new FormData()
      formData.append('resume', file)
      formData.append('userId', user._id)
      formData.append('model', selectedModel)
      const res = await fetch(`${API_BASE}/resume/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Upload failed')
      clearInterval(progressInterval)
      setUploadProgress(100)
      setTimeout(() => { setResult(data); setFile(null) }, 500)
    } catch (err) {
      clearInterval(progressInterval)
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const importSources = [
    { label: 'LinkedIn', icon: 'work', color: 'text-secondary' },
    { label: 'GitHub',   icon: 'code', color: 'text-on-surface' },
    { label: 'Drive',    icon: 'add_to_drive', color: 'text-tertiary' },
  ]

  const features = [
    { icon: 'psychology',     color: 'text-primary',   title: 'Smart Parsing',        desc: 'AI extracts your skills, projects & experience' },
    { icon: 'quiz',           color: 'text-secondary',  title: 'Tailored Questions',   desc: 'Every question based on your actual background' },
    { icon: 'security',       color: 'text-tertiary',   title: 'Secure & Private',     desc: 'Data encrypted and never shared with third parties' },
  ]

  return (
    <div className="bg-background text-on-background min-h-screen flex">
      <Sidebar active="upload" />

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 md:ml-64 px-lg md:px-xl py-xl max-w-[1280px] mx-auto w-full pb-24 md:pb-xl"
      >
        {/* Header */}
        <motion.header variants={cardVariants} className="mb-xl">
          <div className="inline-flex items-center gap-sm px-md py-xs rounded-full border border-primary/30 bg-primary/10 text-xs font-mono text-primary mb-md">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Step 1 of 2 — Resume Intelligence
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-on-background tracking-tighter mb-xs">
            Resume Intelligence
          </h2>
          <p className="text-lg text-on-surface-variant">
            Upload your profile to tailor the AI interviewer specifically to your background.
          </p>
        </motion.header>

        {/* AI Model Selector */}
        <motion.div variants={cardVariants} className="mb-xl">
          <p className="text-xs font-mono text-on-surface-variant uppercase tracking-widest mb-sm">Choose AI Engine</p>
          <div className="inline-flex rounded-xl border border-white/10 bg-surface-container-lowest p-1 relative">
            <div
              className="absolute top-1 bottom-1 rounded-lg bg-primary/15 border border-primary/30 transition-all duration-300 ease-out"
              style={{
                width: 'calc(50% - 4px)',
                left: selectedModel === 'gemini' ? '4px' : 'calc(50%)',
              }}
            />
            <button
              onClick={() => handleModelChange('gemini')}
              className={`relative z-10 flex items-center gap-sm px-lg py-sm rounded-lg text-sm font-semibold transition-colors duration-200 ${
                selectedModel === 'gemini' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              Gemini
            </button>
            <button
              onClick={() => handleModelChange('gpt')}
              className={`relative z-10 flex items-center gap-sm px-lg py-sm rounded-lg text-sm font-semibold transition-colors duration-200 ${
                selectedModel === 'gpt' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              ChatGPT
            </button>
          </div>
          <p className="text-xs text-on-surface-variant mt-xs opacity-60">
            {selectedModel === 'gemini' ? 'Google Gemini 1.5 Flash — fast, free-tier friendly' : 'OpenAI GPT-4o-mini — state-of-the-art reasoning'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-xl">
          {/* Main Upload Area */}
          <div className="xl:col-span-2">
            <AnimatePresence mode="wait">
              {/* Success state */}
              {result ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-lg"
                >
                  <div className="glass-panel rounded-2xl p-xl" style={{ boxShadow: '0 0 40px rgba(192,193,255,0.1)' }}>
                    <div className="flex items-center gap-sm mb-lg">
                      <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                      <span className="text-xs font-mono text-secondary uppercase tracking-widest">Analysis Complete</span>
                    </div>
                    <div className="flex items-center gap-md mb-xl">
                      <motion.div
                        initial={{ scale: 0.7, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                        className="w-14 h-14 rounded-2xl bg-secondary/20 border border-secondary/30 flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      </motion.div>
                      <div>
                        <h3 className="font-display text-xl font-bold text-on-background">Upload Successful!</h3>
                        <p className="text-on-surface-variant text-sm">{result.message}</p>
                      </div>
                    </div>

                    {result.extractedText && (
                      <div className="mb-xl">
                        <div className="flex items-center justify-between mb-sm">
                          <h4 className="text-xs font-mono text-on-surface-variant uppercase tracking-widest">Extracted Content Preview</h4>
                          <span className="text-xs font-mono text-primary">{result.extractedText.length} chars</span>
                        </div>
                        <div className="max-h-48 overflow-y-auto custom-scrollbar p-md rounded-xl bg-surface-container-low border border-white/5 text-sm text-on-surface font-mono leading-relaxed whitespace-pre-wrap">
                          {result.extractedText.length > 2000 ? result.extractedText.substring(0, 2000) + '\n\n... (truncated)' : result.extractedText}
                        </div>
                      </div>
                    )}

                    {/* Skill tags if available */}
                    {result.skills && result.skills.length > 0 && (
                      <div className="mb-xl">
                        <p className="text-xs font-mono text-on-surface-variant uppercase tracking-widest mb-sm">Detected Skills</p>
                        <div className="flex flex-wrap gap-sm">
                          {result.skills.map((skill, si) => (
                            <motion.span
                              key={skill}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: si * 0.05, duration: 0.3 }}
                              className="px-sm py-xs bg-primary/10 text-primary text-xs font-mono rounded-full border border-primary/20"
                            >
                              {skill}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-md">
                      <motion.button
                        onClick={() => navigate('/interview')}
                        whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(192,193,255,0.3)' }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 py-md bg-primary text-on-primary font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-sm"
                      >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                        Start Interview Now
                      </motion.button>
                      <button onClick={() => { setResult(null); setFile(null); setUploadProgress(0) }}
                        className="px-lg py-md border border-outline-variant/30 text-on-surface-variant rounded-xl hover:bg-white/5 transition-all text-sm">
                        Upload Another
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-panel rounded-2xl p-xl transition-all"
                  style={{ boxShadow: '0 0 30px rgba(192,193,255,0.05)' }}
                >
                  {/* Drop Zone */}
                  {!file ? (
                    <label
                      htmlFor="resume-pdf"
                      onDrop={handleDrop}
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      className={`border-2 border-dashed rounded-2xl p-xl flex flex-col items-center justify-center gap-lg cursor-pointer transition-all group min-h-[280px] ${
                        dragActive
                          ? 'border-primary bg-primary/5 scale-[1.01]'
                          : 'border-outline-variant/20 hover:border-primary/40 hover:bg-white/1'
                      }`}
                    >
                      <div className={`w-20 h-20 rounded-2xl bg-surface-container-high flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-primary/15 ${dragActive ? 'scale-110 bg-primary/20' : ''}`}>
                        <span className={`material-symbols-outlined text-4xl transition-colors ${dragActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'}`}>upload_file</span>
                      </div>
                      <div className="text-center">
                        <h3 className="font-display text-2xl font-bold text-on-background mb-xs">
                          {dragActive ? 'Drop it here!' : 'Upload Your Resume'}
                        </h3>
                        <p className="text-on-surface-variant text-sm">Drag & drop your PDF or click to browse</p>
                      </div>
                      <p className="text-xs font-mono text-outline">PDF only · Max 5MB · Encrypted & secure</p>
                      <input id="resume-pdf" type="file" accept=".pdf,application/pdf" onChange={(e) => handleFile(e.target.files[0])} className="hidden" />
                    </label>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="border border-primary/25 rounded-2xl p-lg flex items-center justify-between bg-primary/5 mb-lg"
                    >
                      <div className="flex items-center gap-md min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-on-surface truncate font-semibold">{file.name}</p>
                          <p className="text-xs font-mono text-outline">{(file.size / 1024).toFixed(1)} KB · PDF</p>
                        </div>
                      </div>
                      <button onClick={removeFile} className="text-outline hover:text-error transition-colors p-1 rounded-lg hover:bg-error/5">
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </motion.div>
                  )}

                  {/* Import from */}
                  <div className="flex items-center my-lg gap-md text-outline">
                    <hr className="flex-1 border-outline-variant/15" />
                    <span className="text-xs font-mono uppercase tracking-widest">OR IMPORT FROM</span>
                    <hr className="flex-1 border-outline-variant/15" />
                  </div>

                  <div className="grid grid-cols-3 gap-md mb-lg">
                    {importSources.map(src => (
                      <motion.button
                        key={src.label}
                        whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.05)' }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center justify-center gap-sm py-md glass-panel rounded-xl transition-all group"
                      >
                        <span className={`material-symbols-outlined text-base ${src.color} group-hover:scale-110 transition-transform`} style={{ fontVariationSettings: "'FILL' 1" }}>{src.icon}</span>
                        <span className="text-sm font-medium">{src.label}</span>
                      </motion.button>
                    ))}
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-sm p-sm rounded-xl bg-error-container/20 border border-error/25 mb-lg overflow-hidden"
                      >
                        <span className="material-symbols-outlined text-error text-base">warning</span>
                        <span className="text-sm text-error">{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Progress bar */}
                  {loading && uploadProgress > 0 && (
                    <div className="mb-lg">
                      <div className="flex justify-between text-xs font-mono text-on-surface-variant mb-xs">
                        <span>Analyzing resume...</span>
                        <span className="tabular-nums">{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Upload Button */}
                  <motion.button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    whileHover={file && !loading ? { scale: 1.01, boxShadow: '0 0 40px rgba(192,193,255,0.3)' } : {}}
                    whileTap={file && !loading ? { scale: 0.98 } : {}}
                    className="w-full py-lg bg-primary text-on-primary font-bold rounded-2xl text-lg transition-all flex items-center justify-center gap-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin" />
                        Analyzing Resume...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        Generate Personalized Interview
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </>
                    )}
                  </motion.button>
                  <p className="text-center mt-md text-xs font-mono text-outline">
                    Your resume data is used only for generating personalized interview questions.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Panel — Features */}
          <motion.div variants={containerVariants} className="space-y-lg">
            <motion.div variants={cardVariants} className="glass-card rounded-2xl p-lg">
              <h3 className="font-display text-lg font-bold text-on-background mb-lg">How It Works</h3>
              <div className="space-y-lg">
                {[
                  { step: '01', title: 'Upload Resume', desc: 'Drop your PDF resume and let our AI parse it', icon: 'upload_file', color: 'text-primary', bg: 'bg-primary/10' },
                  { step: '02', title: 'AI Analysis',   desc: 'We extract skills, experience and key projects', icon: 'psychology',   color: 'text-secondary', bg: 'bg-secondary/10' },
                  { step: '03', title: 'Start Session',  desc: 'Begin your personalized mock interview instantly', icon: 'play_circle',  color: 'text-tertiary',  bg: 'bg-tertiary/10' },
                ].map((item, i) => (
                  <div key={item.step} className="flex gap-md items-start">
                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                      <span className={`material-symbols-outlined ${item.color} text-lg`} style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-sm mb-xs">
                        <span className="text-xs font-mono text-outline-variant">{item.step}</span>
                        <p className="font-bold text-on-surface text-sm">{item.title}</p>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Trust Signals */}
            <motion.div variants={cardVariants} className="glass-card rounded-2xl p-lg space-y-md">
              <h3 className="font-display text-base font-bold text-on-background">Why InterviewIQ</h3>
              {features.map(f => (
                <div key={f.title} className="flex items-start gap-sm">
                  <span className={`material-symbols-outlined ${f.color} text-xl shrink-0 mt-0.5`} style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{f.title}</p>
                    <p className="text-xs text-on-surface-variant">{f.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Supported formats */}
            <motion.div variants={cardVariants} className="glass-card rounded-2xl p-lg">
              <p className="text-xs font-mono text-on-surface-variant uppercase tracking-widest mb-md">Supported Formats</p>
              <div className="flex gap-sm">
                {['PDF', 'DOCX', 'LinkedIn'].map(fmt => (
                  <span key={fmt} className="px-sm py-xs bg-surface-container-high text-on-surface-variant text-xs font-mono rounded-lg border border-white/5">{fmt}</span>
                ))}
              </div>
              <p className="text-xs text-outline font-mono mt-sm">Max file size: 5MB</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="w-full py-xl mt-20 flex flex-col md:flex-row justify-between items-center gap-md border-t border-white/5">
          <div>
            <span className="font-display text-lg font-bold text-on-background tracking-tighter">InterviewIQ AI</span>
            <p className="text-xs font-mono text-on-surface-variant mt-xs">© 2024 InterviewIQ AI. Surgical precision in every hire.</p>
          </div>
          <div className="flex gap-lg">
            {['Privacy Policy', 'Terms of Service', 'Security'].map(link => (
              <a key={link} href="#" className="text-xs font-mono text-on-surface-variant hover:text-secondary transition-colors">{link}</a>
            ))}
          </div>
        </footer>
      </motion.main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-md z-50">
        {[
          { icon: 'dashboard',   label: 'Home',     to: '/dashboard' },
          { icon: 'upload_file', label: 'Resume',   to: '/upload',   active: true },
          { icon: 'history',     label: 'Interview',to: '/interview' },
          { icon: 'analytics',   label: 'Stats',    to: '#' },
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
