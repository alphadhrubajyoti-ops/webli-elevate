
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  Edit3,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import type { Sale } from "@/lib/webli/sales.functions";

export const Route = createFileRoute("/admin/sales")({
  component: SalesAdmin,
});

type SaleForm = {
  id?: string;
  title: string;
  description: string;
  image_url: string;
  destination_url: string;
  is_live: boolean;
  sort_order: number;
};

const blank: SaleForm = {
  title: "",
  description: "",
  image_url: "",
  destination_url: "",
  is_live: false,
  sort_order: 0,
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  if (
    error &&
    typeof error === "object" &&
    "message" in error
  ) {
    return String(error.message);
  }

  return "An unexpected error occurred.";
}

function SalesAdmin() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusId, setStatusId] = useState<string | null>(null);
  const [form, setForm] = useState<SaleForm>({ ...blank });

  async function load() {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;

      setSales((data ?? []) as Sale[]);
    } catch (error) {
      console.error("Could not load sales:", error);
      toast.error(`Could not load sales: ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function edit(sale?: Sale) {
    setForm(
      sale
        ? {
            id: sale.id,
            title: sale.title ?? "",
            description: sale.description ?? "",
            image_url: sale.image_url ?? "",
            destination_url: sale.destination_url ?? "",
            is_live: Boolean(sale.is_live),
            sort_order: Number(sale.sort_order) || 0,
          }
        : { ...blank },
    );

    setOpen(true);
  }

  function closeEditor() {
    if (saving || uploading) return;

    setOpen(false);
    setForm({ ...blank });
  }

  async function selectImage(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Choose a valid image file.");
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      toast.error("Choose an image smaller than 12 MB.");
      return;
    }

    setUploading(true);

    try {
      const dataUrl = await compressImage(file);

      if (dataUrl.length > 2_600_000) {
        throw new Error(
          "Image is too large after compression. Choose a smaller image.",
        );
      }

      setForm((current) => ({
        ...current,
        image_url: dataUrl,
      }));

      toast.success("Image ready to save.");
    } catch (error) {
      console.error("Image processing error:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (saving || uploading) return;

    const title = form.title.trim();

    if (!title) {
      toast.error("Enter a sale name first.");
      return;
    }

    let destination: string | null = null;
    const destinationInput = form.destination_url.trim();

    if (destinationInput) {
      try {
        const parsed = new URL(destinationInput);

        if (
          parsed.protocol !== "https:" &&
          parsed.protocol !== "http:"
        ) {
          throw new Error("Only HTTP and HTTPS links are supported.");
        }

        destination = parsed.toString();
      } catch {
        toast.error(
          "Enter a valid complete link starting with https:// or http://.",
        );
        return;
      }
    }

    setSaving(true);

    try {
      const payload = {
        title,
        description: form.description.trim(),
        image_url: form.image_url.trim() || null,
        destination_url: destination,
        is_live: form.is_live,
        sort_order: Number.isFinite(Number(form.sort_order))
          ? Number(form.sort_order)
          : 0,
      };

      if (form.id) {
        const { data, error } = await supabase
          .from("sales")
          .update(payload)
          .eq("id", form.id)
          .select("id");

        if (error) throw error;

        if (!data || data.length === 0) {
          throw new Error(
            "No sale was updated. Check your admin permissions and database policies.",
          );
        }
      } else {
        const { data, error } = await supabase
          .from("sales")
          .insert(payload)
          .select("id");

        if (error) throw error;

        if (!data || data.length === 0) {
          throw new Error(
            "The sale was not returned after saving. Check your database permissions.",
          );
        }
      }

      toast.success(form.id ? "Sale updated successfully." : "Sale added successfully.");

      setOpen(false);
      setForm({ ...blank });

      await load();
    } catch (error) {
      console.error("Sales save error:", error);
      toast.error(`Could not save sale: ${getErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  }

  async function toggle(sale: Sale) {
    if (statusId || deletingId) return;

    setStatusId(sale.id);

    try {
      const { data, error } = await supabase
        .from("sales")
        .update({ is_live: !sale.is_live })
        .eq("id", sale.id)
        .select("id");

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error(
          "Sale status was not changed. Check your database permissions.",
        );
      }

      toast.success(sale.is_live ? "Sale hidden." : "Sale is now live.");
      await load();
    } catch (error) {
      console.error("Sales status update error:", error);
      toast.error(`Could not update sale: ${getErrorMessage(error)}`);
    } finally {
      setStatusId(null);
    }
  }

  async function remove(sale: Sale) {
    if (deletingId || statusId) return;

    if (!window.confirm(`Delete "${sale.title}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(sale.id);

    try {
      const { data, error } = await supabase
        .from("sales")
        .delete()
        .eq("id", sale.id)
        .select("id");

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error(
          "Sale was not deleted. Check your database permissions.",
        );
      }

      toast.success("Sale deleted successfully.");
      await load();
    } catch (error) {
      console.error("Sales deletion error:", error);
      toast.error(`Could not delete sale: ${getErrorMessage(error)}`);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Sales</h1>
          <p className="text-muted-foreground">
            Manage the offers shown on your public Sales page.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => edit()}
          disabled={saving || uploading}
          className="gradient-primary text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Add sale
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60 bg-card">
        <div className="min-w-[680px]">
          <div className="grid grid-cols-[88px_minmax(180px,1fr)_120px_144px] gap-4 border-b border-border/60 px-5 py-3 text-xs font-semibold uppercase text-muted-foreground">
            <span>Image</span>
            <span>Sale</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          {loading ? (
            <div className="p-10 text-center text-muted-foreground">
              Loading sales…
            </div>
          ) : sales.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No sales added yet. Click "Add sale" to create your first offer.
            </div>
          ) : (
            sales.map((sale) => (
              <div
                key={sale.id}
                className="grid grid-cols-[88px_minmax(180px,1fr)_120px_144px] items-center gap-4 border-b border-border/60 px-5 py-3 last:border-0"
              >
                <div className="h-12 w-16 overflow-hidden rounded bg-muted">
                  {sale.image_url && (
                    <img
                      src={sale.image_url}
                      alt={sale.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="truncate font-semibold">{sale.title}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {sale.description || "No description"}
                  </div>
                </div>

                <span
                  className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
                    sale.is_live
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {sale.is_live ? "Live" : "Hidden"}
                </span>

                <div className="flex justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={Boolean(statusId || deletingId)}
                    onClick={() => void toggle(sale)}
                    aria-label={sale.is_live ? "Hide sale" : "Publish sale"}
                    title={sale.is_live ? "Hide" : "Publish"}
                  >
                    {statusId === sale.id ? (
                      <Loader2 className="animate-spin" />
                    ) : sale.is_live ? (
                      <EyeOff />
                    ) : (
                      <Eye />
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={Boolean(statusId || deletingId)}
                    onClick={() => edit(sale)}
                    aria-label="Edit sale"
                  >
                    <Edit3 />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={Boolean(statusId || deletingId)}
                    onClick={() => void remove(sale)}
                    aria-label="Delete sale"
                    className="text-destructive"
                  >
                    {deletingId === sale.id ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Trash2 />
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/35 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEditor();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sale-editor-title"
            className="flex max-h-[92dvh] w-full max-w-2xl flex-col rounded-lg border border-border bg-card shadow-elev"
          >
            <div className="flex items-center justify-between border-b border-border/60 p-5 sm:p-6">
              <h2 id="sale-editor-title" className="text-xl font-semibold">
                {form.id ? "Edit sale" : "Add a sale"}
              </h2>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={saving || uploading}
                onClick={closeEditor}
                aria-label="Close"
              >
                <X />
              </Button>
            </div>

            <div className="space-y-5 overflow-y-auto p-5 sm:p-6">
              <Field label="Sale name *">
                <Input
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="Webli Mahotsav 2026"
                  maxLength={200}
                  required
                />
              </Field>

              <Field label="Description">
                <Textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Sale details and terms…"
                />
              </Field>

              <Field label="Sale image">
                <Input
                  value={
                    form.image_url.startsWith("data:")
                      ? ""
                      : form.image_url
                  }
                  onChange={(event) =>
                    setForm({ ...form, image_url: event.target.value })
                  }
                  placeholder="Paste image URL (optional)"
                  aria-label="Sale image URL"
                  type="url"
                />

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm font-medium hover:bg-accent">
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImagePlus className="h-4 w-4" />
                    )}

                    {uploading ? "Preparing image…" : "Upload from device"}

                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={uploading || saving}
                      onChange={(event) => {
                        const file = event.currentTarget.files?.[0];
                        event.currentTarget.value = "";
                        void selectImage(file);
                      }}
                    />
                  </label>

                  {form.image_url && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={saving || uploading}
                      onClick={() =>
                        setForm({ ...form, image_url: "" })
                      }
                    >
                      Remove image
                    </Button>
                  )}

                  <span className="text-xs text-muted-foreground">
                    Maximum input size: 12 MB. Images are compressed before saving.
                  </span>
                </div>

                {form.image_url && (
                  <img
                    src={form.image_url}
                    alt="Sale preview"
                    className="mt-3 aspect-[16/9] w-full rounded-md bg-muted object-cover"
                  />
                )}
              </Field>

              <Field label="Link shown with the sale">
                <Input
                  type="url"
                  value={form.destination_url}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      destination_url: event.target.value,
                    })
                  }
                  placeholder="https://example.com/offer"
                />
              </Field>

              <Field label="Display order">
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      sort_order: Number(event.target.value),
                    })
                  }
                />
              </Field>

              <div className="flex items-center justify-between border-y border-border/60 py-4">
                <div>
                  <p className="font-medium">Sale is live</p>
                  <p className="text-sm text-muted-foreground">
                    Visible to visitors on the Sales page, subject to your public page configuration.
                  </p>
                </div>

                <Switch
                  checked={form.is_live}
                  disabled={saving || uploading}
                  onCheckedChange={(value) =>
                    setForm({ ...form, is_live: value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border/60 p-5 sm:p-6">
              <Button
                type="button"
                variant="outline"
                disabled={saving || uploading}
                onClick={closeEditor}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={() => void save()}
                disabled={saving || uploading}
                className="gradient-primary text-primary-foreground"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : form.id ? (
                  "Save changes"
                ) : (
                  "Add sale"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);

  try {
    const scale = Math.min(
      1,
      1800 / Math.max(bitmap.width, bitmap.height),
    );

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Could not prepare the image. Try another file.");
    }

    context.drawImage(
      bitmap,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    const result = canvas.toDataURL("image/webp", 0.82);

    if (result === "data:,") {
      throw new Error("Image conversion failed. Try another image.");
    }

    return result;
  } finally {
    bitmap.close();
  }
}
