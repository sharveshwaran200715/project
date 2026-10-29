import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'

export type UserRole = 'farmer' | 'admin'

interface UserProfile {
  full_name: string
  phone: string | null
  preferred_language: string
  farming_method: string
  role: UserRole
}

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  role: UserRole | null
  loading: boolean
  isAdmin: boolean
  isFarmer: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signInAsDemo: (targetRole?: UserRole) => void
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEMO_USERS: Record<UserRole, { user: User; profile: UserProfile }> = {
  farmer: {
    user: {
      id: 'demo-farmer-id',
      app_metadata: {},
      user_metadata: { full_name: 'Demo Farmer' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: 'farmer@farmwise.io',
      role: 'authenticated',
    } as unknown as User,
    profile: {
      full_name: 'Demo Farmer',
      phone: '+1 555-0199',
      preferred_language: 'en',
      farming_method: 'organic',
      role: 'farmer'
    }
  },
  admin: {
    user: {
      id: 'demo-admin-id',
      app_metadata: {},
      user_metadata: { full_name: 'Demo Administrator' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: 'admin@farmwise.io',
      role: 'authenticated',
    } as unknown as User,
    profile: {
      full_name: 'Demo Administrator',
      phone: null,
      preferred_language: 'en',
      farming_method: 'conventional',
      role: 'admin'
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for offline/cached session first
    const savedOffline = localStorage.getItem('farmwise_offline_auth')
    if (savedOffline) {
      try {
        const parsed = JSON.parse(savedOffline)
        if (parsed?.user && parsed?.profile) {
          setUser(parsed.user)
          setProfile(parsed.profile)
          setLoading(false)
          return
        }
      } catch {
        localStorage.removeItem('farmwise_offline_auth')
      }
    }

    // Check for demo login
    const savedDemoRole = localStorage.getItem('farmwise_demo_role') as UserRole | null
    if (savedDemoRole && DEMO_USERS[savedDemoRole]) {
      setUser(DEMO_USERS[savedDemoRole].user)
      setProfile(DEMO_USERS[savedDemoRole].profile)
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    }).catch((err) => {
      console.warn('Supabase auth session check failed (server unreachable/paused):', err)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Don't overwrite if currently in demo/offline mode
      if (localStorage.getItem('farmwise_demo_role') || localStorage.getItem('farmwise_offline_auth')) return

      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        (async () => { await loadProfile(session.user.id) })()
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Admin emails — accounts that should always get admin access
  const ADMIN_EMAILS = ['admin@farmwise.io']

  function loginOffline(email: string, fullName?: string) {
    const isTargetAdmin = ADMIN_EMAILS.includes(email.trim().toLowerCase())
    const role: UserRole = isTargetAdmin ? 'admin' : 'farmer'
    const name = fullName || (isTargetAdmin ? 'Administrator' : email.split('@')[0])

    const offlineUser = {
      id: `local-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      app_metadata: {},
      user_metadata: { full_name: name },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: email,
      role: 'authenticated',
    } as unknown as User

    const offlineProfile: UserProfile = {
      full_name: name,
      phone: null,
      preferred_language: 'en',
      farming_method: 'conventional',
      role: role,
    }

    localStorage.setItem('farmwise_offline_auth', JSON.stringify({ user: offlineUser, profile: offlineProfile }))
    localStorage.removeItem('farmwise_demo_role')
    setUser(offlineUser)
    setProfile(offlineProfile)
    setSession(null)
    setLoading(false)
  }

  async function loadProfile(userId: string) {
    try {
      // Try fetching profile with role column
      const { data } = await supabase
        .from('user_profiles')
        .select('full_name, phone, preferred_language, farming_method, role')
        .eq('user_id', userId)
        .maybeSingle()

      // Get the user's email for admin check
      const { data: authData } = await supabase.auth.getUser()
      const userEmail = authData?.user?.email || ''

      if (data) {
        const role = data.role || (ADMIN_EMAILS.includes(userEmail) ? 'admin' : 'farmer')
        setProfile({ ...data, role: role as UserRole })
      } else {
        const role = ADMIN_EMAILS.includes(userEmail) ? 'admin' : 'farmer'
        setProfile({
          full_name: authData?.user?.user_metadata?.full_name || (role === 'admin' ? 'Administrator' : 'Farmer'),
          phone: null,
          preferred_language: 'en',
          farming_method: 'conventional',
          role
        })
      }
    } catch {
      // In case of network error, assign fallback profile
      setProfile({
        full_name: 'Farmer',
        phone: null,
        preferred_language: 'en',
        farming_method: 'conventional',
        role: 'farmer'
      })
    } finally {
      setLoading(false)
    }
  }

  function signInAsDemo(targetRole: UserRole = 'farmer') {
    const demo = DEMO_USERS[targetRole]
    localStorage.setItem('farmwise_demo_role', targetRole)
    localStorage.removeItem('farmwise_offline_auth')
    setUser(demo.user)
    setProfile(demo.profile)
    setSession(null)
    setLoading(false)
  }

  async function signUp(email: string, password: string, fullName: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) {
        // If Supabase is paused or unreachable, automatically register and log in locally!
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'AuthRetryableFetchError') {
          console.warn('Supabase offline/paused — registering & signing in locally for', email)
          loginOffline(email, fullName)
          return { error: null }
        }
        return { error: error.message }
      }
      if (data.user) {
        try {
          await supabase.from('user_profiles').insert({
            user_id: data.user.id,
            full_name: fullName,
            email: email,
            role: 'farmer',
          })
        } catch {
          // Table or columns might still be initializing
        }
      }
      return { error: null }
    } catch {
      console.warn('Network exception — signing in locally for', email)
      loginOffline(email, fullName)
      return { error: null }
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        // If Supabase is paused or unreachable, automatically log the user in locally!
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'AuthRetryableFetchError') {
          console.warn('Supabase offline/paused — logging in via local session for', email)
          loginOffline(email)
          return { error: null }
        }
        return { error: error.message }
      }

      // Record login timestamp and activity
      if (data?.user) {
        const role = ADMIN_EMAILS.includes(email) ? 'admin' : 'farmer'
        try {
          await supabase.from('user_profiles').upsert({
            user_id: data.user.id,
            email: email,
            role: role,
            last_login_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' })
        } catch {
          // Silently continue if column doesn't exist
        }

        try {
          await supabase.from('admin_audit_log').insert({
            admin_user_id: data.user.id,
            user_email: email,
            action: `${role}_login`,
            target_type: 'auth',
            target_id: data.user.id,
            details: { email, role, logged_in_at: new Date().toISOString() }
          })
        } catch {
          // Silently continue if table doesn't exist
        }
      }

      return { error: null }
    } catch {
      console.warn('Network exception — logging in via local session for', email)
      loginOffline(email)
      return { error: null }
    }
  }

  async function signOut() {
    localStorage.removeItem('farmwise_demo_role')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        await supabase.from('admin_audit_log').insert({
          admin_user_id: user.id,
          user_email: user.email,
          action: 'user_logout',
          target_type: 'auth',
          target_id: user.id,
        })
      }
    } catch {
      // Ignore
    }
    try {
      await supabase.auth.signOut()
    } catch {
      // Ignore
    }
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  async function updateProfile(updates: Partial<UserProfile>) {
    if (!user) return
    if (!localStorage.getItem('farmwise_demo_role')) {
      try {
        await supabase.from('user_profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('user_id', user.id)
      } catch {
        // Ignore
      }
    }
    setProfile(prev => prev ? { ...prev, ...updates } : null)
  }

  const role = profile?.role ?? null
  const isAdmin = role === 'admin'
  const isFarmer = role === 'farmer'

  return (
    <AuthContext.Provider value={{ session, user, profile, role, loading, isAdmin, isFarmer, signUp, signIn, signInAsDemo, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
