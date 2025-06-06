-- Update events table to properly link to venue profiles
-- First, add the new venue_id column
ALTER TABLE events ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES profiles(id);

-- Create index for the new foreign key
CREATE INDEX IF NOT EXISTS idx_events_venue_id ON events(venue_id);

-- Update existing events to link to venues (you'll need to manually map these)
-- This is a placeholder - you'll need to create venue profiles first and then update
-- UPDATE events SET venue_id = (SELECT id FROM profiles WHERE role = 'venue' AND first_name = events.venue LIMIT 1);

-- After migrating data, you can optionally drop the old venue TEXT column
-- ALTER TABLE events DROP COLUMN IF EXISTS venue;

-- Create a function to get venue details for events
CREATE OR REPLACE FUNCTION get_event_venue_details(event_id UUID)
RETURNS TABLE (
  venue_name VARCHAR(255),
  venue_type VARCHAR(100),
  capacity INTEGER,
  address TEXT,
  phone VARCHAR(50),
  website VARCHAR(255)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vp.venue_name,
    vp.venue_type,
    vp.capacity,
    vp.address,
    vp.phone,
    vp.website
  FROM events e
  JOIN venue_profiles vp ON e.venue_id = vp.profile_id
  WHERE e.id = event_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update venue statistics
CREATE OR REPLACE FUNCTION update_venue_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total events hosted count when new event is created
  IF TG_OP = 'INSERT' AND NEW.venue_id IS NOT NULL THEN
    -- This could be implemented later with a venue statistics table
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_venue_stats
  AFTER INSERT OR UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_venue_stats(); 