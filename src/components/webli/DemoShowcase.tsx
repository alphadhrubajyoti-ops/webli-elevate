import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, ExternalLink, FolderOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/webli/Section";
import { fetchPublishedDemos, type Demo } from "@/lib/webli/queries";
import { getPublishedDemos } from "@/lib/webli/demos.functions";
import { supabase } from "@/integrations/supabase/client";

const fallbackCategories = ["All"];

export function DemoShowcase() {
  const [demos, setDemos] = useState<Demo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("All");
  const loadServer = useServerFn(getPublishedDemos);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setError(null);
      try {
        const data = await loadServer({});
        if (mounted) setDemos(data as Demo[]);
        return;
      } catch {
        try {
          const data = await fetchPublishedDemos();
          if (mounted) setDemos(data);
        } catch {
          if (mounted) {
            setDemos(null);
            setError("Demo websites could not be loaded right now.");
          }
        }
      }
    };
    void load();

    const channel = supabase
      .channel("public-demos")
      .on("postgres_changes", { event: "*", schema: "public", table: "demos" }, () => void load())
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [loadServer]);

  const categories = useMemo(() => {
    if (!demos?.length) return fallbackCategories;
    return ["All", ...Array.from(new Set(demos.map((demo) => demo.category))).sort()];
  }, [demos]);

  const filtered = useMemo(
    () => demos?.filter((demo) => category === "All" || demo.category === category) ?? [],
    [category, demos],
  );

  return (
    <Section
      id="demos"
      eyebrow="Selected work"
      title="A sharper look at what we can build."
      subtitle="Explore live-ready concepts and demo websites, organised by the kind of experience they create."
      className="bg-secondary/35"
    >
      {demos === null && error === null ? (
        <div className="grid gap-5 md:grid-cols-12">
          <div className="md:col-span-7 h-[360px] rounded-[2rem] bg-card animate-pulse" />
          <div className="md:col-span-5 h-[360px] rounded-[2rem] bg-card animate-pulse" />
        </div>
      ) : error ? (
        <div className="rounded-[2rem] border border-dashed border-primary/25 bg-card/70 px-6 py-16 text-center">
          <FolderOpen className="mx-auto h-10 w-10 text-primary/70" />
          <h3 className="mt-5 text-2xl font-semibold tracking-tight">We could not load the demo websites</h3>
          <p className="mx-auto mt-2 max-w-lg text-muted-foreground">Please try again in a moment.</p>
          <Button type="button" variant="outline" className="mt-6 rounded-full" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      ) : null}

      {demos !== null && !error && demos.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-primary/25 bg-card/70 px-6 py-16 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-primary shadow-elev">
            <FolderOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="mt-5 text-2xl font-semibold tracking-tight">New work is on the way</h3>
          <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
            We’re preparing a collection of demo websites. Check back soon to explore the work.
          </p>
        </div>
      ) : null}

      {demos !== null && !error && demos.length > 0 ? (
        <>
          <div className="mb-8 flex flex-wrap items-center gap-2">
            {categories.map((item) => (
              <Button
                key={item}
                type="button"
                size="sm"
                variant={category === item ? "default" : "outline"}
                onClick={() => setCategory(item)}
                className={category === item ? "rounded-full gradient-primary text-primary-foreground" : "rounded-full"}
              >
                {item}
              </Button>
            ))}
          </div>
          <div className="grid gap-5 md:grid-cols-12">
            {filtered.map((demo, index) => (
              <DemoCard key={demo.id} demo={demo} featured={index === 0} />
            ))}
          </div>
        </>
      ) : null}
    </Section>
  );
}

function DemoCard({ demo, featured }: { demo: Demo; featured: boolean }) {
  const content = (
    <>
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary/20 via-card to-primary/5">
        {demo.image_url ? (
          <img src={demo.image_url} alt={demo.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center">
            <Sparkles className="h-10 w-10 text-primary/70" />
          </div>
        )}
        <div className="absolute inset-x-4 top-4 flex items-center justify-between">
          <span className="rounded-full glass px-3 py-1 text-xs font-semibold">{demo.category}</span>
          {demo.url && <span className="grid h-9 w-9 place-items-center rounded-full glass"><ArrowUpRight className="h-4 w-4" /></span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <h3 className="text-xl font-semibold tracking-tight">{demo.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{demo.description}</p>
        {demo.url && <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">View demo <ExternalLink className="h-3.5 w-3.5" /></div>}
      </div>
    </>
  );

  const className = `group flex flex-col overflow-hidden rounded-[2rem] border border-border/60 bg-card transition-all duration-500 hover:-translate-y-1 hover:shadow-elev ${featured ? "md:col-span-7" : "md:col-span-5"}`;
  return demo.url ? <a href={demo.url} target="_blank" rel="noreferrer" className={className}>{content}</a> : <article className={className}>{content}</article>;
}