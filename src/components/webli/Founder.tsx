import { MessageCircle, Mail, Code2, Award, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/webli/Section";
import { WHATSAPP_NUMBER, CONTACT_EMAIL, whatsappUrl } from "@/lib/webli/constants";
import founderAsset from "@/assets/founder.png.asset.json";

const stats = [
  { icon: Code2, value: "4+ yrs", label: "Coding experience" },
  { icon: Users, value: "50+", label: "Projects delivered" },
  { icon: Award, value: "5.0", label: "Client rating" },
];

export function Founder() {
  return (
    <Section
      id="founder"
      eyebrow="Meet the founder"
      title="The person behind Webli."
      subtitle="Every project is led personally — from first call to final launch."
    >
      <div className="glass rounded-[2rem] p-6 sm:p-10 grid gap-10 md:grid-cols-[280px_1fr] items-center">
        <div className="relative mx-auto md:mx-0">
          <div className="absolute -inset-3 rounded-[2rem] gradient-primary opacity-20 blur-2xl" aria-hidden />
          <img
            src={founderAsset.url}
            alt="Dhrubajyoti Sharma, founder of Webli"
            loading="lazy"
            className="relative h-64 w-64 rounded-[1.75rem] object-cover shadow-elev ring-1 ring-border/60"
          />
        </div>

        <div>
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> Founder &amp; Lead Developer
          </div>
          <h3 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Dhrubajyoti Sharma</h3>
          <p className="mt-2 text-muted-foreground">
            Founder of Webli — a website developing agency crafting fast, elegant, revenue-focused
            digital experiences.
          </p>
          <p className="mt-4 text-muted-foreground">
            With over four years of hands-on coding experience across modern web stacks, Dhrubajyoti
            has shipped marketing sites, e-commerce storefronts, dashboards and custom web apps for
            founders and growing teams. He leads every Webli engagement end to end — strategy,
            design systems, engineering, performance and SEO — so clients work directly with the
            person building their product.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-4">
                <s.icon className="h-5 w-5 text-primary" />
                <div className="mt-2 text-xl font-semibold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={whatsappUrl("Hi Dhrubajyoti, I'd like to discuss a website project.")}
              target="_blank"
              rel="noreferrer"
            >
              <Button size="lg" className="rounded-full gradient-primary text-primary-foreground shadow-elev h-12 px-6">
                <MessageCircle className="mr-1 h-4 w-4" /> Contact now · {WHATSAPP_NUMBER}
              </Button>
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`}>
              <Button size="lg" variant="outline" className="rounded-full h-12 px-6 glass">
                <Mail className="mr-1 h-4 w-4" /> Email
              </Button>
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
