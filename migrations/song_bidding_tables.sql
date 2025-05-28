-- Create song_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS song_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  profile_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  album_art VARCHAR(255),
  tokens INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create song_bids table if it doesn't exist
CREATE TABLE IF NOT EXISTS song_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_request_id UUID NOT NULL,
  profile_id UUID NOT NULL,
  tokens INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to increment song tokens
CREATE OR REPLACE FUNCTION increment_song_tokens(song_id UUID, token_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE song_requests
  SET tokens = tokens + token_amount
  WHERE id = song_id;
END;
$$ LANGUAGE plpgsql;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_song_requests_event_id ON song_requests(event_id);
CREATE INDEX IF NOT EXISTS idx_song_bids_profile_id ON song_bids(profile_id);
CREATE INDEX IF NOT EXISTS idx_song_bids_song_request_id ON song_bids(song_request_id);
