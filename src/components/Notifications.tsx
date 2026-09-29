import { useState, useEffect } from 'react'
import { Bell, CheckCheck, Trash2, CloudRain, Flame, Bug, Droplets, TrendingUp, Sprout, Recycle, AlertTriangle, Volume2, VolumeX, Sliders, X, CheckCircle2, ShieldAlert } from 'lucide-react'
import { Card, SectionHeader, EmptyState, LoadingSpinner, Badge } from './ui'
import { useAuth } from '../lib/auth'
import { useLang, Lang } from '../lib/i18n'
import { supabase } from '../lib/supabase'
import { voiceService } from '../lib/voiceService'

export interface SmartAlert {
  id: string
  title: string
  message: string
  type: 'weather' | 'disease' | 'irrigation' | 'market' | 'climate' | 'general'
  severity: 'critical' | 'warning' | 'important' | 'info'
  read: boolean
  icon: string
  audioText?: string
  created_at: string
}

const ICON_MAP: Record<string, React.ReactNode> = {
  rain: <CloudRain size={18} />,
  heat: <Flame size={18} />,
  disease: <Bug size={18} />,
  pest: <Bug size={18} />,
  irrigation: <Droplets size={18} />,
  price: <TrendingUp size={18} />,
  harvest: <Sprout size={18} />,
  sustainability: <Recycle size={18} />,
  climate: <ShieldAlert size={18} />,
  bell: <Bell size={18} />,
}

const SAMPLE_ALERTS: SmartAlert[] = [
  {
    id: 'alt_1',
    title: 'Cyclone & Heavy Rainfall Warning',
    message: 'Depression in Bay of Bengal expected to bring 60-80mm rain and 55km/h wind gusts over next 36 hours. Delay irrigation and dig field drainage trenches.',
    type: 'weather',
    severity: 'critical',
    read: false,
    icon: 'rain',
    audioText: 'Warning: Heavy cyclone rainfall and strong winds expected in 36 hours. Please delay irrigation and open field drainage channels immediately.',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'alt_2',
    title: 'Extreme Heat & Soil Desiccation',
    message: 'Forecast temperatures touching 38°C for 3 consecutive days. High risk of moisture stress in flowering vegetables and pulses. Apply evening irrigation.',
    type: 'climate',
    severity: 'warning',
    read: false,
    icon: 'heat',
    audioText: 'Heat Alert: Temperatures touching 38 degrees Celsius. Water your fields during evening to prevent moisture stress.',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'alt_3',
    title: 'Fall Armyworm / Early Blight Outbreak',
    message: 'High humidity (>85%) has triggered early blight alerts across neighboring clusters. Inspect lower tomato leaves for concentric brown rings.',
    type: 'disease',
    severity: 'warning',
    read: false,
    icon: 'disease',
    audioText: 'Pest Alert: High humidity favors early blight fungus. Scout your tomato crop and spray recommended biocontrols.',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'alt_4',
    title: 'Tomato Mandi Price Surged 14%',
    message: 'Arrivals at Madurai & Kolar APMC mandis dropped by 20%. Wholesale price increased to ₹38/kg. Favorable window to harvest and transport.',
    type: 'market',
    severity: 'important',
    read: true,
    icon: 'price',
    audioText: 'Market update: Tomato price jumped 14% to 38 rupees per kilo. This is a favorable time to harvest and sell.',
    created_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'alt_5',
    title: 'Scheduled Irrigation Reminder',
    message: 'Field sensor moisture levels have dipped to 18%. Optimal irrigation window tomorrow between 6:00 AM and 9:00 AM.',
    type: 'irrigation',
    severity: 'info',
    read: true,
    icon: 'irrigation',
    audioText: 'Irrigation reminder: Soil moisture is at 18%. Water field tomorrow morning.',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
]

export default function Notifications() {
  const { user, profile } = useAuth()
  const { lang } = useLang()
  const [alerts, setAlerts] = useState<SmartAlert[]>(SAMPLE_ALERTS)
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [activeSeverity, setActiveSeverity] = useState<string>('all')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Audio & Notification Preferences
  const [voiceLang, setVoiceLang] = useState<Lang>((profile?.preferred_language as Lang) || 'ta')
  const [weatherAlerts, setWeatherAlerts] = useState(true)
  const [cropAlerts, setCropAlerts] = useState(true)
  const [marketAlerts, setMarketAlerts] = useState(true)
  const [climateAlerts, setClimateAlerts] = useState(true)
  const [autoVoice, setAutoVoice] = useState(false)

  useEffect(() => {
    return () => {
      voiceService.stopSpeaking()
    }
  }, [])

  function playAlertAudio(alert: SmartAlert) {
    if (playingId === alert.id) {
      voiceService.stopSpeaking()
      setPlayingId(null)
      return
    }

    voiceService.stopSpeaking()
    setPlayingId(alert.id)

    const textToSpeak = `${alert.title}. ${alert.audioText || alert.message}`
    voiceService.speak(
      textToSpeak,
      voiceLang,
      () => setPlayingId(alert.id),
      () => setPlayingId(null),
      () => setPlayingId(null)
    )
  }

  function markAllRead() {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })))
  }

  function markRead(id: string) {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, read: true } : a)))
  }

  function deleteAlert(id: string) {
    if (playingId === id) {
      voiceService.stopSpeaking()
      setPlayingId(null)
    }
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const filteredAlerts = alerts.filter(a => {
    const matchCat = activeCategory === 'all' || a.type === activeCategory
    const matchSev = activeSeverity === 'all' || a.severity === activeSeverity
    return matchCat && matchSev
  })

  const unreadCount = alerts.filter(a => !a.read).length

  function getSeverityBadge(sev: SmartAlert['severity']) {
    switch (sev) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-error-100 text-error-800 border border-error-200">🔴 CRITICAL</span>
      case 'warning':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">🟠 WARNING</span>
      case 'important':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">🟡 IMPORTANT</span>
      case 'info':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">🔵 INFO</span>
    }
  }

  return (
    <div className="animate-fadeIn space-y-6">
      <SectionHeader
        title="Smart Voice & Farm Alerts"
        subtitle={`Real-time agricultural alerts with regional audio voice broadcasting (${unreadCount} unread)`}
        icon={<Bell size={22} className="text-primary-600" />}
      />

      {/* Top Toolbar: Filters & Preferences */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'weather', 'disease', 'market', 'climate', 'irrigation'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                activeCategory === cat
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat === 'disease' ? 'Crop Doctor' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSettingsOpen(true)}
            className="px-3.5 py-1.5 bg-white border border-gray-200 hover:border-primary-400 rounded-xl text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Sliders size={14} /> Voice & Alert Preferences
          </button>
          <button
            onClick={markAllRead}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-medium text-gray-600 flex items-center gap-1 transition-colors"
          >
            <CheckCheck size={14} /> Mark Read
          </button>
        </div>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <Card>
          <EmptyState
            message="No alerts found for this filter. Your farm parameters are normal."
            icon={<Bell size={40} />}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map(alert => (
            <div
              key={alert.id}
              onClick={() => markRead(alert.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
                !alert.read ? 'border-primary-300 shadow-sm ring-1 ring-primary-400/20' : 'border-gray-200/80 opacity-90'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    alert.severity === 'critical' ? 'bg-error-100 text-error-600' :
                    alert.severity === 'warning' ? 'bg-amber-100 text-amber-600' :
                    alert.severity === 'important' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {ICON_MAP[alert.icon] || <Bell size={18} />}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-gray-900">{alert.title}</h4>
                      {getSeverityBadge(alert.severity)}
                      {!alert.read && <span className="w-2 h-2 rounded-full bg-primary-600" />}
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      {alert.message}
                    </p>

                    <div className="flex items-center gap-3 pt-2 text-[11px] text-gray-400">
                      <span>{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>• Category: <strong className="capitalize text-gray-600">{alert.type}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Listen Voice Alert Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      playAlertAudio(alert)
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                      playingId === alert.id
                        ? 'bg-error-500 text-white animate-pulse'
                        : 'bg-primary-50 hover:bg-primary-100 text-primary-700'
                    }`}
                  >
                    {playingId === alert.id ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    <span className="hidden sm:inline">{playingId === alert.id ? 'Stop Voice' : 'Listen Alert'}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteAlert(alert.id)
                    }}
                    className="p-1.5 text-gray-300 hover:text-error-500 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Voice & Notification Preferences Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-slideIn">
            <button
              onClick={() => setSettingsOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center">
                <Sliders size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Alert & Voice Preferences</h3>
                <p className="text-xs text-gray-400">Customize what you receive & how it is read</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Voice Language Selection */}
              <div>
                <label className="font-bold text-gray-700 block mb-1.5">Voice Audio Readout Language</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'ta', label: 'Tamil (தமிழ்)' },
                    { code: 'hi', label: 'Hindi (हिन्दी)' },
                    { code: 'en', label: 'English' },
                    { code: 'te', label: 'Telugu (తెలుగు)' },
                    { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
                    { code: 'ml', label: 'Malayalam (മലയാളം)' },
                  ].map(item => (
                    <button
                      key={item.code}
                      onClick={() => setVoiceLang(item.code as Lang)}
                      className={`p-2 rounded-xl border text-center font-medium transition-all ${
                        voiceLang === item.code
                          ? 'border-primary-600 bg-primary-50 text-primary-700 font-bold'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Toggles */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <span className="font-bold text-gray-700 block mb-1">Subscribed Alert Categories</span>
                {[
                  { label: 'Severe Weather (Cyclone, Frost, Heavy Rain)', state: weatherAlerts, set: setWeatherAlerts },
                  { label: 'Crop Health & Disease Outbreaks', state: cropAlerts, set: setCropAlerts },
                  { label: 'Mandi Price Fluctuations & Surges', state: marketAlerts, set: setMarketAlerts },
                  { label: 'Long-term Climate & Drought Warnings', state: climateAlerts, set: setClimateAlerts },
                ].map((item, i) => (
                  <label key={i} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl cursor-pointer">
                    <span className="text-gray-700">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={item.state}
                      onChange={e => item.set(e.target.checked)}
                      className="w-4 h-4 accent-primary-600 rounded"
                    />
                  </label>
                ))}
              </div>

              <div className="p-3 bg-primary-50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-primary-900">Auto-Read Critical Audio Alerts</p>
                  <p className="text-[10px] text-primary-700">Automatically play speaker voice for red-level warnings.</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoVoice}
                  onChange={e => setAutoVoice(e.target.checked)}
                  className="w-4 h-4 accent-primary-600 rounded"
                />
              </div>

              <button
                onClick={() => setSettingsOpen(false)}
                className="btn-primary w-full py-2.5 font-bold text-xs shadow-md mt-2"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
