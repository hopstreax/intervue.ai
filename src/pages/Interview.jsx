import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { authService, interviewService } from '../services'

export default function Interview() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputVal, setInputVal] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [ending, setEnding] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [modelType, setModelType] = useState(() => localStorage.getItem('intervue_model') || 'gemini')
  const [paymentStep, setPaymentStep] = useState('plan') // plan, checkout, success
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

  // Timer
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

    // Add user message locally
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
      // Remove last local message if failed to let them retry
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
    <div className="bg-background text-on-background h-screen flex overflow-hidden">

      {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`flex flex-col h-screen w-64 bg-surface-container-lowest border-r border-white/5 py-lg fixed md:relative left-0 top-0 z-40 shrink-0 ${
              sidebarOpen ? 'flex' : 'hidden md:flex'
            }`}
          >
            {/* Logo */}
            <div className="px-lg mb-xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-sm mb-xs">
                  <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <h1 className="text-2xl font-bold font-display text-primary tracking-tighter">InterviewIQ</h1>
                </div>
                <p className="text-xs font-mono text-on-surface-variant opacity-50 uppercase tracking-widest ml-8">Premium Tier</p>
              </div>
              <button className="md:hidden text-outline hover:text-on-surface" onClick={() => setSidebarOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Metrics */}
            <div className="px-lg space-y-md mb-xl">
              <div>
                <h2 className="text-xs font-mono text-outline-variant uppercase mb-sm tracking-widest">Session Stats</h2>
                <div className="glass-panel p-md rounded-xl space-y-md border border-white/5">
                  <div>
                    <div className="flex justify-between text-xs text-on-surface-variant mb-xs">
                      <span>Clarity Rating</span>
                      <span className="font-mono">{metrics.clarity}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-primary" animate={{ width: `${metrics.clarity}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-on-surface-variant mb-xs">
                      <span>Technical Depth</span>
                      <span className="font-mono">{metrics.accuracy}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-secondary" animate={{ width: `${metrics.accuracy}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-sm mt-auto space-y-xs pt-md border-t border-white/5">
              <button
                onClick={handleEndInterview}
                disabled={ending}
                className="w-full py-md bg-error text-on-error font-bold rounded-lg mb-sm active:scale-98 transition-all hover:shadow-[0_0_20px_rgba(255,180,171,0.2)] flex items-center justify-center gap-xs text-sm"
              >
                <span className="material-symbols-outlined text-base">stop_circle</span>
                {ending ? 'Saving Evaluation...' : 'End & Grade Interview'}
              </button>

              <div className="flex items-center gap-md px-md py-sm rounded-xl hover:bg-white/5 transition-all cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-bold truncate text-on-surface">{user?.name || 'User'}</span>
                  <span className="text-xs font-mono text-outline-variant truncate">{user?.email || ''}</span>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile menu */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── MAIN CHAT AREA ───────────────────────────────────────────── */}
      <main className="relative flex-1 flex flex-col h-full bg-background overflow-hidden">

        {/* Top Bar */}
        <header className="h-16 md:h-20 border-b border-white/5 flex items-center justify-between px-md md:px-xl bg-background/80 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-sm md:gap-xl">
            {/* Mobile menu toggle */}
            <button className="md:hidden text-on-surface-variant hover:text-on-surface" onClick={() => setSidebarOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>

            {/* Active Model Badge */}
            <div className="hidden md:inline-flex items-center gap-xs px-sm py-xs rounded-full border border-primary/20 bg-primary/5 text-xs font-mono text-primary">
              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1", fontSize: '14px' }}>
                {modelType === 'gpt' ? 'smart_toy' : 'auto_awesome'}
              </span>
              {modelType === 'gpt' ? 'GPT-4o' : 'Gemini'}
            </div>

            {/* Progress */}
            <div className="flex flex-col">
              <span className="text-xs font-mono text-outline-variant uppercase mb-0.5 hidden md:block">Progress</span>
              <div className="flex items-center gap-sm">
                <span className="text-sm font-semibold text-on-surface">Question {questionNum}</span>
                <div className="flex items-center text-primary text-xs font-bold bg-primary/20 px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-sm">arrow_upward</span>
                  {metrics.questionsAnswered}
                </div>
              </div>
            </div>
          </div>

          {/* Timer + End */}
          <div className="flex items-center gap-sm md:gap-lg">
            <div className="flex items-center gap-sm text-xs font-mono text-on-surface-variant bg-white/5 px-3 py-2 rounded-lg border border-white/5">
              <span className="material-symbols-outlined text-sm text-secondary animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
              <span className="tabular-nums">{formatTime(elapsed)}</span>
            </div>
            <button
              onClick={handleEndInterview}
              className="flex items-center gap-1 md:gap-sm px-3 py-2 rounded-lg bg-error-container text-on-error-container text-xs font-mono hover:brightness-110 transition-all animate-pulse"
            >
              <span className="material-symbols-outlined text-sm">stop_circle</span>
              <span className="hidden md:inline">End Interview</span>
            </button>
          </div>
        </header>

        {/* Conversation Canvas */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto custom-scrollbar px-md md:px-xl pt-xl pb-48">
          <div className="max-w-3xl mx-auto space-y-xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-md">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  </div>
                </div>
                <p className="text-on-surface-variant font-mono text-sm animate-pulse">Initializing AI Interviewer...</p>
              </div>
            ) : !session && error ? (
              <div className="flex flex-col items-center justify-center h-64 gap-md">
                <span className="material-symbols-outlined text-error text-5xl">error</span>
                <p className="text-on-surface-variant text-sm">{error}</p>
                <button onClick={startNewInterview} className="px-lg py-md bg-primary text-on-primary font-bold rounded-lg active:scale-95 transition-all flex items-center gap-sm">
                  <span className="material-symbols-outlined">refresh</span> Retry
                </button>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-md">
                <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center" style={{ boxShadow: '0 0 30px rgba(192,193,255,0.2)' }}>
                  <span className="material-symbols-outlined text-on-primary-container text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                </div>
                <p className="text-on-surface-variant font-mono text-sm">Waiting for interview to begin...</p>
              </div>
            ) : (
              <div className="space-y-xl">
                <AnimatePresence initial={false}>
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className={`flex items-start gap-md md:gap-lg ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        msg.role === 'user'
                          ? 'bg-surface-container-highest border border-white/10'
                          : 'bg-primary-container'
                      }`} style={msg.role !== 'user' ? { boxShadow: '0 0 20px rgba(192,193,255,0.2)' } : {}}>
                        <span className="material-symbols-outlined text-sm" style={msg.role !== 'user' ? { fontVariationSettings: "'FILL' 1" } : {}}>
                          {msg.role === 'user' ? 'person' : 'smart_toy'}
                        </span>
                      </div>
                      <div className="flex-1 pt-1 min-w-0">
                        <h3 className="text-xs font-mono text-outline-variant uppercase mb-sm tracking-widest">
                          {msg.role === 'user' ? (user?.name || 'You') : 'InterviewIQ AI'}
                        </h3>
                        {msg.role === 'assistant' && msg.feedback && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-sm p-sm rounded-lg bg-secondary/5 border border-secondary/20 text-xs text-secondary font-mono italic"
                          >
                            "{msg.feedback}"
                          </motion.div>
                        )}
                        <div className={`text-base md:text-lg leading-relaxed ${
                          msg.role === 'user' ? 'text-on-surface-variant' : 'text-on-surface'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Sending indicator */}
            {sending && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-md py-md px-lg bg-surface-container-low rounded-2xl w-fit border border-white/5"
              >
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs font-mono text-on-surface-variant">Analyzing sentiment & technical depth...</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Chat Input */}
        <div className="absolute bottom-0 left-0 w-full px-md md:px-xl pb-md pt-16 bg-gradient-to-t from-background via-background/95 to-transparent">
          <div className="max-w-3xl mx-auto">
            {error && (
              <div className="mb-sm flex items-center gap-sm p-sm rounded-lg bg-error-container/30 border border-error/30 text-error text-xs font-mono">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSend} className="relative flex items-end gap-sm md:gap-md bg-surface-container-lowest border border-white/5 rounded-2xl p-sm focus-within:border-primary/30 transition-all">
              <textarea
                ref={textareaRef}
                value={inputVal}
                onChange={e => {
                  setInputVal(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = `${e.target.scrollHeight}px`
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend(e)
                  }
                }}
                placeholder="Type your response here... (Press Enter to send)"
                rows={1}
                className="flex-1 bg-transparent border-0 outline-none resize-none max-h-36 py-sm px-sm md:px-md text-on-surface placeholder:text-outline-variant custom-scrollbar text-sm md:text-base leading-relaxed"
              />
              <motion.button
                type="submit"
                disabled={!inputVal.trim() || sending}
                whileHover={inputVal.trim() ? { scale: 1.05 } : {}}
                whileTap={inputVal.trim() ? { scale: 0.95 } : {}}
                className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 disabled:opacity-30 disabled:scale-100 transition-all"
              >
                <span className="material-symbols-outlined text-base">send</span>
              </motion.button>
            </form>
            <p className="text-center mt-xs text-[10px] font-mono text-outline-variant">
              Keep it professional. The AI evaluates confidence, accuracy, and structure.
            </p>
          </div>
        </div>
      </main>

      {/* ── UPGRADE/PAYMENT MODAL ────────────────────────────────────── */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-[500px] bg-surface-container-lowest border border-white/10 rounded-2xl p-xl shadow-2xl flex flex-col gap-lg"
            >
              {/* Close button */}
              <div className="flex justify-end -mb-xl">
                <button
                  onClick={handleCloseUpgradeModal}
                  className="text-outline hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* STEP 1: PLAN SELECTOR */}
              {paymentStep === 'plan' && (
                <>
                  <div className="text-center space-y-xs">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-sm">
                      <span className="material-symbols-outlined text-primary text-2xl font-bold animate-pulse">workspace_premium</span>
                    </div>
                    <h2 className="text-2xl font-bold font-display text-on-surface tracking-tighter">Choose Your AI Power</h2>
                    <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
                      Upgrade to Premium to continue. Swap models mid-interview and get infinite questions.
                    </p>
                  </div>

                  <div className="space-y-md mt-sm">
                    {/* Models Grid */}
                    <div className="grid grid-cols-2 gap-sm">
                      <button
                        onClick={() => setModelType('gemini')}
                        className={`p-md rounded-xl border flex flex-col gap-xs text-left transition-all ${
                          modelType === 'gemini' ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(192,193,255,0.15)]' : 'border-white/5 bg-white/2 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-xs font-bold text-sm text-on-surface">
                          <span className="material-symbols-outlined text-primary text-base">auto_awesome</span>
                          Google Gemini
                        </div>
                        <span className="text-[10px] text-on-surface-variant">1.5 Pro · Deep Analytical Insights</span>
                      </button>
                      <button
                        onClick={() => setModelType('chatgpt')}
                        className={`p-md rounded-xl border flex flex-col gap-xs text-left transition-all ${
                          modelType === 'chatgpt' ? 'border-secondary bg-secondary/5 shadow-[0_0_15px_rgba(76,215,246,0.15)]' : 'border-white/5 bg-white/2 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-xs font-bold text-sm text-on-surface">
                          <span className="material-symbols-outlined text-secondary text-base">bolt</span>
                          ChatGPT
                        </div>
                        <span className="text-[10px] text-on-surface-variant">GPT-4o · Precise Coding Synthesis</span>
                      </button>
                    </div>

                    {/* Feature Perks */}
                    <div className="p-md bg-white/3 rounded-xl border border-white/5 space-y-sm">
                      <div className="flex items-center gap-sm text-sm text-on-surface">
                        <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                        <span>Unlimited technical Q&A sessions</span>
                      </div>
                      <div className="flex items-center gap-sm text-sm text-on-surface">
                        <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                        <span>Personalized shortcoming lists & roadmaps</span>
                      </div>
                      <div className="flex items-center gap-sm text-sm text-on-surface">
                        <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                        <span>PDF reports & future Voice Mode access</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-md pt-md border-t border-white/5">
                    <div>
                      <span className="text-xs text-on-surface-variant font-mono">Monthly plan</span>
                      <div className="flex items-baseline gap-xs">
                        <span className="text-3xl font-bold font-display text-on-surface">$15</span>
                        <span className="text-sm text-on-surface-variant">/mo</span>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPaymentStep('checkout')}
                      className="bg-primary text-on-primary font-bold px-lg py-md rounded-xl hover:shadow-[0_0_30px_rgba(192,193,255,0.3)] transition-all text-sm flex items-center gap-xs"
                    >
                      Choose Plan
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </motion.button>
                  </div>
                </>
              )}

              {/* STEP 2: SIMULATED PAYMENT CHECKOUT */}
              {paymentStep === 'checkout' && (
                <form onSubmit={handleUpgradePayment} className="space-y-md">
                  <div className="text-center space-y-xs">
                    <h2 className="text-xl font-bold font-display text-on-surface">Secure Sandbox Checkout</h2>
                    <p className="text-xs text-on-surface-variant">Please complete the payment using this free checkout simulation.</p>
                  </div>

                  <div className="space-y-sm">
                    {/* Cardholder Name */}
                    <div className="flex flex-col gap-xs">
                      <label className="text-[10px] font-mono text-outline-variant uppercase">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-md py-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 text-sm"
                      />
                    </div>

                    {/* Card Number */}
                    <div className="flex flex-col gap-xs">
                      <label className="text-[10px] font-mono text-outline-variant uppercase">Card Number</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline-variant text-base">credit_card</span>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-md py-sm text-on-surface font-mono focus:outline-none focus:border-primary/50 text-sm"
                        />
                      </div>
                    </div>

                    {/* Expiry & CVC */}
                    <div className="grid grid-cols-2 gap-sm">
                      <div className="flex flex-col gap-xs">
                        <label className="text-[10px] font-mono text-outline-variant uppercase">Expiry Date</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-md py-sm text-on-surface font-mono text-center focus:outline-none focus:border-primary/50 text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-xs">
                        <label className="text-[10px] font-mono text-outline-variant uppercase">CVC / CVV</label>
                        <input
                          type="text"
                          required
                          value={cardCvc}
                          onChange={e => setCardCvc(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-md py-sm text-on-surface font-mono text-center focus:outline-none focus:border-primary/50 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-sm bg-error-container/20 border border-error/30 text-error rounded-xl text-xs font-mono flex items-center gap-xs">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      {error}
                    </div>
                  )}

                  <div className="flex gap-sm pt-md border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setPaymentStep('plan')}
                      disabled={processingPayment}
                      className="flex-1 py-md border border-white/10 text-on-surface-variant font-bold rounded-xl hover:bg-white/5 transition-all text-sm"
                    >
                      Back
                    </button>
                    <motion.button
                      type="submit"
                      disabled={processingPayment}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-md bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all text-sm flex items-center justify-center gap-xs"
                    >
                      {processingPayment ? 'Processing...' : 'Complete Payment'}
                      <span className="material-symbols-outlined text-base">lock</span>
                    </motion.button>
                  </div>
                </form>
              )}

              {/* STEP 3: CELEBRATION SUCCESS PAGE */}
              {paymentStep === 'success' && (
                <div className="text-center py-md flex flex-col items-center gap-md">
                  <motion.div
                    initial={{ scale: 0.5, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                    className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-primary text-3xl font-bold">verified</span>
                  </motion.div>

                  <div className="space-y-xs">
                    <h2 className="text-2xl font-bold font-display text-on-surface">Payment Successful!</h2>
                    <p className="text-sm text-on-surface-variant max-w-sm">
                      Your account has been upgraded to <strong className="text-primary font-semibold">Premium Tier</strong>. Unlimited sessions, full shortcomings roadmap, and advanced models are unlocked!
                    </p>
                  </div>

                  <motion.button
                    onClick={handleCloseUpgradeModal}
                    whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(192,193,255,0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-lg py-md bg-primary text-on-primary font-bold rounded-xl active:scale-95 transition-all text-sm flex items-center justify-center gap-xs shadow-lg shadow-primary/20"
                  >
                    Unlock & Continue Interview
                    <span className="material-symbols-outlined text-base font-bold">arrow_forward</span>
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
