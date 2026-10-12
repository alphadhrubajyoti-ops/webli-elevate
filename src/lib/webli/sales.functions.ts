import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type Sale = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  destination_url: string | null;
  is_live: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export const getLiveSales = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const url = process.env["SUPABASE_URL"] ?? import.meta.env.VITE_SUPABASE_URL;
  if (!url || !key) throw new Error("Sales are temporarily unavailable.");

  const client = createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });

  const { data, error } = await client
    .from("sales")
    .select("id, title, description, image_url, destination_url, is_live, sort_order, created_at, updated_at")
    .eq("is_live", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error("Sales are temporarily unavailable.");
  return (data ?? []) as Sale[];
});