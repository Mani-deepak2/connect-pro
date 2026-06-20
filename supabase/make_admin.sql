-- 1. Drop the existing constraint that blocks 'admin' role
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Add the new constraint allowing 'admin'
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('client', 'freelancer', 'admin'));

-- 3. Update the specific user to be an admin
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin22006@gmail.com';

-- 4. Verify the change
SELECT id, email, role FROM public.users WHERE email = 'admin22006@gmail.com';
