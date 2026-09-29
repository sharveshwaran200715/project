import { useState, useEffect } from 'react'
import { PhoneCall, Phone, Mic, MicOff, PhoneOff, Clock, AlertTriangle, ShieldCheck, UserCheck, Calendar, CheckCircle2, ChevronDown, ChevronUp, Globe, Sparkles } from 'lucide-react'
import { Card, SectionHeader, Badge } from './ui'
import { useAuth } from '../lib/auth'
import { useLang, Lang } from '../lib/i18n'
import { SupportRequest } from '../lib/types'
import { supabase } from '../lib/supabase'

const SUPPORT_LANGUAGES: { code: Lang; name: string; native: string }[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
]

const SAMPLE_HISTORY: SupportRequest[] = [
  {
    id: 'req_1',
    farmer_name: 'Farmer Member',
    phone: '+91 98765 43210',
    language: 'Tamil',
    issue_category: 'Disease Outbreak',
    is_urgent: true,
    description: 'Sudden brown spot disease spreading on tomato vines after recent humidity spike.',
    status: 'completed',
    agent_name: 'Dr. S. Sundaram (TNAU Agronomist)',
    call_notes: 'Advised copper oxychloride 2g/L spray and immediate field drainage. Follow-up scheduled.',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'req_2',
    farmer_name: 'Farmer Member',
    phone: '+91 98765 43210',
    language: 'Hindi',
    issue_category: 'Fertilizer Dosing',
    is_urgent: false,
    description: 'Query on Urea split application timing for late-sown wheat.',
    status: 'completed',
    agent_name: 'Er. Rajesh Verma (IARI Extension Specialist)',
    call_notes: 'Recommended 1/3 at basal, 1/3 at first irrigation, and 1/3 at tillering stage.',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const FAQS = [
  {
    q: 'How quickly does an agronomist respond to emergency calls?',
    a: 'Emergency calls are prioritized with an average response time of under 90 seconds. Non-urgent callback requests are handled within 15–30 minutes during field hours.',
  },
  {
    q: 'Can I speak in my regional dialect?',
    a: 'Yes! Our support center features state agricultural university graduates fluent in Tamil, Hindi, Telugu, Kannada, Malayalam, and English.',
  },
  {
    q: 'Are the recommendations backed by certified agricultural universities?',
    a: 'All our agronomists follow ICAR, TNAU, and State Agricultural University guidelines for spray doses, seed treatments, and pest management.',
  },
  {
    q: 'Is call support free for all farmers?',
    a: 'Free farmers receive 2 callback consultations per month and community chat. FarmWise Premium members receive unlimited instant calls 24x7.',
  },
]

export default function CallSupport() {
  const { user, profile } = useAuth()
  const { lang, setLang } = useLang()
  const [selectedLang, setSelectedLang] = useState<string>('Tamil')
  const [isUrgent, setIsUrgent] = useState(false)
  const [category, setCategory] = useState('Pest / Disease Emergency')
  const [phone, setPhone] = useState(profile?.phone || '+91 98765 43210')
  const [description, setDescription] = useState('')
  const [preferredTime, setPreferredTime] = useState('Immediate (Next 10 mins)')
  const [history, setHistory] = useState<SupportRequest[]>(SAMPLE_HISTORY)
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null)

  // Audio Call Simulation State
  const [callingState, setCallingState] = useState<'idle' | 'dialing' | 'connected'>('idle')
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    let timer: any
    if (callingState === 'connected') {
      timer = setInterval(() => setCallDuration(c => c + 1), 1000)
    } else {
      setCallDuration(0)
    }
    return () => clearInterval(timer)
  }, [callingState])

  function startLiveCall() {
    setCallingState('dialing')
    setTimeout(() => {
      setCallingState('connected')
    }, 2500)
  }

  function endLiveCall() {
    setCallingState('idle')
    setIsMuted(false)
  }

  function formatDuration(sec: number) {
    const mins = Math.floor(sec / 60)
    const secs = sec % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  async function handleRequestCallback(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim()) return

    const newReq: SupportRequest = {
      id: `req_${Date.now()}`,
      farmer_name: profile?.full_name || 'Farmer',
      phone,
      language: selectedLang,
      issue_category: category,
      is_urgent: isUrgent,
      description,
      preferred_time: preferredTime,
      status: 'pending',
      created_at: new Date().toISOString(),
    }

    setHistory(prev => [newReq, ...prev])
    setDescription('')
    setSubmittedNotice(`✅ Support request submitted! An agronomist fluent in ${selectedLang} will call you at ${phone}.`)
    setTimeout(() => setSubmittedNotice(null), 6000)
  }

  return (
    <div className="animate-fadeIn space-y-6">
      <SectionHeader
        title="24x7 Farmer Call Support"
        subtitle="Speak directly with certified agricultural scientists in your mother tongue"
        icon={<PhoneCall size={22} className="text-primary-600" />}
      />

      {submittedNotice && (
        <div className="p-4 bg-primary-50 border border-primary-200 text-primary-800 rounded-2xl flex items-center gap-3 animate-slideIn">
          <CheckCircle2 className="text-primary-600 shrink-0" size={20} />
          <p className="text-sm font-medium">{submittedNotice}</p>
        </div>
      )}

      {/* Hero Live Hotline Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-800 via-primary-700 to-secondary-800 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-24 translate-x-24 blur-2xl" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-primary-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              18 Certified Agronomists Available Now
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Instant Agricultural Hotline
            </h2>
            <p className="text-primary-100 text-sm leading-relaxed max-w-xl">
              Facing sudden yellowing of leaves, flash flood warning, or need pesticide dosage before spraying? Call our dedicated multilingual field desk directly.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-2 bg-black/20 px-3.5 py-1.5 rounded-xl text-xs">
                <Globe size={14} className="text-primary-200" />
                <span>Selected Language: <strong className="text-white">{selectedLang}</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-black/20 px-3.5 py-1.5 rounded-xl text-xs">
                <ShieldCheck size={14} className="text-emerald-300" />
                <span>ICAR & University Certified</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center lg:items-end justify-center">
            {callingState === 'idle' ? (
              <button
                onClick={startLiveCall}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base rounded-2xl shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-3 transition-transform active:scale-95 group"
              >
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <PhoneCall size={20} />
                </div>
                <span>Call Agronomist Now</span>
              </button>
            ) : (
              <div className="w-full bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center animate-fadeIn">
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-300 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {callingState === 'dialing' ? 'Dialing Regional Agronomist...' : 'Connected • Audio Call Live'}
                </div>
                {callingState === 'connected' && (
                  <p className="text-2xl font-mono font-bold tracking-widest my-1">{formatDuration(callDuration)}</p>
                )}
                <p className="text-xs text-primary-200 mb-3">
                  {callingState === 'dialing' ? 'Connecting to Dr. Ramesh (Field Specialist)' : 'Dr. Ramesh (Agronomist) is on the line'}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-3 rounded-full border transition-all ${
                      isMuted ? 'bg-amber-500 border-amber-400 text-white' : 'bg-white/20 border-white/20 text-white'
                    }`}
                  >
                    {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                  <button
                    onClick={endLiveCall}
                    className="px-5 py-2.5 bg-error-600 hover:bg-error-700 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lg"
                  >
                    <PhoneOff size={16} /> End Call
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Callback Request Form + History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request a Callback Form */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Calendar size={18} className="text-primary-600" /> Request an Agronomist Callback
            </h3>
            <span className="text-xs text-gray-400">Available 24x7</span>
          </div>

          <form onSubmit={handleRequestCallback} className="space-y-4">
            {/* Language Selector */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Preferred Consultation Language
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {SUPPORT_LANGUAGES.map(l => (
                  <button
                    type="button"
                    key={l.code}
                    onClick={() => setSelectedLang(l.name)}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      selectedLang === l.name
                        ? 'border-primary-600 bg-primary-50 text-primary-700 font-bold shadow-xs'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div>{l.name}</div>
                    <div className="text-[10px] text-gray-400">{l.native}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Your Mobile Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="input text-sm"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Issue Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="input text-sm"
                >
                  <option value="Pest / Disease Emergency">Pest / Disease Emergency</option>
                  <option value="Weather / Storm Advisory">Weather / Storm Advisory</option>
                  <option value="Fertilizer / Nutrient Deficiency">Fertilizer / Nutrient Deficiency</option>
                  <option value="Irrigation / Water Scarcity">Irrigation / Water Scarcity</option>
                  <option value="Market Price & Selling Advice">Market Price & Selling Advice</option>
                  <option value="Organic Farming Certification">Organic Farming Certification</option>
                </select>
              </div>
            </div>

            {/* Emergency Checkbox */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-900">Mark as Critical Farm Emergency</p>
                  <p className="text-[11px] text-amber-700">Flag this if you have sudden rapid crop damage or flash weather alerts.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={e => setIsUrgent(e.target.checked)}
                className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Describe your crop issue or question
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="input text-sm"
                placeholder="Mention crop name, age of crop, symptoms on leaves or soil, and any sprays done recently..."
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock size={15} />
                <span>Callback window: <strong>{isUrgent ? 'Under 5 minutes' : preferredTime}</strong></span>
              </div>
              <button
                type="submit"
                className="btn-primary w-full sm:w-auto px-6 py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <PhoneCall size={16} /> Request Callback
              </button>
            </div>
          </form>
        </Card>

        {/* Support History */}
        <div className="space-y-4">
          <Card>
            <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <Clock size={16} className="text-gray-400" /> Recent Support Calls & Requests
            </h3>
            <div className="space-y-3">
              {history.map(item => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">{item.issue_category}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      item.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 line-clamp-2">{item.description}</p>
                  {item.agent_name && (
                    <div className="pt-1 border-t border-gray-200/60 flex items-center gap-1.5 text-primary-700 font-medium">
                      <UserCheck size={13} /> {item.agent_name}
                    </div>
                  )}
                  {item.call_notes && (
                    <p className="text-[11px] text-gray-500 italic bg-white p-2 rounded-lg border border-gray-100">
                      "{item.call_notes}"
                    </p>
                  )}
                  <div className="text-[10px] text-gray-400 flex justify-between">
                    <span>Language: {item.language}</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Agricultural Support FAQs */}
      <Card>
        <h3 className="font-bold text-gray-900 text-base mb-4">Frequently Asked Questions</h3>
        <div className="divide-y divide-gray-100">
          {FAQS.map((faq, i) => (
            <div key={i} className="py-3">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between text-left text-sm font-semibold text-gray-800 hover:text-primary-600 transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openFaq === i && (
                <p className="text-xs text-gray-500 mt-2 leading-relaxed animate-fadeIn">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
