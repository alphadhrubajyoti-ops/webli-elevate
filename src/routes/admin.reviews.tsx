import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllReviews, type Review } from "@/lib/webli/queries";

export const Route = createFileRoute("/admin/reviews")({ component: ReviewsAdmin });

function ReviewsAdmin() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try { setReviews(await fetchAllReviews()); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not load reviews."); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function approve(review: Review) {
    const { error } = await supabase.from("reviews").update({ is_approved: true }).eq("id", review.id);
    if (error) toast.error(error.message); else { toast.success("Review approved."); load(); }
  }

  async function remove(review: Review) {
    if (!window.confirm(`Remove the review from ${review.name}?`)) return;
    const { error } = await supabase.from("reviews").delete().eq("id", review.id);
    if (error) toast.error(error.message); else { toast.success("Review removed."); load(); }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-semibold tracking-tight">Reviews</h1><p className="text-muted-foreground">Approve genuine client feedback or remove submissions.</p></div>
      <div className="rounded-3xl bg-card border border-border/60 overflow-hidden">
        {loading ? <div className="p-12 text-center text-muted-foreground">Loading reviews…</div> : reviews.length === 0 ? <div className="p-12 text-center text-muted-foreground">No reviews yet.</div> : reviews.map((review) => (
          <div key={review.id} className="flex flex-col gap-4 border-b border-border/60 p-5 last:border-0 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0"><div className="flex items-center gap-1 text-primary">{Array.from({ length: review.rating }).map((_, index) => <Star key={index} className="h-4 w-4 fill-primary" />)}</div><p className="mt-3 text-sm leading-relaxed">“{review.content}”</p><p className="mt-3 text-sm font-semibold">{review.name}{review.role ? <span className="font-normal text-muted-foreground"> · {review.role}</span> : null}</p><p className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</p></div>
            <div className="flex shrink-0 gap-2"><span className={`self-center rounded-full px-2.5 py-1 text-xs font-semibold ${review.is_approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>{review.is_approved ? "Published" : "Pending"}</span>{!review.is_approved && <Button size="sm" onClick={() => approve(review)} className="rounded-full"><Check className="mr-1 h-4 w-4" />Approve</Button>}<Button size="sm" variant="outline" onClick={() => remove(review)} className="rounded-full text-destructive hover:text-destructive"><Trash2 className="mr-1 h-4 w-4" />Remove</Button></div>
          </div>
        ))}
      </div>
    </div>
  );
}