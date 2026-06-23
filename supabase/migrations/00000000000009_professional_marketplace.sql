-- Migration 9: Professional Marketplace Architecture

-- 1. Extend user roles to include 'admin'
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('client', 'freelancer', 'admin'));

-- 2. Support Tickets Table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL, -- e.g., 'Payment Issues', 'Profile Problems'
  issue text NOT NULL,
  status text DEFAULT 'Open' CHECK (status IN ('Open', 'Pending', 'Resolved', 'Closed')),
  priority text DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Critical')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tickets" ON public.support_tickets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Admins can view/update all tickets (requires a function to check admin role)
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Admins can view all tickets" ON public.support_tickets
  FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update tickets" ON public.support_tickets
  FOR UPDATE USING (is_admin());

-- 3. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL, -- e.g., 'message', 'application', 'system'
  read boolean DEFAULT false,
  link text, -- optional link to click
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. User Subscriptions (Premium Plans)
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  plan_type text DEFAULT 'Free' CHECK (plan_type IN ('Free', 'Pro Freelancer', 'Pro Client', 'Agency')),
  status text DEFAULT 'Active' CHECK (status IN ('Active', 'Cancelled', 'Expired')),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage subscriptions" ON public.user_subscriptions
  FOR ALL USING (is_admin());

-- 5. Detailed Credit Transactions Ledger
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL, -- positive for addition, negative for deduction
  reason text NOT NULL, -- e.g., 'Project Application', 'Bonus', 'Purchase'
  admin_id uuid REFERENCES public.users(id), -- If added by an admin
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON public.credit_transactions
  FOR SELECT USING (is_admin());

-- 6. Add Reputation Fields to Profiles
-- Add to freelancer_profiles
ALTER TABLE public.freelancer_profiles
ADD COLUMN IF NOT EXISTS success_rate integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating numeric(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS projects_completed integer DEFAULT 0;

-- Add to client_profiles
ALTER TABLE public.client_profiles
ADD COLUMN IF NOT EXISTS projects_posted integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS projects_completed integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_client_rating numeric(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS payment_reliability text DEFAULT 'Unknown';

-- 7. Add Contact Info Visibility Control
-- By default, hidden = true means contacts are hidden unless contract exists
ALTER TABLE public.freelancer_profiles
ADD COLUMN IF NOT EXISTS hide_contacts boolean DEFAULT true;
