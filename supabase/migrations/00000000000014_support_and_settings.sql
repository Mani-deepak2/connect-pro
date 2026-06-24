-- Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
    notifications_enabled boolean DEFAULT true,
    email_notifications boolean DEFAULT true,
    privacy_mode boolean DEFAULT false,
    theme varchar(50) DEFAULT 'light',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    subject text NOT NULL,
    description text NOT NULL,
    status varchar(50) DEFAULT 'Open',
    priority varchar(50) DEFAULT 'Normal',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Policies for user_settings
CREATE POLICY "Users can view their own settings"
    ON public.user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON public.user_settings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
    ON public.user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policies for support_tickets
CREATE POLICY "Users can view their own tickets"
    ON public.support_tickets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tickets"
    ON public.support_tickets FOR INSERT
    WITH CHECK (auth.uid() = user_id);
