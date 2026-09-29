export interface FarmProfile {
  id: string
  farm_name: string
  location: string
  area_hectares: number
  main_crop: string | null
  soil_type: string | null
  created_at: string
}

export interface SoilRecord {
  id: string
  farm_id: string | null
  soil_type: string
  ph_level: number
  nitrogen: number
  phosphorus: number
  potassium: number
  organic_matter: number
  moisture: number
  health_score: number
  recommendation: string | null
  created_at: string
}

export interface CropRecord {
  id: string
  farm_id: string | null
  crop_name: string
  variety: string | null
  area_hectares: number
  planting_date: string
  expected_yield_kg: number | null
  expected_price_per_kg: number | null
  status: string
  created_at: string
}

export interface IrrigationLog {
  id: string
  farm_id: string | null
  crop_name: string
  water_amount_liters: number
  method: string
  water_saved_liters: number
  scheduled_date: string
  notes: string | null
  created_at: string
}

export interface DiseaseReport {
  id: string
  crop_name: string
  photo_url: string | null
  diagnosis: string
  severity: string
  type: string
  treatment: string | null
  preventive_actions: string | null
  created_at: string
}

export interface WasteRecord {
  id: string
  waste_type: string
  quantity_kg: number
  disposal_method: string
  value_generated: number
  notes: string | null
  created_at: string
}

export interface CropPrice {
  id: string
  crop_name: string
  price_per_kg: number
  market_location: string
  trend: string
  recorded_date: string
  created_at: string
}

export interface Buyer {
  id: string
  buyer_name: string
  crop_name: string
  price_per_kg: number
  quantity_needed_kg: number | null
  location: string
  distance_km: number
  transport_cost: number
  contact: string | null
  rating: number
  created_at: string
}

export interface CropRotation {
  id: string
  previous_crop: string
  next_crop: string
  reason: string | null
  soil_benefit: string | null
  created_at: string
}

export interface ProfitCalculation {
  id: string
  crop_name: string
  area_hectares: number
  seed_cost: number
  fertilizer_cost: number
  labour_cost: number
  water_cost: number
  transport_cost: number
  total_cost: number
  expected_yield_kg: number
  selling_price_per_kg: number
  gross_revenue: number
  net_profit: number
  created_at: string
}

export interface SustainabilityScore {
  id: string
  water_efficiency: number
  chemical_usage: number
  soil_practices: number
  waste_management_score: number
  total_score: number
  grade: string | null
  recommendations: string | null
  created_at: string
}

export type PlanType = 'free' | 'premium'
export type BillingCycle = 'monthly' | 'yearly'

export interface Subscription {
  id: string
  user_id?: string
  plan_type: PlanType
  billing_cycle: BillingCycle
  status: 'active' | 'canceled' | 'expired'
  amount: number
  payment_method?: string
  started_at: string
  expires_at: string
  created_at?: string
}

export interface SupportRequest {
  id: string
  user_id?: string
  farmer_name: string
  phone: string
  language: string
  issue_category: string
  is_urgent: boolean
  description: string
  preferred_time?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  agent_name?: string
  call_notes?: string
  created_at: string
}

export interface DeviceApplication {
  id: string
  user_id?: string
  farmer_name: string
  phone: string
  aadhaar_last4: string
  land_area_hectares: number
  state: string
  district: string
  village: string
  pin_code: string
  main_crops: string
  device_reason?: string
  status: 'submitted' | 'under_review' | 'approved' | 'dispatched'
  application_number: string
  created_at: string
}

export interface FarmProgressStage {
  id: number
  name: string
  description: string
  tasks: { id: string; title: string; completed: boolean; dueDate?: string }[]
  tips: string
  recommendedTools: string[]
}

export interface FarmProgressLog {
  id: string
  user_id?: string
  crop_record_id?: string
  crop_name: string
  current_stage: number
  stage_name: string
  planting_date: string
  expected_harvest_date: string
  tasks_completed: string[] // task ids
  notes?: string
  created_at: string
  updated_at: string
}

