-- ============================================================
-- CONNECTPRO MASTER MIGRATION - Run once in Supabase SQL Editor
-- ============================================================

-- STEP 1: public.users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  role text CHECK (role IN ('client', 'freelancer')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can read own record" ON public.users FOR SELECT USING (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can update own record" ON public.users FOR UPDATE USING (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can insert own record" ON public.users FOR INSERT WITH CHECK (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Anyone can read user roles" ON public.users FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- STEP 2: Trigger to auto-create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email) VALUES (new.id, new.email) ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- STEP 3: freelancer_profiles
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
ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Anyone can read freelancer profiles" ON public.freelancer_profiles FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Freelancers can insert own profile" ON public.freelancer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Freelancers can update own profile" ON public.freelancer_profiles FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- STEP 4: client_profiles
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
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Anyone can read client profiles" ON public.client_profiles FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Clients can insert own profile" ON public.client_profiles FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Clients can update own profile" ON public.client_profiles FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- STEP 5: projects
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  required_skills text[] NOT NULL DEFAULT '{}',
  budget_type text NOT NULL CHECK (budget_type IN ('fixed', 'hourly')),
  budget_amount numeric NOT NULL,
  duration text NOT NULL,
  experience_level text NOT NULL,
  deadline date NOT NULL,
  attachments text[] DEFAULT '{}',
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Open projects viewable by all" ON public.projects FOR SELECT USING (status = 'open'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Clients can view own projects" ON public.projects FOR SELECT USING (auth.uid() = client_id); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Clients can insert projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = client_id); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Clients can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = client_id); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Clients can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = client_id); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- STEP 6: applications
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  freelancer_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  proposal text NOT NULL,
  bid_amount numeric NOT NULL,
  estimated_delivery_days integer NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'shortlisted', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, freelancer_id)
);
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Freelancers view own applications" ON public.applications FOR SELECT USING (auth.uid() = freelancer_id); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Clients view project applications" ON public.applications FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = applications.project_id AND projects.client_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Freelancers insert own applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = freelancer_id); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Clients update applications" ON public.applications FOR UPDATE USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = applications.project_id AND projects.client_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- STEP 7: credits
CREATE TABLE IF NOT EXISTS public.credits (
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  balance integer DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users read own credits" ON public.credits FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users insert own credits" ON public.credits FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users update own credits" ON public.credits FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- STEP 8: contracts
CREATE TABLE IF NOT EXISTS public.contracts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  freelancer_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users read own contracts" ON public.contracts FOR SELECT USING (auth.uid() = freelancer_id OR auth.uid() = client_id); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Clients insert contracts" ON public.contracts FOR INSERT WITH CHECK (auth.uid() = client_id); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users update own contracts" ON public.contracts FOR UPDATE USING (auth.uid() = freelancer_id OR auth.uid() = client_id); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- STEP 9: conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  freelancer_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users read own conversations" ON public.conversations FOR SELECT USING (auth.uid() = freelancer_id OR auth.uid() = client_id); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users insert conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = freelancer_id OR auth.uid() = client_id); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- STEP 10: messages
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users read conversation messages" ON public.messages FOR SELECT USING (EXISTS (SELECT 1 FROM public.conversations WHERE conversations.id = messages.conversation_id AND (conversations.client_id = auth.uid() OR conversations.freelancer_id = auth.uid()))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users insert messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.conversations WHERE conversations.id = messages.conversation_id AND (conversations.client_id = auth.uid() OR conversations.freelancer_id = auth.uid()))); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- STEP 11: work_submissions
CREATE TABLE IF NOT EXISTS public.work_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id uuid REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  freelancer_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  submission_url text NOT NULL,
  notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'revision_requested')),
  client_feedback text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.work_submissions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Contract parties read submissions" ON public.work_submissions FOR SELECT USING (EXISTS (SELECT 1 FROM public.contracts WHERE contracts.id = work_submissions.contract_id AND (contracts.client_id = auth.uid() OR contracts.freelancer_id = auth.uid()))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Freelancers insert submissions" ON public.work_submissions FOR INSERT WITH CHECK (auth.uid() = freelancer_id); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Contract parties update submissions" ON public.work_submissions FOR UPDATE USING (EXISTS (SELECT 1 FROM public.contracts WHERE contracts.id = work_submissions.contract_id AND (contracts.client_id = auth.uid() OR contracts.freelancer_id = auth.uid()))); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- STEP 12: payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id uuid REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  freelancer_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  platform_fee numeric NOT NULL,
  freelancer_payout numeric NOT NULL,
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users read own payments" ON public.payments FOR SELECT USING (auth.uid() = client_id OR auth.uid() = freelancer_id); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Clients insert payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = client_id); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- STEP 13: reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id uuid REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  reviewer_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  reviewee_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Anyone can read reviews" ON public.reviews FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users insert own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- STEP 14: freelancer_stats
CREATE TABLE IF NOT EXISTS public.freelancer_stats (
  freelancer_id uuid REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  projects_completed integer DEFAULT 0,
  success_rate integer DEFAULT 100,
  total_earnings numeric DEFAULT 0,
  total_hours_worked numeric DEFAULT 0,
  total_reviews integer DEFAULT 0,
  average_rating numeric(3,2) DEFAULT 0.00
);
ALTER TABLE public.freelancer_stats ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Anyone can read freelancer stats" ON public.freelancer_stats FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Freelancers manage own stats" ON public.freelancer_stats FOR ALL USING (auth.uid() = freelancer_id); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- STEP 15: freelancer_skills
CREATE TABLE IF NOT EXISTS public.freelancer_skills (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  freelancer_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  skill_name text NOT NULL,
  years_experience numeric NOT NULL DEFAULT 1,
  rating integer DEFAULT 3 CHECK (rating >= 1 AND rating <= 5)
);
ALTER TABLE public.freelancer_skills ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Anyone can read skills" ON public.freelancer_skills FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Freelancers manage own skills" ON public.freelancer_skills FOR ALL USING (auth.uid() = freelancer_id); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- STEP 16: portfolio_projects
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  freelancer_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  category text,
  description text,
  image_url text,
  project_link text,
  github_link text,
  technologies text[],
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Anyone can read portfolio" ON public.portfolio_projects FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Freelancers manage own portfolio" ON public.portfolio_projects FOR ALL USING (auth.uid() = freelancer_id); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- STEP 17: employment_history
CREATE TABLE IF NOT EXISTS public.employment_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  freelancer_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  company text NOT NULL,
  position text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  description text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.employment_history ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Anyone can read employment" ON public.employment_history FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Freelancers manage own employment" ON public.employment_history FOR ALL USING (auth.uid() = freelancer_id); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- STEP 18: education
CREATE TABLE IF NOT EXISTS public.education (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  freelancer_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  degree text NOT NULL,
  institution text NOT NULL,
  year text NOT NULL,
  grade text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Anyone can read education" ON public.education FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Freelancers manage own education" ON public.education FOR ALL USING (auth.uid() = freelancer_id); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- STEP 19: attachments
CREATE TABLE IF NOT EXISTS public.attachments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  freelancer_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  type text CHECK (type IN ('resume', 'certificate', 'other')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Anyone can read attachments" ON public.attachments FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Freelancers manage own attachments" ON public.attachments FOR ALL USING (auth.uid() = freelancer_id); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- STEP 20: notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Authenticated users insert notifications" ON public.notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated'); EXCEPTION WHEN duplicate_object THEN null; END $$;

SELECT 'All tables created successfully!' as result;
