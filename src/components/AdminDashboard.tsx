import { useState, useEffect } from 'react'
import { Shield, Users, Sprout, Bug, Handshake, Droplets, TrendingUp, BarChart3, Leaf } from 'lucide-react'
import { Card, SectionHeader, LoadingSpinner, StatCard, Badge } from './ui'
import { supabase } from '../lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalFarmers: 0,
    activeFarms: 0,
    cropsTracked: 0,
    diseaseAnalyses: 0,
    buyerConnections: 0,
    waterSaved: 0,
  })
  const [loading, setLoading] = useState(true)
  const [cropPrices, setCropPrices] = useState<{ crop_name: string; price_per_kg: number; trend: string }[]>([])
  const [buyers, setBuyers] = useState<{ buyer_name: string; crop_name: string; rating: number }[]>([])

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [farms, disease, buyersCount, prices, buyersData, irrigation, profiles, soil] = await Promise.all([
      supabase.from('farm_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('disease_reports').select('id', { count: 'exact', head: true }),
      supabase.from('buyers').select('id', { count: 'exact', head: true }),
      supabase.from('crop_prices').select('crop_name, price_per_kg, trend').order('recorded_date', { ascending: false }).limit(10),
      supabase.from('buyers').select('buyer_name, crop_name, rating').limit(10),
      supabase.from('irrigation_logs').select('water_saved_liters'),
      supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('soil_records').select('id', { count: 'exact', head: true }),
    ])
    const waterSaved = irrigation.data?.reduce((s: number, l: any) => s + (l.water_saved_liters || 0), 0) || 0
    setStats({
      totalFarmers: profiles.count || 0,
      activeFarms: farms.count || 0,
      cropsTracked: new Set(prices.data?.map(p => p.crop_name)).size || 0,
      diseaseAnalyses: disease.count || 0,
      buyerConnections: buyersCount.count || 0,
      waterSaved,
    })
    setCropPrices(prices.data || [])
    setBuyers(buyersData.data || [])
    setLoading(false)
  }

  return (
    <div className="animate-fadeIn space-y-6">
      <SectionHeader
        title="Admin Dashboard"
        subtitle="Platform analytics and system overview"
        icon={<Shield size={20} />}
      />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard icon={<Users size={20} />} label="Total Farmers" value={stats.totalFarmers} color="primary" />
            <StatCard icon={<Sprout size={20} />} label="Active Farms" value={stats.activeFarms} color="secondary" />
            <StatCard icon={<Leaf size={20} />} label="Crops Tracked" value={stats.cropsTracked} color="accent" />
            <StatCard icon={<Bug size={20} />} label="Disease Analyses" value={stats.diseaseAnalyses} color="error" />
            <StatCard icon={<Handshake size={20} />} label="Buyer Connections" value={stats.buyerConnections} color="primary" />
            <StatCard icon={<Droplets size={20} />} label="Water Saved (L)" value={stats.waterSaved.toLocaleString()} color="secondary" />
          </div>

          {/* Management sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Crop database */}
            <Card>
              <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 size={18} className="text-primary-500" /> Crop Price Database</h3>
              <div className="space-y-2">
                {cropPrices.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">{p.crop_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">₹{p.price_per_kg}/kg</span>
                      <Badge color={p.trend === 'up' ? 'green' : p.trend === 'down' ? 'red' : 'gray'}>{p.trend}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Buyer management */}
            <Card>
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Handshake size={18} className="text-primary-500" /> Buyer Directory</h3>
              <div className="space-y-2">
                {buyers.map((b, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{b.buyer_name}</p>
                      <p className="text-xs text-gray-500">Buys: {b.crop_name}</p>
                    </div>
                    <Badge color="green">★ {b.rating}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* System analytics */}
          <Card>
            <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-primary-500" /> System Analytics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Soil Records Analyzed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.diseaseAnalyses + stats.activeFarms}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Average Water Saved/Farm</p>
                <p className="text-2xl font-bold text-primary-600">{stats.activeFarms > 0 ? Math.round(stats.waterSaved / stats.activeFarms).toLocaleString() : 0} L</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Active Crop Varieties</p>
                <p className="text-2xl font-bold text-secondary-600">{stats.cropsTracked}</p>
              </div>
            </div>
          </Card>

          {/* Management links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { label: 'User Management', icon: <Users size={20} />, count: stats.totalFarmers },
              { label: 'Farm Management', icon: <Sprout size={20} />, count: stats.activeFarms },
              { label: 'Disease Database', icon: <Bug size={20} />, count: 16 },
              { label: 'Market Data', icon: <BarChart3 size={20} />, count: stats.cropsTracked },
              { label: 'Buyer Management', icon: <Handshake size={20} />, count: stats.buyerConnections },
              { label: 'Weather Alerts', icon: <TrendingUp size={20} />, count: 3 },
              { label: 'AI Usage', icon: <Shield size={20} />, count: 'Active' },
              { label: 'System Reports', icon: <BarChart3 size={20} />, count: 'View' },
            ].map((item, i) => (
              <div key={i} className="card card-hover text-center">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-2">
                  {item.icon}
                </div>
                <p className="text-sm font-medium text-gray-700">{item.label}</p>
                <p className="text-xs text-gray-400 mt-1">{item.count}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
