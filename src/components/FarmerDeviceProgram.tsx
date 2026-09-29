import { useState } from 'react'
import { Tablet, Smartphone, Sun, BatteryCharging, Wifi, WifiOff, ShieldCheck, CheckCircle2, FileText, ArrowRight, X, Clock, MapPin, Sparkles, AlertCircle } from 'lucide-react'
import { Card, SectionHeader, Badge } from './ui'
import { useAuth } from '../lib/auth'
import { DeviceApplication } from '../lib/types'

const DEVICE_SPECS = [
  { icon: <Sun size={20} className="text-amber-500" />, title: 'High-Brightness Sunlight Screen', desc: '10.1-inch anti-glare display clearly readable even under direct midday field sunlight.' },
  { icon: <ShieldCheck size={20} className="text-emerald-600" />, title: 'IP68 Rugged Waterproof & Dustproof', desc: 'Protected against mud, rain, irrigation splashes, and accidental drops on rocky soil.' },
  { icon: <BatteryCharging size={20} className="text-blue-500" />, title: '3-Day Battery + Solar Compatible', desc: '10,000mAh battery supporting DC solar panel charging in off-grid rural farming huts.' },
  { icon: <WifiOff size={20} className="text-purple-500" />, title: 'Full Offline Intelligence Sync', desc: 'Stores disease guides, pest treatments, and irrigation plans locally when cellular signal drops.' },
  { icon: <Sparkles size={20} className="text-amber-500" />, title: 'Dedicated Physical Voice Button', desc: 'One-touch orange side button to instantly speak and listen in regional Indian languages.' },
  { icon: <Tablet size={20} className="text-primary-600" />, title: 'Preloaded FarmWise Suite', desc: 'Comes ready out-of-the-box with weather radar, crop doctor, and 24x7 call hotline.' },
]

const ELIGIBILITY_RULES = [
  'Smallholder or marginal farmer with agricultural landholding up to 5 hectares (12.5 acres).',
  'Resident of recognized agricultural rural districts across India.',
  'Valid Aadhaar card or PM-KISAN / State Farmer Registry identification.',
  'Active cultivator of food crops, pulses, oilseeds, fruits, or vegetables.',
  'Priority given to farmers currently without access to personal smartphones or digital advisories.',
]

const SAMPLE_APPLICATIONS: DeviceApplication[] = [
  {
    id: 'app_1',
    farmer_name: 'M. Selvaraj',
    phone: '+91 94432 10987',
    aadhaar_last4: '4821',
    land_area_hectares: 1.8,
    state: 'Tamil Nadu',
    district: 'Thanjavur',
    village: 'Papanasam',
    pin_code: '614205',
    main_crops: 'Paddy, Black Gram',
    status: 'approved',
    application_number: 'FW-TAB-82910',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export default function FarmerDeviceProgram() {
  const { profile } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [applications, setApplications] = useState<DeviceApplication[]>(SAMPLE_APPLICATIONS)
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null)

  // Application form fields
  const [form, setForm] = useState({
    farmer_name: profile?.full_name || '',
    phone: profile?.phone || '',
    aadhaar_last4: '',
    land_area_hectares: 2.0,
    state: 'Tamil Nadu',
    district: '',
    village: '',
    pin_code: '',
    main_crops: 'Rice / Wheat',
    device_reason: 'Currently sharing an old keypad phone. Need real-time weather and pest advisory for field crops.',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const appNum = `FW-TAB-${Math.floor(10000 + Math.random() * 90000)}`
    const newApp: DeviceApplication = {
      id: `app_${Date.now()}`,
      farmer_name: form.farmer_name,
      phone: form.phone,
      aadhaar_last4: form.aadhaar_last4,
      land_area_hectares: Number(form.land_area_hectares),
      state: form.state,
      district: form.district,
      village: form.village,
      pin_code: form.pin_code,
      main_crops: form.main_crops,
      device_reason: form.device_reason,
      status: 'submitted',
      application_number: appNum,
      created_at: new Date().toISOString(),
    }

    setApplications(prev => [newApp, ...prev])
    setModalOpen(false)
    setSubmittedNotice(`🎉 Application ${appNum} submitted successfully! Your district agricultural office has received your request.`)
    setTimeout(() => setSubmittedNotice(null), 8000)
  }

  return (
    <div className="animate-fadeIn space-y-6">
      <SectionHeader
        title="FarmWise Farmer Device Program"
        subtitle="Empowering smallholder farmers without smartphones through subsidized rugged smart tablets"
        icon={<Tablet size={22} className="text-primary-600" />}
      />

      {submittedNotice && (
        <div className="p-4 bg-primary-50 border border-primary-200 text-primary-800 rounded-2xl flex items-center gap-3 animate-slideIn">
          <CheckCircle2 className="text-primary-600 shrink-0" size={20} />
          <p className="text-sm font-medium">{submittedNotice}</p>
        </div>
      )}

      {/* Hero Showcase Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 text-white p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -translate-y-20 translate-x-20" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-primary-200 border border-white/10">
              <Sparkles size={14} className="text-amber-400" />
              Rural Digital Inclusion Initiative
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              FarmWise Rugged Tablet 10
            </h2>
            <p className="text-primary-100 text-sm sm:text-base leading-relaxed">
              Every farmer deserves modern technology. For rural growers without smartphones, the FarmWise Tablet Program provides a solar-compatible, ruggedized agricultural assistant preloaded with our full AI suite.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => setModalOpen(true)}
                className="px-6 py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-primary-900/40 flex items-center gap-2 transition-transform active:scale-95"
              >
                Apply for a Device <ArrowRight size={16} />
              </button>
              <div className="flex items-center gap-2 text-xs text-primary-200 bg-black/20 px-3.5 py-2 rounded-xl">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Zero Cost for Eligible Smallholders</span>
              </div>
            </div>
          </div>

          {/* Interactive Tablet Visual Frame */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-sm rounded-[2.5rem] bg-gradient-to-b from-gray-800 to-gray-900 p-3.5 shadow-2xl border-4 border-gray-700/60 ring-8 ring-primary-500/20">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-gray-950 rounded-full" />
              <div className="rounded-[2rem] overflow-hidden bg-white text-gray-900 flex flex-col h-[340px]">
                {/* Simulated Tablet Screen */}
                <div className="bg-primary-700 p-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold">FW</div>
                    <span className="font-bold text-sm">FarmWise OS 1.0</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Wifi size={12} />
                    <span>100%</span>
                  </div>
                </div>
                <div className="p-4 flex-1 bg-gray-50 flex flex-col justify-between space-y-2">
                  <div className="p-3 bg-white rounded-xl shadow-xs border border-gray-100">
                    <p className="text-[11px] font-bold text-primary-700">🌱 FIELD ADVISORY</p>
                    <p className="text-xs font-medium text-gray-800">Clear sky today • Ideal for fertilizer spray before 11 AM</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2.5 bg-primary-50 rounded-xl font-medium text-primary-800 border border-primary-100">
                      🌦️ Rain Radar
                    </div>
                    <div className="p-2.5 bg-secondary-50 rounded-xl font-medium text-secondary-800 border border-secondary-100">
                      🩺 Crop Doctor
                    </div>
                  </div>
                  <div className="p-3 bg-amber-500 text-white rounded-xl text-center font-bold text-xs flex items-center justify-center gap-2 shadow-sm">
                    <span>🎙️ Push Orange Button to Speak in Tamil/Hindi</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Grid */}
      <div>
        <h3 className="font-bold text-gray-900 text-lg mb-4">Built Specifically for Indian Farm Conditions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEVICE_SPECS.map((spec, i) => (
            <Card key={i} className="hover:border-primary-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
                {spec.icon}
              </div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">{spec.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{spec.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Eligibility & Program Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-bold text-gray-900 text-base mb-3 flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary-600" /> Eligibility Guidelines
          </h3>
          <ul className="space-y-2.5">
            {ELIGIBILITY_RULES.map((rule, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed">
                <CheckCircle2 size={15} className="text-primary-600 shrink-0 mt-0.5" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">Applications reviewed weekly</span>
            <button
              onClick={() => setModalOpen(true)}
              className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Start Application <ArrowRight size={12} />
            </button>
          </div>
        </Card>

        {/* Existing Applications Tracker */}
        <Card>
          <h3 className="font-bold text-gray-900 text-base mb-3 flex items-center gap-2">
            <Clock size={18} className="text-gray-400" /> Your Program Applications
          </h3>
          {applications.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">
              No device applications submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map(app => (
                <div key={app.id} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900">{app.application_number}</span>
                      <p className="text-[11px] text-gray-500">{app.village}, {app.district}, {app.state}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      app.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      app.status === 'dispatched' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {app.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-500 border-t border-gray-200/60 pt-2">
                    <span>Land: {app.land_area_hectares} ha ({app.main_crops})</span>
                    <span>Applied: {new Date(app.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Program Disclaimer */}
      <div className="p-4 bg-gray-100 rounded-2xl text-xs text-gray-500 flex items-start gap-3">
        <AlertCircle size={16} className="text-gray-400 shrink-0 mt-0.5" />
        <p>
          <strong>Notice:</strong> The FarmWise Farmer Device Program is an institutional and subsidy-backed initiative designed to bridge digital divides. All applications are verified with local agricultural land records prior to device shipment.
        </p>
      </div>

      {/* Application Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-slideIn max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center">
                <Tablet size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Apply for FarmWise Tablet</h3>
                <p className="text-xs text-gray-400">Rural Device Support Scheme</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Farmer Full Name</label>
                  <input
                    type="text"
                    required
                    value={form.farmer_name}
                    onChange={e => setForm({ ...form, farmer_name: e.target.value })}
                    className="input text-xs"
                    placeholder="As on Aadhaar / Land Deed"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Active Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="input text-xs"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Aadhaar (Last 4 Digits)</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={form.aadhaar_last4}
                    onChange={e => setForm({ ...form, aadhaar_last4: e.target.value.replace(/\D/g, '') })}
                    className="input text-xs"
                    placeholder="e.g. 5492"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Cultivated Land (Hectares)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={form.land_area_hectares}
                    onChange={e => setForm({ ...form, land_area_hectares: parseFloat(e.target.value) || 0 })}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">State</label>
                  <select
                    value={form.state}
                    onChange={e => setForm({ ...form, state: e.target.value })}
                    className="input text-xs"
                  >
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={form.district}
                    onChange={e => setForm({ ...form, district: e.target.value })}
                    className="input text-xs"
                    placeholder="District name"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Village & PIN</label>
                  <input
                    type="text"
                    required
                    value={form.village}
                    onChange={e => setForm({ ...form, village: e.target.value })}
                    className="input text-xs"
                    placeholder="Village / PIN"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Crops Cultivated</label>
                <input
                  type="text"
                  required
                  value={form.main_crops}
                  onChange={e => setForm({ ...form, main_crops: e.target.value })}
                  className="input text-xs"
                  placeholder="e.g. Rice, Sugarcane, Cotton"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Why do you need this device?</label>
                <textarea
                  rows={2}
                  value={form.device_reason}
                  onChange={e => setForm({ ...form, device_reason: e.target.value })}
                  className="input text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  <FileText size={16} /> Submit Device Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
