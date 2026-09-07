import { useEffect, useState } from "react";
import { z } from "zod";
import { Quote, Send, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Section } from "@/components/webli/Section";
import { getApprovedReviews, submitReview } from "@/lib/webli/reviews.functions";
import type { Review } from "@/lib/webli/queries";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80, "Name is too long."),
  role: z.string().trim().max(100, "Role is too long."),
  content: z.string().trim().min(12, "Please write a little more.").max(600, "Review is too long."),
  rating: z.number().int().min(1).max(5),
});

export function ReviewSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const loadReviews = useServerFn(getApprovedReviews);
  const saveReview = useServerFn(submitReview);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const rows = await loadReviews({});
        if (mounted) {
          setReviews(rows as Review[]);
          setLoadError(false);
        }
      } catch {
        if (mounted) setLoadError(true);
      }
    };
    void load();
    const channel = supabase
      .channel("public-reviews")
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, () => void load())
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [loadReviews]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = formSchema.safeParse({ name, role, content, rating });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your review.");
      return;
    }
    setSaving(true);
    try {
      await saveReview({ data: parsed.data });
      setName("");
      setRole("");
      setContent("");
      setRating(5);
      toast.success("Thanks — your review is awaiting approval.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit your review.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section id="reviews" eyebrow="Client reviews" title="What people say after working with WEBLI." subtitle="Real words from real clients. Every review is checked before it appears here.">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start">
        <div className="grid gap-4">
          {loadError ? (
            <div className="glass rounded-3xl p-8 min-h-56 grid place-items-center text-center">
              <div>
                <Quote className="mx-auto h-8 w-8 text-primary/60" />
                <p className="mt-4 font-medium">Reviews could not be loaded.</p>
                <p className="mt-1 text-sm text-muted-foreground">Please refresh and try again.</p>
              </div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="glass rounded-3xl p-8 min-h-56 grid place-items-center text-center">
              <div>
                <Quote className="mx-auto h-8 w-8 text-primary/60" />
                <p className="mt-4 font-medium">Be the first to share your WEBLI experience.</p>
                <p className="mt-1 text-sm text-muted-foreground">Approved client reviews will appear here.</p>
              </div>
            </div>
          ) : reviews.map((review) => (
            <figure key={review.id} className="glass rounded-3xl p-7">
              <div className="flex gap-1 text-primary" aria-label={`${review.rating} out of 5 stars`}>
                {Array.from({ length: review.rating }).map((_, index) => <Star key={index} className="h-4 w-4 fill-primary" />)}
              </div>
              <blockquote className="mt-4 text-lg leading-relaxed">“{review.content}”</blockquote>
              <figcaption className="mt-5 border-t border-border/60 pt-5">
                <div className="font-semibold">{review.name}</div>
                {review.role && <div className="text-sm text-muted-foreground">{review.role}</div>}
              </figcaption>
            </figure>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8 space-y-5">
          <div>
            <h3 className="text-xl font-semibold">Share your experience</h3>
            <p className="mt-1 text-sm text-muted-foreground">Your review will be visible after a quick approval.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="review-name">Name</Label><Input id="review-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} required /></div>
            <div className="space-y-2"><Label htmlFor="review-role">Role or company</Label><Input id="review-role" value={role} onChange={(event) => setRole(event.target.value)} maxLength={100} /></div>
          </div>
          <div className="space-y-2"><Label>Rating</Label><div className="flex gap-1" role="radiogroup" aria-label="Rating"><input type="hidden" value={rating} /><button type="button" className="sr-only" aria-label="Rating selected" /></div><div className="flex gap-1">{[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} onClick={() => setRating(value)} aria-label={`${value} star${value === 1 ? "" : "s"}`} className="p-1"><Star className={`h-5 w-5 ${value <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`} /></button>)}</div></div>
          <div className="space-y-2"><Label htmlFor="review-content">Review</Label><Textarea id="review-content" value={content} onChange={(event) => setContent(event.target.value)} maxLength={600} rows={5} placeholder="Tell us about your experience…" required /></div>
          <Button type="submit" disabled={saving} className="w-full rounded-full gradient-primary text-primary-foreground">{saving ? "Sending…" : <>Submit review <Send className="ml-2 h-4 w-4" /></>}</Button>
        </form>
      </div>
    </Section>
  );
}