-- Create DJ profiles table
CREATE TABLE IF NOT EXISTS dj_profiles (
  id SERIAL PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stage_name VARCHAR(255) NOT NULL,
  bio TEXT,
  location VARCHAR(255),
  phone VARCHAR(50),
  experience_level VARCHAR(50),
  primary_genre VARCHAR(100),
  secondary_genres VARCHAR(255),
  hourly_rate INTEGER,
  equipment_provided BOOLEAN DEFAULT false,
  website VARCHAR(255),
  instagram VARCHAR(100),
  twitter VARCHAR(100),
  facebook VARCHAR(100),
  soundcloud VARCHAR(100),
  youtube VARCHAR(100),
  twitch VARCHAR(100),
  cover_image VARCHAR(255),
  available_for_booking BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id)
);

-- Create DJ audio samples table
CREATE TABLE IF NOT EXISTS dj_audio_samples (
  id SERIAL PRIMARY KEY,
  dj_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  url VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  duration INTEGER,
  order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create DJ reviews table
CREATE TABLE IF NOT EXISTS dj_reviews (
  id SERIAL PRIMARY KEY,
  dj_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(dj_id, reviewer_id, event_id)
);

-- Create DJ availability table
CREATE TABLE IF NOT EXISTS dj_availability (
  id SERIAL PRIMARY KEY,
  dj_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_dj_profiles_profile_id ON dj_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_dj_audio_samples_dj_id ON dj_audio_samples(dj_id);
CREATE INDEX IF NOT EXISTS idx_dj_reviews_dj_id ON dj_reviews(dj_id);
CREATE INDEX IF NOT EXISTS idx_dj_reviews_reviewer_id ON dj_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_dj_availability_dj_id ON dj_availability(dj_id);
