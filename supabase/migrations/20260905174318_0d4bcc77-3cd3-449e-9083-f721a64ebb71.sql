CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  role text,
  content text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view approved reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (is_approved = true OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Anyone can submit a review" ON public.reviews FOR INSERT TO anon, authenticated WITH CHECK (is_approved = false AND (user_id IS NULL OR user_id = auth.uid()));
CREATE POLICY "Admins can manage reviews" ON public.reviews FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can remove reviews" ON public.reviews FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE TRIGGER trg_reviews_updated BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();