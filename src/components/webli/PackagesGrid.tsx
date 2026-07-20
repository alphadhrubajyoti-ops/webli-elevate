import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, PackageOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchPublishedPackages, type Package } from "@/lib/webli/queries";
import { supabase } from "@/integrations/supabase/client";
import { whatsappUrl } from "@/lib/webli/constants";

export function PackagesGrid() {
  const [pkgs, setPkgs] = useState<Package[] | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchPublishedPackages().then((d) => mounted && setPkgs(d)).catch(() => mounted && setPkgs([]));
    const ch = supabase
      .channel("public-packages")
      .on("postgres_changes", { event: "*", schema: "public", table: "packages" }, () => {
        fetchPublishedPackages().then((d) => mounted && setPkgs(d)).catch(() => {});
      })
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(ch);
    };
  }, []);

  if (pkgs === null) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="glass rounded-3xl h-[420px] animate-pulse" />
        ))}
      </div>
    );
  }

  if (pkgs.length === 0) {
    return (
      <div className="glass rounded-3xl p-12 md:p-16 text-center">
        <div className="mx-auto h-16 w-16 rounded-2xl gradient-primary grid place-items-center shadow-elev">
          <PackageOpen className="h-8 w-8 text-primary-foreground" />
        </div>
        <h3 className="mt-6 text-2xl font-semibold tracking-tight">Packages coming soon</h3>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          Our team is finalising a fresh lineup of website packages. In the meantime, tell us about
          your project and we'll craft a proposal tailored to your goals.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/book">
            <Button className="rounded-full gradient-primary text-primary-foreground shadow-elev">
              Request a custom quote <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <a href={whatsappUrl("Hi Webli, I'd like a custom quote.")} target="_blank" rel="noreferrer">
            <Button variant="outline" className="rounded-full">
              <MessageCircle className="mr-1 h-4 w-4" /> Chat on WhatsApp
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {pkgs.map((p) => (
        <PackageCard key={p.id} pkg={p} />
      ))}
    </div>
  );
}

function PackageCard({ pkg }: { pkg: Package }) {
  const waMessage = `Hi Webli, I'm interested in the "${pkg.title}" package.`;
  return (
    <article className="group glass rounded-3xl overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-1 hover:shadow-elev">
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
        {pkg.image_url ? (
          <img
            src={pkg.image_url}
            alt={pkg.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full grid place-items-center">
            <Sparkles className="h-10 w-10 text-primary/60" />
          </div>
        )}
        {pkg.price_label && (
          <div className="absolute top-3 right-3 glass rounded-full px-3 py-1 text-xs font-semibold">
            {pkg.price_label}
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-semibold tracking-tight">{pkg.title}</h3>
        {pkg.tagline && <p className="mt-1 text-sm text-primary font-medium">{pkg.tagline}</p>}
        <p className="mt-3 text-sm text-muted-foreground line-clamp-4">{pkg.description}</p>
        {pkg.features.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-sm">
            {pkg.features.slice(0, 4).map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full gradient-primary shrink-0" />
                <span className="text-foreground/80">{f}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6 flex flex-col sm:flex-row gap-2 pt-4 border-t border-border/60">
          <Link
            to="/book"
            search={{ pkg: pkg.id } as never}
            className="flex-1"
          >
            <Button className="w-full rounded-full gradient-primary text-primary-foreground">
              Book Now
            </Button>
          </Link>
          <a
            href={whatsappUrl(waMessage)}
            target="_blank"
            rel="noreferrer"
            className="flex-1"
          >
            <Button variant="outline" className="w-full rounded-full">
              <MessageCircle className="mr-1 h-4 w-4" /> WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </article>
  );
}
