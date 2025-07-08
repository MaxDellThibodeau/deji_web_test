-- Profile Tables for DJEI Dashboard System
-- Run this SQL in your Supabase SQL editor

-- DJ Profiles Table
CREATE TABLE IF NOT EXISTS public.dj_profiles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    stage_name text,
    bio text,
    genres text[] DEFAULT '{}',
    social_links jsonb DEFAULT '{}',
    availability text DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'booked')),
    hourly_rate integer, -- in cents
    location text,
    experience_years integer,
    equipment_list text[] DEFAULT '{}',
    specialties text[] DEFAULT '{}',
    portfolio_links text[] DEFAULT '{}',
    
    -- Metadata
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Constraints
    UNIQUE(profile_id)
);

-- Attendee Profiles Table
CREATE TABLE IF NOT EXISTS public.attendee_profiles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    username text,
    bio text,
    favorite_genres text[] DEFAULT '{}',
    music_preferences jsonb DEFAULT '{}',
    location text,
    saved_events uuid[] DEFAULT '{}',
    preferred_venues uuid[] DEFAULT '{}',
    following_djs uuid[] DEFAULT '{}',
    
    -- Metadata
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Constraints
    UNIQUE(profile_id)
);

-- Venue Profiles Table
CREATE TABLE IF NOT EXISTS public.venue_profiles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    venue_name text NOT NULL,
    description text,
    address text,
    location text,
    hours_of_operation jsonb DEFAULT '{}',
    equipment_list text[] DEFAULT '{}',
    capacity integer,
    venue_type text DEFAULT 'nightclub',
    contact_info jsonb DEFAULT '{}',
    amenities text[] DEFAULT '{}',
    policies text[] DEFAULT '{}',
    
    -- Metadata
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Constraints
    UNIQUE(profile_id)
);

-- Events Table (for dashboard widgets)
CREATE TABLE IF NOT EXISTS public.events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    venue_id uuid REFERENCES public.venue_profiles(id) ON DELETE CASCADE,
    dj_id uuid REFERENCES public.dj_profiles(id) ON DELETE CASCADE,
    date timestamptz NOT NULL,
    start_time time NOT NULL,
    end_time time,
    status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
    genre text,
    ticket_price integer, -- in cents
    max_attendees integer,
    current_attendees integer DEFAULT 0,
    
    -- Metadata
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Event Attendees (many-to-many)
CREATE TABLE IF NOT EXISTS public.event_attendees (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
    attendee_id uuid REFERENCES public.attendee_profiles(id) ON DELETE CASCADE,
    status text DEFAULT 'rsvp' CHECK (status IN ('rsvp', 'attended', 'no_show')),
    rsvp_date timestamptz DEFAULT now(),
    
    -- Constraints
    UNIQUE(event_id, attendee_id)
);

-- DJ Bookings Table
CREATE TABLE IF NOT EXISTS public.dj_bookings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    dj_id uuid REFERENCES public.dj_profiles(id) ON DELETE CASCADE,
    venue_id uuid REFERENCES public.venue_profiles(id) ON DELETE CASCADE,
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
    booking_date timestamptz NOT NULL,
    duration_hours integer NOT NULL,
    payment_amount integer NOT NULL, -- in cents
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes text,
    
    -- Metadata
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Tips Table
CREATE TABLE IF NOT EXISTS public.tips (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    from_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    to_dj_id uuid REFERENCES public.dj_profiles(id) ON DELETE CASCADE,
    amount integer NOT NULL, -- in cents
    song_title text,
    artist_name text,
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
    message text,
    
    -- Metadata
    created_at timestamptz DEFAULT now()
);

-- Song Requests Table
CREATE TABLE IF NOT EXISTS public.song_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id uuid REFERENCES public.attendee_profiles(id) ON DELETE CASCADE,
    dj_id uuid REFERENCES public.dj_profiles(id) ON DELETE CASCADE,
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
    song_title text NOT NULL,
    artist_name text NOT NULL,
    tokens_bid integer NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'played', 'declined')),
    message text,
    
    -- Metadata
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Feedback Table
CREATE TABLE IF NOT EXISTS public.feedback (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
    attendee_id uuid REFERENCES public.attendee_profiles(id) ON DELETE CASCADE,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    category text DEFAULT 'general' CHECK (category IN ('general', 'sound', 'atmosphere', 'service', 'dj_performance')),
    
    -- Metadata
    created_at timestamptz DEFAULT now(),
    
    -- Constraints
    UNIQUE(event_id, attendee_id)
);

-- DJ Followers Table (many-to-many)
CREATE TABLE IF NOT EXISTS public.dj_followers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    dj_id uuid REFERENCES public.dj_profiles(id) ON DELETE CASCADE,
    follower_id uuid REFERENCES public.attendee_profiles(id) ON DELETE CASCADE,
    followed_at timestamptz DEFAULT now(),
    
    -- Constraints
    UNIQUE(dj_id, follower_id)
);

-- Track Analytics Table
CREATE TABLE IF NOT EXISTS public.track_analytics (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    dj_id uuid REFERENCES public.dj_profiles(id) ON DELETE CASCADE,
    track_title text NOT NULL,
    artist_name text NOT NULL,
    play_count integer DEFAULT 0,
    tip_count integer DEFAULT 0,
    last_played timestamptz,
    
    -- Metadata
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Constraints
    UNIQUE(dj_id, track_title, artist_name)
);

-- Enable Row Level Security
ALTER TABLE public.dj_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dj_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dj_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for DJ Profiles
CREATE POLICY "DJ profiles are viewable by everyone" ON public.dj_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own DJ profile" ON public.dj_profiles
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own DJ profile" ON public.dj_profiles
    FOR UPDATE USING (auth.uid() = profile_id);

-- RLS Policies for Attendee Profiles
CREATE POLICY "Attendee profiles are viewable by everyone" ON public.attendee_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own attendee profile" ON public.attendee_profiles
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own attendee profile" ON public.attendee_profiles
    FOR UPDATE USING (auth.uid() = profile_id);

-- RLS Policies for Venue Profiles
CREATE POLICY "Venue profiles are viewable by everyone" ON public.venue_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own venue profile" ON public.venue_profiles
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own venue profile" ON public.venue_profiles
    FOR UPDATE USING (auth.uid() = profile_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dj_profiles_profile_id ON public.dj_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_attendee_profiles_profile_id ON public.attendee_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_profile_id ON public.venue_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_events_venue_id ON public.events(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_dj_id ON public.events(dj_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_tips_to_dj_id ON public.tips(to_dj_id);
CREATE INDEX IF NOT EXISTS idx_song_requests_dj_id ON public.song_requests(dj_id);
CREATE INDEX IF NOT EXISTS idx_dj_followers_dj_id ON public.dj_followers(dj_id);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at_dj_profiles
    BEFORE UPDATE ON public.dj_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_attendee_profiles
    BEFORE UPDATE ON public.attendee_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_venue_profiles
    BEFORE UPDATE ON public.venue_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_events
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_song_requests
    BEFORE UPDATE ON public.song_requests
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_track_analytics
    BEFORE UPDATE ON public.track_analytics
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at(); 