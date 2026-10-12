import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowUpRight, BadgePercent, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingNav } from "@/components/webli/FloatingNav";
import { Footer } from "@/components/webli/Footer";
import { getLiveSales, type Sale } from "@/lib/webli/sales.functions";

export const Route = createFileRoute("/sales")({
  component: SalesPage,
  head: () => ({
    meta: [
      { title: "Live Sales & Offers · WEBLI" },
      { name: "description", content: "See current live offers from WEBLI." },
      { property: "og:title", content: "Live Sales & Offers · WEBLI" },
      { property: "og:description", content: "See current live offers from WEBLI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function SalesPage() {
  const loadSales = useServerFn(getLiveSales);
  const [sales, setSales] = useState<Sale[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    void loadSales({}).then((result) => {
      if (mounted) setSales(result);
    }).catch(() => {
      if (mounted) setFailed(true);
    });
    return () => { mounted = false; };
  }, [loadSales]);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <FloatingNav />
      <main className="min-h-[70vh] px-5 pb-20 pt-32 sm:px-8 sm:pt-40">
        <div className="mx-auto max-w-7xl">
          <div className="border-b border-border/60 pb-8 sm:pb-10">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <BadgePercent className="h-4 w-4" /> WEBLI OFFERS
            </p>
            <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Sales</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">Current offers from Webli.</p>
          </div>

          {sales === null && !failed ? (
            <div className="py-16 text-muted-foreground" role="status">Loading sales…</div>
          ) : failed ? (
            <div className="py-16 text-muted-foreground" role="alert">
              Sales could not be loaded right now. Please try again later.
            </div>
          ) : sales.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center py-16 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
                <Tag className="h-6 w-6" />
              </div>
              <p className="mt-5 text-xl font-semibold">No sale is currently live.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {sales.map((sale) => (
                <article key={sale.id} className="grid gap-7 py-10 md:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)] md:items-center md:gap-12 sm:py-14">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-muted">
                    {sale.image_url ? (
                      <img src={sale.image_url} alt={sale.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-muted-foreground">Sale image</div>
                    )}
                    <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-background/95 px-3 py-1.5 text-xs font-bold text-primary shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> SALE IS LIVE
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">CURRENT OFFER</p>
                    <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{sale.title}</h2>
                    {sale.description && <p className="mt-4 whitespace-pre-wrap leading-relaxed text-muted-foreground">{sale.description}</p>}
                    {safeDestination(sale.destination_url) && (
                      <a href={safeDestination(sale.destination_url) ?? undefined} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex">
                        <Button className="gradient-primary text-primary-foreground">
                          View offer <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function safeDestination(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}