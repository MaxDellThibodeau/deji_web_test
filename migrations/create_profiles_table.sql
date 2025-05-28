-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  location VARCHAR(255),
  bio TEXT,
  favorite_genres VARCHAR(255),
  phone_number VARCHAR(50),
  profile_image VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on id for faster lookups
CREATE INDEX IF NOT EXISTS profiles_id_idx ON profiles(id);
