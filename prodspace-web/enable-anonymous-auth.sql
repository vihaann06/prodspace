-- Enable anonymous authentication in Supabase
-- Run this in your Supabase SQL editor

-- 1. Enable anonymous authentication
-- This is typically done in the Supabase dashboard under Authentication > Settings
-- Make sure "Enable anonymous sign-ins" is turned on

-- 2. Update RLS policies to allow anonymous users to access data
-- Note: Anonymous users will have their own data isolated by their user_id

-- Update todos table policies to allow anonymous users
DROP POLICY IF EXISTS "Users can view own todos" ON todos;
CREATE POLICY "Users can view own todos" ON todos
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own todos" ON todos;
CREATE POLICY "Users can insert own todos" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own todos" ON todos;
CREATE POLICY "Users can update own todos" ON todos
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own todos" ON todos;
CREATE POLICY "Users can delete own todos" ON todos
  FOR DELETE USING (auth.uid() = user_id);

-- Update habits table policies to allow anonymous users
DROP POLICY IF EXISTS "Users can view own habits" ON habits;
CREATE POLICY "Users can view own habits" ON habits
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own habits" ON habits;
CREATE POLICY "Users can insert own habits" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own habits" ON habits;
CREATE POLICY "Users can update own habits" ON habits
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own habits" ON habits;
CREATE POLICY "Users can delete own habits" ON habits
  FOR DELETE USING (auth.uid() = user_id);

-- Update profiles table policies to allow anonymous users
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Note: Anonymous users will automatically get a user_id when they sign in
-- Their data will be isolated and they can use all features normally
-- When they later sign up with email/password, they can choose to migrate their data 