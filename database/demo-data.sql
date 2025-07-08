-- Demo Data for DJEI Dashboard System
-- Run this SQL AFTER setting up the profile tables and having demo users in your system

-- First, let's assume we have demo users in the profiles table
-- You should replace these UUIDs with actual profile IDs from your demo accounts

-- Demo DJ Profile
INSERT INTO public.dj_profiles (
    profile_id, stage_name, bio, genres, social_links, availability, 
    hourly_rate, location, experience_years, equipment_list, specialties
) VALUES (
    (SELECT id FROM public.profiles WHERE email = 'dj@djei.demo'),
    'DJ Alex Rivera',
    'Professional DJ with 8+ years of experience specializing in electronic dance music. Known for creating unforgettable experiences and reading the crowd perfectly.',
    ARRAY['Electronic', 'House', 'Techno', 'Progressive', 'Trance'],
    '{"instagram": "@djalex_rivera", "soundcloud": "alex-rivera-dj", "spotify": "djalex", "twitter": "@AlexRiveraDJ"}',
    'available',
    25000, -- $250/hour in cents
    'San Francisco, CA',
    8,
    ARRAY['Pioneer CDJ-3000', 'Pioneer DJM-900NXS2', 'KRK Rokit 8', 'Shure SM58', 'MacBook Pro'],
    ARRAY['Electronic Dance Music', 'Live Mixing', 'Crowd Reading', 'Event Production']
) ON CONFLICT (profile_id) DO UPDATE SET
    stage_name = EXCLUDED.stage_name,
    bio = EXCLUDED.bio,
    genres = EXCLUDED.genres,
    social_links = EXCLUDED.social_links,
    availability = EXCLUDED.availability,
    hourly_rate = EXCLUDED.hourly_rate,
    location = EXCLUDED.location,
    experience_years = EXCLUDED.experience_years,
    equipment_list = EXCLUDED.equipment_list,
    specialties = EXCLUDED.specialties;

-- Demo Attendee Profile
INSERT INTO public.attendee_profiles (
    profile_id, username, bio, favorite_genres, music_preferences, location
) VALUES (
    (SELECT id FROM public.profiles WHERE email = 'attendee@djei.demo'),
    'MusicLover_Sam',
    'Music enthusiast who loves discovering new beats and supporting local DJs. Always on the lookout for the next great electronic music experience.',
    ARRAY['Electronic', 'House', 'Hip-Hop', 'Latin', 'Indie'],
    '{"energy_level": "high", "discovery_preference": "balanced", "preferred_time": "evening", "dance_style": "electronic"}',
    'San Francisco, CA'
) ON CONFLICT (profile_id) DO UPDATE SET
    username = EXCLUDED.username,
    bio = EXCLUDED.bio,
    favorite_genres = EXCLUDED.favorite_genres,
    music_preferences = EXCLUDED.music_preferences,
    location = EXCLUDED.location;

-- Demo Venue Profile
INSERT INTO public.venue_profiles (
    profile_id, venue_name, description, address, location, hours_of_operation,
    equipment_list, capacity, venue_type, contact_info, amenities
) VALUES (
    (SELECT id FROM public.profiles WHERE email = 'venue@djei.demo'),
    'The Electric Lounge',
    'San Francisco''s premier electronic music venue featuring state-of-the-art sound system and immersive lighting. Perfect for unforgettable nights of dancing and live DJ performances.',
    '123 Mission Street, San Francisco, CA 94105',
    'San Francisco, CA',
    '{
        "Monday": {"open": "18:00", "close": "02:00"},
        "Tuesday": {"open": "18:00", "close": "02:00"},
        "Wednesday": {"open": "18:00", "close": "02:00"},
        "Thursday": {"open": "18:00", "close": "03:00"},
        "Friday": {"open": "18:00", "close": "03:00"},
        "Saturday": {"open": "18:00", "close": "03:00"},
        "Sunday": {"open": "18:00", "close": "01:00"}
    }',
    ARRAY['Funktion-One Sound System', 'Pioneer CDJ-3000 x4', 'Pioneer DJM-900NXS2', 'LED Wall Display', 'Laser Light Show', 'Fog Machines', 'VIP Booth'],
    500,
    'nightclub',
    '{"phone": "+1 (555) 123-4567", "email": "bookings@electriclounge.com", "website": "https://electriclounge.com"}',
    ARRAY['Full Bar', 'VIP Seating', 'Coat Check', 'Security', 'Parking', 'Wheelchair Accessible']
) ON CONFLICT (profile_id) DO UPDATE SET
    venue_name = EXCLUDED.venue_name,
    description = EXCLUDED.description,
    address = EXCLUDED.address,
    location = EXCLUDED.location,
    hours_of_operation = EXCLUDED.hours_of_operation,
    equipment_list = EXCLUDED.equipment_list,
    capacity = EXCLUDED.capacity,
    venue_type = EXCLUDED.venue_type,
    contact_info = EXCLUDED.contact_info,
    amenities = EXCLUDED.amenities;

-- Demo Events
INSERT INTO public.events (
    name, description, venue_id, dj_id, date, start_time, end_time,
    status, genre, ticket_price, max_attendees
) VALUES 
(
    'Summer Beats Festival',
    'An electrifying night of electronic dance music featuring top DJs and immersive visuals.',
    (SELECT id FROM public.venue_profiles WHERE venue_name = 'The Electric Lounge'),
    (SELECT id FROM public.dj_profiles WHERE stage_name = 'DJ Alex Rivera'),
    '2024-07-15 22:00:00+00',
    '22:00',
    '03:00',
    'upcoming',
    'Electronic',
    2500, -- $25 in cents
    400
),
(
    'Saturday Night Mix',
    'Weekly house music session with special guest DJs and drink specials.',
    (SELECT id FROM public.venue_profiles WHERE venue_name = 'The Electric Lounge'),
    (SELECT id FROM public.dj_profiles WHERE stage_name = 'DJ Alex Rivera'),
    '2024-07-20 21:00:00+00',
    '21:00',
    '02:00',
    'upcoming',
    'House',
    2000, -- $20 in cents
    300
),
(
    'Electronic Underground',
    'Deep house and techno night featuring underground artists.',
    (SELECT id FROM public.venue_profiles WHERE venue_name = 'The Electric Lounge'),
    (SELECT id FROM public.dj_profiles WHERE stage_name = 'DJ Alex Rivera'),
    '2024-07-05 20:00:00+00',
    '20:00',
    '01:00',
    'completed',
    'Techno',
    1800, -- $18 in cents
    250
);

-- Demo DJ Bookings
INSERT INTO public.dj_bookings (
    dj_id, venue_id, event_id, booking_date, duration_hours, payment_amount, status
) VALUES 
(
    (SELECT id FROM public.dj_profiles WHERE stage_name = 'DJ Alex Rivera'),
    (SELECT id FROM public.venue_profiles WHERE venue_name = 'The Electric Lounge'),
    (SELECT id FROM public.events WHERE name = 'Summer Beats Festival'),
    '2024-07-15 22:00:00+00',
    5,
    80000, -- $800 in cents
    'confirmed'
),
(
    (SELECT id FROM public.dj_profiles WHERE stage_name = 'DJ Alex Rivera'),
    (SELECT id FROM public.venue_profiles WHERE venue_name = 'The Electric Lounge'),
    (SELECT id FROM public.events WHERE name = 'Saturday Night Mix'),
    '2024-07-20 21:00:00+00',
    5,
    65000, -- $650 in cents
    'pending'
);

-- Demo Event Attendees
INSERT INTO public.event_attendees (
    event_id, attendee_id, status
) VALUES 
(
    (SELECT id FROM public.events WHERE name = 'Summer Beats Festival'),
    (SELECT id FROM public.attendee_profiles WHERE username = 'MusicLover_Sam'),
    'rsvp'
),
(
    (SELECT id FROM public.events WHERE name = 'Saturday Night Mix'),
    (SELECT id FROM public.attendee_profiles WHERE username = 'MusicLover_Sam'),
    'rsvp'
),
(
    (SELECT id FROM public.events WHERE name = 'Electronic Underground'),
    (SELECT id FROM public.attendee_profiles WHERE username = 'MusicLover_Sam'),
    'attended'
);

-- Demo Tips
INSERT INTO public.tips (
    from_user_id, to_dj_id, amount, song_title, artist_name, event_id, message
) VALUES 
(
    (SELECT id FROM public.profiles WHERE email = 'attendee@djei.demo'),
    (SELECT id FROM public.dj_profiles WHERE stage_name = 'DJ Alex Rivera'),
    1500, -- $15 in cents
    'Blinding Lights',
    'The Weeknd',
    (SELECT id FROM public.events WHERE name = 'Electronic Underground'),
    'Amazing remix! Keep the energy up!'
),
(
    (SELECT id FROM public.profiles WHERE email = 'attendee@djei.demo'),
    (SELECT id FROM public.dj_profiles WHERE stage_name = 'DJ Alex Rivera'),
    2000, -- $20 in cents
    'One More Time',
    'Daft Punk',
    (SELECT id FROM public.events WHERE name = 'Electronic Underground'),
    'Perfect song choice!'
),
(
    (SELECT id FROM public.profiles WHERE email = 'attendee@djei.demo'),
    (SELECT id FROM public.dj_profiles WHERE stage_name = 'DJ Alex Rivera'),
    1200, -- $12 in cents
    'Levels',
    'Avicii',
    (SELECT id FROM public.events WHERE name = 'Electronic Underground'),
    'Classic!'
);

-- Demo Song Requests
INSERT INTO public.song_requests (
    requester_id, dj_id, event_id, song_title, artist_name, tokens_bid, status, message
) VALUES 
(
    (SELECT id FROM public.attendee_profiles WHERE username = 'MusicLover_Sam'),
    (SELECT id FROM public.dj_profiles WHERE stage_name = 'DJ Alex Rivera'),
    (SELECT id FROM public.events WHERE name = 'Summer Beats Festival'),
    'Sicko Mode',
    'Travis Scott',
    15,
    'played',
    'Please play this for the crowd!'
),
(
    (SELECT id FROM public.attendee_profiles WHERE username = 'MusicLover_Sam'),
    (SELECT id FROM public.dj_profiles WHERE stage_name = 'DJ Alex Rivera'),
    (SELECT id FROM public.events WHERE name = 'Saturday Night Mix'),
    'Bad Guy',
    'Billie Eilish',
    18,
    'pending',
    'Would love to hear this remix!'
);

-- Demo DJ Followers
INSERT INTO public.dj_followers (
    dj_id, follower_id
) VALUES 
(
    (SELECT id FROM public.dj_profiles WHERE stage_name = 'DJ Alex Rivera'),
    (SELECT id FROM public.attendee_profiles WHERE username = 'MusicLover_Sam')
);

-- Demo Track Analytics
INSERT INTO public.track_analytics (
    dj_id, track_title, artist_name, play_count, tip_count, last_played
) VALUES 
(
    (SELECT id FROM public.dj_profiles WHERE stage_name = 'DJ Alex Rivera'),
    'Electronic Vibes Mix',
    'DJ Alex Rivera',
    2847,
    124,
    '2024-07-05 23:30:00+00'
),
(
    (SELECT id FROM public.dj_profiles WHERE stage_name = 'DJ Alex Rivera'),
    'Midnight House Session',
    'DJ Alex Rivera',
    1923,
    89,
    '2024-07-03 01:15:00+00'
),
(
    (SELECT id FROM public.dj_profiles WHERE stage_name = 'DJ Alex Rivera'),
    'Progressive Trance Journey',
    'DJ Alex Rivera',
    1456,
    67,
    '2024-07-01 22:45:00+00'
);

-- Demo Feedback
INSERT INTO public.feedback (
    event_id, attendee_id, rating, comment, category
) VALUES 
(
    (SELECT id FROM public.events WHERE name = 'Electronic Underground'),
    (SELECT id FROM public.attendee_profiles WHERE username = 'MusicLover_Sam'),
    5,
    'Amazing atmosphere and great sound system! DJ Alex really knows how to read the crowd.',
    'dj_performance'
),
(
    (SELECT id FROM public.events WHERE name = 'Electronic Underground'),
    (SELECT id FROM public.attendee_profiles WHERE username = 'MusicLover_Sam'),
    4,
    'Love the vibe at Electric Lounge. Could use more seating areas for those who want to take a break.',
    'atmosphere'
),
(
    (SELECT id FROM public.events WHERE name = 'Electronic Underground'),
    (SELECT id FROM public.attendee_profiles WHERE username = 'MusicLover_Sam'),
    5,
    'Perfect venue for electronic music events! The sound quality is incredible.',
    'sound'
);

-- Add some sample data for other DJs/venues (optional)
-- You can expand this with more demo data as needed 