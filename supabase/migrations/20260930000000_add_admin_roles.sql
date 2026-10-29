/*
# FarmWise — Admin Roles & Security Migration

## Overview
Adds role-based access control to the FarmWise platform.

## Changes
1. Adds `role` column to `user_profiles` (values: 'farmer' | 'admin')
2. Creates a helper function `is_admin()` for RLS policies
3. Creates admin audit log table
4. Adds admin-scoped RLS policies for platform management tables

## Security
- Role is stored server-side in user_profiles (never just localStorage)
- Admins can read all user_profiles, subscriptions, support_requests, device_applications, farm_profiles
- Farmers cannot read admin data or other farmers' private data
- Passwords are never stored or exposed
*/

-- Add role column to user_profiles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN role text NOT NULL DEFAULT 'farmer'
      CHECK (role IN ('farmer', 'admin'));
  END IF;
END $$;

-- Create index on role for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Helper function: returns true if the calling user has the 'admin' role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- ============================================================
-- ADMIN AUDIT LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_type text,
  target_id text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can insert their own audit records
DROP POLICY IF EXISTS "admin_insert_audit" ON admin_audit_log;
CREATE POLICY "admin_insert_audit" ON admin_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (is_admin() AND admin_user_id = auth.uid());

-- Admins can read all audit records
DROP POLICY IF EXISTS "admin_select_audit" ON admin_audit_log;
CREATE POLICY "admin_select_audit" ON admin_audit_log
  FOR SELECT TO authenticated
  USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin ON admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created ON admin_audit_log(created_at DESC);

-- ============================================================
-- ADMIN READ POLICIES FOR MANAGEMENT TABLES
-- ============================================================

-- user_profiles: admins can read all profiles (for user management)
DROP POLICY IF EXISTS "admin_select_user_profiles" ON user_profiles;
CREATE POLICY "admin_select_user_profiles" ON user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_admin());

-- subscriptions: admins can read all subscriptions
DROP POLICY IF EXISTS "admin_select_subscriptions" ON subscriptions;
CREATE POLICY "admin_select_subscriptions" ON subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_admin());

-- support_requests: admins can read and update all support requests
DROP POLICY IF EXISTS "admin_select_support_requests" ON support_requests;
CREATE POLICY "admin_select_support_requests" ON support_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "admin_update_support_requests" ON support_requests;
CREATE POLICY "admin_update_support_requests" ON support_requests
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- device_applications: admins can read and update all applications
DROP POLICY IF EXISTS "admin_select_device_applications" ON device_applications;
CREATE POLICY "admin_select_device_applications" ON device_applications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "admin_update_device_applications" ON device_applications;
CREATE POLICY "admin_update_device_applications" ON device_applications
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- farm_profiles: admins can read all farm profiles
DROP POLICY IF EXISTS "admin_select_farm_profiles" ON farm_profiles;
CREATE POLICY "admin_select_farm_profiles" ON farm_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_admin());

-- chat_messages: admins can view for analytics (count/usage only)
DROP POLICY IF EXISTS "admin_select_chat_messages" ON chat_messages;
CREATE POLICY "admin_select_chat_messages" ON chat_messages
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_admin());

-- notifications: admin can insert broadcast notifications
DROP POLICY IF EXISTS "admin_insert_notifications" ON notifications;
CREATE POLICY "admin_insert_notifications" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR is_admin());
