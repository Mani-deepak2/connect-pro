-- Migration 10: Finalizing Marketplace Phases (Credits, Submissions, Reviews, Disputes)

-- 1. Ensure credits table has a row for every user, defaulting to 20.
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.credits (user_id, balance)
  VALUES (new.id, 20);

  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (new.id, 20, 'signup_bonus', 'Initial 20 free credits');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON public.users;
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- Backfill credits for existing users who don't have them
INSERT INTO public.credits (user_id, balance)
SELECT id, 20 FROM public.users WHERE id NOT IN (SELECT user_id FROM public.credits);

-- Add missing columns to credit_transactions if they don't exist (from migration 9 vs 2)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='credit_transactions' AND column_name='reason') THEN
    ALTER TABLE public.credit_transactions ADD COLUMN reason text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='credit_transactions' AND column_name='admin_id') THEN
    ALTER TABLE public.credit_transactions ADD COLUMN admin_id uuid REFERENCES public.users(id);
  END IF;
END $$;

-- Add missing columns to applications
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='credits_spent') THEN
    ALTER TABLE public.applications ADD COLUMN credits_spent integer DEFAULT 2;
  END IF;
END $$;

-- 2. Work Submissions Table
CREATE TABLE IF NOT EXISTS public.work_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id uuid REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  submitted_by uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  file_url text NOT NULL,
  version integer DEFAULT 1,
  notes text,
  status text DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'revision_requested', 'approved')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.work_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view submissions for their contracts" ON public.work_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.contracts 
      WHERE contracts.id = work_submissions.contract_id
      AND (contracts.client_id = auth.uid() OR contracts.freelancer_id = auth.uid())
    )
  );
CREATE POLICY "Freelancers can insert submissions" ON public.work_submissions
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Users can update submissions" ON public.work_submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.contracts 
      WHERE contracts.id = work_submissions.contract_id
      AND (contracts.client_id = auth.uid() OR contracts.freelancer_id = auth.uid())
    )
  );

-- 3. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  reviewee_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  contract_id uuid REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(reviewer_id, contract_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
  FOR SELECT USING (true);
CREATE POLICY "Users can insert reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- 4. Disputes Table
CREATE TABLE IF NOT EXISTS public.disputes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id uuid REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  freelancer_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  reason text NOT NULL,
  evidence text,
  status text DEFAULT 'Open' CHECK (status IN ('Open', 'Under Review', 'Resolved', 'Closed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view disputes for their contracts" ON public.disputes
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = freelancer_id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can insert disputes" ON public.disputes
  FOR INSERT WITH CHECK (auth.uid() = client_id OR auth.uid() = freelancer_id);
CREATE POLICY "Admins can update disputes" ON public.disputes
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

