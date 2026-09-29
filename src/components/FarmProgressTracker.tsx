import { useState, useEffect } from 'react'
import { Sprout, CheckCircle2, Circle, Clock, Calendar, CheckSquare, Square, ChevronRight, Plus, AlertCircle, ArrowUpRight, Leaf, Shield, Award } from 'lucide-react'
import { Card, SectionHeader, Badge, ProgressBar } from './ui'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { FarmProfile, CropRecord, FarmProgressStage } from '../lib/types'

const DEFAULT_STAGES: FarmProgressStage[] = [
  {
    id: 1,
    name: 'Farm Setup',
    description: 'Land boundary verification, bund strengthening, and irrigation channel cleaning.',
    tasks: [
      { id: '1-1', title: 'Inspect and clear drainage channels around perimeter', completed: true },
      { id: '1-2', title: 'Check water pump and motor electrical safety', completed: true },
    ],
    tips: 'Clear weeds along borders to eliminate natural pests before planting starts.',
    recommendedTools: ['Tractor / Plough', 'Laser Land Leveler'],
  },
  {
    id: 2,
    name: 'Soil Preparation',
    description: 'Deep ploughing, farmyard manure (FYM) mixing, and soil test nutrient assessment.',
    tasks: [
      { id: '2-1', title: 'Complete soil testing for N-P-K & pH status', completed: true },
      { id: '2-2', title: 'Incorporate 10 tonnes/ha decomposed organic compost', completed: true },
      { id: '2-3', title: 'Secondary harrowing to achieve fine tilth', completed: true },
    ],
    tips: 'Aim for a soil pH between 6.2 and 7.2 for optimal macronutrient uptake.',
    recommendedTools: ['Rotavator', 'Soil Health Kit'],
  },
  {
    id: 3,
    name: 'Seed Selection',
    description: 'Choosing certified high-yield seeds and bio-fungicide seed priming.',
    tasks: [
      { id: '3-1', title: 'Procure certified high-germination seed variety', completed: true },
      { id: '3-2', title: 'Treat seeds with Trichoderma or Azospirillum bio-culture', completed: true },
    ],
    tips: 'Seed treatment prevents seed-borne fungal infections by up to 80%.',
    recommendedTools: ['Seed Treatment Drum', 'Certified Seed Tag'],
  },
  {
    id: 4,
    name: 'Planting / Sowing',
    description: 'Direct sowing or nursery transplanting at recommended row spacing.',
    tasks: [
      { id: '4-1', title: 'Sow seeds at optimal depth (3–4 cm)', completed: true },
      { id: '4-2', title: 'Maintain row-to-row spacing of 20 cm', completed: true },
      { id: '4-3', title: 'Initial light germination irrigation', completed: true },
    ],
    tips: 'Morning sowing helps prevent heat stress on emerging seedlings.',
    recommendedTools: ['Seed Drill Machine', 'Drip Lateral Lines'],
  },
  {
    id: 5,
    name: 'Irrigation Scheduling',
    description: 'Controlled moisture management through critical root development stages.',
    tasks: [
      { id: '5-1', title: 'First crown root initiation watering', completed: true },
      { id: '5-2', title: 'Inspect soil moisture tensiometer reading', completed: false },
      { id: '5-3', title: 'Clean drip emitters and sand filters', completed: false },
    ],
    tips: 'Water during early morning to minimize solar evaporation losses by 30%.',
    recommendedTools: ['Soil Moisture Sensor', 'Drip Automation Timer'],
  },
  {
    id: 6,
    name: 'Fertilization & Nutrition',
    description: 'Split nitrogen application and foliar micronutrient feeding.',
    tasks: [
      { id: '6-1', title: 'Apply first top-dress Urea at tillering phase', completed: false },
      { id: '6-2', title: 'Spray Zinc Sulphate + Ferrous micronutrient solution', completed: false },
    ],
    tips: 'Never apply urea immediately before heavy rains to avoid leaching losses.',
    recommendedTools: ['Fertilizer Spreader', 'Knapsack Sprayer'],
  },
  {
    id: 7,
    name: 'Crop Growth & Monitoring',
    description: 'Vegetative expansion, canopy closure, and weed removal.',
    tasks: [
      { id: '7-1', title: 'Conduct mechanical or manual weeding', completed: false },
      { id: '7-2', title: 'Record plant height and tiller count', completed: false },
    ],
    tips: 'Keep the critical 30–45 days post-sowing completely weed-free.',
    recommendedTools: ['Cono Weeder', 'Crop Health Camera'],
  },
  {
    id: 8,
    name: 'Pest & Disease Scouting',
    description: 'Bi-weekly leaf inspection, pheromone traps, and bio-pesticide control.',
    tasks: [
      { id: '8-1', title: 'Install yellow sticky traps for sucking pests', completed: false },
      { id: '8-2', title: 'Scan leaves using FarmWise AI disease doctor', completed: false },
    ],
    tips: 'Inspect leaf undersides where early aphid and mite colonies gather.',
    recommendedTools: ['Pheromone Traps', 'Neem Oil Spray'],
  },
  {
    id: 9,
    name: 'Harvest Stage',
    description: 'Grain maturity check, moisture drying, and clean harvesting.',
    tasks: [
      { id: '9-1', title: 'Confirm grain moisture content below 14%', completed: false },
      { id: '9-2', title: 'Combine harvest and thresh under dry weather', completed: false },
      { id: '9-3', title: 'Pack into moisture-proof aerated bags', completed: false },
    ],
    tips: 'Harvest when 85% of ears have turned golden yellow.',
    recommendedTools: ['Combine Harvester', 'Grain Moisture Meter'],
  },
  {
    id: 10,
    name: 'Selling & Market Realization',
    description: 'Mandi price comparison, quality grading, and direct buyer linkage.',
    tasks: [
      { id: '10-1', title: 'Compare APMC mandi rates vs private buyers on FarmWise', completed: false },
      { id: '10-2', title: 'Arrange transport logistics with verified buyer', completed: false },
      { id: '10-3', title: 'Record net realization & profit in calculator', completed: false },
    ],
    tips: 'Graded and cleaned grain commands a 10–15% premium price in mandis.',
    recommendedTools: ['FarmWise Market Radar', 'Digital Weighing Scale'],
  },
]

export default function FarmProgressTracker() {
  const { user } = useAuth()
  const [stages, setStages] = useState<FarmProgressStage[]>(DEFAULT_STAGES)
  const [activeStageId, setActiveStageId] = useState<number>(5) // Stage 5: Irrigation
  const [farm, setFarm] = useState<FarmProfile | null>(null)
  const [plantingDate, setPlantingDate] = useState<string>('2026-08-15')
  const [expectedHarvestDate, setExpectedHarvestDate] = useState<string>('2026-11-20')
  const [cropName, setCropName] = useState<string>('Wheat (HD-2967)')

  useEffect(() => {
    async function loadFarmData() {
      const [farmRes, cropRes] = await Promise.all([
        supabase.from('farm_profiles').select('*').limit(1).maybeSingle(),
        supabase.from('crop_records').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
      ])

      if (farmRes.data) {
        setFarm(farmRes.data)
        if (farmRes.data.main_crop) setCropName(farmRes.data.main_crop)
      }

      if (cropRes.data) {
        if (cropRes.data.crop_name) setCropName(cropRes.data.crop_name)
        if (cropRes.data.planting_date) setPlantingDate(cropRes.data.planting_date)
      }
    }
    loadFarmData()
  }, [])

  // Calculate crop age in days
  const plantedTime = new Date(plantingDate).getTime()
  const nowTime = new Date().getTime()
  const cropAgeDays = Math.max(0, Math.floor((nowTime - plantedTime) / (1000 * 60 * 60 * 24)))

  const harvestTime = new Date(expectedHarvestDate).getTime()
  const daysToHarvest = Math.max(0, Math.ceil((harvestTime - nowTime) / (1000 * 60 * 60 * 24)))

  // Calculate overall progress percentage
  const totalTasks = stages.reduce((acc, s) => acc + s.tasks.length, 0)
  const completedTasks = stages.reduce((acc, s) => acc + s.tasks.filter(t => t.completed).length, 0)
  const progressPct = Math.round((completedTasks / totalTasks) * 100)

  function toggleTask(stageId: number, taskId: string) {
    setStages(prev =>
      prev.map(s => {
        if (s.id !== stageId) return s
        return {
          ...s,
          tasks: s.tasks.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
        }
      })
    )
  }

  const currentStage = stages.find(s => s.id === activeStageId) || stages[4]

  return (
    <div className="animate-fadeIn space-y-6">
      <SectionHeader
        title="Farm Progress Tracker"
        subtitle="Step-by-step lifecycle monitoring from seedbed to harvest and market sale"
        icon={<Sprout size={22} className="text-primary-600" />}
      />

      {/* Overview Metric Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-primary-700 via-primary-600 to-secondary-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-primary-100">
              <Leaf size={14} className="text-emerald-300" /> Active Crop: {cropName}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Stage {activeStageId} of 10: {currentStage.name}
            </h2>
            <p className="text-primary-100 text-xs sm:text-sm max-w-xl">
              {currentStage.description}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-black/20 p-4 rounded-2xl backdrop-blur-sm text-center">
            <div className="px-2">
              <p className="text-[11px] text-primary-200">Crop Age</p>
              <p className="text-xl sm:text-2xl font-black text-white">{cropAgeDays} <span className="text-xs font-normal">days</span></p>
            </div>
            <div className="px-2 border-x border-white/10">
              <p className="text-[11px] text-primary-200">Harvest In</p>
              <p className="text-xl sm:text-2xl font-black text-white">{daysToHarvest} <span className="text-xs font-normal">days</span></p>
            </div>
            <div className="px-2">
              <p className="text-[11px] text-primary-200">Completed</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-300">{progressPct}%</p>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex justify-between text-xs text-primary-200 mb-2">
            <span>Overall Lifecycle Completion</span>
            <span>{completedTasks} of {totalTasks} milestones achieved</span>
          </div>
          <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 10-Stage Horizontal Scrollable Timeline */}
      <Card className="p-4 overflow-hidden">
        <h3 className="font-bold text-sm text-gray-700 mb-3 px-1">Farming Journey Timeline</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {stages.map((stage) => {
            const isCompleted = stage.tasks.every(t => t.completed)
            const isCurrent = stage.id === activeStageId
            const isPast = stage.id < activeStageId

            return (
              <button
                key={stage.id}
                onClick={() => setActiveStageId(stage.id)}
                className={`flex-shrink-0 min-w-[130px] p-3 rounded-2xl border text-left transition-all ${
                  isCurrent
                    ? 'border-primary-600 bg-primary-50/80 shadow-sm ring-2 ring-primary-500/20'
                    : isCompleted || isPast
                    ? 'border-gray-200 bg-gray-50/60 hover:bg-gray-100'
                    : 'border-gray-100 bg-white opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isCurrent
                      ? 'bg-primary-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    Stage {stage.id}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  ) : isCurrent ? (
                    <Clock size={16} className="text-primary-600 animate-pulse" />
                  ) : (
                    <Circle size={14} className="text-gray-300" />
                  )}
                </div>
                <p className="font-bold text-xs text-gray-900 truncate">{stage.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {stage.tasks.filter(t => t.completed).length}/{stage.tasks.length} tasks
                </p>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Selected Stage Detail & Interactive Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stage Tasks List */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <span className="text-xs uppercase font-bold text-primary-600">Stage {currentStage.id} Checklist</span>
              <h3 className="text-lg font-bold text-gray-900">{currentStage.name}</h3>
            </div>
            <button
              onClick={() => {
                if (activeStageId < 10) setActiveStageId(activeStageId + 1)
              }}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Next Stage <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-2.5">
            {currentStage.tasks.map(task => (
              <div
                key={task.id}
                onClick={() => toggleTask(currentStage.id, task.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  task.completed
                    ? 'bg-emerald-50/50 border-emerald-200 text-gray-700'
                    : 'bg-white border-gray-200 hover:border-primary-300 shadow-xs'
                }`}
              >
                <button type="button" className="mt-0.5 text-primary-600 shrink-0">
                  {task.completed ? (
                    <CheckSquare size={18} className="text-emerald-600" />
                  ) : (
                    <Square size={18} className="text-gray-400 hover:text-primary-600" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    {task.title}
                  </p>
                </div>
                {task.completed && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    DONE
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Expert Field Tip for this stage */}
          <div className="p-4 bg-primary-50/80 rounded-2xl border border-primary-100 flex items-start gap-3 mt-4">
            <Award size={20} className="text-primary-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-primary-900">Agronomist Recommendation for {currentStage.name}</p>
              <p className="text-xs text-primary-800 mt-0.5 leading-relaxed">{currentStage.tips}</p>
            </div>
          </div>
        </Card>

        {/* Sidebar Info: Recommended Tools & Stage Dates */}
        <div className="space-y-4">
          <Card>
            <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <Calendar size={16} className="text-primary-600" /> Key Crop Dates
            </h4>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center">
                <span className="text-gray-500">Planting Date</span>
                <span className="font-bold text-gray-900">{new Date(plantingDate).toLocaleDateString()}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center">
                <span className="text-gray-500">Current Crop Age</span>
                <span className="font-bold text-emerald-700">{cropAgeDays} Days</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center">
                <span className="text-gray-500">Est. Harvest Window</span>
                <span className="font-bold text-primary-700">{new Date(expectedHarvestDate).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>

          <Card>
            <h4 className="font-bold text-gray-900 text-sm mb-3">Recommended Implements & Inputs</h4>
            <div className="flex flex-wrap gap-2">
              {currentStage.recommendedTools.map((tool, i) => (
                <span key={i} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition-colors">
                  🔧 {tool}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
