-- Create venue profiles table
CREATE TABLE IF NOT EXISTS venue_profiles (
  id SERIAL PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  venue_name VARCHAR(255) NOT NULL,
  venue_type VARCHAR(100), -- e.g., "Nightclub", "Bar", "Concert Hall", "Festival Ground"
  capacity INTEGER,
  established INTEGER, -- Year established
  address TEXT,
  phone VARCHAR(50),
  website VARCHAR(255),
  booking_email VARCHAR(255),
  description TEXT,
  
  -- Operating details
  operating_hours TEXT,
  pricing_info TEXT,
  amenities TEXT[], -- Array of amenities like ["Full Bar", "VIP Section", "Coat Check"]
  
  -- Technical specifications
  sound_system TEXT,
  lighting_system TEXT,
  stage_info TEXT,
  
  -- Business info
  featured BOOLEAN DEFAULT false,
  active_for_bookings BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT true,
  
  -- Social media
  instagram VARCHAR(100),
  twitter VARCHAR(100),
  facebook VARCHAR(100),
  youtube VARCHAR(100),
  
  -- Images
  profile_image VARCHAR(255),
  cover_image VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id)
);

-- Create venue gallery images table
CREATE TABLE IF NOT EXISTS venue_gallery_images (
  id SERIAL PRIMARY KEY,
  venue_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  url VARCHAR(255) NOT NULL,
  caption TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create venue reviews table
CREATE TABLE IF NOT EXISTS venue_reviews (
  id SERIAL PRIMARY KEY,
  venue_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  review_type VARCHAR(50) DEFAULT 'general', -- 'general', 'sound_quality', 'atmosphere', 'service'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(venue_id, reviewer_id, event_id)
);

-- Create venue operating hours table (for detailed schedule)
CREATE TABLE IF NOT EXISTS venue_operating_hours (
  id SERIAL PRIMARY KEY,
  venue_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT false,
  special_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_venue_profiles_profile_id ON venue_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_venue_type ON venue_profiles(venue_type);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_capacity ON venue_profiles(capacity);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_featured ON venue_profiles(featured);
CREATE INDEX IF NOT EXISTS idx_venue_gallery_images_venue_id ON venue_gallery_images(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_reviews_venue_id ON venue_reviews(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_reviews_reviewer_id ON venue_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_venue_operating_hours_venue_id ON venue_operating_hours(venue_id); 