import { supabase } from './supabase'
import { Subscription, PlanType, BillingCycle } from './types'

const LOCAL_STORAGE_KEY = 'farmwise_subscription'

const DEFAULT_FREE_SUBSCRIPTION: Subscription = {
  id: 'sub_free',
  plan_type: 'free',
  billing_cycle: 'monthly',
  status: 'active',
  amount: 0,
  started_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
}

export const PLAN_PRICING = {
  monthly: {
    price: 299,
    savingsText: '',
    period: 'per month',
  },
  yearly: {
    price: 2499,
    savingsText: 'Save 30% (₹208/mo)',
    period: 'per year',
  },
}

export const EXCLUSIVE_FEATURES = [
  { id: 'voice_ai', name: 'AI Multilingual Voice Assistant', free: false, premium: true, desc: 'Speak and listen in 6 Indian languages' },
  { id: 'weather_alerts', name: 'Hyperlocal Severe Weather Audio Radar', free: false, premium: true, desc: 'Real-time cyclone, frost, and flood voice alerts' },
  { id: 'market_intel', name: 'Advanced Market Price Forecasts', free: false, premium: true, desc: '14-day price prediction & best mandi recommendations' },
  { id: 'disease_ai', name: 'Unlimited Crop Disease Diagnostics', free: '5 scans/month', premium: 'Unlimited High-Res', desc: 'Detailed pesticide dosing & treatment calendar' },
  { id: 'progress_tracker', name: 'Full Farm Progress Timeline & Logs', free: 'Basic stages', premium: 'Advanced tasks & harvest forecast', desc: 'Milestone tracking & stage-by-stage guidance' },
  { id: 'support_priority', name: '24x7 Priority Human Agronomist Call Support', free: 'Chatbot only', premium: 'Direct phone & video callback', desc: 'Dedicated regional agricultural scientists' },
  { id: 'satellite_ndvi', name: 'Satellite Soil & Vegetation Health Reports', free: false, premium: true, desc: 'Weekly satellite moisture and nitrogen heatmaps' },
  { id: 'device_subsidy', name: 'Priority Device Program Eligibility', free: 'Standard queue', premium: 'Priority approval & shipping', desc: 'Free FarmWise rugged tablet consideration' },
]

export async function fetchCurrentSubscription(userId?: string): Promise<Subscription> {
  // 1. Try Supabase if table exists & user logged in
  if (userId) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!error && data) {
        return data as Subscription
      }
    } catch {
      // fallback to local storage
    }
  }

  // 2. Check localStorage
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved) as Subscription
    }
  } catch {
    // ignore
  }

  return DEFAULT_FREE_SUBSCRIPTION
}

export async function saveSubscription(sub: Subscription, userId?: string): Promise<Subscription> {
  // Save locally
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sub))
  } catch {
    // ignore
  }

  // Try saving to Supabase
  if (userId) {
    try {
      await supabase.from('subscriptions').insert({
        user_id: userId,
        plan_type: sub.plan_type,
        billing_cycle: sub.billing_cycle,
        status: sub.status,
        amount: sub.amount,
        payment_method: sub.payment_method || 'demo_payment',
        started_at: sub.started_at,
        expires_at: sub.expires_at,
      })
    } catch {
      // ignore
    }
  }

  return sub
}

export async function upgradeToPremium(
  cycle: BillingCycle,
  paymentMethod: string,
  userId?: string
): Promise<Subscription> {
  const days = cycle === 'yearly' ? 365 : 30
  const amount = PLAN_PRICING[cycle].price

  const newSub: Subscription = {
    id: `sub_${Math.random().toString(36).slice(2, 9)}`,
    user_id: userId,
    plan_type: 'premium',
    billing_cycle: cycle,
    status: 'active',
    amount,
    payment_method: paymentMethod,
    started_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  }

  return await saveSubscription(newSub, userId)
}

export async function cancelSubscription(userId?: string): Promise<Subscription> {
  const canceled: Subscription = {
    ...DEFAULT_FREE_SUBSCRIPTION,
    plan_type: 'free',
  }
  return await saveSubscription(canceled, userId)
}
