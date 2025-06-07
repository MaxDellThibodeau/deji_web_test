-- Move user_preferences table to Supabase (from Neon)
-- This eliminates the need for a secondary database

CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Link to main profiles table
  genre TEXT DEFAULT 'electronic',
  mood TEXT DEFAULT 'energetic',
  danceability INTEGER DEFAULT 80 CHECK (danceability >= 0 AND danceability <= 100),
  energy INTEGER DEFAULT 70 CHECK (energy >= 0 AND energy <= 100),
  popularity INTEGER DEFAULT 60 CHECK (popularity >= 0 AND popularity <= 100),
  
  -- Additional AI preference fields
  tempo_preference VARCHAR(20) DEFAULT 'medium', -- 'slow', 'medium', 'fast'
  instrumental_preference BOOLEAN DEFAULT false,
  vocal_preference BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one preference per user
  UNIQUE(user_id),
  UNIQUE(profile_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_profile_id ON user_preferences(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_genre ON user_preferences(genre);
CREATE INDEX IF NOT EXISTS idx_user_preferences_mood ON user_preferences(mood);

-- Migrate any existing data from Neon (if applicable)
-- INSERT INTO user_preferences (user_id, genre, mood, danceability, energy, popularity)
-- SELECT user_id, genre, mood, danceability, energy, popularity 
-- FROM neon_user_preferences -- This would be done manually during migration

-- Add some sample data for testing
INSERT INTO user_preferences (user_id, profile_id, genre, mood, danceability, energy, popularity)
VALUES 
  ('sample_user_1', null, 'electronic', 'energetic', 85, 75, 65),
  ('sample_user_2', null, 'house', 'chill', 70, 60, 70)
ON CONFLICT (user_id) DO NOTHING; 