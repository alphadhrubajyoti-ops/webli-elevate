CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  destination_url TEXT,
  is_live BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sales TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales TO authenticated;
GRANT ALL ON public.sales TO service_role;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY sales_public_read_live ON public.sales FOR SELECT TO anon USING (is_live = true);
CREATE POLICY sales_auth_read_live_or_admin ON public.sales FOR SELECT TO authenticated USING (is_live = true OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY sales_admin_insert ON public.sales FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY sales_admin_update ON public.sales FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY sales_admin_delete ON public.sales FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));