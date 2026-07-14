import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { API_BASE, authService } from '../services'
import { HiHome, HiCheck, HiChevronRight, HiX } from 'react-icons/hi'
import { BsFileTextFill, BsChatDotsFill, BsBarChartFill, BsPlusCircleFill, BsCloudUploadFill, BsShieldFillCheck, BsExclamationTriangleFill, BsLightningFill } from 'react-icons/bs'
import { TbBrain } from 'react-icons/tb'
import { MdMessage } from 'react-icons/md'
import { useTheme } from '../context/ThemeContext'

const EASE = [0.16, 1, 0.3, 1]
const cardAnim = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }
const staggerCont = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }

/* ── Sidebar ──────────────────────────────────────────────────────────── */
function Sidebar({ active = 'upload' }) {
  const navigate = useNavigate()
  const user = authService.getUser()
  const navItems = [
    { id: 'dashboard', label: 'Home',      Icon: HiHome,          to: '/dashboard' },
    { id: 'upload',    label: 'Resume',    Icon: BsFileTextFill,  to: '/upload' },
    { id: 'interview', label: 'Interview', Icon: MdMessage,        to: '/interview' },
    { id: 'analytics', label: 'Analytics', Icon: BsBarChartFill,  to: '#' },
  ]
  return (
    <aside style={{ display: 'none', flexDirection: 'column', height: '100vh', width: 240, background: 'var(--sidebar-bg)', borderRight: '1.5px solid var(--border-soft)', padding: '24px 0', position: 'fixed', left: 0, top: 0, zIndex: 40, transition: 'background 0.3s, border-color 0.3s' }} className="hidden-mobile sidebar-desk">
      <style>{`.sidebar-desk { display: flex; } @media (max-width: 768px) { .sidebar-desk { display: none; } }`}</style>
      {/* Logo */}
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #e8e5de' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, background: '#1a1a1a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#ff7557', fontSize: 15, fontWeight: 900, fontFamily: 'Space Grotesk' }}>IQ</span>
          </div>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 17, color: '#1a1a1a', letterSpacing: '-0.03em' }}>InterviewIQ</span>
        </Link>
      </div>
      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(item => (
          <Link key={item.id} to={item.to} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12,
            textDecoration: 'none', fontSize: 14, fontWeight: 600,
            background: active === item.id ? '#1a1a1a' : 'transparent',
            color: active === item.id ? '#ff7557' : '#555',
            transition: 'background 0.2s, color 0.2s',
          }}>
            <item.Icon size={16} />
            {item.label}
          </Link>
        ))}
      </nav>
      {/* Bottom */}
      <div style={{ padding: '12px', borderTop: '1px solid #e8e5de' }}>
        <Link to="/upload" style={{ display: 'block', textAlign: 'center', padding: '11px', background: '#ff7557', color: '#1a0a04', borderRadius: 99, fontWeight: 800, fontSize: 13, textDecoration: 'none', marginBottom: 12, letterSpacing: '-0.01em' }}>
          + New Interview
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#ff7557', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#1a0a04', flexShrink: 0 }}>
            {(user?.name || 'U')[0].toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{user?.email || ''}</div>
          </div>
        </div>
        <button onClick={() => { authService.logout(); navigate('/login') }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 12, width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#888', fontWeight: 600 }}>
          🚪 Sign Out
        </button>
      </div>
    </aside>
  )
}

/* ── Main ─────────────────────────────────────────────────────────────── */
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
  useEffect(() => { if (!user) navigate('/login') }, [user, navigate])
  if (!user) return null

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
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => { if (prev >= 90) { clearInterval(progressInterval); return prev }; return prev + Math.random() * 15 })
    }, 200)
    try {
      const token = localStorage.getItem('intervue_token')
      const formData = new FormData()
      formData.append('resume', file)
      formData.append('userId', user._id)
      formData.append('model', selectedModel)
      const res = await fetch(`${API_BASE}/resume/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData })
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

  return (
    <div className="theme-page" style={{ minHeight: '100vh', fontFamily: "'Inter', 'DM Sans', sans-serif", display: 'flex' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .coral-btn-ru { background: var(--accent); color: #1a0a04; border: none; cursor: pointer; font-weight: 800; border-radius: 99px; transition: background 0.2s, transform 0.15s; }
        .coral-btn-ru:hover { background: var(--accent-hover); }
        .coral-btn-ru:active { transform: scale(0.97); }
        .coral-btn-ru:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <Sidebar active="upload" />

      <motion.main
        variants={staggerCont}
        initial="hidden"
        animate="visible"
        style={{ flex: 1, marginLeft: 0, padding: '32px 24px 80px', maxWidth: 1200, width: '100%' }}
        className="main-content-offset"
      >
        <style>{`@media (min-width: 769px) { .main-content-offset { margin-left: 240px; } }`}</style>

        {/* Header */}
        <motion.div variants={cardAnim} style={{ marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff6f4', border: '1.5px solid #ff7557', borderRadius: 99, padding: '5px 14px', marginBottom: 16 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff7557', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#ff7557', letterSpacing: '0.04em', fontFamily: 'Space Grotesk' }}>Step 1 of 2 — Resume Intelligence</span>
          </div>
          <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.04em', marginBottom: 8, lineHeight: 1.1 }}>
            Resume Intelligence
          </h1>
          <p style={{ fontSize: 16, color: '#666', lineHeight: 1.6 }}>
            Upload your profile to tailor the AI interviewer specifically to your background.
          </p>
        </motion.div>

        {/* AI Model Selector */}
        <motion.div variants={cardAnim} style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Choose AI Engine</p>
          <div style={{ display: 'inline-flex', borderRadius: 16, border: '1.5px solid #1a1a1a', background: '#fff', padding: 4, position: 'relative' }}>
            <motion.div
              animate={{ x: selectedModel === 'gemini' ? 0 : '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              style={{ position: 'absolute', top: 4, left: 4, width: 'calc(50% - 8px)', height: 'calc(100% - 8px)', background: '#1a1a1a', borderRadius: 12 }}
            />
            {[{ id: 'gemini', label: '✦ Gemini' }, { id: 'gpt', label: '⊕ ChatGPT' }].map(m => (
              <button key={m.id} onClick={() => handleModelChange(m.id)}
                style={{ position: 'relative', zIndex: 1, padding: '9px 22px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, background: 'transparent', color: selectedModel === m.id ? '#ff7557' : '#555', transition: 'color 0.25s', minWidth: 110, fontFamily: 'Space Grotesk' }}>
                {m.label}
              </button>
            ))}
          </div>
          <p style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
            {selectedModel === 'gemini' ? 'Google Gemini 1.5 Flash — fast, free-tier friendly' : 'OpenAI GPT-4o-mini — state-of-the-art reasoning'}
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 24 }} className="upload-grid">
          <style>{`@media (max-width: 900px) { .upload-grid { grid-template-columns: 1fr !important; } }`}</style>

          {/* Main upload area */}
          <div>
            <AnimatePresence mode="wait">
              {result ? (
                /* SUCCESS STATE */
                <motion.div key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ background: '#fff', border: '1.5px solid #1a1a1a', borderRadius: 24, padding: 32, boxShadow: '0 8px 40px rgba(26,26,26,0.08)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                    <motion.div
                      initial={{ scale: 0.5, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                      style={{ width: 52, height: 52, borderRadius: 16, background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <HiCheck size={24} color="#fff" />
                    </motion.div>
                    <div>
                      <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.03em' }}>Upload Successful!</h3>
                      <p style={{ fontSize: 13, color: '#666' }}>{result.message}</p>
                    </div>
                  </div>

                  {result.extractedText && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Extracted Content Preview</span>
                        <span style={{ fontSize: 11, color: '#ff7557', fontFamily: 'monospace' }}>{result.extractedText.length} chars</span>
                      </div>
                      <div style={{ maxHeight: 180, overflowY: 'auto', padding: '12px 16px', background: '#f7f5f0', border: '1px solid #e8e5de', borderRadius: 14, fontSize: 12, color: '#444', fontFamily: 'monospace', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                        {result.extractedText.length > 2000 ? result.extractedText.substring(0, 2000) + '\n\n... (truncated)' : result.extractedText}
                      </div>
                    </div>
                  )}

                  {result.skills && result.skills.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Detected Skills</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {result.skills.map((skill, si) => (
                          <motion.span key={skill}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: si * 0.04 }}
                            style={{ padding: '4px 12px', background: '#fff6f4', border: '1px solid #ffd4c8', color: '#ff7557', fontSize: 12, fontWeight: 700, borderRadius: 99, fontFamily: 'monospace' }}
                          >
                            {skill}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 12 }}>
                    <motion.button
                      onClick={() => navigate('/interview')}
                      whileHover={{ scale: 1.02, boxShadow: '0 6px 24px rgba(255,117,87,0.28)' }}
                      whileTap={{ scale: 0.97 }}
                      className="coral-btn-ru"
                      style={{ flex: 1, padding: '13px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, letterSpacing: '-0.01em' }}
                    >
                      <HiChevronRight size={16} /> Start Interview Now
                    </motion.button>
                    <button onClick={() => { setResult(null); setFile(null); setUploadProgress(0) }}
                      style={{ padding: '13px 20px', border: '1.5px solid #1a1a1a', borderRadius: 99, background: '#fff', color: '#1a1a1a', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      Upload Another
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* UPLOAD STATE */
                <motion.div key="upload"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ background: '#fff', border: '1.5px solid #1a1a1a', borderRadius: 24, padding: 32, boxShadow: '0 8px 40px rgba(26,26,26,0.08)' }}
                >
                  {/* Drop zone */}
                  {!file ? (
                    <label htmlFor="resume-pdf"
                      onDrop={handleDrop} onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: 16, padding: '48px 24px', border: `2px dashed ${dragActive ? '#ff7557' : '#d5d0c8'}`,
                        borderRadius: 20, cursor: 'pointer', background: dragActive ? '#fff6f4' : '#f7f5f0',
                        transition: 'border-color 0.2s, background 0.2s', minHeight: 260,
                      }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = '#ff7557'; e.currentTarget.style.background = '#fff6f4'; }}
                      onMouseOut={e => { if (!dragActive) { e.currentTarget.style.borderColor = '#d5d0c8'; e.currentTarget.style.background = '#f7f5f0'; } }}
                    >
                      <motion.div
                        animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ width: 72, height: 72, borderRadius: '50%', background: '#fff', border: '1.5px solid #e8e5de', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <BsCloudUploadFill size={32} color={dragActive ? '#ff7557' : '#aaa'} />
                      </motion.div>
                      <div style={{ textAlign: 'center' }}>
                        <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.03em', marginBottom: 6 }}>
                          {dragActive ? 'Drop it here!' : 'Upload Your Resume'}
                        </h3>
                        <p style={{ fontSize: 13, color: '#888' }}>Drag & drop your PDF or click to browse</p>
                      </div>
                      <span style={{ fontSize: 11, color: '#bbb', fontFamily: 'monospace' }}>PDF only · Max 5MB · Encrypted & secure</span>
                      <input id="resume-pdf" type="file" accept=".pdf,application/pdf" onChange={(e) => handleFile(e.target.files[0])} style={{ display: 'none' }} />
                    </label>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 20px', borderRadius: 16, background: '#fff6f4', border: '1.5px solid #ff7557', marginBottom: 16 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ff7557', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><BsFileTextFill size={20} color="#1a0a04" /></div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                          <div style={{ fontSize: 11, color: '#888', fontFamily: 'monospace' }}>{(file.size / 1024).toFixed(1)} KB · PDF</div>
                        </div>
                      </div>
                      <button onClick={removeFile} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#888', flexShrink: 0, padding: 4 }}><HiX size={16} /></button>
                    </motion.div>
                  )}

                  {/* Or import from */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                    <div style={{ flex: 1, height: 1, background: '#e8e5de' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>OR IMPORT FROM</span>
                    <div style={{ flex: 1, height: 1, background: '#e8e5de' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
                    {[{ label: 'LinkedIn', Icon: BsLightningFill }, { label: 'GitHub', Icon: TbBrain }, { label: 'Drive', Icon: BsShieldFillCheck }].map(src => (
                      <motion.button key={src.label}
                        whileHover={{ scale: 1.03, borderColor: '#1a1a1a' }} whileTap={{ scale: 0.97 }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', border: '1.5px solid #d5d0c8', borderRadius: 14, background: '#f7f5f0', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#555', transition: 'border-color 0.2s' }}
                      >
                        <src.Icon size={16} color="#888" />
                        {src.label}
                      </motion.button>
                    ))}
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div key="err"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ background: '#fff0ed', border: '1.5px solid #ff7557', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#c0392b', marginBottom: 16, overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <BsExclamationTriangleFill size={13} style={{ flexShrink: 0 }} /> {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Progress bar */}
                  {loading && uploadProgress > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginBottom: 6 }}>
                        <span>Analyzing resume...</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{Math.round(uploadProgress)}%</span>
                      </div>
                      <div style={{ height: 6, width: '100%', background: '#e8e5de', borderRadius: 99, overflow: 'hidden' }}>
                        <motion.div
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.3 }}
                          style={{ height: '100%', background: 'linear-gradient(90deg, #ff7557, #c84b9e)', borderRadius: 99 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Upload button */}
                  <motion.button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    whileHover={file && !loading ? { scale: 1.01, boxShadow: '0 8px 30px rgba(255,117,87,0.3)' } : {}}
                    whileTap={file && !loading ? { scale: 0.97 } : {}}
                    className="coral-btn-ru"
                    style={{ width: '100%', padding: '14px', fontSize: 16, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                  >
                    {loading ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          style={{ width: 18, height: 18, border: '2px solid rgba(26,10,4,0.2)', borderTopColor: '#1a0a04', borderRadius: '50%' }} />
                        Analyzing Resume...
                      </>
                    ) : <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BsLightningFill size={16} /> Generate Personalized Interview <HiChevronRight size={15} /></span>}
                  </motion.button>
                  <p style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: '#aaa', fontFamily: 'monospace' }}>
                    Your resume data is used only for generating personalized interview questions.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right panel */}
          <motion.div variants={staggerCont} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* How it works */}
            <motion.div variants={cardAnim} style={{ background: '#fff', border: '1.5px solid #1a1a1a', borderRadius: 20, padding: 24 }}>
              <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 15, fontWeight: 800, color: '#1a1a1a', marginBottom: 18, letterSpacing: '-0.02em' }}>How It Works</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { step: '01', title: 'Upload Resume', desc: 'Drop your PDF resume and let our AI parse it', Icon: BsCloudUploadFill, color: '#fff6f4', border: '#ffd4c8', iconColor: '#ff7557' },
                  { step: '02', title: 'AI Analysis', desc: 'We extract skills, experience and key projects', Icon: TbBrain, color: '#f0f9f4', border: '#bbf7d0', iconColor: '#22c55e' },
                  { step: '03', title: 'Start Session', desc: 'Begin your personalized mock interview instantly', Icon: HiChevronRight, color: '#fefce8', border: '#fde68a', iconColor: '#d97706' },
                ].map((item, i) => (
                  <div key={item.step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: item.color, border: `1px solid ${item.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><item.Icon size={16} color={item.iconColor} /></div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: '#ccc', fontFamily: 'monospace' }}>{item.step}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{item.title}</span>
                      </div>
                      <p style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Why InterviewIQ */}
            <motion.div variants={cardAnim} style={{ background: '#1a1a1a', border: '1.5px solid #1a1a1a', borderRadius: 20, padding: 24 }}>
              <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 15, fontWeight: 800, color: '#f7f5f0', marginBottom: 16, letterSpacing: '-0.02em' }}>Why InterviewIQ</h3>
              {[
                { icon: '🧠', title: 'Smart Parsing', desc: 'AI extracts your skills, projects & experience', color: '#ff7557' },
                { icon: '❓', title: 'Tailored Questions', desc: 'Every question based on your actual background', color: '#4285f4' },
                { icon: '🛡', title: 'Secure & Private', desc: 'Data encrypted and never shared with third parties', color: '#22c55e' },
              ].map(f => (
                <div key={f.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 16, marginTop: 2 }}>{f.icon}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#f7f5f0', marginBottom: 2 }}>{f.title}</p>
                    <p style={{ fontSize: 11, color: 'rgba(247,245,240,0.5)' }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Supported formats */}
            <motion.div variants={cardAnim} style={{ background: '#fff', border: '1.5px solid #1a1a1a', borderRadius: 20, padding: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Supported Formats</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['PDF', 'DOCX', 'LinkedIn'].map(fmt => (
                  <span key={fmt} style={{ padding: '4px 12px', background: '#f7f5f0', border: '1px solid #e8e5de', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#555', fontFamily: 'monospace' }}>{fmt}</span>
                ))}
              </div>
              <p style={{ fontSize: 11, color: '#aaa', fontFamily: 'monospace', marginTop: 8 }}>Max file size: 5MB</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.main>

      {/* Mobile Bottom Nav */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 64, background: 'rgba(247,245,240,0.96)', backdropFilter: 'blur(18px)', borderTop: '1.5px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 16px', zIndex: 50 }} className="mobile-nav">
        <style>{`@media (min-width: 769px) { .mobile-nav { display: none !important; } }`}</style>
        {[
          { icon: '🏠', label: 'Home', to: '/dashboard' },
          { icon: '📄', label: 'Resume', to: '/upload', active: true },
          { icon: '💬', label: 'Interview', to: '/interview' },
          { icon: '📊', label: 'Stats', to: '#' },
        ].map(item => (
          <Link key={item.label} to={item.to} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', color: item.active ? '#ff7557' : '#888' }}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'monospace' }}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
