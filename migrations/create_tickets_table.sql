-- Create tickets table if it doesn't exist
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_id TEXT NOT NULL,
  ticket_type TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  ticket_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS tickets_user_id_idx ON tickets(user_id);

-- Create index on event_id for faster queries
CREATE INDEX IF NOT EXISTS tickets_event_id_idx ON tickets(event_id);

-- Add some sample tickets for testing
INSERT INTO tickets (user_id, event_id, ticket_type, price, status, ticket_number)
VALUES 
  -- Replace with actual user IDs from your auth.users table
  ('00000000-0000-0000-0000-000000000000', 'summer-beats-festival', 'VIP', 49.99, 'active', 'TKT-ABC123XYZ'),
  ('00000000-0000-0000-0000-000000000000', 'neon-nights', 'General Admission', 29.99, 'active', 'TKT-DEF456UVW');
