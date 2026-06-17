-- Migration 6: Create Profile Tables from Scratch with Full RLS

-- 1. freelancer_profiles table (create if not exists, with all required columns)
CREATE TABLE IF NOT EXISTS public.freelancer_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name text,
  title text,
  skills text[],
  bio text,
  hourly_rate numeric,
  experience_level text,
  portfolio_link text,
  profile_image text,
  location text,
  languages text[],
  remote_friendly boolean DEFAULT true,
  desired_salary text,
  username text UNIQUE,
  availability_status text DEFAULT 'Available Now',
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for freelancer_profiles
DO $$ BEGIN
  CREATE POLICY "Anyone can read freelancer profiles" ON public.freelancer_profiles
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Freelancers can insert own profile" ON public.freelancer_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Freelancers can update own profile" ON public.freelancer_profiles
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. client_profiles table (create if not exists, with all required columns)
CREATE TABLE IF NOT EXISTS public.client_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name text NOT NULL,
  industry text,
  company_website text,
  company_description text,
  company_logo text,
  logo text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_profiles
DO $$ BEGIN
  CREATE POLICY "Anyone can read client profiles" ON public.client_profiles
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Clients can insert own profile" ON public.client_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Clients can update own profile" ON public.client_profiles
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
