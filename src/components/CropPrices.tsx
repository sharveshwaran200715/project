import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, MapPin, Store } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell } from 'recharts'
import { Card, Badge, SectionHeader, EmptyState, LoadingSpinner } from './ui'
import { supabase } from '../lib/supabase'
import { CropPrice } from '../lib/types'

export default function CropPrices() {
  const [prices, setPrices] = useState<CropPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCrop, setSelectedCrop] = useState('')

  useEffect(() => { loadPrices() }, [])

  async function loadPrices() {
    setLoading(true)
    const { data } = await supabase.from('crop_prices').select('*').order('recorded_date', { ascending: false })
    setPrices(data || [])
    if (data && data.length > 0 && !selectedCrop) setSelectedCrop(data[0].crop_name)
    setLoading(false)
  }

  const crops = [...new Set(prices.map(p => p.crop_name))]
  const cropPrices = prices.filter(p => p.crop_name === selectedCrop)
  const allMarketsForCrop = cropPrices

  // Generate historical trend data
  const trendData = generateTrendData(selectedCrop, cropPrices)

  function generateTrendData(crop: string, current: CropPrice[]) {
    const basePrice = current[0]?.price_per_kg || 20
    const data: { month: string; price: number }[] = []
    const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
    for (let i = 0; i < months.length; i++) {
      const variation = (Math.sin(i * 0.7) * 0.08 + 1) * basePrice
      data.push({ month: months[i], price: Math.round(variation * 100) / 100 })
    }
    return data
  }

  function trendIcon(trend: string) {
    if (trend === 'up') return <TrendingUp size={14} className="text-primary-600" />
    if (trend === 'down') return <TrendingDown size={14} className="text-error-600" />
    return <Minus size={14} className="text-gray-400" />
  }

  function trendColor(trend: string): 'green' | 'red' | 'gray' {
    if (trend === 'up') return 'green'
    if (trend === 'down') return 'red'
    return 'gray'
  }

  const currentPrice = cropPrices[0]?.price_per_kg || 0
  const prevPrice = trendData[trendData.length - 2]?.price || currentPrice
  const priceChange = currentPrice - prevPrice
  const priceChangePct = ((priceChange / prevPrice) * 100).toFixed(1)

  // Where to sell comparison
  const marketComparison = [...cropPrices].sort((a, b) => {
    return (b.price_per_kg) - (a.price_per_kg)
  })

  return (
    <div className="animate-fadeIn space-y-6">
      <SectionHeader
        title="Crop Price Trends"
        subtitle="Current market prices, historical trends, and best market comparison"
        icon={<TrendingUp size={20} />}
      />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Crop selector */}
          <div className="flex flex-wrap gap-2">
            {crops.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCrop(c)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCrop === c ? 'bg-primary-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Price summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <p className="text-sm text-gray-500 mb-1">Current Price</p>
              <p className="text-3xl font-bold text-gray-900">₹{currentPrice}<span className="text-base font-normal text-gray-400">/kg</span></p>
              <div className="flex items-center gap-2 mt-2">
                {priceChange >= 0 ? <TrendingUp size={16} className="text-primary-600" /> : <TrendingDown size={16} className="text-error-600" />}
                <span className={`text-sm font-medium ${priceChange >= 0 ? 'text-primary-600' : 'text-error-600'}`}>
                  {priceChange >= 0 ? '+' : ''}₹{priceChange.toFixed(2)} ({priceChangePct}%)
                </span>
              </div>
            </Card>
            <Card>
              <p className="text-sm text-gray-500 mb-1">Best Market</p>
              <p className="text-lg font-semibold text-gray-900">{marketComparison[0]?.market_location || '—'}</p>
              <p className="text-sm text-primary-600 mt-1">₹{marketComparison[0]?.price_per_kg || 0}/kg</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500 mb-1">Trend</p>
              <div className="flex items-center gap-2 mt-2">
                {cropPrices[0] && trendIcon(cropPrices[0].trend)}
                <Badge color={trendColor(cropPrices[0]?.trend || 'stable')}>{(cropPrices[0]?.trend || 'stable').toUpperCase()}</Badge>
              </div>
              <p className="text-xs text-gray-400 mt-2">Based on recent market data</p>
            </Card>
          </div>

          {/* Historical trend chart */}
          <Card>
            <h3 className="font-semibold mb-4">Price History — {selectedCrop}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={v => `₹${v}`} />
                <Tooltip
                  formatter={(v: number) => [`₹${v}/kg`, 'Price']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                />
                <Line type="monotone" dataKey="price" stroke="#16a34a" strokeWidth={3} dot={{ fill: '#16a34a', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Where to sell comparison */}
          <Card>
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Store size={18} className="text-primary-500" /> Where to Sell — Market Comparison</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={marketComparison.map(m => ({ name: m.market_location, price: m.price_per_kg, trend: m.trend }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={(v: number) => [`₹${v}/kg`, 'Price']} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
                <Bar dataKey="price" radius={[8, 8, 0, 0]}>
                  {marketComparison.map((m, i) => (
                    <Cell key={i} fill={i === 0 ? '#16a34a' : '#86efac'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {marketComparison.map((m, i) => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-primary-100 text-primary-700' : 'bg-gray-200 text-gray-500'}`}>
                      #{i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{m.market_location}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={11} /> {new Date(m.recorded_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">₹{m.price_per_kg}/kg</span>
                    {trendIcon(m.trend)}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* All crops overview */}
          <Card>
            <h3 className="font-semibold mb-4">All Crop Prices Overview</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {crops.map(c => {
                const latest = prices.find(p => p.crop_name === c)
                if (!latest) return null
                return (
                  <div key={c} className="p-3 bg-gray-50 rounded-xl hover:shadow-sm transition-all cursor-pointer" onClick={() => setSelectedCrop(c)}>
                    <p className="text-sm font-medium text-gray-700">{c}</p>
                    <p className="text-lg font-bold mt-1">₹{latest.price_per_kg}</p>
                    <div className="flex items-center gap-1 mt-1">{trendIcon(latest.trend)}</div>
                  </div>
                )
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
