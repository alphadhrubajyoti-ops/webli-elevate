import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/webli/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/settings")({ component: SettingsAdmin });

function SettingsAdmin() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).maybeSingle().then(({ data }) => {
      setFullName(data?.full_name ?? (user.user_metadata?.full_name as string) ?? "");
      setAvatar(data?.avatar_url ?? (user.user_metadata?.avatar_url as string) ?? "");
    });
  }, [user]);

  async function save() {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").upsert({ id: user.id, email: user.email, full_name: fullName, avatar_url: avatar });
      if (error) throw error;
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your admin profile.</p>
      </div>
      <div className="rounded-3xl bg-card border border-border/60 p-6 space-y-4">
        <div className="flex items-center gap-4">
          <img
            src={avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.email ?? "A")}`}
            alt=""
            className="h-16 w-16 rounded-full ring-2 ring-primary/20"
          />
          <div>
            <div className="font-semibold">{fullName || user?.email}</div>
            <div className="text-xs text-muted-foreground">{user?.email}</div>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Full name</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Avatar URL</Label>
          <Input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://…" />
        </div>
        <Button onClick={save} disabled={saving} className="rounded-full gradient-primary text-primary-foreground">
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
