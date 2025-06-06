-- Create attendee profiles table
CREATE TABLE IF NOT EXISTS attendee_profiles (
  id SERIAL PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Music preferences
  favorite_genres TEXT[], -- Array of preferred music genres
  preferred_venues TEXT[], -- Array of preferred venue types
  music_discovery_preference VARCHAR(50) DEFAULT 'balanced', -- 'popular', 'underground', 'balanced'
  
  -- Event preferences
  preferred_event_types TEXT[], -- ["club_night", "festival", "concert", "private_party"]
  typical_budget_range VARCHAR(50), -- "under_50", "50_100", "100_200", "200_plus"
  preferred_event_times VARCHAR(50), -- "early_evening", "late_night", "all_night"
  
  -- Social features
  allow_song_requests BOOLEAN DEFAULT true,
  public_bidding_history BOOLEAN DEFAULT true,
  share_attendance_publicly BOOLEAN DEFAULT false,
  accept_friend_requests BOOLEAN DEFAULT true,
  
  -- Notification preferences
  notify_favorite_djs BOOLEAN DEFAULT true,
  notify_venue_events BOOLEAN DEFAULT false,
  notify_genre_events BOOLEAN DEFAULT true,
  notify_friend_activity BOOLEAN DEFAULT true,
  
  -- Statistics (read-only, updated by triggers/app logic)
  total_events_attended INTEGER DEFAULT 0,
  total_tokens_spent INTEGER DEFAULT 0,
  total_songs_requested INTEGER DEFAULT 0,
  favorite_dj_id UUID REFERENCES profiles(id),
  favorite_venue_id UUID REFERENCES profiles(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id)
);

-- Create attendee event history table
CREATE TABLE IF NOT EXISTS attendee_event_history (
  id SERIAL PRIMARY KEY,
  attendee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  attendance_date TIMESTAMP WITH TIME ZONE NOT NULL,
  tokens_spent INTEGER DEFAULT 0,
  songs_requested INTEGER DEFAULT 0,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- Event rating
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(attendee_id, event_id)
);

-- Create attendee friends/connections table
CREATE TABLE IF NOT EXISTS attendee_connections (
  id SERIAL PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, receiver_id),
  CHECK (requester_id != receiver_id)
);

-- Create attendee favorite DJs table
CREATE TABLE IF NOT EXISTS attendee_favorite_djs (
  id SERIAL PRIMARY KEY,
  attendee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dj_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(attendee_id, dj_id)
);

-- Create attendee favorite venues table
CREATE TABLE IF NOT EXISTS attendee_favorite_venues (
  id SERIAL PRIMARY KEY,
  attendee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(attendee_id, venue_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendee_profiles_profile_id ON attendee_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_attendee_event_history_attendee_id ON attendee_event_history(attendee_id);
CREATE INDEX IF NOT EXISTS idx_attendee_event_history_event_id ON attendee_event_history(event_id);
CREATE INDEX IF NOT EXISTS idx_attendee_connections_requester_id ON attendee_connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_attendee_connections_receiver_id ON attendee_connections(receiver_id);
CREATE INDEX IF NOT EXISTS idx_attendee_connections_status ON attendee_connections(status);
CREATE INDEX IF NOT EXISTS idx_attendee_favorite_djs_attendee_id ON attendee_favorite_djs(attendee_id);
CREATE INDEX IF NOT EXISTS idx_attendee_favorite_djs_dj_id ON attendee_favorite_djs(dj_id);
CREATE INDEX IF NOT EXISTS idx_attendee_favorite_venues_attendee_id ON attendee_favorite_venues(attendee_id);
CREATE INDEX IF NOT EXISTS idx_attendee_favorite_venues_venue_id ON attendee_favorite_venues(venue_id); 