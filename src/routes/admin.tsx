import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, Package as PackageIcon, ShoppingBag, Users, Settings, LogOut, Menu, X, Home, Lock, Mail, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/webli/useAuth";
import { isAdminUser } from "@/lib/webli/queries";
import { ensureFixedAdmin } from "@/lib/webli/admin-bootstrap.functions";
import { WebliLogo } from "@/components/webli/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Admin · Webli" }, { name: "robots", content: "noindex" }] }),
});

const ADMIN_EMAIL = "alpha.dhrubajyoti@gmail.com";
const ADMIN_PASSWORD = "WB9609022523";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/packages", label: "Packages", icon: PackageIcon },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminLayout() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = useRouterState({ select: (r) => r.location.pathname });

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    setIsAdmin(null);
    isAdminUser(user.id).then(setIsAdmin);
  }, [user]);

  useEffect(() => setMobileOpen(false), [path]);

  if (loading || (user && isAdmin === null)) {
    return <div className="min-h-dvh grid place-items-center text-muted-foreground">Loading…</div>;
  }
  if (!user || !isAdmin) return <AdminLogin />;

  return (
    <div className="min-h-dvh bg-secondary/30 flex">
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-sidebar border-r border-sidebar-border transition-all duration-300
        ${collapsed ? "w-[76px]" : "w-64"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="h-16 flex items-center px-5 border-b border-sidebar-border justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <WebliLogo height={22} />
            {!collapsed && <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Admin</span>}
          </Link>
          <button className="md:hidden" onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
        </div>
        <nav className="p-3 space-y-1">
          {nav.map((n) => {
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "gradient-primary text-primary-foreground shadow-elev"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <n.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{n.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 inset-x-0 p-3 border-t border-sidebar-border space-y-1">
          <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-sidebar-accent">
            <Home className="h-4 w-4" /> {!collapsed && "Back to site"}
          </Link>
          <button
            onClick={async () => { await supabase.auth.signOut(); toast.success("Signed out"); }}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-sidebar-accent text-left"
          >
            <LogOut className="h-4 w-4" /> {!collapsed && "Sign out"}
          </button>
        </div>
      </aside>

      <div className={`flex-1 min-w-0 transition-[margin] ${collapsed ? "md:ml-[76px]" : "md:ml-64"}`}>
        <header className="sticky top-0 z-30 h-16 glass border-b border-border/60 flex items-center gap-3 px-5">
          <button className="md:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button>
          <button
            className="hidden md:inline-flex h-9 w-9 rounded-xl border border-border/60 items-center justify-center hover:bg-primary/5"
            onClick={() => setCollapsed((c) => !c)}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <img
              src={(user.user_metadata?.avatar_url as string) || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.email ?? "A")}`}
              alt=""
              className="h-9 w-9 rounded-full ring-2 ring-primary/20"
            />
            <div className="hidden sm:block text-sm">
              <div className="font-semibold leading-tight">{(user.user_metadata?.full_name as string) || user.email}</div>
              <div className="text-xs text-muted-foreground">Administrator</div>
            </div>
          </div>
        </header>
        <main className="p-5 sm:p-8">
          <Outlet />
        </main>
      </div>

      {mobileOpen && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setMobileOpen(false)} />}
    </div>
  );
}

function AdminLogin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (user) await supabase.auth.signOut();

      const emailTrim = email.trim();
      if (emailTrim.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
        // Idempotently ensure the fixed admin exists with this password + role.
        await ensureFixedAdmin();
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: emailTrim,
        password,
      });
      if (error) throw error;

      toast.success("Welcome, Administrator");
      navigate({ to: "/admin", replace: true });
      setTimeout(() => location.reload(), 150);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid administrator credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center bg-background p-6 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 gradient-primary opacity-[0.06]" />
      <div className="glass rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-elev animate-fade-up">
        <div className="flex items-center justify-center">
          <div className="h-14 w-14 rounded-2xl gradient-primary grid place-items-center shadow-elev">
            <ShieldCheck className="h-7 w-7 text-primary-foreground" />
          </div>
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-center tracking-tight">Administrator sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground text-center">
          Restricted access. Authorized personnel only.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="pl-9 h-11"
                placeholder="admin@webli.com"
                required
                autoComplete="username"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="pl-9 h-11"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-full gradient-primary text-primary-foreground shadow-elev"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in to Admin"}
          </Button>
        </form>

        <div className="mt-6 flex justify-between text-xs">
          <Link to="/" className="text-muted-foreground hover:text-foreground">← Back to site</Link>
          {user && (
            <button
              onClick={async () => { await supabase.auth.signOut(); toast.success("Signed out"); }}
              className="text-muted-foreground hover:text-foreground"
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
