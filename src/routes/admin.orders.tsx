import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, MessageCircle, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllOrders, type Order, type OrderStatus } from "@/lib/webli/queries";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { whatsappUrl } from "@/lib/webli/constants";

export const Route = createFileRoute("/admin/orders")({ component: OrdersAdmin });

const STATUSES: OrderStatus[] = ["pending", "confirmed", "completed", "cancelled"];
const statusColor: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
};

function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  const load = () => fetchAllOrders().then(setOrders).catch(() => setOrders([]));
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (q && !`${o.full_name} ${o.email} ${o.business_name ?? ""} ${o.package_title ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [orders, q, filter]);

  async function updateStatus(o: Order, status: OrderStatus) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", o.id);
    if (error) toast.error(error.message);
    else { toast.success(`Marked ${status}.`); load(); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">Manage bookings and update status.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="glass rounded-2xl p-2 flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="h-4 w-4 text-muted-foreground ml-2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, business…"
            className="flex-1 bg-transparent outline-none text-sm py-2"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-44 rounded-2xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-3xl bg-card border border-border/60 overflow-hidden">
        <div className="hidden md:grid grid-cols-[1.4fr_1.2fr_1fr_1fr_180px] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/60">
          <div>Customer</div>
          <div>Package</div>
          <div>Contact</div>
          <div>Date</div>
          <div>Status</div>
        </div>
        {filtered.length === 0 ? (
          <div className="p-14 text-center text-muted-foreground">No orders match.</div>
        ) : filtered.map((o) => (
          <div key={o.id} className="grid md:grid-cols-[1.4fr_1.2fr_1fr_1fr_180px] gap-3 px-5 py-4 border-b border-border/60 last:border-0 hover:bg-secondary/40">
            <div className="min-w-0">
              <div className="font-semibold truncate">{o.full_name}</div>
              <div className="text-xs text-muted-foreground truncate">{o.business_name || o.business_category || "—"}</div>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{o.package_title ?? "Custom"}</div>
              {o.payment_method && <div className="text-xs text-muted-foreground truncate">{o.payment_method}</div>}
            </div>
            <div className="text-xs space-y-1 min-w-0">
              <a href={`mailto:${o.email}`} className="flex items-center gap-1.5 hover:text-primary truncate"><Mail className="h-3 w-3 shrink-0" /><span className="truncate">{o.email}</span></a>
              <a href={`tel:${o.phone}`} className="flex items-center gap-1.5 hover:text-primary"><Phone className="h-3 w-3 shrink-0" /> {o.phone}</a>
              {o.whatsapp && <a href={whatsappUrl(`Hi ${o.full_name.split(" ")[0]}, regarding your Webli order…`)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-primary"><MessageCircle className="h-3 w-3 shrink-0" /> {o.whatsapp}</a>}
            </div>
            <div className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${statusColor[o.status]}`}>{o.status}</span>
              <Select value={o.status} onValueChange={(v) => updateStatus(o, v as OrderStatus)}>
                <SelectTrigger className="h-8 text-xs rounded-lg w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {o.notes && <div className="md:col-span-5 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">{o.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
