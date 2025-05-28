CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  genre TEXT DEFAULT 'electronic',
  mood TEXT DEFAULT 'energetic',
  danceability INTEGER DEFAULT 80,
  energy INTEGER DEFAULT 70,
  popularity INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add some sample data
INSERT INTO user_preferences (user_id, genre, mood, danceability, energy, popularity)
VALUES 
  ('att_a2q26evj', 'electronic', 'energetic', 80, 70, 60),
  ('att_p5s2avdg', 'electronic', 'energetic', 85, 75, 65)
ON CONFLICT (user_id) DO NOTHING;
