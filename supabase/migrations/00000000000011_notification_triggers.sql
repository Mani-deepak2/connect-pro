-- Migration 11: Notification Triggers

-- 1. Trigger for New Application
CREATE OR REPLACE FUNCTION notify_client_on_application()
RETURNS TRIGGER AS $$
DECLARE
  v_client_id uuid;
  v_project_title text;
  v_freelancer_name text;
BEGIN
  -- Get project details
  SELECT client_id, title INTO v_client_id, v_project_title
  FROM public.projects
  WHERE id = NEW.project_id;

  -- Get freelancer details
  SELECT full_name INTO v_freelancer_name
  FROM public.freelancer_profiles
  WHERE user_id = NEW.freelancer_id;

  -- Insert notification for client
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (
    v_client_id,
    'application',
    'New Application',
    COALESCE(v_freelancer_name, 'A freelancer') || ' applied to your project: ' || v_project_title
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_client_on_application ON public.applications;
CREATE TRIGGER trigger_notify_client_on_application
AFTER INSERT ON public.applications
FOR EACH ROW
EXECUTE FUNCTION notify_client_on_application();

-- 2. Trigger for Application Accepted / Contract Created
CREATE OR REPLACE FUNCTION notify_freelancer_on_hire()
RETURNS TRIGGER AS $$
DECLARE
  v_project_title text;
BEGIN
  -- Get project details
  SELECT title INTO v_project_title
  FROM public.projects
  WHERE id = NEW.project_id;

  -- Insert notification for freelancer
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (
    NEW.freelancer_id,
    'contract',
    'Application Accepted',
    'You have been hired for the project: ' || v_project_title || '. A new contract has been created.'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_freelancer_on_hire ON public.contracts;
CREATE TRIGGER trigger_notify_freelancer_on_hire
AFTER INSERT ON public.contracts
FOR EACH ROW
EXECUTE FUNCTION notify_freelancer_on_hire();
