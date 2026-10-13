export function calculateFinalPrice(originalPrice: number, discountPercentage: number): number | null {
  if (!Number.isFinite(originalPrice) || originalPrice < 0) return null;
  if (!Number.isFinite(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) return null;
  return Math.round(originalPrice * (1 - discountPercentage / 100));
}

export function formatRupees(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function numericPriceFromLabel(label: string | null): number | null {
  if (!label) return null;
  const digits = label.replace(/[^0-9.]/g, "");
  if (!digits || !/^\d+(\.\d+)?$/.test(digits)) return null;
  const amount = Number(digits);
  return Number.isFinite(amount) ? amount : null;
}