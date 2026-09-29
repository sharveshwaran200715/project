import { useState, useMemo } from 'react'
import { CloudRain, Sun, Cloud, CloudLightning, Wind, Droplets, Thermometer, AlertTriangle, CheckCircle, CloudDrizzle, Umbrella, Eye } from 'lucide-react'
import { Badge } from './ui'
import { generateWeatherForecast, getFarmingAction, WeatherData } from '../lib/agriData'

function WeatherIcon({ condition, size = 24, className = '' }: { condition: string; size?: number; className?: string }) {
  if (condition.includes('Rain')) return <CloudRain size={size} className={`text-sky-400 ${className}`} />
  if (condition.includes('Cloud')) return <Cloud size={size} className={`text-gray-400 ${className}`} />
  if (condition.includes('Sunny') || condition.includes('Clear')) return <Sun size={size} className={`text-amber-400 ${className}`} />
  if (condition.includes('storm') || condition.includes('Thunder')) return <CloudLightning size={size} className={`text-amber-500 ${className}`} />
  if (condition.includes('Drizzle')) return <CloudDrizzle size={size} className={`text-sky-300 ${className}`} />
  return <Cloud size={size} className={`text-gray-400 ${className}`} />
}

function priorityColor(priority: string): 'green' | 'amber' | 'red' {
  if (priority === 'high') return 'red'
  if (priority === 'medium') return 'amber'
  return 'green'
}

function priorityIcon(icon: string, size = 18) {
  const map: Record<string, JSX.Element> = {
    rain: <CloudRain size={size} />, flood: <Droplets size={size} />, sun: <Sun size={size} />,
    mulch: <CloudDrizzle size={size} />, check: <CheckCircle size={size} />, spray: <Wind size={size} />,
    alert: <AlertTriangle size={size} />, wind: <Wind size={size} />,
  }
  return map[icon] || <CheckCircle size={size} />
}

export default function Weather() {
  const [forecast] = useState<WeatherData[]>(() => generateWeatherForecast())
  const today = forecast[0]
  const farmingActions = useMemo(() => getFarmingAction(today), [today])
  const extremes = useMemo(() => ({
    highRainDays: forecast.filter(d => d.rainChance > 70),
    heatDays: forecast.filter(d => d.tempHigh > 35),
  }), [forecast])

  const rainBar = (chance: number) => {
    const col = chance > 70 ? 'bg-red-500' : chance > 40 ? 'bg-amber-400' : 'bg-sky-400'
    return <div className="health-bar flex-1"><div className={`health-bar-fill ${col}`} style={{ width: `${chance}%` }} /></div>
  }

  return (
    <div className="animate-fadeIn space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl hero-gradient p-6 sm:p-8 text-white">
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-green-300/70 text-sm font-medium mb-1">Live Weather Intelligence</p>
              <h1 className="text-2xl sm:text-3xl font-black">Weather & Climate</h1>
              <p className="text-green-200/70 text-sm mt-1">7-day forecast with smart farming recommendations</p>
            </div>
            <div className="text-right">
              <div className="flex items-end gap-1 justify-end">
                <WeatherIcon condition={today.condition} size={60} />
              </div>
              <p className="text-5xl font-black mt-1">{today.tempHigh}°</p>
              <p className="text-green-300/80 text-sm">{today.condition}</p>
            </div>
          </div>

          {/* Today's quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Thermometer, label: 'High / Low', value: `${today.tempHigh}° / ${today.tempLow}°C` },
              { icon: Droplets, label: 'Humidity', value: `${today.humidity}%` },
              { icon: CloudRain, label: 'Rain Chance', value: `${today.rainChance}%` },
              { icon: Wind, label: 'Wind Speed', value: `${today.windSpeed} km/h` },
            ].map(({ icon: Icon, label, value }, i) => (
              <div key={i} className="stat-card-glass px-3 py-3 rounded-xl">
                <Icon size={15} className="text-green-300/70 mb-1.5" />
                <p className="text-[10px] text-green-300/60 uppercase font-semibold tracking-wide">{label}</p>
                <p className="text-sm font-black text-white mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(extremes.heatDays.length > 0 || extremes.highRainDays.length > 0) && (
        <div className="space-y-3">
          {extremes.heatDays.length > 0 && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="font-bold text-red-700 mb-0.5">⚠️ Heat / Drought Alert</p>
                <p className="text-sm text-red-600 leading-relaxed">{extremes.heatDays.length} day(s) with temperatures above 35°C expected. Increase irrigation frequency and provide shade for sensitive crops.</p>
              </div>
            </div>
          )}
          {extremes.highRainDays.length > 0 && (
            <div className="flex items-start gap-3 p-4 bg-sky-50 border border-sky-200 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
                <Umbrella size={20} className="text-sky-600" />
              </div>
              <div>
                <p className="font-bold text-sky-700 mb-0.5">🌧️ Heavy Rain Warning</p>
                <p className="text-sm text-sky-600 leading-relaxed">{extremes.highRainDays.length} day(s) with high rain probability. Ensure drainage is clear and delay chemical applications.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {extremes.heatDays.length === 0 && extremes.highRainDays.length === 0 && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <div>
            <p className="font-bold text-green-700 mb-0.5">✅ Clear Weather Week</p>
            <p className="text-sm text-green-600 leading-relaxed">No extreme weather conditions expected. Conditions are favorable for normal farming activities this week.</p>
          </div>
        </div>
      )}

      {/* 7-Day Forecast */}
      <div className="card">
        <h3 className="font-black text-lg mb-5">📅 7-Day Forecast</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {forecast.map((day, i) => (
            <div key={i} className={`rounded-2xl p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md ${
              i === 0
                ? 'bg-gradient-to-br from-green-600 to-emerald-700 text-white shadow-lg shadow-green-200'
                : 'bg-gray-50 hover:bg-green-50'
            }`}>
              <p className={`text-xs font-bold mb-2 ${i === 0 ? 'text-green-200' : 'text-gray-500'}`}>
                {i === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
              </p>
              <div className="flex justify-center mb-2">
                <WeatherIcon condition={day.condition} size={32} />
              </div>
              <p className={`text-lg font-black ${i === 0 ? 'text-white' : 'text-gray-900'}`}>{day.tempHigh}°</p>
              <p className={`text-xs ${i === 0 ? 'text-green-200' : 'text-gray-400'}`}>{day.tempLow}°</p>
              <div className={`flex items-center justify-center gap-1 mt-2 text-xs font-medium ${i === 0 ? 'text-green-200' : 'text-sky-500'}`}>
                <CloudRain size={11} />
                <span>{day.rainChance}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rain Probability Chart */}
      <div className="card">
        <h3 className="font-black text-lg mb-5 flex items-center gap-2">
          <CloudRain size={20} className="text-sky-500" /> Rain Probability — 7 Days
        </h3>
        <div className="space-y-3">
          {forecast.map((day, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-xs text-gray-500 font-medium w-12 shrink-0">
                {i === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
              </span>
              {rainBar(day.rainChance)}
              <span className={`text-xs font-bold w-10 text-right shrink-0 ${
                day.rainChance > 70 ? 'text-red-500' : day.rainChance > 40 ? 'text-amber-600' : 'text-gray-400'
              }`}>{day.rainChance}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Farming Actions */}
      <div className="card">
        <h3 className="font-black text-lg mb-5 flex items-center gap-2">
          🌱 Farming Action Recommendations
          <span className="ml-auto text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">Today</span>
        </h3>
        <div className="space-y-3">
          {farmingActions.map((action, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 hover:bg-green-50/50 rounded-2xl transition-colors animate-slideIn" style={{ animationDelay: `${i * 60}ms` }}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                action.priority === 'high' ? 'bg-red-100 text-red-600' :
                action.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                'bg-green-100 text-green-600'
              }`}>
                {priorityIcon(action.icon)}
              </div>
              <div className="flex-1">
                <Badge color={priorityColor(action.priority)}>{action.priority.toUpperCase()}</Badge>
                <p className="text-sm text-gray-700 leading-relaxed">{action.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
