-- Migration 5: Freelancer Profile Extended Data

-- 1. Modify freelancer_profiles
ALTER TABLE public.freelancer_profiles 
ADD COLUMN IF NOT EXISTS username text UNIQUE,
ADD COLUMN IF NOT EXISTS availability_status text DEFAULT 'Available Now' CHECK (availability_status IN ('Available Now', 'Busy', 'Unavailable')),
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS hourly_rate numeric,
ADD COLUMN IF NOT EXISTS portfolio_link text,
ADD COLUMN IF NOT EXISTS profile_image text,
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS languages text[],
ADD COLUMN IF NOT EXISTS remote_friendly boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS desired_salary text;

-- 2. Freelancer Statistics


CREATE TABLE public.freelancer_stats (
  freelancer_id uuid REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  projects_completed integer DEFAULT 0,
  success_rate integer DEFAULT 100,
  total_earnings numeric DEFAULT 0,
  total_hours_worked numeric DEFAULT 0,
  total_reviews integer DEFAULT 0,
  average_rating numeric(3,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
-- 3. Freelancer Skills
CREATE TABLE public.freelancer_skills (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  freelancer_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  skill_name text NOT NULL,
  years_experience numeric NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5)
);

ALTER TABLE public.freelancer_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read skills" ON public.freelancer_skills FOR SELECT USING (true);
CREATE POLICY "Freelancers can manage own skills" ON public.freelancer_skills FOR ALL USING (auth.uid() = freelancer_id);

-- 4. Portfolio Projects
CREATE TABLE public.portfolio_projects (
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
CREATE POLICY "Anyone can read portfolio projects" ON public.portfolio_projects FOR SELECT USING (true);
CREATE POLICY "Freelancers can manage own portfolio" ON public.portfolio_projects FOR ALL USING (auth.uid() = freelancer_id);

-- 5. Employment History
CREATE TABLE public.employment_history (
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
CREATE POLICY "Anyone can read employment history" ON public.employment_history FOR SELECT USING (true);
CREATE POLICY "Freelancers can manage own employment" ON public.employment_history FOR ALL USING (auth.uid() = freelancer_id);

-- 6. Education
CREATE TABLE public.education (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  freelancer_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  degree text NOT NULL,
  institution text NOT NULL,
  year text NOT NULL,
  grade text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read education" ON public.education FOR SELECT USING (true);
CREATE POLICY "Freelancers can manage own education" ON public.education FOR ALL USING (auth.uid() = freelancer_id);

-- 7. Attachments
CREATE TABLE public.attachments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  freelancer_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  type text CHECK (type IN ('resume', 'certificate', 'other')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read attachments" ON public.attachments FOR SELECT USING (true);
CREATE POLICY "Freelancers can manage own attachments" ON public.attachments FOR ALL USING (auth.uid() = freelancer_id);
