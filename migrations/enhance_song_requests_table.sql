-- Enhance song_requests table with music metadata
ALTER TABLE song_requests ADD COLUMN IF NOT EXISTS spotify_id VARCHAR(255);
ALTER TABLE song_requests ADD COLUMN IF NOT EXISTS soundcloud_id VARCHAR(255);
ALTER TABLE song_requests ADD COLUMN IF NOT EXISTS music_source VARCHAR(50) DEFAULT 'manual'; -- 'spotify', 'soundcloud', 'manual'
ALTER TABLE song_requests ADD COLUMN IF NOT EXISTS album_art_url TEXT;
ALTER TABLE song_requests ADD COLUMN IF NOT EXISTS duration_ms INTEGER;
ALTER TABLE song_requests ADD COLUMN IF NOT EXISTS popularity_score INTEGER;
ALTER TABLE song_requests ADD COLUMN IF NOT EXISTS external_url TEXT;
ALTER TABLE song_requests ADD COLUMN IF NOT EXISTS preview_url TEXT;
ALTER TABLE song_requests ADD COLUMN IF NOT EXISTS genre VARCHAR(100);
ALTER TABLE song_requests ADD COLUMN IF NOT EXISTS release_date DATE;
ALTER TABLE song_requests ADD COLUMN IF NOT EXISTS play_count INTEGER DEFAULT 0;
ALTER TABLE song_requests ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_song_requests_music_source ON song_requests(music_source);
CREATE INDEX IF NOT EXISTS idx_song_requests_popularity ON song_requests(popularity_score);
CREATE INDEX IF NOT EXISTS idx_song_requests_spotify_id ON song_requests(spotify_id);
CREATE INDEX IF NOT EXISTS idx_song_requests_soundcloud_id ON song_requests(soundcloud_id);

-- Create a function to calculate ranking score
CREATE OR REPLACE FUNCTION calculate_song_ranking_score(
  p_tokens INTEGER,
  p_popularity_score INTEGER,
  p_bid_count INTEGER,
  p_duration_ms INTEGER
) RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  duration_bonus INTEGER := 0;
BEGIN
  -- Base score from tokens (50% weight)
  score := p_tokens * 2;
  
  -- Popularity bonus (20% weight)
  IF p_popularity_score IS NOT NULL THEN
    score := score + (p_popularity_score / 5);
  END IF;
  
  -- Bid count bonus (15% weight) - more bidders = higher demand
  score := score + (p_bid_count * 10);
  
  -- Duration bonus (15% weight) - prefer tracks between 2-5 minutes
  IF p_duration_ms IS NOT NULL THEN
    IF p_duration_ms >= 120000 AND p_duration_ms <= 300000 THEN
      duration_bonus := 50;
    ELSIF p_duration_ms >= 90000 AND p_duration_ms <= 360000 THEN
      duration_bonus := 25;
    END IF;
    score := score + duration_bonus;
  END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Add a computed column for ranking score
ALTER TABLE song_requests ADD COLUMN IF NOT EXISTS ranking_score INTEGER;

-- Create a trigger to automatically update ranking score
CREATE OR REPLACE FUNCTION update_song_ranking_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ranking_score = calculate_song_ranking_score(
    NEW.tokens,
    NEW.popularity_score,
    (SELECT COUNT(*) FROM song_bids WHERE song_request_id = NEW.id),
    NEW.duration_ms
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_song_ranking ON song_requests;
CREATE TRIGGER trigger_update_song_ranking
  BEFORE INSERT OR UPDATE ON song_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_song_ranking_score();

-- Create a view for ranked songs
CREATE OR REPLACE VIEW ranked_songs AS
SELECT 
  sr.*,
  COUNT(sb.id) as bid_count,
  calculate_song_ranking_score(
    sr.tokens,
    sr.popularity_score,
    COUNT(sb.id),
    sr.duration_ms
  ) as calculated_ranking_score
FROM song_requests sr
LEFT JOIN song_bids sb ON sr.id = sb.song_request_id
GROUP BY sr.id
ORDER BY calculated_ranking_score DESC;

-- Add comments for documentation
COMMENT ON COLUMN song_requests.spotify_id IS 'Spotify track ID for API integration';
COMMENT ON COLUMN song_requests.soundcloud_id IS 'SoundCloud track ID for API integration';
COMMENT ON COLUMN song_requests.music_source IS 'Source of the music data: spotify, soundcloud, or manual';
COMMENT ON COLUMN song_requests.ranking_score IS 'Calculated ranking score based on tokens, popularity, and other factors';
COMMENT ON COLUMN song_requests.popularity_score IS 'Popularity score from the music platform (0-100)'; 