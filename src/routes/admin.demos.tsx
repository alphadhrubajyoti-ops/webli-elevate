import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Edit3, Eye, EyeOff, ImageIcon, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllDemos, type Demo } from "@/lib/webli/queries";

export const Route = createFileRoute("/admin/demos")({ component: DemosAdmin });

type FormState = {
  id?: string;
  title: string;
  category: string;
  description: string;
  url: string;
  image_url: string;
  is_published: boolean;
  sort_order: number;
};

const empty: FormState = { title: "", category: "", description: "", url: "", image_url: "", is_published: true, sort_order: 0 };

function DemosAdmin() {
  const [demos, setDemos] = useState<Demo[]>([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<FormState>(empty);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => fetchAllDemos().then(setDemos).catch(() => setDemos([]));
  useEffect(() => { load(); }, []);
  const filtered = useMemo(() => demos.filter((demo) => `${demo.title} ${demo.category}`.toLowerCase().includes(query.toLowerCase())), [demos, query]);

  function edit(demo?: Demo) {
    setForm(demo ? { id: demo.id, title: demo.title, category: demo.category, description: demo.description, url: demo.url ?? "", image_url: demo.image_url ?? "", is_published: demo.is_published, sort_order: demo.sort_order } : empty);
    setOpen(true);
  }

  async function save() {
    if (!form.title.trim() || !form.category.trim() || !form.description.trim()) { toast.error("Title, category, and description are required."); return; }
    setSaving(true);
    try {
      const payload = { title: form.title.trim(), category: form.category.trim(), description: form.description.trim(), url: form.url.trim() || null, image_url: form.image_url.trim() || null, is_published: form.is_published, sort_order: Number(form.sort_order) || 0 };
      const result = form.id ? await supabase.from("demos").update(payload).eq("id", form.id) : await supabase.from("demos").insert(payload);
      if (result.error) throw result.error;
      toast.success(form.id ? "Demo updated." : "Demo published.");
      setOpen(false);
      load();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save demo."); }
    finally { setSaving(false); }
  }

  async function toggle(demo: Demo) {
    const { error } = await supabase.from("demos").update({ is_published: !demo.is_published }).eq("id", demo.id);
    if (error) toast.error(error.message); else { toast.success(demo.is_published ? "Demo hidden." : "Demo published."); load(); }
  }

  async function remove(demo: Demo) {
    if (!window.confirm(`Delete “${demo.title}”?`)) return;
    const { error } = await supabase.from("demos").delete().eq("id", demo.id);
    if (error) toast.error(error.message); else { toast.success("Demo deleted."); load(); }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-3xl font-semibold tracking-tight">Demo websites</h1><p className="text-muted-foreground">Showcase your work to every visitor on the public site.</p></div>
        <Button onClick={() => edit()} className="rounded-full gradient-primary text-primary-foreground shadow-elev"><Plus className="mr-1 h-4 w-4" /> Add demo</Button>
      </div>
      <div className="glass flex items-center gap-3 rounded-2xl p-3"><Search className="ml-2 h-4 w-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search demo websites…" className="flex-1 bg-transparent py-2 text-sm outline-none" /></div>
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card">
        <div className="grid grid-cols-[72px_1fr_140px_120px_140px] gap-4 border-b border-border/60 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><div>Preview</div><div>Website</div><div>Category</div><div>Status</div><div className="text-right">Actions</div></div>
        {filtered.length === 0 ? <div className="p-14 text-center text-muted-foreground">No demo websites yet. Add your first showcase entry.</div> : filtered.map((demo) => (
          <div key={demo.id} className="grid grid-cols-[72px_1fr_140px_120px_140px] items-center gap-4 border-b border-border/60 px-5 py-3 last:border-0 hover:bg-secondary/40">
            <div className="grid h-12 w-16 place-items-center overflow-hidden rounded-xl bg-muted">{demo.image_url ? <img src={demo.image_url} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-muted-foreground" />}</div>
            <div className="min-w-0"><div className="truncate font-semibold">{demo.title}</div><div className="truncate text-xs text-muted-foreground">{demo.description}</div></div>
            <div className="truncate text-sm">{demo.category}</div>
            <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${demo.is_published ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{demo.is_published ? "Published" : "Hidden"}</span>
            <div className="flex justify-end gap-1"><button onClick={() => toggle(demo)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted" title={demo.is_published ? "Hide" : "Publish"}>{demo.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button><button onClick={() => edit(demo)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted" title="Edit"><Edit3 className="h-4 w-4" /></button><button onClick={() => remove(demo)} className="grid h-8 w-8 place-items-center rounded-lg text-destructive hover:bg-destructive/10" title="Delete"><Trash2 className="h-4 w-4" /></button></div>
          </div>
        ))}
      </div>
      {open && <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm"><div className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-3xl bg-card shadow-elev"><div className="flex items-center justify-between border-b border-border/60 p-6"><h3 className="text-xl font-semibold">{form.id ? "Edit demo website" : "Add demo website"}</h3><button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted" aria-label="Close"><X className="h-4 w-4" /></button></div><div className="space-y-4 overflow-y-auto p-6"><div className="grid gap-4 sm:grid-cols-2"><Field label="Title *"><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Studio landing page" /></Field><Field label="Category *"><Input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Business" /></Field><Field label="Preview URL"><Input value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} placeholder="https://…" /></Field><Field label="Display order"><Input type="number" value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: Number(event.target.value) })} /></Field></div><Field label="Image URL"><Input value={form.image_url} onChange={(event) => setForm({ ...form, image_url: event.target.value })} placeholder="https://…" /></Field><Field label="Description *"><Textarea rows={5} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What makes this demo useful or distinctive?" /></Field><div className="flex items-center justify-between rounded-xl border border-border p-4"><div><div className="text-sm font-medium">Publish immediately</div><div className="text-xs text-muted-foreground">Published demos appear on the public website.</div></div><Switch checked={form.is_published} onCheckedChange={(value) => setForm({ ...form, is_published: value })} /></div></div><div className="flex justify-end gap-2 border-t border-border/60 p-6"><Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Cancel</Button><Button onClick={save} disabled={saving} className="rounded-full gradient-primary text-primary-foreground">{saving ? "Saving…" : form.id ? "Save changes" : "Add demo"}</Button></div></div></div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>{children}</div>; }