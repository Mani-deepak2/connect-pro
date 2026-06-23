-- Migration 12: Secure is_verified flag

-- Create a function to prevent non-admins from updating is_verified
CREATE OR REPLACE FUNCTION public.prevent_is_verified_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If the user is trying to change is_verified
  IF NEW.is_verified IS DISTINCT FROM OLD.is_verified THEN
    -- Check if the current user is an admin
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') THEN
      -- Revert silently to avoid breaking frontend forms that send the whole object
      NEW.is_verified = OLD.is_verified;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS ensure_secure_is_verified ON public.freelancer_profiles;
CREATE TRIGGER ensure_secure_is_verified
  BEFORE UPDATE ON public.freelancer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_is_verified_update();
