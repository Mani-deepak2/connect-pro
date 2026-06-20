-- Migration 8: Add Freelancer Profile Fields & Storage Buckets

-- 1. Add new columns to freelancer_profiles
ALTER TABLE public.freelancer_profiles 
ADD COLUMN IF NOT EXISTS github_link text,
ADD COLUMN IF NOT EXISTS linkedin_link text,
ADD COLUMN IF NOT EXISTS resume_url text,
ADD COLUMN IF NOT EXISTS certificate_url text;

-- 2. Create Storage Buckets for Avatars and Documents (if they don't exist)
-- Note: Supabase storage requires the storage API enabled, but we can attempt to insert into storage.buckets.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies for Avatars
-- Allow public viewing of avatars
CREATE POLICY "Public Access to Avatars" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload avatars" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- 4. Storage Policies for Documents (Resumes/Certificates)
-- Allow public viewing of documents (since profiles are public, resumes usually are too in this context)
CREATE POLICY "Public Access to Documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'documents');

-- Allow authenticated users to upload documents
CREATE POLICY "Users can upload documents" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Allow users to update their own documents
CREATE POLICY "Users can update their own documents" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'documents' AND auth.uid() = owner);
