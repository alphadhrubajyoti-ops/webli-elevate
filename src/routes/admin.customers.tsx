import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Mail, Phone } from "lucide-react";
import { fetchAllOrders, type Order } from "@/lib/webli/queries";

export const Route = createFileRoute("/admin/customers")({ component: CustomersAdmin });

type Customer = {
  email: string;
  name: string;
  phone: string;
  orders: number;
  last: string;
  business: string | null;
};

function CustomersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => { fetchAllOrders().then(setOrders).catch(() => setOrders([])); }, []);

  const customers = useMemo<Customer[]>(() => {
    const map = new Map<string, Customer>();
    for (const o of orders) {
      const key = o.email.toLowerCase();
      const cur = map.get(key);
      if (cur) {
        cur.orders += 1;
        if (o.created_at > cur.last) cur.last = o.created_at;
      } else {
        map.set(key, { email: o.email, name: o.full_name, phone: o.phone, orders: 1, last: o.created_at, business: o.business_name });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.last.localeCompare(a.last));
  }, [orders]);

  const filtered = customers.filter((c) => `${c.name} ${c.email} ${c.business ?? ""}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">Everyone who's booked with Webli.</p>
      </div>
      <div className="glass rounded-2xl p-2 flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground ml-2" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers…" className="flex-1 bg-transparent outline-none text-sm py-2" />
      </div>
      <div className="rounded-3xl bg-card border border-border/60 overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_100px_140px] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/60">
          <div>Customer</div>
          <div>Contact</div>
          <div>Orders</div>
          <div>Last order</div>
        </div>
        {filtered.length === 0 ? (
          <div className="p-14 text-center text-muted-foreground">No customers yet.</div>
        ) : filtered.map((c) => (
          <div key={c.email} className="grid grid-cols-[1fr_1fr_100px_140px] gap-4 px-5 py-4 items-center border-b border-border/60 last:border-0 hover:bg-secondary/40">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 shrink-0 rounded-full gradient-primary grid place-items-center text-primary-foreground font-semibold text-sm">
                {c.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-semibold truncate">{c.name}</div>
                <div className="text-xs text-muted-foreground truncate">{c.business ?? "—"}</div>
              </div>
            </div>
            <div className="text-xs space-y-1 min-w-0">
              <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 truncate hover:text-primary"><Mail className="h-3 w-3 shrink-0" /><span className="truncate">{c.email}</span></a>
              <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 hover:text-primary"><Phone className="h-3 w-3 shrink-0" /> {c.phone}</a>
            </div>
            <div className="text-2xl font-bold gradient-text">{c.orders}</div>
            <div className="text-sm text-muted-foreground">{new Date(c.last).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
