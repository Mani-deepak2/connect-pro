-- Migration 3: Fix Users Table and Trigger

-- 1. Create public.users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  role text CHECK (role IN ('client', 'freelancer')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
DO $$ BEGIN
  CREATE POLICY "Users can read own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Allow users to update their own profile
DO $$ BEGIN
  CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Allow users to insert their own profile
DO $$ BEGIN
  CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Allow reading all users (needed for profiles)
DO $$ BEGIN
  CREATE POLICY "Anyone can read user roles" ON public.users
    FOR SELECT USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create the trigger function to automatically insert into public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
