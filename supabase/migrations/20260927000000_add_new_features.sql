/*
# FarmWise — New Features Schema Migration
# Tables: subscriptions, support_requests, device_applications, farm_progress_logs

## Security
- Enables Row Level Security (RLS) on all new tables.
- Scoped to authenticated users: auth.uid() = user_id.
- Public/anon read/insert allowed if demo mode or unauthenticated user access needed.
*/

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type text NOT NULL DEFAULT 'free', -- 'free', 'premium'
  billing_cycle text DEFAULT 'monthly', -- 'monthly', 'yearly'
  status text NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'expired'
  amount numeric DEFAULT 0,
  payment_method text DEFAULT 'demo_upi',
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_subscriptions" ON subscriptions;
CREATE POLICY "select_own_subscriptions" ON subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_subscriptions" ON subscriptions;
CREATE POLICY "insert_own_subscriptions" ON subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_subscriptions" ON subscriptions;
CREATE POLICY "update_own_subscriptions" ON subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Support Requests Table (24x7 Call Support)
CREATE TABLE IF NOT EXISTS support_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  farmer_name text NOT NULL,
  phone text NOT NULL,
  language text NOT NULL DEFAULT 'en',
  issue_category text NOT NULL DEFAULT 'general', -- 'weather', 'disease', 'irrigation', 'fertilizer', 'emergency'
  is_urgent boolean DEFAULT false,
  description text,
  preferred_time text,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  agent_name text,
  call_notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_support_requests" ON support_requests;
CREATE POLICY "select_own_support_requests" ON support_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_support_requests" ON support_requests;
CREATE POLICY "insert_own_support_requests" ON support_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_support_requests" ON support_requests;
CREATE POLICY "update_own_support_requests" ON support_requests FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Device Applications Table (Farmer Tablet Program)
CREATE TABLE IF NOT EXISTS device_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  farmer_name text NOT NULL,
  phone text NOT NULL,
  aadhaar_last4 text NOT NULL,
  land_area_hectares numeric NOT NULL,
  state text NOT NULL,
  district text NOT NULL,
  village text NOT NULL,
  pin_code text NOT NULL,
  main_crops text NOT NULL,
  device_reason text,
  status text NOT NULL DEFAULT 'submitted', -- 'submitted', 'under_review', 'approved', 'dispatched'
  application_number text UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE device_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_device_applications" ON device_applications;
CREATE POLICY "select_own_device_applications" ON device_applications FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_device_applications" ON device_applications;
CREATE POLICY "insert_own_device_applications" ON device_applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Farm Progress Logs Table
CREATE TABLE IF NOT EXISTS farm_progress_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_record_id uuid REFERENCES crop_records(id) ON DELETE CASCADE,
  crop_name text NOT NULL,
  current_stage integer NOT NULL DEFAULT 1, -- 1 to 10
  stage_name text NOT NULL,
  planting_date date,
  expected_harvest_date date,
  tasks_completed jsonb DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE farm_progress_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_progress_logs" ON farm_progress_logs;
CREATE POLICY "select_own_progress_logs" ON farm_progress_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_progress_logs" ON farm_progress_logs;
CREATE POLICY "insert_own_progress_logs" ON farm_progress_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_progress_logs" ON farm_progress_logs;
CREATE POLICY "update_own_progress_logs" ON farm_progress_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id);
