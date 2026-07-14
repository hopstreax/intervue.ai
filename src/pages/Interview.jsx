import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { authService, interviewService } from '../services'
import { useTheme } from '../context/ThemeContext'
import { HiMenu, HiX, HiCheck, HiLockClosed, HiChevronRight, HiArrowRight } from 'react-icons/hi'
import { BsStopCircleFill, BsExclamationTriangleFill, BsSendFill, BsCpuFill, BsBarChartFill } from 'react-icons/bs'
import { TbBrain } from 'react-icons/tb'
import { MdTimer, MdSmartToy } from 'react-icons/md'
import { FaCircleUser, FaCrown, FaRocket } from 'react-icons/fa6'

const EASE = [0.16, 1, 0.3, 1]

export default function Interview() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [session, setSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputVal, setInputVal] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [ending, setEnding] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [modelType, setModelType] = useState(() => localStorage.getItem('intervue_model') || 'gemini')
  const [paymentStep, setPaymentStep] = useState('plan')
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242')
  const [cardExpiry, setCardExpiry] = useState('12/28')
  const [cardCvc, setCardCvc] = useState('424')
  const [processingPayment, setProcessingPayment] = useState(false)
  const [metrics, setMetrics] = useState({ clarity: 0, accuracy: 0, questionsAnswered: 0 })
  const [error, setError] = useState('')
  const [questionNum, setQuestionNum] = useState(1)
  const [elapsed, setElapsed] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const chatContainerRef = useRef(null)
  const isStartingRef = useRef(false)
  const timerRef = useRef(null)
  const textareaRef = useRef(null)
  const user = authService.getUser()

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (!session && !isStartingRef.current) startNewInterview()
  }, [user?._id, navigate, session])

  const startNewInterview = async () => {
    if (isStartingRef.current) return
    isStartingRef.current = true
    setLoading(true); setError('')
    try {
      const selectedModel = localStorage.getItem('intervue_model') || 'gemini'
      setModelType(selectedModel)
      const res = await interviewService.start(selectedModel)
      setSession(res.data.interviewId)
      setMessages(res.data.history || [])
    } catch (err) {
      setError(err.message || 'Failed to start interview')
    } finally {
      setLoading(false); isStartingRef.current = false
    }
  }

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, sending])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputVal.trim() || sending || !session) return
    const userMessage = inputVal.trim()
    setInputVal('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setSending(true); setError('')
    try {
      const res = await interviewService.chat({ interviewId: session, message: userMessage })
      if (res.data && res.data.reply) {
        setMessages(res.data.history || [])
        if (res.data.metrics) setMetrics(res.data.metrics)
        setQuestionNum(prev => prev + 1)
      }
    } catch (err) {
      if (err.message && err.message.includes('limit reached') || err.message.includes('upgrade')) {
        setShowUpgradeModal(true)
      } else {
        setError(err.message || 'Connection lost. Please try re-sending.')
      }
      setMessages(prev => prev.filter((_, idx) => idx !== prev.length - 1))
      setInputVal(userMessage)
    } finally {
      setSending(false)
    }
  }

  const handleEndInterview = async () => {
    if (ending || !session) return
    setEnding(true); setError('')
    try {
      await interviewService.end(session)
      navigate('/summary')
    } catch (err) {
      setError(err.message || 'Failed to analyze and save interview.')
      setEnding(false)
    }
  }

  const handleUpgradePayment = async (e) => {
    e.preventDefault()
    setProcessingPayment(true); setError('')
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await authService.upgrade()
      setPaymentStep('success')
    } catch (err) {
      setError(err.message || 'Payment simulation failed')
    } finally {
      setProcessingPayment(false)
    }
  }

  const handleCloseUpgradeModal = () => {
    setShowUpgradeModal(false)
    setPaymentStep('plan')
  }

  return (
    <div className="theme-page" style={{ height: '100vh', display: 'flex', overflow: 'hidden', fontFamily: "'Inter', 'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .int-input { width: 100%; background: transparent; border: none; outline: none; resize: none; max-height: 140px; padding: 12px 14px; font-size: 14px; font-family: Inter, sans-serif; color: var(--text); line-height: 1.6; }
        .int-input::placeholder { color: var(--text-faint); }
        .int-sidebar { display: none; flex-direction: column; height: 100vh; width: 240px; background: var(--sidebar-bg); border-right: 1.5px solid var(--border-soft); padding: 0; position: fixed; left: 0; top: 0; z-index: 40; transition: background 0.3s, border-color 0.3s; }
        @media (min-width: 769px) { .int-sidebar { display: flex; } .int-main { margin-left: 240px; } }
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: var(--border-soft); border-radius: 99px; }
      `}</style>

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {(sidebarOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.5)', zIndex: 30 }}
            className="md-hidden"
          />
        )}
      </AnimatePresence>

      <div className="int-sidebar" style={{ flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, background: 'var(--text)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#ff7557', fontSize: 14, fontWeight: 900, fontFamily: 'Space Grotesk' }}>IQ</span>
            </div>
            <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'var(--text)', letterSpacing: '-0.03em' }}>InterviewIQ</span>
          </Link>
        </div>

        {/* Session stats */}
        <div style={{ padding: '16px 16px', borderBottom: '1px solid var(--border-soft)' }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Session Stats</p>
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-soft)', borderRadius: 14, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Clarity Rating', val: metrics.clarity, color: '#ff7557' },
              { label: 'Technical Depth', val: metrics.accuracy, color: '#4285f4' },
            ].map(m => (
              <div key={m.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>
                  <span style={{ fontWeight: 600 }}>{m.label}</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{m.val}%</span>
                </div>
                <div style={{ height: 5, background: 'var(--border-soft)', borderRadius: 99, overflow: 'hidden' }}>
                  <motion.div animate={{ width: `${m.val}%` }} transition={{ duration: 0.6, ease: EASE }}
                    style={{ height: '100%', background: m.color, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Q Answered</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#ff7557', fontFamily: 'Space Grotesk' }}>{metrics.questionsAnswered}</span>
          </div>
        </div>

        <div style={{ padding: '14px 16px', borderBottom: '1px solid #e8e5de' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff6f4', border: '1.5px solid #ff7557', borderRadius: 99, padding: '5px 12px' }}>
            {modelType === 'gpt' ? <BsCpuFill size={13} color="#ff7557" /> : <TbBrain size={13} color="#ff7557" />}
            <span style={{ fontSize: 12, fontWeight: 700, color: '#ff7557', fontFamily: 'Space Grotesk' }}>{modelType === 'gpt' ? 'GPT-4o' : 'Gemini'}</span>
          </div>
        </div>

        {/* End interview button */}
        <div style={{ padding: '14px 16px', marginTop: 'auto', borderTop: '1px solid #e8e5de' }}>
          <motion.button
            onClick={handleEndInterview}
            disabled={ending}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{ width: '100%', padding: '12px', background: '#1a1a1a', color: '#ff7557', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Space Grotesk' }}
          >
            {ending ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  style={{ width: 14, height: 14, border: '2px solid rgba(255,117,87,0.3)', borderTopColor: '#ff7557', borderRadius: '50%' }} />
                Saving...
              </>
            ) : <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BsStopCircleFill size={14} /> End & Grade Interview</span>}
          </motion.button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 4px', marginTop: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#ff7557', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#1a0a04', flexShrink: 0 }}>
              {(user?.name || 'U')[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</div>
              <div style={{ fontSize: 10, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{user?.email || ''}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CHAT AREA ──────────────────────────────────────────────── */}
      <main className="int-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#f7f5f0' }}>

        {/* Top bar */}
        <header style={{ height: 64, borderBottom: '1.5px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'rgba(247,245,240,0.95)', backdropFilter: 'blur(16px)', flexShrink: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Mobile menu */}
            <button onClick={() => setSidebarOpen(true)} className="mobile-menu-btn"
              style={{ background: 'none', border: '1.5px solid #1a1a1a', borderRadius: 8, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a1a1a' }}>
              <HiMenu size={18} />
            </button>
            <style>{`@media (min-width: 769px) { .mobile-menu-btn { display: none !important; } }`}</style>

            {/* Model badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff6f4', border: '1px solid #ffd4c8', borderRadius: 99, padding: '4px 12px' }}>
              {modelType === 'gpt' ? <BsCpuFill size={12} color="#ff7557" /> : <TbBrain size={12} color="#ff7557" />}
              <span style={{ fontSize: 12, fontWeight: 700, color: '#ff7557', fontFamily: 'Space Grotesk' }}>{modelType === 'gpt' ? 'GPT-4o' : 'Gemini'}</span>
            </div>

            {/* Progress */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Progress</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>Question {questionNum}</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#ff7557', background: '#fff6f4', padding: '1px 8px', borderRadius: 99, fontFamily: 'monospace' }}>+{metrics.questionsAnswered}</span>
              </div>
            </div>
          </div>

          {/* Timer + End */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: '#fff', border: '1px solid #e8e5de', borderRadius: 10, fontFamily: 'monospace', fontWeight: 700, color: '#555' }}>
              <MdTimer size={13} /> <span style={{ fontSize: 13 }}>{formatTime(elapsed)}</span>
            </div>
            <motion.button
              onClick={handleEndInterview}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: '#1a1a1a', color: '#ff7557', border: 'none', borderRadius: 99, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk' }}
            >
              <BsStopCircleFill size={13} /> End
            </motion.button>
          </div>
        </header>

        {/* Chat messages */}
        <div ref={chatContainerRef} className="chat-scroll" style={{ flex: 1, overflowY: 'auto', padding: '28px 24px 200px' }}>
          <div style={{ maxWidth: 740, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 240, gap: 16 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #e8e5de', borderTopColor: '#ff7557' }} />
                <p style={{ fontSize: 13, color: '#888', fontFamily: 'monospace' }}>Initializing AI Interviewer...</p>
              </div>
            ) : !session && error ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 240, gap: 16 }}>
                <BsExclamationTriangleFill size={40} color="#ff7557" />
                <p style={{ fontSize: 14, color: '#666' }}>{error}</p>
                <button onClick={startNewInterview}
                  style={{ padding: '10px 24px', background: '#ff7557', color: '#1a0a04', border: 'none', borderRadius: 99, fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <HiArrowRight size={14} /> Retry
                </button>
              </div>
            ) : messages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 240, gap: 16 }}>
                <div style={{ width: 60, height: 60, borderRadius: 18, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MdSmartToy size={26} color="#ff7557" /></div>
                <p style={{ fontSize: 13, color: '#888', fontFamily: 'monospace' }}>Waiting for interview to begin...</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 12, flexShrink: 0,
                      background: msg.role === 'user' ? '#e8e5de' : '#1a1a1a',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: msg.role !== 'user' ? '1px solid #1a1a1a' : '1px solid #d5d0c8'
                    }}>
                      {msg.role === 'user' ? <FaCircleUser size={18} color="#555" /> : <MdSmartToy size={18} color="#ff7557" />}
                    </div>
                    {/* Bubble */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 10, fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                        {msg.role === 'user' ? (user?.name || 'You') : 'InterviewIQ AI'}
                      </p>
                      {msg.role === 'assistant' && msg.feedback && (
                        <div style={{ marginBottom: 8, padding: '8px 12px', background: '#f0f9f4', border: '1px solid #bbf7d0', borderRadius: 10, fontSize: 12, color: '#15803d', fontStyle: 'italic' }}>
                          "{msg.feedback}"
                        </div>
                      )}
                      <div style={{
                        padding: '14px 18px', borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                        background: msg.role === 'user' ? '#1a1a1a' : '#fff',
                        border: '1.5px solid #1a1a1a',
                        color: msg.role === 'user' ? 'rgba(247,245,240,0.9)' : '#1a1a1a',
                        fontSize: 15, lineHeight: 1.7, fontWeight: 450,
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {/* Sending indicator */}
            {sending && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', background: '#fff', border: '1.5px solid #1a1a1a', borderRadius: 14, width: 'fit-content' }}
              >
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0, 150, 300].map(delay => (
                    <motion.div key={delay}
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.8, delay: delay / 1000, repeat: Infinity }}
                      style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff7557' }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 12, color: '#888', fontFamily: 'monospace' }}>Analyzing sentiment & technical depth...</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Chat input */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '16px 24px 20px', background: 'linear-gradient(to top, #f7f5f0 70%, transparent)' }} className="int-input-bar">
          <style>{`@media (min-width: 769px) { .int-input-bar { left: 240px; width: calc(100% - 240px); } }`}</style>
          <div style={{ maxWidth: 740, margin: '0 auto' }}>
            {error && (
              <div style={{ marginBottom: 10, padding: '8px 12px', background: '#fff0ed', border: '1px solid #ff7557', borderRadius: 10, fontSize: 12, color: '#c0392b', display: 'flex', alignItems: 'center', gap: 8 }}>
                <BsExclamationTriangleFill size={13} style={{ flexShrink: 0 }} /> {error}
              </div>
            )}
            <form onSubmit={handleSend}
              style={{ display: 'flex', alignItems: 'flex-end', gap: 10, background: '#fff', border: '1.5px solid #1a1a1a', borderRadius: 18, padding: '4px 4px 4px 4px', boxShadow: '0 4px 20px rgba(26,26,26,0.08)' }}
            >
              <textarea
                ref={textareaRef}
                value={inputVal}
                onChange={e => {
                  setInputVal(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = `${e.target.scrollHeight}px`
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) }
                }}
                placeholder="Type your response here... (Enter to send, Shift+Enter for new line)"
                rows={1}
                className="int-input"
                style={{ flex: 1 }}
              />
              <motion.button
                type="submit"
                disabled={!inputVal.trim() || sending}
                whileHover={inputVal.trim() ? { scale: 1.05 } : {}}
                whileTap={inputVal.trim() ? { scale: 0.95 } : {}}
                style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: inputVal.trim() ? '#ff7557' : '#e8e5de',
                  border: 'none', cursor: inputVal.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                  transition: 'background 0.2s', margin: 4,
                  color: inputVal.trim() ? '#1a0a04' : '#aaa'
                }}
              >
                <BsSendFill size={16} />
              </motion.button>
            </form>
            <p style={{ textAlign: 'center', marginTop: 8, fontSize: 10, color: '#aaa', fontFamily: 'monospace' }}>
              Keep it professional. The AI evaluates confidence, accuracy, and structure.
            </p>
          </div>
        </div>
      </main>

      {/* ── UPGRADE/PAYMENT MODAL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(26,26,26,0.7)', backdropFilter: 'blur(10px)' }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{ width: '100%', maxWidth: 500, background: '#fff', border: '1.5px solid #1a1a1a', borderRadius: 24, padding: 36, boxShadow: '0 24px 80px rgba(26,26,26,0.25)', display: 'flex', flexDirection: 'column', gap: 24 }}
            >
              {/* Close */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleCloseUpgradeModal}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, color: '#888' }}><HiX size={18} /></button>
              </div>

              {/* PLAN STEP */}
              {paymentStep === 'plan' && (
                <>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, background: '#ff7557', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><FaCrown size={22} color="#1a0a04" /></div>
                    <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.04em', marginBottom: 8 }}>Choose Your AI Power</h2>
                    <p style={{ fontSize: 13, color: '#666', maxWidth: 300, margin: '0 auto' }}>Upgrade to Premium to continue. Swap models mid-interview and get infinite questions.</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[
                      { id: 'gemini', label: 'Google Gemini', sub: '1.5 Pro · Deep Analytical Insights', Icon: TbBrain, accent: '#4285f4' },
                      { id: 'gpt', label: 'ChatGPT', sub: 'GPT-4o · Precise Coding Synthesis', Icon: BsCpuFill, accent: '#10a37f' },
                    ].map(m => (
                      <motion.button key={m.id} onClick={() => setModelType(m.id)}
                        whileHover={{ borderColor: m.accent }}
                        style={{
                          padding: '16px', borderRadius: 14, border: `1.5px solid ${modelType === m.id ? m.accent : '#e8e5de'}`,
                          background: modelType === m.id ? `${m.accent}10` : '#f7f5f0', cursor: 'pointer', textAlign: 'left',
                          transition: 'border-color 0.2s, background 0.2s',
                          boxShadow: modelType === m.id ? `0 0 15px ${m.accent}25` : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 14, color: '#1a1a1a', marginBottom: 4 }}>
                          <m.Icon size={15} color={m.accent} />
                          {m.label}
                        </div>
                        <p style={{ fontSize: 11, color: '#888' }}>{m.sub}</p>
                      </motion.button>
                    ))}
                  </div>

                  <div style={{ padding: '14px 16px', background: '#f7f5f0', border: '1px solid #e8e5de', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {['Unlimited technical Q&A sessions', 'Personalized shortcoming lists & roadmaps', 'PDF reports & future Voice Mode access'].map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#333' }}>
                        <HiCheck size={13} color="#22c55e" />
                        {f}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid #e8e5de' }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Monthly plan</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span style={{ fontFamily: 'Space Grotesk', fontSize: 32, fontWeight: 900, color: '#1a1a1a' }}>$15</span>
                        <span style={{ fontSize: 14, color: '#888' }}>/mo</span>
                      </div>
                    </div>
                    <motion.button onClick={() => setPaymentStep('checkout')}
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                      className="coral-btn-int"
                      style={{ padding: '12px 24px', fontSize: 14, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 8 }}>
                      Choose Plan <HiChevronRight size={15} />
                    </motion.button>
                  </div>
                </>
              )}

              {/* CHECKOUT STEP */}
              {paymentStep === 'checkout' && (
                <form onSubmit={handleUpgradePayment} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.04em', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><HiLockClosed size={18} /> Secure Sandbox Checkout</h2>
                    <p style={{ fontSize: 13, color: '#666' }}>Complete the payment using this free checkout simulation.</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                      { label: 'Cardholder Name', value: cardName, setter: setCardName, type: 'text', placeholder: 'John Doe' },
                    ].map(field => (
                      <div key={field.label} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{field.label}</label>
                        <input type={field.type} required placeholder={field.placeholder} value={field.value}
                          onChange={e => field.setter(e.target.value)}
                          style={{ padding: '11px 14px', border: '1.5px solid #d5d0c8', borderRadius: 12, fontSize: 14, color: '#1a1a1a', background: '#fff', outline: 'none', fontFamily: 'Inter, sans-serif' }} />
                      </div>
                    ))}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Card Number</label>
                      <input type="text" required value={cardNumber} onChange={e => setCardNumber(e.target.value)}
                        style={{ padding: '11px 14px', border: '1.5px solid #d5d0c8', borderRadius: 12, fontSize: 14, color: '#1a1a1a', background: '#fff', outline: 'none', fontFamily: 'monospace' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {[
                        { label: 'Expiry', value: cardExpiry, setter: setCardExpiry },
                        { label: 'CVC', value: cardCvc, setter: setCardCvc },
                      ].map(f => (
                        <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          <label style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
                          <input type="text" required value={f.value} onChange={e => f.setter(e.target.value)}
                            style={{ padding: '11px 14px', border: '1.5px solid #d5d0c8', borderRadius: 12, fontSize: 14, color: '#1a1a1a', background: '#fff', outline: 'none', fontFamily: 'monospace', textAlign: 'center' }} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div style={{ background: '#fff0ed', border: '1px solid #ff7557', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#c0392b', display: 'flex', alignItems: 'center', gap: 6 }}><BsExclamationTriangleFill size={13} style={{ flexShrink: 0 }} /> {error}</div>
                  )}

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="button" onClick={() => setPaymentStep('plan')} disabled={processingPayment}
                      style={{ flex: 1, padding: '12px', border: '1.5px solid #1a1a1a', borderRadius: 99, background: '#fff', color: '#1a1a1a', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                      Back
                    </button>
                    <motion.button type="submit" disabled={processingPayment}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      className="coral-btn-int"
                      style={{ flex: 1, padding: '12px', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      {processingPayment ? <><MdTimer size={14} className="animate-spin" /> Processing...</> : <><HiLockClosed size={14} /> Complete Payment</>}
                    </motion.button>
                  </div>
                </form>
              )}

              {/* SUCCESS STEP */}
              {paymentStep === 'success' && (
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
                  <motion.div
                    initial={{ scale: 0.5, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                    style={{ width: 64, height: 64, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <HiCheck size={28} color="#fff" />
                  </motion.div>
                  <div>
                    <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.04em', marginBottom: 8 }}>Payment Successful!</h2>
                    <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
                      Your account has been upgraded to <strong style={{ color: '#ff7557' }}>Premium Tier</strong>. Unlimited sessions, full shortcomings roadmap, and advanced models are unlocked!
                    </p>
                  </div>
                  <motion.button onClick={handleCloseUpgradeModal}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="coral-btn-int"
                    style={{ width: '100%', padding: '14px', fontSize: 15, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <FaRocket size={15} /> Unlock & Continue Interview
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
