/*
# AgriSmart — Farm Intelligence Platform Schema

## Overview
Creates the database tables for a comprehensive agricultural intelligence platform.
This is a single-tenant app with no sign-in — all data is shared/public, so policies
use `TO anon, authenticated` with `USING (true)`.

## New Tables

1. **farm_profiles** — stores farm information (name, location, area, main crop)
2. **soil_records** — soil health data (type, pH, NPK, organic matter, moisture)
3. **crop_records** — crop planting records (crop type, area, planting date, expected yield)
4. **irrigation_logs** — watering events (water amount, method, water saved)
5. **disease_reports** — crop disease/pest reports (photo URL, diagnosis, severity, treatment)
6. **waste_management** — agricultural waste records (waste type, quantity, disposal method)
7. **crop_prices** — market price data (crop, price, market location, trend)
8. **buyers** — buyer listings (name, crop, price offered, location, contact)
9. **crop_rotations** — rotation history and suggestions (previous crop, next crop, reason)
10. **profit_calculations** — saved profit calculator results
11. **sustainability_scores** — sustainability score records

## Security
- RLS enabled on all tables.
- All policies use `TO anon, authenticated` with `USING (true)` since data is intentionally shared (no auth).
*/

-- Farm profiles
CREATE TABLE IF NOT EXISTS farm_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_name text NOT NULL,
  location text NOT NULL,
  area_hectares numeric NOT NULL DEFAULT 0,
  main_crop text,
  soil_type text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE farm_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_farm_profiles" ON farm_profiles;
CREATE POLICY "anon_select_farm_profiles" ON farm_profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_farm_profiles" ON farm_profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_farm_profiles" ON farm_profiles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_farm_profiles" ON farm_profiles FOR DELETE TO anon, authenticated USING (true);

-- Soil records
CREATE TABLE IF NOT EXISTS soil_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farm_profiles(id) ON DELETE CASCADE,
  soil_type text NOT NULL,
  ph_level numeric NOT NULL,
  nitrogen numeric NOT NULL,
  phosphorus numeric NOT NULL,
  potassium numeric NOT NULL,
  organic_matter numeric DEFAULT 0,
  moisture numeric DEFAULT 0,
  health_score integer DEFAULT 0,
  recommendation text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE soil_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_soil_records" ON soil_records FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_soil_records" ON soil_records FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_soil_records" ON soil_records FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_soil_records" ON soil_records FOR DELETE TO anon, authenticated USING (true);

-- Crop records
CREATE TABLE IF NOT EXISTS crop_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farm_profiles(id) ON DELETE CASCADE,
  crop_name text NOT NULL,
  variety text,
  area_hectares numeric NOT NULL,
  planting_date date NOT NULL,
  expected_yield_kg numeric,
  expected_price_per_kg numeric,
  status text DEFAULT 'planning',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE crop_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_crop_records" ON crop_records FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_crop_records" ON crop_records FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_crop_records" ON crop_records FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_crop_records" ON crop_records FOR DELETE TO anon, authenticated USING (true);

-- Irrigation logs
CREATE TABLE IF NOT EXISTS irrigation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farm_profiles(id) ON DELETE CASCADE,
  crop_name text NOT NULL,
  water_amount_liters numeric NOT NULL,
  method text NOT NULL,
  water_saved_liters numeric DEFAULT 0,
  scheduled_date date NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE irrigation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_irrigation_logs" ON irrigation_logs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_irrigation_logs" ON irrigation_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_irrigation_logs" ON irrigation_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_irrigation_logs" ON irrigation_logs FOR DELETE TO anon, authenticated USING (true);

-- Disease reports
CREATE TABLE IF NOT EXISTS disease_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name text NOT NULL,
  photo_url text,
  diagnosis text NOT NULL,
  severity text DEFAULT 'low',
  type text DEFAULT 'disease',
  treatment text,
  preventive_actions text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE disease_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_disease_reports" ON disease_reports FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_disease_reports" ON disease_reports FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_disease_reports" ON disease_reports FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_disease_reports" ON disease_reports FOR DELETE TO anon, authenticated USING (true);

-- Waste management
CREATE TABLE IF NOT EXISTS waste_management (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  waste_type text NOT NULL,
  quantity_kg numeric NOT NULL,
  disposal_method text NOT NULL,
  value_generated numeric DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE waste_management ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_waste_management" ON waste_management FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_waste_management" ON waste_management FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_waste_management" ON waste_management FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_waste_management" ON waste_management FOR DELETE TO anon, authenticated USING (true);

-- Crop prices
CREATE TABLE IF NOT EXISTS crop_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name text NOT NULL,
  price_per_kg numeric NOT NULL,
  market_location text NOT NULL,
  trend text DEFAULT 'stable',
  recorded_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE crop_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_crop_prices" ON crop_prices FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_crop_prices" ON crop_prices FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_crop_prices" ON crop_prices FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_crop_prices" ON crop_prices FOR DELETE TO anon, authenticated USING (true);

-- Buyers
CREATE TABLE IF NOT EXISTS buyers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_name text NOT NULL,
  crop_name text NOT NULL,
  price_per_kg numeric NOT NULL,
  quantity_needed_kg numeric,
  location text NOT NULL,
  distance_km numeric DEFAULT 0,
  transport_cost numeric DEFAULT 0,
  contact text,
  rating numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_buyers" ON buyers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_buyers" ON buyers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_buyers" ON buyers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_buyers" ON buyers FOR DELETE TO anon, authenticated USING (true);

-- Crop rotations
CREATE TABLE IF NOT EXISTS crop_rotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  previous_crop text NOT NULL,
  next_crop text NOT NULL,
  reason text,
  soil_benefit text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE crop_rotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_crop_rotations" ON crop_rotations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_crop_rotations" ON crop_rotations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_crop_rotations" ON crop_rotations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_crop_rotations" ON crop_rotations FOR DELETE TO anon, authenticated USING (true);

-- Profit calculations
CREATE TABLE IF NOT EXISTS profit_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name text NOT NULL,
  area_hectares numeric NOT NULL,
  seed_cost numeric NOT NULL DEFAULT 0,
  fertilizer_cost numeric NOT NULL DEFAULT 0,
  labour_cost numeric NOT NULL DEFAULT 0,
  water_cost numeric NOT NULL DEFAULT 0,
  transport_cost numeric NOT NULL DEFAULT 0,
  total_cost numeric NOT NULL DEFAULT 0,
  expected_yield_kg numeric NOT NULL,
  selling_price_per_kg numeric NOT NULL,
  gross_revenue numeric NOT NULL DEFAULT 0,
  net_profit numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profit_calculations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_profit_calculations" ON profit_calculations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_profit_calculations" ON profit_calculations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_profit_calculations" ON profit_calculations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_profit_calculations" ON profit_calculations FOR DELETE TO anon, authenticated USING (true);

-- Sustainability scores
CREATE TABLE IF NOT EXISTS sustainability_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  water_efficiency integer NOT NULL DEFAULT 0,
  chemical_usage integer NOT NULL DEFAULT 0,
  soil_practices integer NOT NULL DEFAULT 0,
  waste_management_score integer NOT NULL DEFAULT 0,
  total_score integer NOT NULL DEFAULT 0,
  grade text,
  recommendations text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE sustainability_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_sustainability_scores" ON sustainability_scores FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_sustainability_scores" ON sustainability_scores FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_sustainability_scores" ON sustainability_scores FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_sustainability_scores" ON sustainability_scores FOR DELETE TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_soil_records_farm ON soil_records(farm_id);
CREATE INDEX IF NOT EXISTS idx_crop_records_farm ON crop_records(farm_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_logs_farm ON irrigation_logs(farm_id);
CREATE INDEX IF NOT EXISTS idx_crop_prices_crop ON crop_prices(crop_name);
CREATE INDEX IF NOT EXISTS idx_buyers_crop ON buyers(crop_name);
