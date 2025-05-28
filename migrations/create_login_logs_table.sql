-- Create login_logs table to track user login activity
CREATE TABLE IF NOT EXISTS login_logs (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  user_id UUID,
  status VARCHAR(50) NOT NULL, -- 'success', 'failed'
  error_message TEXT,
  ip_address VARCHAR(50),
  user_agent TEXT,
  login_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON login_logs(user_id);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_login_logs_email ON login_logs(email);

-- Create index on login_time for date range queries
CREATE INDEX IF NOT EXISTS idx_login_logs_login_time ON login_logs(login_time);
