-- Create event_codes table
CREATE TABLE IF NOT EXISTS event_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT NOT NULL,
  code TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(event_id, code)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_event_codes_event_id ON event_codes(event_id);
CREATE INDEX IF NOT EXISTS idx_event_codes_code ON event_codes(code);

-- Create function to validate event code
CREATE OR REPLACE FUNCTION validate_event_code(p_event_id TEXT, p_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_code_exists BOOLEAN;
  v_is_valid BOOLEAN := FALSE;
BEGIN
  -- Check if code exists and is valid
  SELECT EXISTS (
    SELECT 1 
    FROM event_codes 
    WHERE event_id = p_event_id 
    AND code = p_code 
    AND is_active = TRUE 
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (max_uses IS NULL OR current_uses < max_uses)
  ) INTO v_code_exists;
  
  -- If code exists and is valid, increment usage count
  IF v_code_exists THEN
    UPDATE event_codes
    SET current_uses = current_uses + 1
    WHERE event_id = p_event_id AND code = p_code;
    
    v_is_valid := TRUE;
  END IF;
  
  RETURN v_is_valid;
END;
$$ LANGUAGE plpgsql;
