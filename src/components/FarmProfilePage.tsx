import { useState, useEffect } from 'react'
import { User, Phone, MapPin, Sprout, Droplets, Globe, Plus, Trash2, Loader2, Crown, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Card, SectionHeader, EmptyState, LoadingSpinner, Badge } from './ui'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { FarmProfile, Subscription } from '../lib/types'
import { LANGUAGES, Lang } from '../lib/i18n'
import { CROPS, SOIL_TYPES } from '../lib/agriData'
import { fetchCurrentSubscription } from '../lib/subscriptionService'

export default function FarmProfilePage({ onNavigate }: { onNavigate?: (v: string) => void }) {
  const { user, profile, updateProfile } = useAuth()
  const [farms, setFarms] = useState<FarmProfile[]>([])
  const [sub, setSub] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [showAddFarm, setShowAddFarm] = useState(false)
  const [newFarm, setNewFarm] = useState({ farm_name: '', location: '', area_hectares: 1, main_crop: 'Wheat', soil_type: 'Loamy' })
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    preferred_language: 'en',
    farming_method: 'conventional',
  })

  useEffect(() => {
    fetchCurrentSubscription(user?.id).then(setSub)
  }, [user])

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        preferred_language: profile.preferred_language || 'en',
        farming_method: profile.farming_method || 'conventional',
      })
    }
  }, [profile])

  useEffect(() => { loadFarms() }, [])

  async function loadFarms() {
    setLoading(true)
    const { data } = await supabase.from('farm_profiles').select('*').order('created_at', { ascending: true })
    setFarms(data || [])
    setLoading(false)
  }

  async function saveProfile() {
    setSavingProfile(true)
    await updateProfile(profileForm)
    setSavingProfile(false)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  async function addFarm() {
    if (!newFarm.farm_name || !newFarm.location) return
    await supabase.from('farm_profiles').insert(newFarm)
    setNewFarm({ farm_name: '', location: '', area_hectares: 1, main_crop: 'Wheat', soil_type: 'Loamy' })
    setShowAddFarm(false)
    loadFarms()
  }

  async function deleteFarm(id: string) {
    await supabase.from('farm_profiles').delete().eq('id', id)
    loadFarms()
  }

  return (
    <div className="animate-fadeIn space-y-6">
      <SectionHeader
        title="Farm Profile"
        subtitle="Manage your farmer details and farm information"
        icon={<User size={20} />}
      />

      {/* User profile */}
      <Card>
        <h3 className="font-semibold mb-4">Farmer Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={profileForm.full_name} onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })} placeholder="Your name" />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input className="input" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="+91-XXXXXXXXXX" />
          </div>
          <div>
            <label className="label">Preferred Language</label>
            <select className="input" value={profileForm.preferred_language} onChange={e => setProfileForm({ ...profileForm, preferred_language: e.target.value })}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Farming Method</label>
            <select className="input" value={profileForm.farming_method} onChange={e => setProfileForm({ ...profileForm, farming_method: e.target.value })}>
              <option value="conventional">Conventional</option>
              <option value="organic">Organic</option>
              <option value="mixed">Mixed</option>
              <option value="hydroponic">Hydroponic</option>
            </select>
          </div>
        </div>
        <button className="btn-primary mt-4 flex items-center gap-2" onClick={saveProfile} disabled={savingProfile}>
          {savingProfile ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : profileSaved ? 'Saved!' : 'Save Profile'}
        </button>
      </Card>

      {/* Membership & Subscription Status */}
      <Card className="border border-primary-100 bg-gradient-to-r from-primary-50/50 via-white to-amber-50/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              sub?.plan_type === 'premium' ? 'bg-amber-500 text-white shadow-md' : 'bg-primary-100 text-primary-700'
            }`}>
              {sub?.plan_type === 'premium' ? <Crown size={24} /> : <Sprout size={24} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-base">
                  {sub?.plan_type === 'premium' ? 'FarmWise Premium Plan' : 'Free Farmer Plan'}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  sub?.plan_type === 'premium' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {sub?.plan_type === 'premium' ? 'ACTIVE' : 'STANDARD'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {sub?.plan_type === 'premium'
                  ? `Unlimited Voice AI, 24x7 Agronomist Hotline & Market Radar (${sub.billing_cycle})`
                  : 'Access basic weather forecasts, disease detection (5/mo), and soil calculation.'}
              </p>
            </div>
          </div>
          <div>
            <button
              onClick={() => onNavigate && onNavigate('subscription')}
              className="btn-primary text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles size={14} /> {sub?.plan_type === 'premium' ? 'Manage Membership' : 'Upgrade to Premium'}
            </button>
          </div>
        </div>
      </Card>

      {/* Farms */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">My Farms</h3>
          <button onClick={() => setShowAddFarm(!showAddFarm)} className="btn-secondary text-sm flex items-center gap-2">
            <Plus size={16} /> Add Farm
          </button>
        </div>

        {showAddFarm && (
          <div className="p-4 bg-gray-50 rounded-xl mb-4 animate-fadeIn space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="input" placeholder="Farm name" value={newFarm.farm_name} onChange={e => setNewFarm({ ...newFarm, farm_name: e.target.value })} />
              <input className="input" placeholder="Location" value={newFarm.location} onChange={e => setNewFarm({ ...newFarm, location: e.target.value })} />
              <select className="input" value={newFarm.main_crop} onChange={e => setNewFarm({ ...newFarm, main_crop: e.target.value })}>
                {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="input" value={newFarm.soil_type} onChange={e => setNewFarm({ ...newFarm, soil_type: e.target.value })}>
                {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="sm:col-span-2">
                <label className="label">Area (hectares)</label>
                <input type="number" step="0.5" min="0.5" className="input" value={newFarm.area_hectares} onChange={e => setNewFarm({ ...newFarm, area_hectares: +e.target.value })} />
              </div>
            </div>
            <button className="btn-primary w-full" onClick={addFarm}>Add Farm</button>
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : farms.length === 0 ? (
          <EmptyState message="No farms added yet. Click 'Add Farm' to create one." icon={<MapPin size={40} />} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {farms.map(farm => (
              <div key={farm.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{farm.farm_name}</h4>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5"><MapPin size={13} /> {farm.location}</p>
                  </div>
                  <button onClick={() => deleteFarm(farm.id)} className="text-gray-300 hover:text-error-500 transition-colors p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400">Area</p>
                    <p className="font-semibold text-sm">{farm.area_hectares} ha</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400">Crop</p>
                    <p className="font-semibold text-sm">{farm.main_crop || '—'}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400">Soil</p>
                    <p className="font-semibold text-sm">{farm.soil_type || '—'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
