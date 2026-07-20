import { supabase } from "@/integrations/supabase/client";

export type Package = {
  id: string;
  title: string;
  tagline: string | null;
  description: string;
  price_label: string | null;
  image_url: string | null;
  features: string[];
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type OrderStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type Order = {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  business_name: string | null;
  business_category: string | null;
  package_id: string | null;
  package_title: string | null;
  payment_method: string | null;
  notes: string | null;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
};

export async function fetchPublishedPackages(): Promise<Package[]> {
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalizePkg);
}

export async function fetchAllPackages(): Promise<Package[]> {
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalizePkg);
}

function normalizePkg(row: Record<string, unknown>): Package {
  const features = Array.isArray(row.features) ? (row.features as string[]) : [];
  return { ...(row as Package), features };
}

export async function fetchMyOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Order[];
}

export async function fetchAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Order[];
}

export async function isAdminUser(userId: string | undefined): Promise<boolean> {
  if (!userId) return false;
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) return false;
  return !!data;
}
