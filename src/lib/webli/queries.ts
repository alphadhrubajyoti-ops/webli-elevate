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

export type Review = {
  id: string;
  user_id: string | null;
  name: string;
  role: string | null;
  content: string;
  rating: number;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
};

export type Demo = {
  id: string;
  title: string;
  category: string;
  description: string;
  url: string | null;
  image_url: string | null;
  is_published: boolean;
  sort_order: number;
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

export async function fetchPublishedDemos(): Promise<Demo[]> {
  const { data, error } = await supabase
    .from("demos")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Demo[];
}

export async function fetchAllDemos(): Promise<Demo[]> {
  const { data, error } = await supabase
    .from("demos")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Demo[];
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

export async function fetchAllReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Review[];
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
