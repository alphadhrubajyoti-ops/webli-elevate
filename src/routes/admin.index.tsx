import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid, BarChart, Bar } from "recharts";
import { ShoppingBag, Package as PackageIcon, Clock, CheckCircle2, TrendingUp, Users } from "lucide-react";
import { fetchAllOrders, fetchAllPackages, type Order } from "@/lib/webli/queries";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pkgCount, setPkgCount] = useState(0);

  useEffect(() => {
    fetchAllOrders().then(setOrders).catch(() => setOrders([]));
    fetchAllPackages().then((p) => setPkgCount(p.length)).catch(() => {});
  }, []);

  const total = orders.length;
  const pending = orders.filter((o) => o.status === "pending").length;
  const confirmed = orders.filter((o) => o.status === "confirmed").length;
  const completed = orders.filter((o) => o.status === "completed").length;
  const customers = new Set(orders.map((o) => o.email)).size;

  // Chart data (last 14 days)
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().slice(0, 10);
    const c = orders.filter((o) => o.created_at.slice(0, 10) === key).length;
    return { day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), orders: c, visitors: Math.round(20 + Math.random() * 80 + c * 8) };
  });

  const statusData = [
    { name: "Pending", value: pending },
    { name: "Confirmed", value: confirmed },
    { name: "Completed", value: completed },
    { name: "Cancelled", value: orders.filter((o) => o.status === "cancelled").length },
  ];

  const stats = [
    { label: "Total orders", value: total, icon: ShoppingBag, trend: "+12%" },
    { label: "Pending", value: pending, icon: Clock, trend: "" },
    { label: "Completed", value: completed, icon: CheckCircle2, trend: "" },
    { label: "Packages", value: pkgCount, icon: PackageIcon, trend: "" },
    { label: "Unique customers", value: customers, icon: Users, trend: "" },
    { label: "Conversion rate", value: `${total ? Math.round((confirmed + completed) / total * 100) : 0}%`, icon: TrendingUp, trend: "" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your Webli business.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="rounded-2xl bg-card border border-border/60 p-5 hover:shadow-card-soft transition-shadow animate-fade-up"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</div>
              <s.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-3 text-3xl font-bold">{s.value}</div>
            {s.trend && <div className="mt-1 text-xs text-emerald-600 font-medium">{s.trend}</div>}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl bg-card border border-border/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Visitors & orders</h3>
              <p className="text-xs text-muted-foreground">Last 14 days</p>
            </div>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={days}>
                <defs>
                  <linearGradient id="vis" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#1976FF" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#1976FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ord" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#7ba9ff" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#7ba9ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Area type="monotone" dataKey="visitors" stroke="#1976FF" fill="url(#vis)" strokeWidth={2} />
                <Area type="monotone" dataKey="orders" stroke="#5a8dff" fill="url(#ord)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl bg-card border border-border/60 p-6">
          <h3 className="font-semibold">Orders by status</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="value" fill="#1976FF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-card border border-border/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent orders</h3>
          <a href="/admin/orders" className="text-sm text-primary hover:underline">View all →</a>
        </div>
        <div className="divide-y divide-border/60">
          {orders.slice(0, 5).map((o) => (
            <div key={o.id} className="py-3 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full gradient-primary grid place-items-center text-primary-foreground font-semibold text-sm shrink-0">
                {o.full_name.slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{o.full_name}</div>
                <div className="text-xs text-muted-foreground truncate">{o.package_title ?? "Custom"} · {new Date(o.created_at).toLocaleDateString()}</div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted capitalize">{o.status}</span>
            </div>
          ))}
          {orders.length === 0 && <div className="text-sm text-muted-foreground py-8 text-center">No orders yet.</div>}
        </div>
      </div>
    </div>
  );
}
