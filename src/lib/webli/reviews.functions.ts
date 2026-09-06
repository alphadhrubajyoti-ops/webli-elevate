import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { env } from "cloudflare:workers";
import type { Database } from "@/integrations/supabase/types";

const reviewSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(80, "Name is too long."),

  role: z
    .string()
    .trim()
    .max(100, "Role is too long.")
    .optional(),

  content: z
    .string()
    .trim()
    .min(12, "Please write a little more about your experience.")
    .max(600, "Review is too long."),

  rating: z
    .number()
    .int()
    .min(1)
    .max(5),
});

function getSupabaseClient() {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_PUBLISHABLE_KEY;

  if (!url) {
    throw new Error("SUPABASE_URL is not configured.");
  }

  if (!key) {
    throw new Error("SUPABASE_PUBLISHABLE_KEY is not configured.");
  }

  return createClient<Database>(url, key, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },

    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);

        if (
          key.startsWith("sb_") &&
          headers.get("Authorization") === `Bearer ${key}`
        ) {
          headers.delete("Authorization");
        }

        headers.set("apikey", key);

        return fetch(input, {
          ...init,
          headers,
        });
      },
    },
  });
}

export const getApprovedReviews = createServerFn({
  method: "GET",
}).handler(async () => {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("id, name, role, content, rating, created_at")
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load reviews:", error);
    throw new Error("Failed to load reviews.");
  }

  return data ?? [];
});

export const submitReview = createServerFn({
  method: "POST",
})
  .inputValidator((input: unknown) => reviewSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = getSupabaseClient();

    const { error } = await supabase.from("reviews").insert({
      name: data.name,
      role: data.role || null,
      content: data.content,
      rating: data.rating,
      is_approved: false,
    });

    if (error) {
      console.error("Failed to submit review:", error);
      throw new Error("Failed to submit review.");
    }

    return {
      ok: true,
    };
  });
