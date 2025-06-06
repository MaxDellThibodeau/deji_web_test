-- Check what tables exist in your database
-- Run these queries in Supabase SQL Editor

-- 1. List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check specific tables and row counts
SELECT 
  'profiles' as table_name, 
  (SELECT COUNT(*) FROM profiles) as row_count
UNION ALL
SELECT 
  'user_tokens' as table_name, 
  (SELECT COUNT(*) FROM user_tokens) as row_count
UNION ALL
SELECT 
  'events' as table_name, 
  (SELECT COUNT(*) FROM events) as row_count
UNION ALL
SELECT 
  'tickets' as table_name, 
  (SELECT COUNT(*) FROM tickets) as row_count;

-- 3. Check table structures
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'user_tokens', 'events', 'tickets')
ORDER BY table_name, ordinal_position; 