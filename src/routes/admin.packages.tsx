
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  X,
  ImageIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllPackages, type Package } from "@/lib/webli/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  calculateFinalPrice,
  formatRupees,
  numericPriceFromLabel,
} from "@/lib/webli/package-pricing";

export const Route = createFileRoute("/admin/packages")({
  component: PackagesAdmin,
});

type FormState = {
  id?: string;
  title: string;
  tagline: string;
  description: string;
  price_label: string;
  original_price: string;
  discount_percentage: string;
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
  original_price: "",
  discount_percentage: "0",
  image_url: "",
  features: "",
  is_published: true,
  sort_order: 0,
};

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = String(
      (error as { message: unknown }).message
    );

    const code =
      "code" in error
        ? String((error as { code: unknown }).code)
        : "";

    const details =
      "details" in error
        ? String((error as { details: unknown }).details ?? "")
        : "";

    const hint =
      "hint" in error
        ? String((error as { hint: unknown }).hint ?? "")
        : "";

    return [
      message,
      code ? `Code: ${code}` : "",
      details ? `Details: ${details}` : "",
      hint ? `Hint: ${hint}` : "",
    ]
      .filter(Boolean)
      .join(" | ");
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error ?? "Unknown error");
}

function PackagesAdmin() {
  const [pkgs, setPkgs] = useState<Package[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const data = await fetchAllPackages();
      setPkgs(data);
    } catch (error) {
      console.error("Failed to load packages:", error);
      toast.error(`Could not load packages: ${getErrorMessage(error)}`);
    }
  }

  useEffect(() => {
    void load();

    const channel = supabase
      .channel("admin-packages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "packages",
        },
        () => {
          void load();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(
    () =>
      pkgs.filter((p) =>
        p.title.toLowerCase().includes(q.toLowerCase())
      ),
    [pkgs, q]
  );

  function openNew() {
    setForm({ ...empty });
    setOpen(true);
  }

  function openEdit(p: Package) {
    setForm({
      id: p.id,
      title: p.title,
      tagline: p.tagline ?? "",
      description: p.description ?? "",
      price_label: p.price_label ?? "",
      original_price: String(
        p.original_price ??
          numericPriceFromLabel(p.price_label) ??
          ""
      ),
      discount_percentage: String(p.discount_percentage ?? 0),
      image_url: p.image_url ?? "",
      features: (p.features ?? []).join("\n"),
      is_published: p.is_published,
      sort_order: p.sort_order,
    });

    setOpen(true);
  }

  const originalPrice = form.original_price.trim() === ""
    ? null
    : Number(form.original_price);

  const discountPercentage = form.discount_percentage.trim() === ""
    ? 0
    : Number(form.discount_percentage);

  const validOriginalPrice =
    originalPrice !== null &&
    Number.isFinite(originalPrice) &&
    originalPrice >= 0;

  const validDiscount =
    Number.isFinite(discountPercentage) &&
    discountPercentage >= 0 &&
    discountPercentage <= 100;

  const calculatedPrice =
    validOriginalPrice && validDiscount
      ? calculateFinalPrice(originalPrice, discountPercentage)
      : null;

  async function save() {
    if (saving) return;

    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required.");
      return;
    }

    if (originalPrice !== null && !validOriginalPrice) {
      toast.error("Enter a valid original price of zero or greater.");
      return;
    }

    if (!validDiscount) {
      toast.error("Discount must be between 0% and 100%.");
      return;
    }

    if (discountPercentage > 0 && originalPrice === null) {
      toast.error("Enter an original price before adding a discount.");
      return;
    }

    setSaving(true);

    try {
      const finalPrice =
        originalPrice === null
          ? null
          : calculateFinalPrice(
              originalPrice,
              discountPercentage
            );

      const payload = {
        title: form.title.trim(),
        tagline: form.tagline.trim() || null,
        description: form.description.trim(),

        // Keep the existing price field compatible with the
        // rest of the website.
        price_label:
          finalPrice === null
            ? form.price_label || null
            : formatRupees(finalPrice),

        original_price: originalPrice,
        discount_percentage: discountPercentage,

        image_url: form.image_url.trim() || null,
        features: form.features
          .split("\n")
          .map((feature) => feature.trim())
          .filter(Boolean),
        is_published: form.is_published,
        sort_order: Number(form.sort_order) || 0,
      };

      if (form.id) {
        const { error } = await supabase
          .from("packages")
          .update(payload)
          .eq("id", form.id);

        if (error) throw error;

        toast.success("Package updated successfully.");
      } else {
        const { error } = await supabase
          .from("packages")
          .insert(payload);

        if (error) throw error;

        toast.success("Package created successfully.");
      }

      setOpen(false);
      await load();
    } catch (error) {
      console.error("Package save failed:", error);

      toast.error(
        `Failed to save package: ${getErrorMessage(error)}`
      );
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(p: Package) {
    try {
      const { error } = await supabase
        .from("packages")
        .update({ is_published: !p.is_published })
        .eq("id", p.id);

      if (error) throw error;

      toast.success(
        p.is_published ? "Package unpublished." : "Package published."
      );

      await load();
    } catch (error) {
      console.error("Publish update failed:", error);
      toast.error(`Could not update package: ${getErrorMessage(error)}`);
    }
  }

  async function remove(p: Package) {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("packages")
        .delete()
        .eq("id", p.id);

      if (error) throw error;

      toast.success("Package deleted.");
      await load();
    } catch (error) {
      console.error("Package deletion failed:", error);
      toast.error(`Could not delete package: ${getErrorMessage(error)}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Packages
          </h1>
          <p className="text-muted-foreground">
            Create and manage the packages shown on your website.
          </p>
        </div>

        <Button
          onClick={openNew}
          className="rounded-full gradient-primary text-primary-foreground shadow-elev"
        >
          <Plus className="mr-1 h-4 w-4" />
          New package
        </Button>
      </div>

      <div className="glass flex items-center gap-3 rounded-2xl p-3">
        <Search className="ml-2 h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search packages…"
          className="flex-1 bg-transparent py-2 text-sm outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card">
        <div className="hidden grid-cols-[80px_1fr_180px_120px_120px] gap-4 border-b border-border/60 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid">
          <div>Image</div>
          <div>Title</div>
          <div>Pricing</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-14 text-center text-muted-foreground">
            No packages found. Create your first package.
          </div>
        ) : (
          filtered.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-1 items-center gap-3 border-b border-border/60 px-4 py-4 last:border-0 hover:bg-secondary/40 sm:px-5 md:grid-cols-[80px_1fr_180px_120px_120px] md:gap-4"
            >
              <div className="flex items-center gap-3 md:block">
                <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                <div className="min-w-0 md:hidden">
                  <div className="truncate font-semibold">{p.title}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {p.tagline || p.description.slice(0, 60)}
                  </div>
                </div>
              </div>

              <div className="hidden min-w-0 md:block">
                <div className="truncate font-semibold">{p.title}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {p.tagline || p.description.slice(0, 60)}
                </div>
              </div>

              <div>
                <PackagePrice
                  originalPrice={p.original_price}
                  discountPercentage={p.discount_percentage}
                  fallback={p.price_label}
                />
              </div>

              <div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    p.is_published
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      p.is_published
                        ? "bg-emerald-500"
                        : "bg-muted-foreground"
                    }`}
                  />
                  {p.is_published ? "Published" : "Hidden"}
                </span>
              </div>

              <div className="flex justify-end gap-1">
                <button
                  onClick={() => void togglePublish(p)}
                  className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted"
                  title={p.is_published ? "Hide" : "Publish"}
                >
                  {p.is_published ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>

                <button
                  onClick={() => openEdit(p)}
                  className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted"
                  title="Edit"
                >
                  <Edit3 className="h-4 w-4" />
                </button>

                <button
                  onClick={() => void remove(p)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-destructive hover:bg-destructive/10"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-3 backdrop-blur-sm sm:p-4">
          <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-card shadow-elev">
            <div className="flex items-center justify-between border-b border-border/60 p-5 sm:p-6">
              <h3 className="text-xl font-semibold">
                {form.id ? "Edit package" : "New package"}
              </h3>

              <button
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Title *">
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="Starter Site"
                  />
                </Field>

                <Field label="Tagline">
                  <Input
                    value={form.tagline}
                    onChange={(e) =>
                      setForm({ ...form, tagline: e.target.value })
                    }
                    placeholder="Perfect for launching fast"
                  />
                </Field>

                <Field label="Original price (₹)">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={form.original_price}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        original_price: e.target.value,
                      })
                    }
                    placeholder="25000"
                  />
                </Field>

                <Field label="Discount (%)">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    inputMode="decimal"
                    value={form.discount_percentage}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        discount_percentage: e.target.value,
                      })
                    }
                    placeholder="0"
                  />
                </Field>

                <div
                  className="rounded-lg border border-border/60 bg-secondary/40 p-4 sm:col-span-2"
                  aria-live="polite"
                >
                  <div className="text-xs font-semibold uppercase text-muted-foreground">
                    Calculated final price
                  </div>

                  <div className="mt-1 text-2xl font-semibold">
                    {calculatedPrice !== null
                      ? formatRupees(calculatedPrice)
                      : "—"}
                  </div>

                  {validOriginalPrice &&
                    originalPrice !== null &&
                    discountPercentage > 0 &&
                    validDiscount && (
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                        <span className="text-muted-foreground line-through">
                          {formatRupees(originalPrice)}
                        </span>
                        <span className="font-semibold text-emerald-600">
                          {discountPercentage}% OFF
                        </span>
                      </div>
                    )}

                  <p className="mt-1 text-xs text-muted-foreground">
                    Automatically updates when the original price or
                    discount changes.
                  </p>
                </div>

                <Field label="Sort order">
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        sort_order: Number(e.target.value),
                      })
                    }
                  />
                </Field>
              </div>

              <Field label="Image URL">
                <Input
                  value={form.image_url}
                  onChange={(e) =>
                    setForm({ ...form, image_url: e.target.value })
                  }
                  placeholder="https://…"
                />

                {form.image_url && (
                  <div className="mt-3 aspect-[16/9] overflow-hidden rounded-xl border border-border bg-muted">
                    <img
                      src={form.image_url}
                      alt="Package preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </Field>

              <Field label="Description *">
                <Textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Detailed description shown on the card…"
                />
              </Field>

              <Field label="Features (one per line)">
                <Textarea
                  rows={4}
                  value={form.features}
                  onChange={(e) =>
                    setForm({ ...form, features: e.target.value })
                  }
                  placeholder={"Custom design\n5 pages\nSEO setup"}
                />
              </Field>

              <div className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <div className="text-sm font-medium">
                    Publish immediately
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Visible to everyone on the public site.
                  </div>
                </div>

                <Switch
                  checked={form.is_published}
                  onCheckedChange={(value) =>
                    setForm({ ...form, is_published: value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border/60 p-5 sm:p-6">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={saving}
                className="rounded-full"
              >
                Cancel
              </Button>

              <Button
                onClick={() => void save()}
                disabled={saving}
                className="rounded-full gradient-primary text-primary-foreground"
              >
                {saving
                  ? "Saving…"
                  : form.id
                    ? "Save changes"
                    : "Create package"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PackagePrice({
  originalPrice,
  discountPercentage,
  fallback,
}: {
  originalPrice: number | null;
  discountPercentage: number | null;
  fallback: string | null;
}) {
  if (originalPrice === null || !Number.isFinite(originalPrice)) {
    return <span className="text-sm">{fallback ?? "—"}</span>;
  }

  const discount = discountPercentage ?? 0;
  const finalPrice = calculateFinalPrice(originalPrice, discount);

  if (finalPrice === null) {
    return <span className="text-sm">{fallback ?? "—"}</span>;
  }

  if (discount <= 0) {
    return (
      <span className="text-sm font-semibold">
        {formatRupees(finalPrice)}
      </span>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground line-through">
          {formatRupees(originalPrice)}
        </span>
        <span className="text-xs font-semibold text-emerald-600">
          {discount}% OFF
        </span>
      </div>
      <div className="text-sm font-semibold">
        {formatRupees(finalPrice)}
      </div>
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
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
