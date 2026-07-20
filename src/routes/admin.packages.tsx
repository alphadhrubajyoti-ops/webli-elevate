import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Trash2, Edit3, Eye, EyeOff, X, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllPackages, type Package } from "@/lib/webli/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/packages")({ component: PackagesAdmin });

type FormState = {
  id?: string;
  title: string;
  tagline: string;
  description: string;
  price_label: string;
  image_url: string;
  features: string;
  is_published: boolean;
  sort_order: number;
};

const empty: FormState = {
  title: "",
  tagline: "",
  description: "",
  price_label: "",
  image_url: "",
  features: "",
  is_published: true,
  sort_order: 0,
};

function PackagesAdmin() {
  const [pkgs, setPkgs] = useState<Package[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  const load = () => fetchAllPackages().then(setPkgs).catch(() => setPkgs([]));
  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () => pkgs.filter((p) => p.title.toLowerCase().includes(q.toLowerCase())),
    [pkgs, q]
  );

  function openNew() { setForm(empty); setOpen(true); }
  function openEdit(p: Package) {
    setForm({
      id: p.id,
      title: p.title,
      tagline: p.tagline ?? "",
      description: p.description,
      price_label: p.price_label ?? "",
      image_url: p.image_url ?? "",
      features: p.features.join("\n"),
      is_published: p.is_published,
      sort_order: p.sort_order,
    });
    setOpen(true);
  }

  async function save() {
    if (!form.title || !form.description) { toast.error("Title and description are required."); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        tagline: form.tagline || null,
        description: form.description,
        price_label: form.price_label || null,
        image_url: form.image_url || null,
        features: form.features.split("\n").map((s) => s.trim()).filter(Boolean),
        is_published: form.is_published,
        sort_order: Number(form.sort_order) || 0,
      };
      if (form.id) {
        const { error } = await supabase.from("packages").update(payload).eq("id", form.id);
        if (error) throw error;
        toast.success("Package updated.");
      } else {
        const { error } = await supabase.from("packages").insert(payload);
        if (error) throw error;
        toast.success("Package created.");
      }
      setOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally { setSaving(false); }
  }

  async function togglePublish(p: Package) {
    const { error } = await supabase.from("packages").update({ is_published: !p.is_published }).eq("id", p.id);
    if (error) toast.error(error.message);
    else { toast.success(p.is_published ? "Unpublished" : "Published"); load(); }
  }

  async function remove(p: Package) {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("packages").delete().eq("id", p.id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted."); load(); }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Packages</h1>
          <p className="text-muted-foreground">Create and manage the packages shown on your website.</p>
        </div>
        <Button onClick={openNew} className="rounded-full gradient-primary text-primary-foreground shadow-elev">
          <Plus className="h-4 w-4 mr-1" /> New package
        </Button>
      </div>

      <div className="glass rounded-2xl p-3 flex items-center gap-3">
        <Search className="h-4 w-4 text-muted-foreground ml-2" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search packages…"
          className="flex-1 bg-transparent outline-none text-sm py-2"
        />
      </div>

      <div className="rounded-3xl bg-card border border-border/60 overflow-hidden">
        <div className="grid grid-cols-[80px_1fr_120px_120px_160px] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/60">
          <div>Image</div>
          <div>Title</div>
          <div>Price</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>
        {filtered.length === 0 ? (
          <div className="p-14 text-center text-muted-foreground">
            No packages yet. Create your first one.
          </div>
        ) : filtered.map((p) => (
          <div key={p.id} className="grid grid-cols-[80px_1fr_120px_120px_160px] gap-4 px-5 py-3 items-center border-b border-border/60 last:border-0 hover:bg-secondary/40">
            <div className="h-14 w-14 rounded-xl bg-muted overflow-hidden grid place-items-center">
              {p.image_url ? <img src={p.image_url} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-muted-foreground" />}
            </div>
            <div className="min-w-0">
              <div className="font-semibold truncate">{p.title}</div>
              <div className="text-xs text-muted-foreground truncate">{p.tagline || p.description.slice(0, 60)}</div>
            </div>
            <div className="text-sm">{p.price_label ?? "—"}</div>
            <div>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${p.is_published ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${p.is_published ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                {p.is_published ? "Published" : "Hidden"}
              </span>
            </div>
            <div className="flex justify-end gap-1">
              <button onClick={() => togglePublish(p)} className="h-8 w-8 rounded-lg hover:bg-muted grid place-items-center" title={p.is_published ? "Hide" : "Publish"}>
                {p.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button onClick={() => openEdit(p)} className="h-8 w-8 rounded-lg hover:bg-muted grid place-items-center" title="Edit">
                <Edit3 className="h-4 w-4" />
              </button>
              <button onClick={() => remove(p)} className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive grid place-items-center" title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4 animate-fade-up">
          <div className="bg-card w-full max-w-2xl rounded-3xl shadow-elev max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border/60">
              <h3 className="text-xl font-semibold">{form.id ? "Edit package" : "New package"}</h3>
              <button onClick={() => setOpen(false)} className="h-9 w-9 rounded-full hover:bg-muted grid place-items-center"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Title *">
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Starter Site" />
                </Field>
                <Field label="Tagline">
                  <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Perfect for launching fast" />
                </Field>
                <Field label="Price label">
                  <Input value={form.price_label} onChange={(e) => setForm({ ...form, price_label: e.target.value })} placeholder="From ₹25,000" />
                </Field>
                <Field label="Sort order">
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
                </Field>
              </div>
              <Field label="Image URL">
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://…" />
                {form.image_url && (
                  <div className="mt-3 rounded-xl border border-border overflow-hidden aspect-[16/9] bg-muted">
                    <img src={form.image_url} alt="Preview" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  </div>
                )}
              </Field>
              <Field label="Description *">
                <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detailed description shown on the card…" />
              </Field>
              <Field label="Features (one per line)">
                <Textarea rows={4} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Custom design&#10;5 pages&#10;SEO setup" />
              </Field>
              <div className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <div className="font-medium text-sm">Publish immediately</div>
                  <div className="text-xs text-muted-foreground">Visible to everyone on the public site.</div>
                </div>
                <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-6 border-t border-border/60">
              <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Cancel</Button>
              <Button onClick={save} disabled={saving} className="rounded-full gradient-primary text-primary-foreground">
                {saving ? "Saving…" : (form.id ? "Save changes" : "Create package")}
              </Button>
            </div>
          </div>
        </div>
      )}
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
