-- Migration 2: Core Operations & Collaboration (Credits, Contracts, Chat)

-- 1. Credits Table
CREATE TABLE public.credits (
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  balance integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;

-- Users can read their own credits
CREATE POLICY "Users can read own credits" ON public.credits
  FOR SELECT USING (auth.uid() = user_id);

-- Only authenticated users (and system) can insert/update (in a real prod app, use secure functions)
CREATE POLICY "Users can insert own credits" ON public.credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON public.credits
  FOR UPDATE USING (auth.uid() = user_id);

-- 2. Credit Transactions Table
CREATE TABLE public.credit_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('signup_bonus', 'application_fee', 'purchase')),
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Contracts Table
CREATE TABLE public.contracts (
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
-- Freelancers and Clients can read their own contracts
CREATE POLICY "Users can read own contracts" ON public.contracts
  FOR SELECT USING (auth.uid() = freelancer_id OR auth.uid() = client_id);

-- Clients can insert contracts
CREATE POLICY "Clients can insert contracts" ON public.contracts
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Clients and freelancers can update contracts
CREATE POLICY "Users can update own contracts" ON public.contracts
  FOR UPDATE USING (auth.uid() = freelancer_id OR auth.uid() = client_id);

-- 4. Conversations Table
CREATE TABLE public.conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  freelancer_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = freelancer_id OR auth.uid() = client_id);

CREATE POLICY "Users can insert conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = freelancer_id OR auth.uid() = client_id);

-- 5. Messages Table
CREATE TABLE public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
-- Read if part of conversation
CREATE POLICY "Users can read conversation messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.client_id = auth.uid() OR conversations.freelancer_id = auth.uid())
    )
  );

-- Insert if sender
CREATE POLICY "Users can insert messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.client_id = auth.uid() OR conversations.freelancer_id = auth.uid())
    )
  );
