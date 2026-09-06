CREATE TABLE public.demos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  url text,
  image_url text,
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.demos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.demos TO authenticated;
GRANT ALL ON public.demos TO service_role;

ALTER TABLE public.demos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "demos_public_read_published"
  ON public.demos
  FOR SELECT
  TO anon
  USING (is_published = true);

CREATE POLICY "demos_auth_read_published_or_admin"
  ON public.demos
  FOR SELECT
  TO authenticated
  USING (is_published = true OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "demos_admin_insert"
  ON public.demos
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "demos_admin_update"
  ON public.demos
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "demos_admin_delete"
  ON public.demos
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER trg_demos_updated
  BEFORE UPDATE ON public.demos
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();