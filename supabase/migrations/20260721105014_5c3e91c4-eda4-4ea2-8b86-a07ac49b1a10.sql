INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user' FROM auth.users WHERE email = 'alpha.dhrubajyoti@gmail.com'
ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'alpha.dhrubajyoti@gmail.com'
ON CONFLICT DO NOTHING;