-- Add is_admin flag to profiles table
-- This replaces the need for 'admin' as a separate role

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Add an index for quick admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;

-- Create a function to check if a user is admin
CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to allow admin access
-- (This is a template - you'll need to apply this pattern to your specific tables)
-- Example for a hypothetical admin_actions table:
-- CREATE POLICY "Admins can manage all records" ON admin_actions
--   FOR ALL USING (is_user_admin(auth.uid()));

-- Note: You may want to manually set some existing users as admins:
-- UPDATE profiles SET is_admin = true WHERE email = 'your-admin@email.com'; 