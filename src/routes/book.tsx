import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, MessageCircle, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchPublishedPackages, type Package } from "@/lib/webli/queries";
import { useAuth } from "@/lib/webli/useAuth";
import { whatsappUrl } from "@/lib/webli/constants";
import { FloatingNav } from "@/components/webli/FloatingNav";
import { Footer } from "@/components/webli/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const searchSchema = z.object({ pkg: z.string().optional() });

export const Route = createFileRoute("/book")({
  validateSearch: (s) => searchSchema.parse(s),
  component: BookPage,
  head: () => ({
    meta: [
      { title: "Book a project · Webli" },
      { name: "description", content: "Tell us about your project. We reply within 24 hours." },
      { property: "og:title", content: "Book a project · Webli" },
      { property: "og:description", content: "Tell us about your project. We reply within 24 hours." },
    ],
  }),
});

const categories = [
  "SaaS / Software",
  "E-commerce",
  "Agency / Consultancy",
  "Restaurant / Hospitality",
  "Healthcare",
  "Education",
  "Real Estate",
  "Portfolio / Personal",
  "Non-profit",
  "Other",
];

const paymentMethods = [
  "Bank transfer",
  "UPI",
  "Credit/Debit card",
  "PayPal / Wire",
  "Discuss during proposal",
];

function BookPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pkgs, setPkgs] = useState<Package[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | { name: string; pkgTitle: string }>(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    whatsapp: "",
    business_name: "",
    business_category: "",
    package_id: search.pkg ?? "",
    payment_method: "",
    notes: "",
  });

  useEffect(() => {
    fetchPublishedPackages().then(setPkgs).catch(() => setPkgs([]));
  }, []);

  useEffect(() => {
    if (user && !form.email) {
      setForm((f) => ({
        ...f,
        email: user.email ?? f.email,
        full_name: (user.user_metadata?.full_name as string) ?? f.full_name,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.phone) {
      toast.error("Please fill your name, email and phone.");
      return;
    }
    setSubmitting(true);
    try {
      const pkg = pkgs.find((p) => p.id === form.package_id);
      const { error } = await supabase.from("orders").insert({
        user_id: user?.id ?? null,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        whatsapp: form.whatsapp || null,
        business_name: form.business_name || null,
        business_category: form.business_category || null,
        package_id: form.package_id || null,
        package_title: pkg?.title ?? "Custom project",
        payment_method: form.payment_method || null,
        notes: form.notes || null,
      });
      if (error) throw error;
      setDone({ name: form.full_name, pkgTitle: pkg?.title ?? "Custom project" });
      toast.success("Request received. We'll be in touch shortly.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-dvh bg-background">
        <FloatingNav />
        <div className="pt-40 pb-24 px-6">
          <div className="mx-auto max-w-xl glass rounded-3xl p-10 text-center animate-fade-up">
            <div className="mx-auto h-16 w-16 rounded-2xl gradient-primary grid place-items-center shadow-elev">
              <Check className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight">Thanks, {done.name}!</h1>
            <p className="mt-3 text-muted-foreground">
              Your request for <strong>{done.pkgTitle}</strong> is in. We'll review the details and get
              back within 24 hours. No payment has been taken — we'll send a proposal first.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button onClick={() => navigate({ to: "/orders" })} className="rounded-full gradient-primary text-primary-foreground">
                Track my order <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <a href={whatsappUrl(`Hi Webli, I just booked (${done.pkgTitle}).`)} target="_blank" rel="noreferrer">
                <Button variant="outline" className="rounded-full">
                  <MessageCircle className="mr-1 h-4 w-4" /> Message on WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <FloatingNav />
      <div className="pt-32 pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
                Book your project
              </div>
              <h1 className="mt-5 text-4xl sm:text-5xl font-semibold tracking-tight text-balance">
                Let's build something <span className="gradient-text">exceptional</span>.
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Share the essentials — we'll follow up within 24 hours with a scoped proposal and
                timeline. <strong className="text-foreground">No payment is taken here.</strong>
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "Reply within 24 hours",
                  "Free scoping call",
                  "Transparent, fixed-price proposal",
                  "Pay only after you approve",
                ].map((x) => (
                  <li key={x} className="flex items-center gap-3 text-sm">
                    <div className="h-6 w-6 rounded-full gradient-primary grid place-items-center shadow-elev">
                      <Check className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                    {x}
                  </li>
                ))}
              </ul>
              <div className="mt-10 glass rounded-2xl p-5">
                <div className="text-sm font-semibold">Prefer WhatsApp?</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Message us directly and we'll walk you through it.
                </p>
                <a href={whatsappUrl("Hi Webli, I'd like to book a project.")} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="mt-4 rounded-full">
                    <MessageCircle className="mr-1 h-4 w-4" /> Open WhatsApp
                  </Button>
                </a>
              </div>
            </div>

            <form
              onSubmit={submit}
              className="glass rounded-3xl p-6 sm:p-8 space-y-5 shadow-elev animate-fade-up"
              style={{ animationDelay: "80ms" }}
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full name *">
                  <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="Jane Doe" required />
                </Field>
                <Field label="Email *">
                  <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@company.com" required />
                </Field>
                <Field label="Phone *">
                  <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 98xxxxxx" required />
                </Field>
                <Field label="WhatsApp number">
                  <Input value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} placeholder="+91 98xxxxxx" />
                </Field>
                <Field label="Business name">
                  <Input value={form.business_name} onChange={(e) => update("business_name", e.target.value)} placeholder="Acme Inc." />
                </Field>
                <Field label="Business category">
                  <Select value={form.business_category} onValueChange={(v) => update("business_category", v)}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Preferred package">
                  <Select value={form.package_id} onValueChange={(v) => update("package_id", v)}>
                    <SelectTrigger><SelectValue placeholder={pkgs.length ? "Choose a package" : "Custom project"} /></SelectTrigger>
                    <SelectContent>
                      {pkgs.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                      <SelectItem value="__custom__">Custom / Not sure yet</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Payment method">
                  <Select value={form.payment_method} onValueChange={(v) => update("payment_method", v)}>
                    <SelectTrigger><SelectValue placeholder="Preferred method" /></SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Additional notes">
                <Textarea rows={4} value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Goals, timeline, references, anything else…" />
              </Field>
              <p className="text-xs text-muted-foreground">
                By submitting, you agree we can contact you about your project. No payment is
                collected here.
              </p>
              <Button type="submit" size="lg" disabled={submitting} className="w-full rounded-full gradient-primary text-primary-foreground shadow-elev h-12">
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</> : <>Submit request <ArrowRight className="ml-1 h-4 w-4" /></>}
              </Button>
              {!user && (
                <p className="text-xs text-center text-muted-foreground">
                  Tip: <Link to="/login" className="text-primary font-medium">log in</Link> before booking to track your order.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
