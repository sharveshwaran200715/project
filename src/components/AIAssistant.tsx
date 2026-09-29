import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Sparkles, AlertTriangle, User, Mic, MicOff, Volume2, VolumeX, Globe, Zap, Key, X, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useLang } from '../lib/i18n'
import { supabase } from '../lib/supabase'
import { generateSmartFarmAIResponse, SUGGESTED_QUESTIONS, AIResponse, getActiveAIKey } from '../lib/aiEngine'
import { voiceService } from '../lib/voiceService'

// Lightweight markdown-to-HTML renderer for chat messages
function renderMarkdown(text: string): string {
  return text
    .split('\n')
    .map(line => {
      // Headings: ### Title → <strong class="...">
      line = line.replace(/^### (.+)$/gm, '<div class="chat-heading">$1</div>')
      line = line.replace(/^## (.+)$/gm, '<div class="chat-heading">$1</div>')
      line = line.replace(/^# (.+)$/gm, '<div class="chat-heading chat-heading-lg">$1</div>')
      // Bold: **text** → <strong>
      line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic: *text* → <em>
      line = line.replace(/(?<![*])\*([^*]+)\*(?![*])/g, '<em>$1</em>')
      // Inline code: `text` → <code>
      line = line.replace(/`([^`]+)`/g, '<code class="chat-code">$1</code>')
      // Bullet points: • or - at start
      line = line.replace(/^\s*[•\-]\s+(.+)$/gm, '<div class="chat-bullet">$1</div>')
      // Numbered list: 1. text
      line = line.replace(/^\s*(\d+)\.\s+(.+)$/gm, '<div class="chat-numbered"><span class="chat-num">$1.</span> $2</div>')
      return line
    })
    .join('\n')
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="chat-hr" />')
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  warnings?: string[]
  suggestions?: string[]
  created_at: string
}

const LANG_LABELS: Record<string, string> = {
  en: '🇬🇧 English',
  ta: '🇮🇳 Tamil',
  te: '🇮🇳 Telugu',
  kn: '🇮🇳 Kannada',
  ml: '🇮🇳 Malayalam',
  hi: '🇮🇳 Hindi',
}

export default function AIAssistant() {
  const { user, profile } = useAuth()
  const { lang } = useLang()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null)
  const [showApiModal, setShowApiModal] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [hasApiKey, setHasApiKey] = useState(false)
  const [keySavedToast, setKeySavedToast] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMessages()
    const active = getActiveAIKey()
    if (active) {
      setHasApiKey(true)
      setApiKeyInput(active.key)
    }
  }, [user])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, thinking])

  async function loadMessages() {
    try {
      if (user?.id) {
        const { data } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(50)

        if (data && data.length > 0) {
          setMessages(data.map(d => ({ ...d })))
          return
        }
      }
    } catch {
      // Non-blocking fallback
    }

    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `Vanakkam${profile?.full_name ? `, ${profile.full_name}` : ''}! 🌱 I'm FarmWise AI — your intelligent agricultural scientist.\n\nI can answer ANY question about your crops, pest/disease treatments, NPK fertilizer dosages, irrigation timing, market prices, and full farm audits.\n\nTry asking: "How is my farm doing?", "What tasks are pending?", or "What pesticide for aphids?"`,
      suggestions: SUGGESTED_QUESTIONS,
      created_at: new Date().toISOString(),
    }])
  }

  async function send(question?: string) {
    const text = (question || input).trim()
    if (!text || loading) return
    setInput('')
    setLoading(true)
    setThinking(true)

    const userMsg: Message = {
      id: Math.random().toString(36),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])

    // Non-blocking save to Supabase
    if (user?.id) {
      supabase.from('chat_messages').insert({ user_id: user.id, role: 'user', content: text }).then(() => {})
    }

    // Generate intelligent AI response immediately
    try {
      const historyContext = messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
      const response: AIResponse = await generateSmartFarmAIResponse(text, user?.id, historyContext)

      const aiMsg: Message = {
        id: Math.random().toString(36),
        role: 'assistant',
        content: response.text,
        warnings: response.warnings,
        suggestions: response.suggestions,
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, aiMsg])
      setThinking(false)
      setLoading(false)

      if (user?.id) {
        supabase.from('chat_messages').insert({
          user_id: user.id,
          role: 'assistant',
          content: response.text + (response.warnings ? ` | WARN: ${response.warnings.join(' ')}` : ''),
        }).then(() => {})
      }
    } catch (err) {
      console.error('Error generating AI response:', err)
      setThinking(false)
      setLoading(false)
    }
  }

  function handleSaveApiKey() {
    const trimmed = apiKeyInput.trim()
    if (trimmed) {
      localStorage.setItem('farmwise_ai_api_key', trimmed)
      setHasApiKey(true)
    } else {
      localStorage.removeItem('farmwise_ai_api_key')
      setHasApiKey(false)
    }
    setKeySavedToast(true)
    setTimeout(() => {
      setKeySavedToast(false)
      setShowApiModal(false)
    }, 1200)
  }

  function toggleVoiceInput() {
    if (isListening) {
      voiceService.stopListening()
      setIsListening(false)
    } else {
      voiceService.stopSpeaking()
      setSpeakingMsgId(null)
      setIsListening(true)
      voiceService.startListening({
        lang: (profile?.preferred_language as any) || lang || 'en',
        onStart: () => setIsListening(true),
        onResult: (text) => setInput(text),
        onError: () => setIsListening(false),
        onEnd: () => setIsListening(false),
      })
    }
  }

  function handleSpeak(id: string, text: string) {
    if (speakingMsgId === id) { voiceService.stopSpeaking(); setSpeakingMsgId(null); return }
    voiceService.stopSpeaking()
    setSpeakingMsgId(id)
    voiceService.speak(text, (profile?.preferred_language as any) || lang || 'en',
      () => setSpeakingMsgId(id),
      () => setSpeakingMsgId(null),
      () => setSpeakingMsgId(null)
    )
  }

  return (
    <div className="animate-fadeIn space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl hero-gradient p-6 text-white shadow-sm">
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
              <Bot size={26} className="text-green-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-black">FarmWise AI Assistant</h1>
                <div className="flex items-center gap-1.5 bg-green-500/20 border border-green-400/30 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-green-300">ONLINE</span>
                </div>
              </div>
              <p className="text-green-200/70 text-sm">Ask any question in Tamil, Tanglish, Telugu, Hindi, or English</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowApiModal(true)}
              className={`text-[11px] border px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                hasApiKey
                  ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
                  : 'bg-white/10 text-white/90 border-white/20 hover:bg-white/20'
              }`}
            >
              <Zap size={12} className={hasApiKey ? 'text-emerald-300' : 'text-amber-300'} />
              <span>{hasApiKey ? '⚡ AI API Active' : '⚡ Connect AI Key'}</span>
            </button>

            <div className="hidden lg:flex flex-wrap gap-1.5">
              {Object.values(LANG_LABELS).map((l, i) => (
                <span key={i} className="text-[10px] bg-white/10 border border-white/15 text-white/80 px-2 py-0.5 rounded-full font-medium">
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Chat messages */}
        <div ref={scrollRef} className="h-[480px] overflow-y-auto p-5 space-y-4 chat-panel">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fadeIn`}>
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-sky-500 to-blue-600'
                  : 'bg-gradient-to-br from-green-500 to-emerald-700'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>

              <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                {/* Bubble */}
                <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-tr-sm'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                }`}>
                  <div
                    className="text-sm leading-relaxed chat-markdown"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                  />

                  {/* Audio button for AI messages */}
                  {msg.role === 'assistant' && msg.id !== 'welcome' && (
                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">Voice playback</span>
                      <button
                        onClick={() => handleSpeak(msg.id, msg.content)}
                        className={`text-xs px-2 py-1 rounded-lg flex items-center gap-1 font-semibold transition-all ${
                          speakingMsgId === msg.id
                            ? 'bg-green-100 text-green-700 animate-pulse'
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {speakingMsgId === msg.id ? <VolumeX size={12} /> : <Volume2 size={12} />}
                        {speakingMsgId === msg.id ? 'Stop' : 'Listen'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Warnings */}
                {msg.warnings && msg.warnings.map((w, i) => (
                  <div key={i} className="mt-2 flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700 leading-relaxed">{w}</p>
                  </div>
                ))}

                {/* Suggestions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    {msg.suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => send(s)}
                        className="px-3 py-1.5 bg-white border border-green-200 text-green-700 rounded-xl text-xs font-semibold hover:bg-green-50 transition-all shadow-sm"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Thinking indicator */}
          {thinking && (
            <div className="flex gap-3 animate-fadeIn">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 text-white flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Sparkles size={14} className="text-green-500 animate-pulse" />
                  <span className="text-sm">Thinking</span>
                  <div className="flex gap-1">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-gray-100 p-4 bg-white">
          <div className="flex gap-2.5">
            <input
              type="text"
              className="input flex-1 text-sm"
              placeholder={isListening ? '🎤 Listening... speak now' : 'Ask any question (e.g. "What pesticide for armyworm?", "How is my farm doing?", "Tomato price?")'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) send() }}
              disabled={loading}
            />
            <button
              type="button"
              onClick={toggleVoiceInput}
              title="Voice Input"
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-500 text-white ring-4 ring-red-300 animate-pulse'
                  : 'bg-green-100 hover:bg-green-200 text-green-700'
              }`}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="btn-primary px-4 disabled:opacity-40"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="card">
        <h3 className="font-black mb-4 flex items-center gap-2 text-base">
          <Sparkles size={18} className="text-green-500" /> Try Asking
          <span className="ml-auto text-xs text-gray-400 font-normal">Tap to ask instantly</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => send(q)}
              className="text-left p-3.5 bg-gray-50 hover:bg-green-50 border border-transparent hover:border-green-200 rounded-xl text-sm text-gray-600 hover:text-green-700 transition-all font-medium"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
        <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-700 leading-relaxed">
          <strong>Note:</strong> FarmWise AI provides informational guidance based on agricultural data. For disease treatment, pesticide use, and fertilizer application, always confirm with a qualified local agricultural professional.
        </p>
      </div>

      {/* API Key Modal ("apply apk" / API Key configuration) */}
      {showApiModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative animate-slideUp">
            <button
              onClick={() => setShowApiModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Key size={20} />
              </div>
              <div>
                <h4 className="text-base font-black text-gray-900">Configure AI API Key</h4>
                <p className="text-xs text-gray-500">Connect Google Gemini, OpenAI, or Groq</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-gray-600 leading-relaxed">
                Paste your API key below. FarmWise will directly connect to your LLM for live reasoning. If left empty, FarmWise's built-in Agricultural Science Engine answers all questions using your real farm records.
              </p>

              <div>
                <label className="label">API Key (Gemini, OpenAI, or Groq)</label>
                <input
                  type="password"
                  className="input font-mono text-xs"
                  placeholder="AIzaSy... (Gemini) or sk-... (OpenAI) or gsk_... (Groq)"
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1 text-[11px] text-gray-500">
                <p>• <strong>Google Gemini</strong>: Keys starting with <code>AIzaSy...</code> connect automatically to Gemini 1.5/2.0 Flash.</p>
                <p>• <strong>OpenAI / Groq</strong>: Keys starting with <code>sk-...</code> or <code>gsk_...</code> use standard completions.</p>
                <p>• Keys are stored securely in your private browser storage.</p>
              </div>
            </div>

            {keySavedToast && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-green-50 text-green-700 border border-green-200 text-xs font-semibold">
                <CheckCircle2 size={16} /> Key settings updated successfully!
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setApiKeyInput('')
                  localStorage.removeItem('farmwise_ai_api_key')
                  setHasApiKey(false)
                  setShowApiModal(false)
                }}
                className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-semibold text-xs transition-colors"
              >
                Clear Key
              </button>
              <button
                onClick={handleSaveApiKey}
                className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs transition-colors shadow-sm"
              >
                Save & Apply Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
