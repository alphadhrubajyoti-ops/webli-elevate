import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, Package as PackageIcon, ShoppingBag, Users, Settings, LogOut, Menu, X, Home } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/webli/useAuth";
import { isAdminUser } from "@/lib/webli/queries";
import { WebliLogo } from "@/components/webli/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Admin · Webli" }, { name: "robots", content: "noindex" }] }),
});

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
    isAdminUser(user.id).then(setIsAdmin);
  }, [user]);

  useEffect(() => setMobileOpen(false), [path]);

  if (loading || (user && isAdmin === null)) {
    return <div className="min-h-dvh grid place-items-center text-muted-foreground">Loading…</div>;
  }
  if (!user) return <AdminLoginPrompt />;
  if (!isAdmin) return <NotAdmin userEmail={user.email ?? ""} />;

  return (
    <div className="min-h-dvh bg-secondary/30 flex">
      {/* Sidebar */}
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

      {/* Main */}
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

function AdminLoginPrompt() {
  return (
    <div className="min-h-dvh grid place-items-center bg-background p-6">
      <div className="glass rounded-3xl p-10 max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold">Admin sign-in required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please sign in with an administrator account to access the admin panel.
        </p>
        <Link to="/login" className="mt-6 inline-block">
          <Button className="rounded-full gradient-primary text-primary-foreground">Sign in</Button>
        </Link>
      </div>
    </div>
  );
}

function NotAdmin({ userEmail }: { userEmail: string }) {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const bootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: existing, error: chkErr } = await supabase.from("user_roles").select("id").eq("role", "admin").limit(1);
      if (chkErr) throw chkErr;
      if ((existing?.length ?? 0) > 0) {
        toast.error("An administrator already exists. Ask them to promote you.");
        return;
      }
      if (key !== "webli-admin") {
        toast.error("Invalid setup key.");
        return;
      }
      const { data: { user: cur } } = await supabase.auth.getUser();
      if (!cur) throw new Error("Not signed in");
      const { error } = await supabase.from("user_roles").insert({ user_id: cur.id, role: "admin" });
      if (error) throw error;
      toast.success("You're now the administrator.");
      navigate({ to: "/admin", replace: true });
      setTimeout(() => location.reload(), 200);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally { setLoading(false); }
  };
  return (
    <div className="min-h-dvh grid place-items-center bg-background p-6">
      <div className="glass rounded-3xl p-10 max-w-md w-full">
        <h1 className="text-2xl font-semibold">Admin access required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Signed in as <strong>{userEmail}</strong>. This account isn't an administrator.
        </p>
        <div className="my-6 h-px bg-border" />
        <form onSubmit={bootstrap} className="space-y-3">
          <p className="text-xs text-muted-foreground">
            First-time setup: if no administrator exists yet, enter the setup key <code className="font-mono bg-muted px-1 py-0.5 rounded">webli-admin</code> to claim this account as the admin.
          </p>
          <Label>Setup key</Label>
          <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Enter setup key" />
          <Button type="submit" disabled={loading} className="w-full rounded-full gradient-primary text-primary-foreground">
            Claim admin access
          </Button>
        </form>
        <div className="mt-4 flex justify-between text-xs">
          <Link to="/" className="text-muted-foreground hover:text-foreground">← Back</Link>
          <button onClick={() => supabase.auth.signOut()} className="text-muted-foreground hover:text-foreground">Sign out</button>
        </div>
      </div>
    </div>
  );
}
