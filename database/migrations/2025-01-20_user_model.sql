-- User Model table for authentication and user management
BEGIN;

-- Create user_model table
CREATE TABLE IF NOT EXISTS public.user_model (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_model_email ON public.user_model (email);
CREATE INDEX IF NOT EXISTS idx_user_model_role ON public.user_model (role);
CREATE INDEX IF NOT EXISTS idx_user_model_created_at ON public.user_model (created_at);
CREATE INDEX IF NOT EXISTS idx_user_model_deleted_at ON public.user_model (deleted_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_model_updated_at 
    BEFORE UPDATE ON public.user_model 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_model ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.user_model
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON public.user_model
    FOR UPDATE USING (auth.uid() = id);

-- Only authenticated users can insert
CREATE POLICY "Authenticated users can insert" ON public.user_model
    FOR INSERT WITH CHECK (auth.uid() = id);

COMMIT;
