import { useState, useEffect } from 'react'
import { Leaf, Menu, X, Home, CloudRain, Bug, Sprout, Droplets, Calculator, TrendingUp, Recycle, RefreshCw, Handshake, Bot, User, Bell, Shield, Globe, LogOut, PhoneCall, Tablet, Crown, Mic, ChevronRight, Compass } from 'lucide-react'
import { AuthProvider, useAuth } from './lib/auth'
import { LanguageProvider, useLang, LANGUAGES, Lang } from './lib/i18n'
import Dashboard, { NAV_ITEMS } from './components/Dashboard'
import Weather from './components/Weather'
import DiseaseAlert from './components/DiseaseAlert'
import SoilHealth from './components/SoilHealth'
import SmartIrrigation from './components/SmartIrrigation'
import ProfitCalculator from './components/ProfitCalculator'
import CropPrices from './components/CropPrices'
import Sustainability from './components/Sustainability'
import CropRotation from './components/CropRotation'
import WasteManagement from './components/WasteManagement'
import FarmerBuyer from './components/FarmerBuyer'
import AIAssistant from './components/AIAssistant'
import FarmProfilePage from './components/FarmProfilePage'
import Notifications from './components/Notifications'
import AdminDashboard from './components/AdminDashboard'
import LandingPage from './components/LandingPage'
import AuthPage from './components/AuthPage'
import SubscriptionPage from './components/SubscriptionPage'
import CallSupport from './components/CallSupport'
import FarmerDeviceProgram from './components/FarmerDeviceProgram'
import FarmProgressTracker from './components/FarmProgressTracker'
import VoiceAssistant from './components/VoiceAssistant'
import WhatIfSimulator from './components/WhatIfSimulator'
import { supabase } from './lib/supabase'

const ICON_MAP: Record<string, React.ReactNode> = {
  simulator: <Compass size={18} />,
  progress: <Sprout size={18} />,
  voice: <Mic size={18} />,
  support: <PhoneCall size={18} />,
  weather: <CloudRain size={18} />,
  disease: <Bug size={18} />,
  soil: <Sprout size={18} />,
  irrigation: <Droplets size={18} />,
  profit: <Calculator size={18} />,
  prices: <TrendingUp size={18} />,
  device: <Tablet size={18} />,
  subscription: <Crown size={18} />,
  sustainability: <Leaf size={18} />,
  rotation: <RefreshCw size={18} />,
  waste: <Recycle size={18} />,
  buyer: <Handshake size={18} />,
  ai: <Bot size={18} />,
  profile: <User size={18} />,
  notifications: <Bell size={18} />,
  admin: <Shield size={18} />,
}

type View = 'landing' | 'auth' | 'dashboard' | 'weather' | 'disease' | 'soil' | 'irrigation' | 'profit' | 'prices' | 'sustainability' | 'rotation' | 'waste' | 'buyer' | 'ai' | 'profile' | 'notifications' | 'admin' | 'subscription' | 'support' | 'device' | 'progress' | 'voice' | 'simulator'

function AppInner() {
  const { user, loading, signOut } = useAuth()
  const { t, lang, setLang } = useLang()
  const [view, setView] = useState<View>('landing')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [aiOpen, setAiOpen] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (user && view === 'landing') setView('dashboard')
      if (!user && view !== 'landing' && view !== 'auth') setView('landing')
    }
  }, [user, loading, view])

  useEffect(() => {
    if (!user) return
    async function checkUnread() {
      const { count } = await supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('read', false)
      setUnreadCount(count || 0)
    }
    checkUnread()
    const interval = setInterval(checkUnread, 30000)
    return () => clearInterval(interval)
  }, [user, view])

  function navigate(v: string) {
    setView(v as View)
    setSidebarOpen(false)
    setAiOpen(false)
  }

  function renderView() {
    switch (view) {
      case 'simulator': return <WhatIfSimulator onNavigate={navigate} />
      case 'weather': return <Weather />
      case 'disease': return <DiseaseAlert />
      case 'soil': return <SoilHealth />
      case 'irrigation': return <SmartIrrigation />
      case 'profit': return <ProfitCalculator />
      case 'prices': return <CropPrices />
      case 'sustainability': return <Sustainability />
      case 'rotation': return <CropRotation />
      case 'waste': return <WasteManagement />
      case 'buyer': return <FarmerBuyer />
      case 'ai': return <AIAssistant />
      case 'profile': return <FarmProfilePage onNavigate={navigate} />
      case 'notifications': return <Notifications />
      case 'admin': return <AdminDashboard />
      case 'subscription': return <SubscriptionPage />
      case 'support': return <CallSupport />
      case 'device': return <FarmerDeviceProgram />
      case 'progress': return <FarmProgressTracker />
      case 'voice': return <VoiceAssistant />
      default: return <Dashboard onNavigate={navigate} />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a2e1a 0%, #0f4a2a 100%)' }}>
        <div className="flex flex-col items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-2xl shadow-green-500/50">
            <Sprout size={28} className="text-white animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-green-300 text-sm font-medium">Loading FarmWise...</span>
          </div>
        </div>
      </div>
    )
  }

  // Landing & Auth pages (no sidebar)
  if (view === 'landing' || !user) {
    if (view === 'auth' && !user) {
      return <AuthPage onBack={() => setView('landing')} />
    }
    if (!user) {
      return (
        <LandingPage
          onGetStarted={() => setView('auth')}
          onLogin={() => setView('auth')}
          onExplore={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
        />
      )
    }
  }

  // ===== App shell with dark sidebar =====
  const sidebarItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: <Home size={18} /> },
    ...NAV_ITEMS.map(n => ({ id: n.id, label: t(n.labelKey), icon: ICON_MAP[n.id] })),
    { id: 'notifications', label: t('nav.notifications'), icon: <Bell size={18} /> },
    { id: 'profile', label: t('nav.profile'), icon: <User size={18} /> },
    { id: 'admin', label: t('nav.admin'), icon: <Shield size={18} /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ===== DARK SIDEBAR ===== */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 sidebar-dark flex flex-col z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
              <Sprout size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-white text-base tracking-tight">FarmWise</h1>
              <p className="text-[10px] text-green-400/70 font-medium">Smart Farming AI</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={view === item.id ? 'sidebar-item-active w-full relative' : 'sidebar-item w-full relative'}
            >
              <span className={view === item.id ? 'text-green-400' : 'text-green-400/50'}>
                {item.icon}
              </span>
              <span className="truncate flex-1 text-left">{item.label}</span>
              {item.id === 'notifications' && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unreadCount}
                </span>
              )}
              {view === item.id && <ChevronRight size={14} className="text-green-400 ml-auto" />}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/8">
          <button
            onClick={async () => { await signOut(); setView('landing') }}
            className="sidebar-item w-full"
          >
            <LogOut size={18} className="text-red-400/70" />
            <span>{t('common.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 nav-glass z-30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <Sprout size={17} className="text-white" />
            </div>
            <span className="font-black text-white text-base">FarmWise</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('notifications')} className="relative p-2 rounded-lg hover:bg-white/10 text-green-200">
              <Bell size={19} />
              {unreadCount > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black rounded-full min-w-[14px] h-[14px] flex items-center justify-center">{unreadCount}</span>}
            </button>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-white/10 text-green-200">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        {/* Desktop top bar */}
        <header className="hidden lg:flex sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-30 px-6 h-14 items-center justify-end gap-4">
          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Globe size={15} className="text-green-600" />
              <span>{LANGUAGES.find(l => l.code === lang)?.label}</span>
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 min-w-[160px] animate-slideUp">
                  {LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code as Lang); setLangOpen(false) }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 transition-colors ${lang === l.code ? 'text-green-700 font-semibold bg-green-50' : 'text-gray-600'}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button onClick={() => navigate('notifications')} className="relative p-2 rounded-xl hover:bg-gray-100">
            <Bell size={18} className="text-gray-500" />
            {unreadCount > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black rounded-full min-w-[14px] h-[14px] flex items-center justify-center">{unreadCount}</span>}
          </button>
          <button onClick={() => navigate('profile')} className="w-8 h-8 rounded-xl bg-green-100 text-green-700 flex items-center justify-center hover:bg-green-200 transition-colors">
            <User size={16} />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderView()}
        </main>
      </div>

      {/* ===== FLOATING AI ASSISTANT BUTTON ===== */}
      {view !== 'ai' && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          {/* Quick tip bubble */}
          {!aiOpen && (
            <div className="bg-white rounded-2xl shadow-xl border border-green-100 px-3.5 py-2 text-xs text-gray-600 max-w-[180px] animate-slideUp">
              <span className="font-semibold text-green-700">FarmWise AI</span> — Ask anything in Tamil, Telugu, Hindi...
              <div className="absolute bottom-0 right-5 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))' }} />
            </div>
          )}

          <button
            onClick={() => navigate('ai')}
            className="ai-fab w-14 h-14 rounded-2xl flex items-center justify-center text-white pulse-ring"
            title="Open AI Assistant"
          >
            <Bot size={24} />
          </button>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppInner />
      </LanguageProvider>
    </AuthProvider>
  )
}
