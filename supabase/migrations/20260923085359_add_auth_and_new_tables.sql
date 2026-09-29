/*
# FarmWise — Multi-user auth, profiles, notifications, chat, and admin tables

## Overview
Converts the app from single-tenant to multi-user with authentication.
Adds user_id columns to user-specific tables, creates new tables for
user profiles, notifications, AI chat messages, and admin tracking.

## New Tables
1. **user_profiles** — farmer details (name, phone, preferred language, farming method)
2. **notifications** — user notifications (rain alerts, disease risk, price changes, etc.)
3. **chat_messages** — AI FarmWise assistant conversation history

## Modified Tables
- **farm_profiles** — added user_id column (owner-scoped)
- **soil_records** — added user_id column (owner-scoped)
- **irrigation_logs** — added user_id column (owner-scoped)
- **disease_reports** — added user_id column (owner-scoped)
- **waste_management** — added user_id column (owner-scoped)
- **profit_calculations** — added user_id column (owner-scoped)
- **sustainability_scores** — added user_id column (owner-scoped)

## Security Changes
- User-specific tables get owner-scoped RLS policies (TO authenticated, auth.uid() = user_id)
- Shared reference tables (crop_prices, buyers, crop_rotations) remain public (TO anon, authenticated)
- user_profiles, notifications, chat_messages are owner-scoped

## Important Notes
1. Existing rows in user-specific tables will have NULL user_id and will not be visible
   to any authenticated user. This is expected — they were demo data from the single-tenant phase.
2. crop_prices, buyers, and crop_rotations remain shared/public — all users see the same market data.
3. user_id columns default to auth.uid() so inserts work without explicitly passing user_id.
*/

-- Add user_id columns to user-specific tables
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farm_profiles' AND column_name = 'user_id') THEN
    ALTER TABLE farm_profiles ADD COLUMN user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'soil_records' AND column_name = 'user_id') THEN
    ALTER TABLE soil_records ADD COLUMN user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'irrigation_logs' AND column_name = 'user_id') THEN
    ALTER TABLE irrigation_logs ADD COLUMN user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'disease_reports' AND column_name = 'user_id') THEN
    ALTER TABLE disease_reports ADD COLUMN user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'waste_management' AND column_name = 'user_id') THEN
    ALTER TABLE waste_management ADD COLUMN user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profit_calculations' AND column_name = 'user_id') THEN
    ALTER TABLE profit_calculations ADD COLUMN user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sustainability_scores' AND column_name = 'user_id') THEN
    ALTER TABLE sustainability_scores ADD COLUMN user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text,
  preferred_language text DEFAULT 'en',
  farming_method text DEFAULT 'conventional',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_profile" ON user_profiles;
CREATE POLICY "select_own_profile" ON user_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_profile" ON user_profiles;
CREATE POLICY "insert_own_profile" ON user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_profile" ON user_profiles;
CREATE POLICY "update_own_profile" ON user_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_profile" ON user_profiles;
CREATE POLICY "delete_own_profile" ON user_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  priority text DEFAULT 'normal',
  read boolean NOT NULL DEFAULT false,
  icon text DEFAULT 'bell',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_messages" ON chat_messages;
CREATE POLICY "select_own_messages" ON chat_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_messages" ON chat_messages;
CREATE POLICY "insert_own_messages" ON chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_messages" ON chat_messages;
CREATE POLICY "delete_own_messages" ON chat_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Update policies on user-specific tables: drop old anon policies, add owner-scoped
-- farm_profiles
DROP POLICY IF EXISTS "anon_select_farm_profiles" ON farm_profiles;
DROP POLICY IF EXISTS "anon_insert_farm_profiles" ON farm_profiles;
DROP POLICY IF EXISTS "anon_update_farm_profiles" ON farm_profiles;
DROP POLICY IF EXISTS "anon_delete_farm_profiles" ON farm_profiles;
DROP POLICY IF EXISTS "select_own_farm_profiles" ON farm_profiles;
CREATE POLICY "select_own_farm_profiles" ON farm_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_farm_profiles" ON farm_profiles;
CREATE POLICY "insert_own_farm_profiles" ON farm_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_farm_profiles" ON farm_profiles;
CREATE POLICY "update_own_farm_profiles" ON farm_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_farm_profiles" ON farm_profiles;
CREATE POLICY "delete_own_farm_profiles" ON farm_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- soil_records
DROP POLICY IF EXISTS "anon_select_soil_records" ON soil_records;
DROP POLICY IF EXISTS "anon_insert_soil_records" ON soil_records;
DROP POLICY IF EXISTS "anon_update_soil_records" ON soil_records;
DROP POLICY IF EXISTS "anon_delete_soil_records" ON soil_records;
DROP POLICY IF EXISTS "select_own_soil_records" ON soil_records;
CREATE POLICY "select_own_soil_records" ON soil_records FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_soil_records" ON soil_records;
CREATE POLICY "insert_own_soil_records" ON soil_records FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_soil_records" ON soil_records;
CREATE POLICY "update_own_soil_records" ON soil_records FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_soil_records" ON soil_records;
CREATE POLICY "delete_own_soil_records" ON soil_records FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- irrigation_logs
DROP POLICY IF EXISTS "anon_select_irrigation_logs" ON irrigation_logs;
DROP POLICY IF EXISTS "anon_insert_irrigation_logs" ON irrigation_logs;
DROP POLICY IF EXISTS "anon_update_irrigation_logs" ON irrigation_logs;
DROP POLICY IF EXISTS "anon_delete_irrigation_logs" ON irrigation_logs;
DROP POLICY IF EXISTS "select_own_irrigation_logs" ON irrigation_logs;
CREATE POLICY "select_own_irrigation_logs" ON irrigation_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_irrigation_logs" ON irrigation_logs;
CREATE POLICY "insert_own_irrigation_logs" ON irrigation_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_irrigation_logs" ON irrigation_logs;
CREATE POLICY "update_own_irrigation_logs" ON irrigation_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_irrigation_logs" ON irrigation_logs;
CREATE POLICY "delete_own_irrigation_logs" ON irrigation_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- disease_reports
DROP POLICY IF EXISTS "anon_select_disease_reports" ON disease_reports;
DROP POLICY IF EXISTS "anon_insert_disease_reports" ON disease_reports;
DROP POLICY IF EXISTS "anon_update_disease_reports" ON disease_reports;
DROP POLICY IF EXISTS "anon_delete_disease_reports" ON disease_reports;
DROP POLICY IF EXISTS "select_own_disease_reports" ON disease_reports;
CREATE POLICY "select_own_disease_reports" ON disease_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_disease_reports" ON disease_reports;
CREATE POLICY "insert_own_disease_reports" ON disease_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_disease_reports" ON disease_reports;
CREATE POLICY "update_own_disease_reports" ON disease_reports FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_disease_reports" ON disease_reports;
CREATE POLICY "delete_own_disease_reports" ON disease_reports FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- waste_management
DROP POLICY IF EXISTS "anon_select_waste_management" ON waste_management;
DROP POLICY IF EXISTS "anon_insert_waste_management" ON waste_management;
DROP POLICY IF EXISTS "anon_update_waste_management" ON waste_management;
DROP POLICY IF EXISTS "anon_delete_waste_management" ON waste_management;
DROP POLICY IF EXISTS "select_own_waste_management" ON waste_management;
CREATE POLICY "select_own_waste_management" ON waste_management FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_waste_management" ON waste_management;
CREATE POLICY "insert_own_waste_management" ON waste_management FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_waste_management" ON waste_management;
CREATE POLICY "update_own_waste_management" ON waste_management FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_waste_management" ON waste_management;
CREATE POLICY "delete_own_waste_management" ON waste_management FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- profit_calculations
DROP POLICY IF EXISTS "anon_select_profit_calculations" ON profit_calculations;
DROP POLICY IF EXISTS "anon_insert_profit_calculations" ON profit_calculations;
DROP POLICY IF EXISTS "anon_update_profit_calculations" ON profit_calculations;
DROP POLICY IF EXISTS "anon_delete_profit_calculations" ON profit_calculations;
DROP POLICY IF EXISTS "select_own_profit_calculations" ON profit_calculations;
CREATE POLICY "select_own_profit_calculations" ON profit_calculations FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_profit_calculations" ON profit_calculations;
CREATE POLICY "insert_own_profit_calculations" ON profit_calculations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_profit_calculations" ON profit_calculations;
CREATE POLICY "update_own_profit_calculations" ON profit_calculations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_profit_calculations" ON profit_calculations;
CREATE POLICY "delete_own_profit_calculations" ON profit_calculations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- sustainability_scores
DROP POLICY IF EXISTS "anon_select_sustainability_scores" ON sustainability_scores;
DROP POLICY IF EXISTS "anon_insert_sustainability_scores" ON sustainability_scores;
DROP POLICY IF EXISTS "anon_update_sustainability_scores" ON sustainability_scores;
DROP POLICY IF EXISTS "anon_delete_sustainability_scores" ON sustainability_scores;
DROP POLICY IF EXISTS "select_own_sustainability_scores" ON sustainability_scores;
CREATE POLICY "select_own_sustainability_scores" ON sustainability_scores FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_sustainability_scores" ON sustainability_scores;
CREATE POLICY "insert_own_sustainability_scores" ON sustainability_scores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_sustainability_scores" ON sustainability_scores;
CREATE POLICY "update_own_sustainability_scores" ON sustainability_scores FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_sustainability_scores" ON sustainability_scores;
CREATE POLICY "delete_own_sustainability_scores" ON sustainability_scores FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_farm_profiles_user ON farm_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_soil_records_user ON soil_records(user_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_logs_user ON irrigation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_disease_reports_user ON disease_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_waste_management_user ON waste_management(user_id);
CREATE INDEX IF NOT EXISTS idx_profit_calculations_user ON profit_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_sustainability_scores_user ON sustainability_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id);
