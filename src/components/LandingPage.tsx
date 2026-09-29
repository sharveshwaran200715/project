import { useState, useEffect } from 'react'
import { CloudRain, Bug, Sprout, Droplets, Calculator, TrendingUp, Leaf, Recycle, RefreshCw, Handshake, Bot, ArrowRight, CheckCircle, Star, Mic, PhoneCall, Crown, Shield, ChevronDown, Globe, Zap, Wind, Sun, Thermometer } from 'lucide-react'
import { useLang } from '../lib/i18n'
import { useAuth } from '../lib/auth'

const FEATURES = [
  { id: 'weather', icon: CloudRain, title: 'Weather Intelligence', desc: 'Rain prediction, heat alerts, and daily farming actions', color: 'from-sky-500 to-blue-600', bg: 'bg-sky-50', text: 'text-sky-600' },
  { id: 'disease', icon: Bug, title: 'AI Crop Doctor', desc: 'Leaf photo analysis, disease detection & treatment', color: 'from-red-500 to-rose-600', bg: 'bg-red-50', text: 'text-red-600' },
  { id: 'soil', icon: Sprout, title: 'Soil Health', desc: 'Nutrient analysis, health scores, fertilizer recs', color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { id: 'irrigation', icon: Droplets, title: 'Smart Irrigation', desc: 'Weather-based watering suggestions & water tracking', color: 'from-cyan-500 to-teal-600', bg: 'bg-cyan-50', text: 'text-cyan-600' },
  { id: 'profit', icon: Calculator, title: 'Profit Calculator', desc: 'Full cost analysis with scenario planning', color: 'from-amber-500 to-yellow-600', bg: 'bg-amber-50', text: 'text-amber-600' },
  { id: 'prices', icon: TrendingUp, title: 'Market Prices', desc: 'Live trends, historical charts, best market finder', color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-600' },
  { id: 'voice', icon: Mic, title: 'Voice Assistant', desc: 'Speak in Tamil, Telugu, Hindi, Kannada & more', color: 'from-pink-500 to-rose-600', bg: 'bg-pink-50', text: 'text-pink-600' },
  { id: 'buyer', icon: Handshake, title: 'Buyer Matching', desc: 'Find best buyers by price, distance & net return', color: 'from-orange-500 to-amber-600', bg: 'bg-orange-50', text: 'text-orange-600' },
  { id: 'support', icon: PhoneCall, title: '24×7 Agronomist', desc: 'Live call with certified agricultural scientists', color: 'from-teal-500 to-green-600', bg: 'bg-teal-50', text: 'text-teal-600' },
  { id: 'sustainability', icon: Leaf, title: 'Sustainability', desc: 'Rate your practices, get a farm sustainability grade', color: 'from-lime-500 to-green-600', bg: 'bg-lime-50', text: 'text-lime-600' },
]

const STATS = [
  { value: '12.5M L', label: 'Water Saved', icon: Droplets },
  { value: '8,400+', label: 'Farms Supported', icon: Sprout },
  { value: '45,000+', label: 'Crops Analyzed', icon: Leaf },
  { value: '23,000+', label: 'Disease Detections', icon: Bug },
  { value: '1,200+', label: 'Buyers Connected', icon: Handshake },
]

const LANGUAGES = ['English', 'தமிழ்', 'తెలుగు', 'ಕನ್ನಡ', 'മലയാളം', 'हिन्दी']

const CHAT_DEMO = [
  { role: 'user', text: 'Innaiku tomato market price enna?' },
  { role: 'ai', text: '🍅 Today\'s Tomato Price:\n• Salem Market: ₹28/kg (↑ 12%)\n• Chennai Koyambedu: ₹32/kg\n• Best nearby: Hosur Market ₹30/kg\n\n✅ Good time to sell — prices are rising this week!' },
  { role: 'user', text: 'Should I irrigate my crops today?' },
  { role: 'ai', text: '💧 Irrigation Advice:\nRain probability is 68% tonight. I recommend delaying irrigation by 1 day to save water.\n\n🌱 Your wheat crop at 42 days needs ~25mm water — let the rain provide that first.' },
]

const NAV_LINKS = ['Dashboard', 'Crops', 'Market Prices', 'Weather', 'Water Mgmt', 'AI Assistant']

export default function LandingPage({ onGetStarted, onLogin, onExplore }: {
  onGetStarted: () => void
  onLogin: () => void
  onExplore: () => void
}) {
  const { t } = useLang()
  const { user } = useAuth()
  const [chatStep, setChatStep] = useState(0)
  const [langIdx, setLangIdx] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setChatStep(s => (s + 1) % CHAT_DEMO.length)
    }, 2800)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const langTimer = setInterval(() => {
      setLangIdx(i => (i + 1) % LANGUAGES.length)
    }, 1800)
    return () => clearInterval(langTimer)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* ===== NAV ===== */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'nav-glass shadow-xl shadow-black/20' : 'bg-transparent'}`}
        style={!scrolled ? { background: 'rgba(10,46,26,0.85)', backdropFilter: 'blur(12px)' } : {}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
              <Sprout size={20} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight">FarmWise</span>
              <span className="hidden sm:inline ml-2 text-[10px] font-semibold text-green-300 bg-green-500/20 px-1.5 py-0.5 rounded-full border border-green-400/30">AI</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link, i) => (
              <button key={i} onClick={i === 0 ? onGetStarted : onExplore} className="nav-link">
                {link}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <button onClick={onLogin} className="hidden sm:block text-sm font-medium text-green-200/80 hover:text-white transition-colors">
              Login
            </button>
            {user ? (
              <button onClick={onGetStarted} className="btn-glow text-sm px-4 py-2">
                Dashboard →
              </button>
            ) : (
              <button onClick={onGetStarted} className="btn-glow text-sm px-4 py-2">
                Get Started Free
              </button>
            )}
            <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10">
              <div className="space-y-1">
                <span className="block w-5 h-0.5 bg-white" />
                <span className="block w-5 h-0.5 bg-white" />
                <span className="block w-4 h-0.5 bg-white" />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="lg:hidden border-t border-white/10 px-4 py-3 space-y-1 animate-fadeIn">
            {NAV_LINKS.map((link, i) => (
              <button key={i} onClick={() => { onGetStarted(); setMobileMenu(false) }} className="block w-full text-left nav-link">
                {link}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden hero-gradient min-h-[88vh] flex items-center">
        {/* Decorative blobs */}
        <div className="hero-overlay absolute inset-0" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-green-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-emerald-300/8 rounded-full blur-2xl" />

        {/* Animated dots grid */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left — Hero text */}
            <div className="animate-fadeIn">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-green-500/15 border border-green-400/30 text-green-300 px-4 py-2 rounded-full text-sm font-semibold mb-8 backdrop-blur-sm">
                <Zap size={14} className="text-yellow-400" />
                AI-Powered Smart Farming Platform
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight">
                Smart Farming.<br />
                <span className="gradient-text">Better Decisions.</span>
              </h1>

              <p className="text-lg text-green-100/80 mb-4 leading-relaxed max-w-xl">
                FarmWise brings AI intelligence to your fields. Real-time crop health, weather insights, market prices, and expert advice — in your language.
              </p>

              {/* Language pill */}
              <div className="flex items-center gap-2 mb-8">
                <Globe size={14} className="text-green-400" />
                <span className="text-sm text-green-300/70">Now available in</span>
                <span className="text-sm font-semibold text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15 transition-all animate-fadeIn">
                  {LANGUAGES[langIdx]}
                </span>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-10">
                <button onClick={onGetStarted} className="btn-glow text-base px-7 py-3.5 flex items-center gap-2 group">
                  <Bot size={18} /> Ask AI Assistant
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={onExplore} className="btn-ghost text-base px-7 py-3.5 flex items-center gap-2">
                  <TrendingUp size={18} /> Market Prices
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-4">
                {['Free to Start', 'No Credit Card', '6 Languages'].map((b, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-green-300/70">
                    <CheckCircle size={13} className="text-green-400" />
                    {b}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Dashboard preview card */}
            <div className="relative animate-slideUp hidden lg:block">
              {/* Main card */}
              <div className="glass-card p-6 animate-float">
                {/* Mini nav */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-green-500/30 flex items-center justify-center">
                      <Sprout size={13} className="text-green-300" />
                    </div>
                    <span className="text-white font-bold text-sm">FarmWise</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { icon: Sun, label: 'Weather', value: '28°C', sub: 'Clear Sky', color: 'text-yellow-300' },
                    { icon: Droplets, label: 'Soil Moisture', value: '68%', sub: 'Optimal', color: 'text-cyan-300' },
                    { icon: Leaf, label: 'Crop Health', value: '92%', sub: 'Excellent', color: 'text-green-300' },
                  ].map(({ icon: Icon, label, value, sub, color }, i) => (
                    <div key={i} className="stat-card-glass p-3 text-center">
                      <Icon size={18} className={`${color} mx-auto mb-1.5`} />
                      <p className="text-[10px] text-green-300/60 mb-0.5">{label}</p>
                      <p className={`text-sm font-bold ${color}`}>{value}</p>
                      <p className="text-[9px] text-white/50">{sub}</p>
                    </div>
                  ))}
                </div>

                {/* AI Chat demo */}
                <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <div className="px-3 py-2 flex items-center gap-2 border-b border-white/5">
                    <div className="w-5 h-5 rounded-full bg-green-500/30 flex items-center justify-center">
                      <Bot size={11} className="text-green-300" />
                    </div>
                    <span className="text-[11px] text-green-300 font-semibold">FarmWise AI</span>
                    <div className="ml-auto flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[9px] text-green-400">Live</span>
                    </div>
                  </div>
                  <div className="p-3 space-y-2 min-h-[80px]">
                    <div key={chatStep} className="animate-fadeIn">
                      {CHAT_DEMO[chatStep].role === 'user' ? (
                        <div className="ml-auto max-w-[80%] bg-green-600/30 border border-green-500/20 rounded-xl rounded-tr-sm px-3 py-1.5">
                          <p className="text-[11px] text-green-100">{CHAT_DEMO[chatStep].text}</p>
                        </div>
                      ) : (
                        <div className="max-w-[90%]">
                          <div className="bg-white/10 border border-white/10 rounded-xl rounded-tl-sm px-3 py-1.5">
                            <p className="text-[11px] text-white/90 whitespace-pre-line leading-relaxed">{CHAT_DEMO[chatStep].text}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge 1 */}
              <div className="absolute -bottom-6 -left-8 glass-card-light flex items-center gap-2.5 px-4 py-3 shadow-2xl animate-float" style={{ animationDelay: '1s' }}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <CloudRain size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">40% Rain</p>
                  <p className="text-xs text-gray-500">Delay irrigation</p>
                </div>
              </div>

              {/* Floating badge 2 */}
              <div className="absolute -top-4 -right-6 glass-card-light flex items-center gap-2.5 px-4 py-3 shadow-2xl animate-float" style={{ animationDelay: '2s' }}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                  <TrendingUp size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 text-green-700">+12% ↑</p>
                  <p className="text-xs text-gray-500">Tomato price</p>
                </div>
              </div>

              {/* Stars */}
              <div className="absolute top-4 left-0 flex items-center gap-1 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-3 py-1.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="#fbbf24" className="text-amber-400" />)}
                <span className="text-[10px] text-white/80 ml-1">4.9 rating</span>
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-green-300/50 animate-float">
            <span className="text-xs">Scroll to explore</span>
            <ChevronDown size={16} />
          </div>
        </div>
      </section>

      {/* ===== STATS STRIP ===== */}
      <section className="bg-gradient-to-r from-green-800 via-green-700 to-green-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {STATS.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="text-center text-white animate-fadeIn" style={{ animationDelay: `${i * 80}ms` }}>
                  <Icon size={24} className="mx-auto mb-2 text-green-300" />
                  <p className="text-2xl sm:text-3xl font-black">{s.value}</p>
                  <p className="text-sm text-green-200/70 mt-0.5">{s.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section className="py-20 bg-gray-50" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
              <Zap size={14} /> Everything You Need
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              One Platform. Every Farming Need.
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              From AI crop diagnostics to live market prices — FarmWise covers every aspect of modern, data-driven agriculture.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <button
                  key={f.id}
                  className="card card-hover text-left group animate-slideIn"
                  style={{ animationDelay: `${i * 40}ms` }}
                  onClick={onGetStarted}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${f.bg} ${f.text} group-hover:scale-110 transition-transform duration-200`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1.5 group-hover:text-green-700 transition-colors">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                  <div className="flex items-center gap-1 text-xs text-green-600 font-semibold mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    Open <ArrowRight size={12} />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== AI ASSISTANT SECTION ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="hero-gradient rounded-3xl p-8 sm:p-14 relative overflow-hidden">
            <div className="hero-overlay absolute inset-0" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-green-400/10 rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
                    <Bot size={24} className="text-green-300" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">FarmWise AI Assistant</h2>
                    <p className="text-green-300/70 text-sm">Multilingual • Voice • Instant</p>
                  </div>
                </div>
                <p className="text-green-100/80 text-lg mb-8 leading-relaxed">
                  Ask anything in your language. Get instant, personalized farming advice backed by real agricultural data.
                </p>

                {/* Language badges */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {['🇬🇧 English', '🇮🇳 Tamil', '🇮🇳 Telugu', '🇮🇳 Kannada', '🇮🇳 Malayalam', '🇮🇳 Hindi'].map((l, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-white/10 border border-white/15 backdrop-blur-sm">
                      {l}
                    </span>
                  ))}
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    'Innaiku tomato market price enna?',
                    'Should I irrigate my crops today?',
                    'Which crop should I grow after rice?',
                    'Naa enga sell pananum?',
                  ].map((q, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-green-50/80 text-sm">
                      <CheckCircle size={16} className="text-green-400 shrink-0" /> {q}
                    </li>
                  ))}
                </ul>

                <button onClick={onGetStarted} className="btn-glow flex items-center gap-2">
                  <Mic size={18} /> Try AI Assistant
                </button>
              </div>

              {/* Right — Chat preview */}
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-green-500/25 flex items-center justify-center">
                    <Bot size={16} className="text-green-300" />
                  </div>
                  <span className="text-white font-semibold text-sm">FarmWise AI</span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-green-400 font-medium">Online</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {CHAT_DEMO.slice(0, 2).map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideIn`} style={{ animationDelay: `${i * 200}ms` }}>
                      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                        msg.role === 'user'
                          ? 'bg-green-600/30 border border-green-500/25 text-green-100 rounded-tr-sm'
                          : 'bg-white/10 border border-white/10 text-white rounded-tl-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {/* Typing indicator */}
                  <div className="flex gap-2 items-center">
                    <div className="flex gap-1">
                      {[0, 150, 300].map(delay => (
                        <div key={delay} className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                      ))}
                    </div>
                    <span className="text-xs text-green-300/60">AI is typing...</span>
                  </div>
                </div>

                {/* Input */}
                <div className="mt-4 flex gap-2">
                  <div className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-green-300/60">
                    Ask anything in your language...
                  </div>
                  <button className="w-8 h-8 rounded-xl bg-green-500/30 border border-green-400/25 flex items-center justify-center hover:bg-green-500/40 transition-colors">
                    <Mic size={14} className="text-green-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PREMIUM PLAN CTA ===== */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
              <Crown size={14} /> FarmWise Premium
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Unlock the Full Power of AI Farming</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Get voice AI, 24×7 agronomist calls, unlimited market forecasts & more.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="card border-2 border-gray-200">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Free Plan</h3>
                <p className="text-3xl font-black text-gray-900">₹0 <span className="text-base font-normal text-gray-400">/month</span></p>
              </div>
              {['Weather forecast', 'Basic AI assistant', 'Crop health check', 'Soil analysis', 'Market prices'].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <CheckCircle size={15} className="text-green-500" /> {f}
                </div>
              ))}
              <button onClick={onGetStarted} className="btn-secondary w-full mt-4">Get Started Free</button>
            </div>

            {/* Premium */}
            <div className="card border-2 border-amber-400 relative bg-gradient-to-br from-amber-50 to-white">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                ⭐ MOST POPULAR
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2"><Crown size={18} className="text-amber-500" /> Premium</h3>
                <p className="text-3xl font-black text-gray-900">₹299 <span className="text-base font-normal text-gray-400">/month</span></p>
              </div>
              {['Everything in Free', 'AI Voice Assistant (6 languages)', '24×7 Agronomist Call', 'Advanced market forecasts', 'Priority disease detection', 'Buyer matching platform'].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                  <CheckCircle size={15} className="text-amber-500" /> {f}
                </div>
              ))}
              <button onClick={onGetStarted} className="w-full mt-4 btn-glow flex items-center justify-center gap-2">
                <Crown size={16} /> Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-20 hero-gradient relative overflow-hidden">
        <div className="hero-overlay absolute inset-0" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
            Ready to Farm Smarter?
          </h2>
          <p className="text-lg text-green-100/80 mb-10 max-w-xl mx-auto">
            Join 8,400+ farmers already using FarmWise to increase yields, save water, and boost profits.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={onGetStarted} className="btn-glow text-base px-8 py-3.5 flex items-center gap-2">
              <Bot size={18} /> Start Free — No Card Needed
            </button>
            <button onClick={onLogin} className="btn-ghost text-base px-8 py-3.5">
              Already a farmer? Login
            </button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <Sprout size={20} className="text-white" />
                </div>
                <span className="font-bold text-lg text-white">FarmWise</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">AI-powered smart farming for everyone — from smallholders to large agricultural enterprises.</p>
            </div>

            {[
              { title: 'Platform', links: ['Dashboard', 'Crop Health', 'Market Prices', 'Weather', 'AI Assistant'] },
              { title: 'Resources', links: ['Help Center', 'Farming Guide', 'Video Tutorials', 'Community Forum'] },
              { title: 'Company', links: ['About Us', 'Privacy Policy', 'Terms of Use', 'Contact Support'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-sm font-semibold text-white mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((l, j) => (
                    <li key={j}>
                      <button onClick={onGetStarted} className="text-sm text-gray-500 hover:text-green-400 transition-colors">
                        {l}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">© 2026 FarmWise. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <Shield size={13} className="text-green-600" />
              <p className="text-xs text-gray-600">Data encrypted. Privacy protected. Never shared.</p>
            </div>
            <p className="text-xs text-gray-600">Demo data shown. Verify prices before selling.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
