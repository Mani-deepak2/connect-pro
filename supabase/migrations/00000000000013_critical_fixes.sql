-- 1. Unique Usernames
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- Migrate any existing usernames from freelancer_profiles
UPDATE public.users u
SET username = p.username
FROM public.freelancer_profiles p
WHERE u.id = p.user_id AND u.username IS NULL AND p.username IS NOT NULL;

-- 2. Interviews Table
CREATE TABLE IF NOT EXISTS public.interviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  freelancer_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  scheduled_at timestamptz NOT NULL,
  status text CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'Rescheduled')) DEFAULT 'Scheduled',
  meeting_link text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can read own interviews" ON public.interviews FOR SELECT USING (auth.uid() = client_id OR auth.uid() = freelancer_id); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Clients can insert interviews" ON public.interviews FOR INSERT WITH CHECK (auth.uid() = client_id); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can update own interviews" ON public.interviews FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = freelancer_id); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Credits initialization trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email) VALUES (new.id, new.email) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.credits (user_id, balance) VALUES (new.id, 20) ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Credit Migration for existing users
INSERT INTO public.credits (user_id, balance)
SELECT id, 20 FROM public.users
ON CONFLICT (user_id) DO UPDATE SET balance = EXCLUDED.balance WHERE public.credits.balance = 100 OR public.credits.balance = 0;
-- We only update if they haven't used credits (default was 100) or have 0. If they have some random amount we assume they bought/earned them. Actually, just to be safe based on requirements, let's just make sure everyone has at least 20 credits.
UPDATE public.credits SET balance = 20 WHERE balance < 20;

-- 5. Prevent negative credits
DO $$ BEGIN
  ALTER TABLE public.credits ADD CONSTRAINT credits_balance_check CHECK (balance >= 0);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
