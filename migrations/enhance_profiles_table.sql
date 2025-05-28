-- Add new fields to profiles table for enhanced user profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Create table for user settings
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  notification_email BOOLEAN DEFAULT TRUE,
  notification_push BOOLEAN DEFAULT TRUE,
  theme VARCHAR(20) DEFAULT 'dark',
  language VARCHAR(10) DEFAULT 'en',
  privacy_profile_public BOOLEAN DEFAULT TRUE,
  privacy_show_activity BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for profile images
CREATE TABLE IF NOT EXISTS profile_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profile_images_profile_id ON profile_images(profile_id);
