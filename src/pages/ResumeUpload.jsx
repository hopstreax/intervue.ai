import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services'

// Sidebar component shared across app pages
function Sidebar({ active = 'upload' }) {
  const navigate = useNavigate()
  const user = authService.getUser()
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: 'dashboard', to: '/dashboard' },
    { id: 'upload',    label: 'Resume',   icon: 'upload_file', to: '/upload' },
    { id: 'interview', label: 'Interview', icon: 'history', to: '/interview' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics', to: '#' },
    { id: 'settings',  label: 'Settings',  icon: 'settings', to: '#' },
  ]
  return (
    <aside className="hidden md:flex flex-col h-screen w-64 bg-surface-container-lowest border-r border-outline-variant/20 py-lg fixed left-0 top-0 z-40">
      <div className="px-lg mb-xl">
        <h1 className="text-2xl font-bold font-display text-primary tracking-tighter">InterviewIQ</h1>
        <p className="text-xs font-mono text-on-surface-variant opacity-70 mt-xs">Premium Tier</p>
      </div>

      <nav className="flex-1 px-sm space-y-xs overflow-y-auto custom-scrollbar">
        {navItems.map(item => (
          <Link
            key={item.id}
            to={item.to}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all ${
              active === item.id
                ? 'nav-active'
                : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-base">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="px-sm mt-auto pt-md border-t border-white/5 space-y-xs">
        <button
          onClick={() => navigate('/interview')}
          className="w-full py-md bg-primary text-on-primary font-bold rounded-lg mb-lg active:scale-[0.98] transition-transform"
        >
          Start New Interview
        </button>
        <a href="#" className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-all">
          <span className="material-symbols-outlined">help</span>
          <span className="text-base">Support</span>
        </a>
        <a href="#" className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-all">
          <span className="material-symbols-outlined">logout</span>
          <span className="text-base">Sign Out</span>
        </a>
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

  const user = authService.getUser()
  if (!user) { navigate('/login'); return null }

  const handleFile = (f) => {
    setError(''); setResult(null)
    if (f && f.type !== 'application/pdf') { setError('Only PDF files are accepted'); return }
    if (f && f.size > 5 * 1024 * 1024) { setError('File size must be under 5 MB'); return }
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

  const removeFile = () => { setFile(null); setError(''); setResult(null) }

  const handleUpload = async () => {
    if (!file) { setError('Please select a PDF file first'); return }
    setLoading(true); setError('')
    try {
      const token = localStorage.getItem('intervue_token')
      const formData = new FormData()
      formData.append('resume', file)
      formData.append('userId', user._id)
      const res = await fetch('http://localhost:5000/api/resume/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Upload failed')
      setResult(data); setFile(null)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex">
      <Sidebar active="upload" />

      <main className="flex-1 md:ml-64 p-xl max-w-[1280px] mx-auto w-full">
        {/* Header */}
        <header className="mb-xl">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-on-background tracking-tighter mb-xs">
            Resume Intelligence
          </h2>
          <p className="text-lg text-on-surface-variant">
            Upload your profile to tailor the AI interviewer specifically to your background.
          </p>
        </header>

        {/* Success state */}
        {result ? (
          <div className="max-w-2xl space-y-lg">
            <div className="glass-panel rounded-xl p-xl ai-glow">
              <div className="flex items-center gap-sm mb-lg">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-mono text-primary uppercase tracking-widest">Analysis Complete</span>
              </div>
              <div className="flex items-center gap-md mb-lg">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-on-background">Upload Successful</h3>
                  <p className="text-on-surface-variant text-sm">{result.message}</p>
                </div>
              </div>

              {result.extractedText && (
                <div className="mb-lg">
                  <h4 className="text-xs font-mono text-on-surface-variant uppercase tracking-widest mb-sm">Extracted Content Preview</h4>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar p-md rounded-lg bg-surface-container-low border border-outline-variant/20 text-sm text-on-surface font-mono leading-relaxed whitespace-pre-wrap">
                    {result.extractedText.length > 3000 ? result.extractedText.substring(0, 3000) + '\n\n... (truncated)' : result.extractedText}
                  </div>
                </div>
              )}

              <div className="flex gap-md">
                <button
                  onClick={() => navigate('/interview')}
                  className="flex-1 py-md bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-sm"
                >
                  <span className="material-symbols-outlined">play_arrow</span>
                  Start Interview
                </button>
                <button
                  onClick={() => { setResult(null); setFile(null) }}
                  className="px-lg py-md border border-outline-variant/30 text-on-surface-variant rounded-lg hover:bg-white/5 transition-all"
                >
                  Upload Another
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Upload Section */
          <section className="flex flex-col items-center justify-center min-h-[512px]">
            <div className="glass-panel w-full max-w-2xl p-xl rounded-xl ai-glow transition-all duration-500 hover:border-primary/30">
              {/* Drop Zone */}
              {!file ? (
                <label
                  htmlFor="resume-pdf"
                  onDrop={handleDrop}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  className={`border-2 border-dashed rounded-lg p-xl flex flex-col items-center justify-center gap-md cursor-pointer transition-colors group ${
                    dragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-outline-variant/30 hover:border-primary/50'
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-4xl">upload_file</span>
                  </div>
                  <div className="text-center">
                    <h3 className="font-display text-2xl font-bold text-on-background mb-xs">Upload Your Resume</h3>
                    <p className="text-on-surface-variant">Drag and drop or click to browse files from your device</p>
                  </div>
                  <p className="text-xs font-mono text-outline">Supported formats: PDF, DOCX (Max 10MB)</p>
                  <input id="resume-pdf" type="file" accept=".pdf,application/pdf" onChange={(e) => handleFile(e.target.files[0])} className="hidden" />
                </label>
              ) : (
                <div className="border border-primary/30 rounded-lg p-lg flex items-center justify-between bg-primary/5">
                  <div className="flex items-center gap-md min-w-0">
                    <span className="material-symbols-outlined text-primary">description</span>
                    <div className="min-w-0">
                      <p className="text-sm text-on-surface truncate font-medium">{file.name}</p>
                      <p className="text-xs font-mono text-outline">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button onClick={removeFile} className="text-outline hover:text-error transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              )}

              {/* Import from */}
              <div className="flex items-center my-lg gap-md text-outline">
                <hr className="flex-1 border-outline-variant/20" />
                <span className="text-xs font-mono uppercase tracking-widest">OR IMPORT FROM</span>
                <hr className="flex-1 border-outline-variant/20" />
              </div>

              <div className="grid grid-cols-3 gap-md mb-lg">
                {[
                  { label: 'LinkedIn', icon: 'work' },
                  { label: 'GitHub', icon: 'code' },
                  { label: 'Google Drive', icon: 'add_to_drive' },
                ].map(src => (
                  <button key={src.label} className="flex items-center justify-center gap-sm py-md glass-panel rounded-lg hover:bg-white/5 transition-all">
                    <span className="material-symbols-outlined text-primary text-base">{src.icon}</span>
                    <span className="text-sm">{src.label}</span>
                  </button>
                ))}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-sm p-sm rounded-lg bg-error-container/30 border border-error/30 mb-lg">
                  <span className="material-symbols-outlined text-error text-base">warning</span>
                  <span className="text-sm text-error">{error}</span>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="w-full py-xl bg-primary text-on-primary font-bold rounded-xl text-xl ai-glow hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-md disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-on-primary/20 border-t-on-primary animate-spin" />
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    Generate Personalized Interview
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
              <p className="text-center mt-md text-xs font-mono text-outline">
                Your resume data is used only for generating personalized interview questions.
              </p>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="w-full py-xl mt-auto flex flex-col md:flex-row justify-between items-center gap-md border-t border-white/5 mt-20">
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
      </main>
    </div>
  )
}
