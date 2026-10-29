-- =============================================================
-- FarmWise — Admin Account Setup Script
-- =============================================================
-- Run this in the Supabase SQL Editor to promote an existing
-- user to 'admin' role, or to verify admin accounts.
--
-- IMPORTANT:
-- 1. Admin accounts are created via Supabase Auth (email/password)
--    using the standard sign-up flow or the Supabase dashboard.
-- 2. After the auth account is created, run this script to set
--    the 'admin' role in user_profiles.
-- 3. NEVER hardcode passwords in SQL or source code.
-- =============================================================

-- Option A: Promote an existing user to admin by their email
-- Replace 'admin@farmwise.io' with the actual admin email.
UPDATE user_profiles
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'admin@farmwise.io'
);

-- Verify the update
SELECT
  up.id,
  up.full_name,
  au.email,
  up.role,
  up.created_at
FROM user_profiles up
JOIN auth.users au ON au.id = up.user_id
WHERE up.role = 'admin';

-- =============================================================
-- Option B: If user_profile doesn't exist yet for the admin user
-- (run after creating the auth account via Supabase Dashboard)
-- =============================================================
/*
INSERT INTO user_profiles (user_id, full_name, role, preferred_language)
SELECT
  id,
  'FarmWise Admin',  -- Replace with actual name
  'admin',
  'en'
FROM auth.users
WHERE email = 'admin@farmwise.io'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
*/

-- =============================================================
-- How to create an admin account:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" > "Create new user"
-- 3. Enter admin email and a strong password
-- 4. The user_profile row may be auto-created by the trigger,
--    or you can run Option B above.
-- 5. Run Option A above to set role = 'admin'
-- 6. The admin can now log in via the Admin Login page
-- =============================================================
