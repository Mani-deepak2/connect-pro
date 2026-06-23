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
- -   M i g r a t i o n   9 :   P r o f e s s i o n a l   M a r k e t p l a c e   A r c h i t e c t u r e  
  
 - -   1 .   E x t e n d   u s e r   r o l e s   t o   i n c l u d e   ' a d m i n '  
 - -   T h e   ' u s e r s '   t a b l e   h a s   a   ' r o l e '   c o l u m n   w h i c h   i s   t e x t .   W e   d o n ' t   n e e d   t o   a l t e r   t h e   t y p e   i f   i t ' s   t e x t ,  
 - -   b u t   w e   m i g h t   w a n t   t o   e n s u r e   ' a d m i n '   i s   r e c o g n i z e d .   N o   s t r u c t u r a l   c h a n g e   r e q u i r e d ,   j u s t   l o g i c .  
  
 - -   2 .   S u p p o r t   T i c k e t s   T a b l e  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . s u p p o r t _ t i c k e t s   (  
     i d   u u i d   D E F A U L T   g e n _ r a n d o m _ u u i d ( )   P R I M A R Y   K E Y ,  
     u s e r _ i d   u u i d   R E F E R E N C E S   p u b l i c . u s e r s ( i d )   O N   D E L E T E   C A S C A D E   N O T   N U L L ,  
     c a t e g o r y   t e x t   N O T   N U L L ,   - -   e . g . ,   ' P a y m e n t   I s s u e s ' ,   ' P r o f i l e   P r o b l e m s '  
     i s s u e   t e x t   N O T   N U L L ,  
     s t a t u s   t e x t   D E F A U L T   ' O p e n '   C H E C K   ( s t a t u s   I N   ( ' O p e n ' ,   ' P e n d i n g ' ,   ' R e s o l v e d ' ,   ' C l o s e d ' ) ) ,  
     p r i o r i t y   t e x t   D E F A U L T   ' N o r m a l '   C H E C K   ( p r i o r i t y   I N   ( ' L o w ' ,   ' N o r m a l ' ,   ' H i g h ' ,   ' C r i t i c a l ' ) ) ,  
     c r e a t e d _ a t   t i m e s t a m p t z   D E F A U L T   n o w ( ) ,  
     u p d a t e d _ a t   t i m e s t a m p t z   D E F A U L T   n o w ( )  
 ) ;  
  
 A L T E R   T A B L E   p u b l i c . s u p p o r t _ t i c k e t s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
  
 C R E A T E   P O L I C Y   " U s e r s   c a n   v i e w   t h e i r   o w n   t i c k e t s "   O N   p u b l i c . s u p p o r t _ t i c k e t s  
     F O R   S E L E C T   U S I N G   ( a u t h . u i d ( )   =   u s e r _ i d ) ;  
 C R E A T E   P O L I C Y   " U s e r s   c a n   c r e a t e   t i c k e t s "   O N   p u b l i c . s u p p o r t _ t i c k e t s  
     F O R   I N S E R T   W I T H   C H E C K   ( a u t h . u i d ( )   =   u s e r _ i d ) ;  
 - -   A d m i n s   c a n   v i e w / u p d a t e   a l l   t i c k e t s   ( r e q u i r e s   a   f u n c t i o n   t o   c h e c k   a d m i n   r o l e )  
 C R E A T E   O R   R E P L A C E   F U N C T I O N   i s _ a d m i n ( )   R E T U R N S   b o o l e a n   A S   $ $  
 B E G I N  
     R E T U R N   E X I S T S   (  
         S E L E C T   1   F R O M   p u b l i c . u s e r s    
         W H E R E   i d   =   a u t h . u i d ( )   A N D   r o l e   =   ' a d m i n '  
     ) ;  
 E N D ;  
 $ $   L A N G U A G E   p l p g s q l   S E C U R I T Y   D E F I N E R ;  
  
 C R E A T E   P O L I C Y   " A d m i n s   c a n   v i e w   a l l   t i c k e t s "   O N   p u b l i c . s u p p o r t _ t i c k e t s  
     F O R   S E L E C T   U S I N G   ( i s _ a d m i n ( ) ) ;  
 C R E A T E   P O L I C Y   " A d m i n s   c a n   u p d a t e   t i c k e t s "   O N   p u b l i c . s u p p o r t _ t i c k e t s  
     F O R   U P D A T E   U S I N G   ( i s _ a d m i n ( ) ) ;  
  
 - -   3 .   N o t i f i c a t i o n s   T a b l e  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . n o t i f i c a t i o n s   (  
     i d   u u i d   D E F A U L T   g e n _ r a n d o m _ u u i d ( )   P R I M A R Y   K E Y ,  
     u s e r _ i d   u u i d   R E F E R E N C E S   p u b l i c . u s e r s ( i d )   O N   D E L E T E   C A S C A D E   N O T   N U L L ,  
     t i t l e   t e x t   N O T   N U L L ,  
     m e s s a g e   t e x t   N O T   N U L L ,  
     t y p e   t e x t   N O T   N U L L ,   - -   e . g . ,   ' m e s s a g e ' ,   ' a p p l i c a t i o n ' ,   ' s y s t e m '  
     r e a d   b o o l e a n   D E F A U L T   f a l s e ,  
     l i n k   t e x t ,   - -   o p t i o n a l   l i n k   t o   c l i c k  
     c r e a t e d _ a t   t i m e s t a m p t z   D E F A U L T   n o w ( )  
 ) ;  
  
 A L T E R   T A B L E   p u b l i c . n o t i f i c a t i o n s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
  
 C R E A T E   P O L I C Y   " U s e r s   c a n   v i e w   t h e i r   o w n   n o t i f i c a t i o n s "   O N   p u b l i c . n o t i f i c a t i o n s  
     F O R   S E L E C T   U S I N G   ( a u t h . u i d ( )   =   u s e r _ i d ) ;  
 C R E A T E   P O L I C Y   " U s e r s   c a n   u p d a t e   t h e i r   o w n   n o t i f i c a t i o n s "   O N   p u b l i c . n o t i f i c a t i o n s  
     F O R   U P D A T E   U S I N G   ( a u t h . u i d ( )   =   u s e r _ i d ) ;  
  
 - -   4 .   U s e r   S u b s c r i p t i o n s   ( P r e m i u m   P l a n s )  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . u s e r _ s u b s c r i p t i o n s   (  
     u s e r _ i d   u u i d   R E F E R E N C E S   p u b l i c . u s e r s ( i d )   O N   D E L E T E   C A S C A D E   P R I M A R Y   K E Y ,  
     p l a n _ t y p e   t e x t   D E F A U L T   ' F r e e '   C H E C K   ( p l a n _ t y p e   I N   ( ' F r e e ' ,   ' P r o   F r e e l a n c e r ' ,   ' P r o   C l i e n t ' ,   ' A g e n c y ' ) ) ,  
     s t a t u s   t e x t   D E F A U L T   ' A c t i v e '   C H E C K   ( s t a t u s   I N   ( ' A c t i v e ' ,   ' C a n c e l l e d ' ,   ' E x p i r e d ' ) ) ,  
     e x p i r e s _ a t   t i m e s t a m p t z ,  
     c r e a t e d _ a t   t i m e s t a m p t z   D E F A U L T   n o w ( ) ,  
     u p d a t e d _ a t   t i m e s t a m p t z   D E F A U L T   n o w ( )  
 ) ;  
  
 A L T E R   T A B L E   p u b l i c . u s e r _ s u b s c r i p t i o n s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
 C R E A T E   P O L I C Y   " U s e r s   c a n   v i e w   t h e i r   o w n   s u b s c r i p t i o n "   O N   p u b l i c . u s e r _ s u b s c r i p t i o n s  
     F O R   S E L E C T   U S I N G   ( a u t h . u i d ( )   =   u s e r _ i d ) ;  
 C R E A T E   P O L I C Y   " A d m i n s   c a n   m a n a g e   s u b s c r i p t i o n s "   O N   p u b l i c . u s e r _ s u b s c r i p t i o n s  
     F O R   A L L   U S I N G   ( i s _ a d m i n ( ) ) ;  
  
 - -   5 .   D e t a i l e d   C r e d i t   T r a n s a c t i o n s   L e d g e r  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . c r e d i t _ t r a n s a c t i o n s   (  
     i d   u u i d   D E F A U L T   g e n _ r a n d o m _ u u i d ( )   P R I M A R Y   K E Y ,  
     u s e r _ i d   u u i d   R E F E R E N C E S   p u b l i c . u s e r s ( i d )   O N   D E L E T E   C A S C A D E   N O T   N U L L ,  
     a m o u n t   i n t e g e r   N O T   N U L L ,   - -   p o s i t i v e   f o r   a d d i t i o n ,   n e g a t i v e   f o r   d e d u c t i o n  
     r e a s o n   t e x t   N O T   N U L L ,   - -   e . g . ,   ' P r o j e c t   A p p l i c a t i o n ' ,   ' B o n u s ' ,   ' P u r c h a s e '  
     a d m i n _ i d   u u i d   R E F E R E N C E S   p u b l i c . u s e r s ( i d ) ,   - -   I f   a d d e d   b y   a n   a d m i n  
     c r e a t e d _ a t   t i m e s t a m p t z   D E F A U L T   n o w ( )  
 ) ;  
  
 A L T E R   T A B L E   p u b l i c . c r e d i t _ t r a n s a c t i o n s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
 C R E A T E   P O L I C Y   " U s e r s   c a n   v i e w   t h e i r   o w n   t r a n s a c t i o n s "   O N   p u b l i c . c r e d i t _ t r a n s a c t i o n s  
     F O R   S E L E C T   U S I N G   ( a u t h . u i d ( )   =   u s e r _ i d ) ;  
 C R E A T E   P O L I C Y   " A d m i n s   c a n   v i e w   a l l   t r a n s a c t i o n s "   O N   p u b l i c . c r e d i t _ t r a n s a c t i o n s  
     F O R   S E L E C T   U S I N G   ( i s _ a d m i n ( ) ) ;  
  
 - -   6 .   A d d   R e p u t a t i o n   F i e l d s   t o   P r o f i l e s  
 - -   A d d   t o   f r e e l a n c e r _ p r o f i l e s  
 A L T E R   T A B L E   p u b l i c . f r e e l a n c e r _ p r o f i l e s  
 A D D   C O L U M N   I F   N O T   E X I S T S   s u c c e s s _ r a t e   i n t e g e r   D E F A U L T   0 ,  
 A D D   C O L U M N   I F   N O T   E X I S T S   a v e r a g e _ r a t i n g   n u m e r i c ( 3 , 2 )   D E F A U L T   0 . 0 0 ,  
 A D D   C O L U M N   I F   N O T   E X I S T S   p r o j e c t s _ c o m p l e t e d   i n t e g e r   D E F A U L T   0 ;  
  
 - -   A d d   t o   c l i e n t _ p r o f i l e s  
 A L T E R   T A B L E   p u b l i c . c l i e n t _ p r o f i l e s  
 A D D   C O L U M N   I F   N O T   E X I S T S   p r o j e c t s _ p o s t e d   i n t e g e r   D E F A U L T   0 ,  
 A D D   C O L U M N   I F   N O T   E X I S T S   p r o j e c t s _ c o m p l e t e d   i n t e g e r   D E F A U L T   0 ,  
 A D D   C O L U M N   I F   N O T   E X I S T S   a v e r a g e _ c l i e n t _ r a t i n g   n u m e r i c ( 3 , 2 )   D E F A U L T   0 . 0 0 ,  
 A D D   C O L U M N   I F   N O T   E X I S T S   p a y m e n t _ r e l i a b i l i t y   t e x t   D E F A U L T   ' U n k n o w n ' ;  
  
 - -   7 .   A d d   C o n t a c t   I n f o   V i s i b i l i t y   C o n t r o l  
 - -   B y   d e f a u l t ,   h i d d e n   =   t r u e   m e a n s   c o n t a c t s   a r e   h i d d e n   u n l e s s   c o n t r a c t   e x i s t s  
 A L T E R   T A B L E   p u b l i c . f r e e l a n c e r _ p r o f i l e s  
 A D D   C O L U M N   I F   N O T   E X I S T S   h i d e _ c o n t a c t s   b o o l e a n   D E F A U L T   t r u e ;  
 