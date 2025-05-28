-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL,
  price_yearly INTEGER NOT NULL,
  stripe_price_id_monthly VARCHAR(100),
  stripe_price_id_yearly VARCHAR(100),
  features JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id SERIAL PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES subscription_plans(id),
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  status VARCHAR(50) NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  billing_cycle VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id)
);

-- Create subscription feature usage table
CREATE TABLE IF NOT EXISTS subscription_feature_usage (
  id SERIAL PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature_name VARCHAR(100) NOT NULL,
  usage_count INTEGER DEFAULT 0,
  reset_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, feature_name)
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, stripe_price_id_monthly, stripe_price_id_yearly)
VALUES 
  ('Basic', 'Essential tools for new DJs', 999, 9990, 
   '{"max_events": 5, "song_library": 100, "analytics": false, "custom_branding": false, "priority_support": false, "ai_recommendations": false}',
   'price_basic_monthly', 'price_basic_yearly'),
  
  ('Pro', 'Advanced features for working DJs', 1999, 19990, 
   '{"max_events": 20, "song_library": 500, "analytics": true, "custom_branding": true, "priority_support": false, "ai_recommendations": true}',
   'price_pro_monthly', 'price_pro_yearly'),
  
  ('Premium', 'Complete solution for professional DJs', 2999, 29990, 
   '{"max_events": -1, "song_library": -1, "analytics": true, "custom_branding": true, "priority_support": true, "ai_recommendations": true}',
   'price_premium_monthly', 'price_premium_yearly');

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_profile_id ON user_subscriptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_subscription_feature_usage_profile_id ON subscription_feature_usage(profile_id);
