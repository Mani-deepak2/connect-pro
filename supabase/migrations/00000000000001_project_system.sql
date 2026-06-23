-- Migration 1: Project System

-- 1. Create Projects Table
CREATE TABLE public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  required_skills text[] NOT NULL,
  budget_type text NOT NULL CHECK (budget_type IN ('fixed', 'hourly')),
  budget_amount numeric NOT NULL,
  duration text NOT NULL,
  experience_level text NOT NULL,
  deadline date NOT NULL,
  attachments text[] DEFAULT '{}'::text[],
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policies for projects
-- Anyone can view open projects
CREATE POLICY "Open projects are viewable by everyone" ON public.projects
  FOR SELECT USING (status = 'open');

-- Clients can view all their own projects (including drafts/cancelled)
CREATE POLICY "Clients can view their own projects" ON public.projects
  FOR SELECT USING (auth.uid() = client_id);

-- Only clients can insert their own projects
CREATE POLICY "Clients can insert their own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Only clients can update their own projects
CREATE POLICY "Clients can update their own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = client_id);

-- Only clients can delete their own projects
CREATE POLICY "Clients can delete their own projects" ON public.projects
  FOR DELETE USING (auth.uid() = client_id);

-- 2. Create Applications Table
CREATE TABLE public.applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  freelancer_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  proposal text NOT NULL,
  bid_amount numeric NOT NULL,
  estimated_delivery_days integer NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'shortlisted', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, freelancer_id) -- Prevent duplicate applications
);

-- Enable RLS for applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Policies for applications
-- Freelancers can view their own applications
CREATE POLICY "Freelancers can view their own applications" ON public.applications
  FOR SELECT USING (auth.uid() = freelancer_id);

-- Clients can view applications for their projects
CREATE POLICY "Clients can view applications for their projects" ON public.applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = applications.project_id
      AND projects.client_id = auth.uid()
    )
  );

-- Freelancers can insert their own applications
CREATE POLICY "Freelancers can insert their own applications" ON public.applications
  FOR INSERT WITH CHECK (auth.uid() = freelancer_id);

-- Clients can update the status of applications for their projects
CREATE POLICY "Clients can update applications for their projects" ON public.applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = applications.project_id
      AND projects.client_id = auth.uid()
    )
  );

-- 3. Create Notifications Table
CREATE TABLE public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- System can insert notifications (via functions/triggers, so no explicit RLS needed for clients)
-- But let's allow inserts by authenticated users for now if we want client-side notification generation
CREATE POLICY "Users can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
