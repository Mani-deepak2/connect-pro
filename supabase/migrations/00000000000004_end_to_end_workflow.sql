-- Migration 4: End-to-End Workflow (Submissions, Payments, Reviews)

-- 1. Work Submissions Table
CREATE TABLE public.work_submissions (
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
CREATE POLICY "Users can read own submissions" ON public.work_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE contracts.id = work_submissions.contract_id
      AND (contracts.client_id = auth.uid() OR contracts.freelancer_id = auth.uid())
    )
  );

CREATE POLICY "Freelancers can insert submissions" ON public.work_submissions
  FOR INSERT WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "Clients and Freelancers can update submissions" ON public.work_submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE contracts.id = work_submissions.contract_id
      AND (contracts.client_id = auth.uid() OR contracts.freelancer_id = auth.uid())
    )
  );

-- 2. Payments Table
CREATE TABLE public.payments (
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
CREATE POLICY "Users can read own payments" ON public.payments
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = freelancer_id);

CREATE POLICY "Clients can insert payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- 3. Reviews Table
CREATE TABLE public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id uuid REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  reviewer_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  reviewee_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
