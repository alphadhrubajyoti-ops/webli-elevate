import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  MessageCircle,
  Sparkles,
  Rocket,
  Layout,
  ShoppingBag,
  Cpu,
  Palette,
  ShieldCheck,
  Zap,
  Star,
  ChevronDown,
  Check,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FloatingNav } from "@/components/webli/FloatingNav";
import { Footer } from "@/components/webli/Footer";
import { Section } from "@/components/webli/Section";
import { PackagesGrid } from "@/components/webli/PackagesGrid";
import { WebliLogo } from "@/components/webli/Logo";
import { whatsappUrl, WHATSAPP_NUMBER, CONTACT_EMAIL } from "@/lib/webli/constants";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const services = [
  { icon: Layout, title: "Business websites", desc: "Marketing sites that tell your story and convert visitors into pipeline." },
  { icon: ShoppingBag, title: "E-commerce", desc: "Fast, beautiful storefronts built to sell — mobile-first checkout included." },
  { icon: Rocket, title: "Landing pages", desc: "High-conversion campaign pages shipped in days, not weeks." },
  { icon: Cpu, title: "Web apps & dashboards", desc: "Custom internal tools and SaaS dashboards, engineered to scale." },
  { icon: Palette, title: "Brand & UI design", desc: "Distinctive visual systems your customers remember." },
  { icon: ShieldCheck, title: "Care & optimisation", desc: "Ongoing performance, SEO and reliability — hands-off for you." },
];


const why = [
  { icon: Zap, title: "Blazing performance", desc: "Sub-second loads, perfect Core Web Vitals, and clean, semantic code." },
  { icon: Palette, title: "Custom, not templated", desc: "Every project gets a bespoke design system — nothing off the shelf." },
  { icon: ShieldCheck, title: "Built to scale", desc: "Modern stack, secure by default, ready for growth from day one." },
  { icon: Sparkles, title: "Delightful details", desc: "Micro-interactions and typography that make your brand feel premium." },
];

const testimonials = [
  {
    quote: "Webli delivered a site that outperformed our previous one on every metric. Ten out of ten.",
    author: "Ananya Rao",
    role: "Founder, Northline Studio",
  },
  {
    quote: "Fast, opinionated, and genuinely design-led. Our launch page converted 4× the previous version.",
    author: "Marcus Bell",
    role: "Head of Growth, Cascade",
  },
  {
    quote: "The most professional agency I've worked with. Clean handover and a site I'm proud to send around.",
    author: "Priya Malhotra",
    role: "CEO, Loom & Co.",
  },
];

const faqs = [
  { q: "How long does a typical project take?", a: "Landing pages ship in 5–10 days. Full marketing sites take 3–5 weeks. E-commerce and web apps are scoped individually." },
  { q: "Do you handle hosting and maintenance?", a: "Yes. Every project ships on a modern, globally-cached hosting stack, and we offer optional care plans for ongoing updates, monitoring, and SEO." },
  { q: "Who owns the final website?", a: "You do — 100%. Source code, design files, domains and analytics all belong to you." },
  { q: "How does payment work?", a: "You never pay through the booking form. After we review your project, we send a proposal and secure payment link. Typical terms are 50% to start, 50% at launch." },
  { q: "Can you redesign an existing site?", a: "Absolutely. We do full redesigns, incremental refreshes, and one-off landing pages depending on what you need." },
];

function HomePage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <FloatingNav />
      <Hero />
      
      <About />
      <Services />
      <Packages />
      <Portfolio />
      <WhyChoose />
      <Testimonials />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 sm:pt-44 pb-20 sm:pb-32">
      <div className="absolute inset-0 gradient-hero-bg pointer-events-none" aria-hidden />
      <div className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full gradient-mesh opacity-20 blur-3xl animate-blob" aria-hidden />
      <div className="absolute -bottom-32 -right-24 h-[520px] w-[520px] rounded-full gradient-mesh opacity-15 blur-3xl animate-blob" aria-hidden style={{ animationDelay: "-6s" }} />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-4xl text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            A boutique website studio
          </div>
          <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-balance">
            Websites that <span className="gradient-text">convert</span>.
            <br className="hidden sm:block" /> Crafted, not templated.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Webli designs and builds fast, elegant, revenue-focused websites for ambitious brands —
            from bold landing pages to full e-commerce and custom web apps.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link to="/book">
              <Button size="lg" className="rounded-full gradient-primary text-primary-foreground shadow-elev hover:opacity-95 h-12 px-6">
                Start your project <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <a href={whatsappUrl("Hi Webli, I'd like to discuss a project.")} target="_blank" rel="noreferrer">
              <Button size="lg" variant="outline" className="rounded-full h-12 px-6 glass">
                <MessageCircle className="mr-1 h-4 w-4" /> WhatsApp us
              </Button>
            </a>
          </div>
        </div>

        {/* Hero illustration / product mock */}
        <div className="relative mt-16 sm:mt-24 mx-auto max-w-5xl animate-fade-up" style={{ animationDelay: "150ms" }}>
          <div className="glass rounded-[2rem] p-3 shadow-elev">
            <div className="relative rounded-[1.5rem] overflow-hidden aspect-[16/9] bg-gradient-to-br from-primary/15 via-white to-primary/5">
              <div className="absolute inset-0 grid grid-cols-12 gap-3 p-6">
                <div className="col-span-3 space-y-3">
                  <div className="glass rounded-2xl p-4 h-full flex flex-col gap-3">
                    <WebliLogo height={22} />
                    <div className="h-2 w-3/4 rounded-full bg-primary/20" />
                    <div className="h-2 w-1/2 rounded-full bg-primary/15" />
                    <div className="mt-auto h-24 rounded-xl gradient-primary/70 gradient-primary" />
                  </div>
                </div>
                <div className="col-span-9 grid grid-rows-6 gap-3">
                  <div className="row-span-2 grid grid-cols-3 gap-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="glass rounded-2xl p-4 flex flex-col justify-between">
                        <div className="h-2 w-1/2 rounded-full bg-primary/20" />
                        <div className="text-2xl font-bold gradient-text">{["98", "3.4×", "12d"][i]}</div>
                      </div>
                    ))}
                  </div>
                  <div className="row-span-4 glass rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-2 w-40 rounded-full bg-primary/25" />
                        <div className="h-2 w-24 rounded-full bg-primary/15" />
                      </div>
                      <div className="flex gap-2">
                        <div className="h-6 w-16 rounded-full gradient-primary" />
                        <div className="h-6 w-16 rounded-full bg-primary/10" />
                      </div>
                    </div>
                    <svg viewBox="0 0 400 120" className="mt-6 w-full h-32">
                      <defs>
                        <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#1976FF" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#1976FF" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0 90 C 60 80 90 40 140 50 S 240 100 290 60 S 360 20 400 30 L400 120 L0 120 Z" fill="url(#g1)" />
                      <path d="M0 90 C 60 80 90 40 140 50 S 240 100 290 60 S 360 20 400 30" fill="none" stroke="#1976FF" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                    <div className="absolute bottom-4 right-4 glass rounded-full px-3 py-1 text-xs font-semibold">
                      +342% conversions
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -top-6 -left-6 hidden md:block glass rounded-2xl p-4 animate-float shadow-elev">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Zap className="h-4 w-4 text-primary" /> Perfect Lighthouse
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 hidden md:block glass rounded-2xl p-4 animate-float shadow-elev" style={{ animationDelay: "-3s" }}>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Star className="h-4 w-4 text-primary" /> 5.0 client rating
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <div className="mx-auto max-w-7xl px-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-10 border-y border-border/60">
        {stats.map((s) => (
          <div key={s.l} className="text-center">
            <div className="text-3xl sm:text-4xl font-bold gradient-text">{s.k}</div>
            <div className="mt-1 text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function About() {
  return (
    <Section
      id="about"
      eyebrow="About Webli"
      title={<>A studio, not a factory.</>}
      subtitle="We're a small team of designers and engineers who care deeply about craft. Every project is led end-to-end by senior people — no juniors, no handoffs, no compromise."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { t: "Design-led", d: "Every pixel considered. Every interaction intentional." },
          { t: "Engineered right", d: "Clean, semantic, accessible code — built to last." },
          { t: "Honest & fast", d: "Fixed timelines. Clear scope. No surprises, ever." },
        ].map((x) => (
          <div key={x.t} className="glass rounded-3xl p-8 hover:shadow-elev transition-shadow">
            <div className="h-10 w-10 rounded-2xl gradient-primary grid place-items-center shadow-elev">
              <Check className="h-5 w-5 text-primary-foreground" />
            </div>
            <h3 className="mt-5 text-xl font-semibold">{x.t}</h3>
            <p className="mt-2 text-muted-foreground">{x.d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Services() {
  return (
    <Section
      id="services"
      eyebrow="Services"
      title="Everything you need to launch and grow online."
      subtitle="From your first landing page to full custom platforms — one team, one standard of quality."
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <div
            key={s.title}
            className="group relative rounded-3xl border border-border/60 bg-card p-7 hover:border-primary/30 hover:shadow-card-soft transition-all overflow-hidden"
          >
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full gradient-primary opacity-0 group-hover:opacity-10 blur-2xl transition-opacity" />
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 grid place-items-center">
                <s.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Packages() {
  return (
    <Section
      id="packages"
      eyebrow="Packages"
      title="Choose a package or start with a custom quote."
      subtitle="Transparent scope. Fixed timelines. Payment is never taken through the booking form — we send a proposal first."
    >
      <PackagesGrid />
    </Section>
  );
}

function Portfolio() {
  const items = [
    { title: "Northline Studio", tag: "Marketing site", grad: "from-blue-500 to-indigo-500" },
    { title: "Cascade", tag: "SaaS landing", grad: "from-sky-500 to-cyan-500" },
    { title: "Loom & Co.", tag: "E-commerce", grad: "from-indigo-500 to-violet-500" },
    { title: "Atlas Freight", tag: "Web app", grad: "from-blue-600 to-blue-400" },
  ];
  return (
    <Section
      id="portfolio"
      eyebrow="Selected work"
      title="Recent launches."
      subtitle="A snapshot of brands we've helped ship polished, high-performing digital experiences."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {items.map((it, i) => (
          <div
            key={it.title}
            className="group relative aspect-[16/10] rounded-3xl overflow-hidden glass hover:shadow-elev transition-all"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${it.grad} opacity-90`} />
            <div className="absolute inset-0 bg-[radial-gradient(600px_200px_at_50%_100%,white,transparent)] opacity-20" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
              <div className="text-xs font-semibold uppercase tracking-widest opacity-80">{it.tag}</div>
              <div className="mt-1 text-2xl font-semibold">{it.title}</div>
            </div>
            <div className="absolute top-6 right-6 h-10 w-10 rounded-full glass grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-4 w-4 text-primary" />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function WhyChoose() {
  return (
    <Section
      id="why"
      eyebrow="Why Webli"
      title="Premium quality, without the premium agency friction."
      subtitle="We work directly with founders and marketing teams to move fast without cutting corners."
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {why.map((w) => (
          <div key={w.title} className="glass rounded-3xl p-7 hover:-translate-y-1 hover:shadow-elev transition-all">
            <div className="h-11 w-11 rounded-2xl gradient-primary grid place-items-center shadow-elev">
              <w.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">{w.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{w.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Testimonials() {
  return (
    <Section
      id="testimonials"
      eyebrow="Testimonials"
      title="Loved by founders and teams."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure key={t.author} className="glass rounded-3xl p-8 flex flex-col">
            <div className="flex gap-1 text-primary">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-primary" />
              ))}
            </div>
            <blockquote className="mt-4 text-foreground/90 text-lg leading-relaxed">
              "{t.quote}"
            </blockquote>
            <figcaption className="mt-6 pt-6 border-t border-border/60">
              <div className="font-semibold">{t.author}</div>
              <div className="text-sm text-muted-foreground">{t.role}</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

function FAQ() {
  return (
    <Section id="faq" eyebrow="FAQ" title="Answers to the questions we hear most.">
      <div className="max-w-3xl">
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={String(i)}
              className="glass rounded-2xl px-6 border-none"
            >
              <AccordionTrigger className="text-left text-base font-semibold py-5 hover:no-underline [&>svg]:hidden group">
                <span className="flex-1">{f.q}</span>
                <ChevronDown className="h-5 w-5 text-primary transition-transform group-data-[state=open]:rotate-180" />
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}

function Contact() {
  return (
    <Section id="contact" eyebrow="Contact" title="Ready to build something great?">
      <div className="glass rounded-[2rem] p-8 sm:p-14 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero-bg opacity-60 pointer-events-none" aria-hidden />
        <div className="relative grid gap-10 md:grid-cols-2 items-center">
          <div>
            <h3 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
              Tell us about your project. We'll get back within 24 hours.
            </h3>
            <p className="mt-4 text-muted-foreground">
              Book online or reach out on WhatsApp — whichever's easier for you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/book">
                <Button size="lg" className="rounded-full gradient-primary text-primary-foreground shadow-elev h-12 px-6">
                  Book a project <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <a href={whatsappUrl("Hi Webli!")} target="_blank" rel="noreferrer">
                <Button size="lg" variant="outline" className="rounded-full h-12 px-6">
                  <MessageCircle className="mr-1 h-4 w-4" /> WhatsApp
                </Button>
              </a>
            </div>
          </div>
          <div className="grid gap-3">
            <a
              href={whatsappUrl("Hi Webli!")}
              target="_blank"
              rel="noreferrer"
              className="glass rounded-2xl p-5 flex items-center gap-4 hover:shadow-elev transition-shadow"
            >
              <div className="h-11 w-11 rounded-2xl gradient-primary grid place-items-center shadow-elev">
                <MessageCircle className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">WhatsApp</div>
                <div className="font-semibold">{WHATSAPP_NUMBER}</div>
              </div>
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="glass rounded-2xl p-5 flex items-center gap-4 hover:shadow-elev transition-shadow"
            >
              <div className="h-11 w-11 rounded-2xl gradient-primary grid place-items-center shadow-elev">
                <Mail className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-semibold">{CONTACT_EMAIL}</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
