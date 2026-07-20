
-- Fix search_path
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Lock down SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Tighten permissive policies
DROP POLICY IF EXISTS "orders_insert_auth" ON public.orders;
CREATE POLICY "orders_insert_auth" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "orders_insert_anyone" ON public.orders;
CREATE POLICY "orders_insert_anon" ON public.orders FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);
