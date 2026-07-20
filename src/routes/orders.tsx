import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, XCircle, PackageCheck, LogIn, PackageOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/webli/useAuth";
import { fetchMyOrders, type Order, type OrderStatus } from "@/lib/webli/queries";
import { FloatingNav } from "@/components/webli/FloatingNav";
import { Footer } from "@/components/webli/Footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
  head: () => ({
    meta: [
      { title: "My orders · Webli" },
      { name: "description", content: "Track your Webli projects: pending, confirmed, completed, cancelled." },
    ],
  }),
});

const STATUS: Record<OrderStatus, { label: string; icon: typeof Clock; className: string }> = {
  pending: { label: "Pending", icon: Clock, className: "bg-amber-100 text-amber-800 border-amber-200" },
  confirmed: { label: "Confirmed", icon: PackageCheck, className: "bg-blue-100 text-blue-800 border-blue-200" },
  completed: { label: "Completed", icon: CheckCircle2, className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "bg-rose-100 text-rose-800 border-rose-200" },
};

function OrdersPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchMyOrders(user.id).then(setOrders).catch(() => setOrders([]));
    const ch = supabase
      .channel(`orders-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` }, () => {
        fetchMyOrders(user.id).then(setOrders).catch(() => {});
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-dvh bg-background">
        <FloatingNav />
        <div className="pt-40 px-6 text-center text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-dvh bg-background">
        <FloatingNav />
        <div className="pt-40 pb-24 px-6">
          <div className="mx-auto max-w-md glass rounded-3xl p-10 text-center animate-fade-up">
            <div className="mx-auto h-16 w-16 rounded-2xl gradient-primary grid place-items-center shadow-elev">
              <LogIn className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="mt-6 text-2xl font-semibold">Sign in to see your orders</h1>
            <p className="mt-2 text-muted-foreground text-sm">
              Log in with Google or email to track your Webli projects.
            </p>
            <Link to="/login" className="mt-6 inline-block">
              <Button className="rounded-full gradient-primary text-primary-foreground">Sign in</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const counts: Record<OrderStatus, number> = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  (orders ?? []).forEach((o) => { counts[o.status]++; });

  return (
    <div className="min-h-dvh bg-background">
      <FloatingNav />
      <div className="pt-32 pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-up">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
                My orders
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">Your projects</h1>
              <p className="mt-2 text-muted-foreground">Track the status of every project you've booked.</p>
            </div>
            <Link to="/book">
              <Button className="rounded-full gradient-primary text-primary-foreground shadow-elev">
                Book a new project
              </Button>
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {(Object.keys(STATUS) as OrderStatus[]).map((s) => {
              const St = STATUS[s];
              return (
                <div key={s} className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">{St.label}</div>
                    <St.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="mt-2 text-3xl font-bold">{counts[s]}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 glass rounded-3xl overflow-hidden">
            {orders === null ? (
              <div className="p-10 text-center text-muted-foreground">Loading orders…</div>
            ) : orders.length === 0 ? (
              <div className="p-14 text-center">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 grid place-items-center">
                  <PackageOpen className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">No orders yet</h3>
                <p className="mt-2 text-muted-foreground text-sm">Book your first project to see it here.</p>
                <Link to="/book" className="mt-6 inline-block">
                  <Button className="rounded-full gradient-primary text-primary-foreground">Book a project</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {orders.map((o) => {
                  const St = STATUS[o.status];
                  return (
                    <div key={o.id} className="p-5 sm:p-6 flex flex-wrap items-center gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="font-semibold">{o.package_title ?? "Custom project"}</div>
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${St.className}`}>
                            <St.icon className="h-3 w-3" /> {St.label}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground truncate">
                          {o.business_name ? `${o.business_name} · ` : ""}
                          {new Date(o.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                        {o.notes && <div className="mt-2 text-sm text-foreground/80 line-clamp-2">{o.notes}</div>}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">#{o.id.slice(0, 8)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
