import { Link } from "@tanstack/react-router";
import { WebliLogo } from "./Logo";
import { WHATSAPP_NUMBER, CONTACT_EMAIL, whatsappUrl } from "@/lib/webli/constants";
import { MessageCircle, Mail, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border/60 bg-gradient-to-b from-background to-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <WebliLogo height={30} />
          <p className="mt-4 text-sm text-muted-foreground max-w-sm">
            Webli is a boutique website studio building fast, elegant, revenue-focused sites for
            ambitious brands.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={whatsappUrl("Hi Webli, I'd like to know more.")}
              target="_blank"
              rel="noreferrer"
              className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium hover:shadow-elev transition-shadow"
            >
              <MessageCircle className="h-4 w-4 text-primary" />
              {WHATSAPP_NUMBER}
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium hover:shadow-elev transition-shadow"
            >
              <Mail className="h-4 w-4 text-primary" />
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-4">Company</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Home</Link></li>
            <li><Link to="/#services" className="hover:text-foreground">Services</Link></li>
            <li><Link to="/#portfolio" className="hover:text-foreground">Portfolio</Link></li>
            <li><Link to="/#faq" className="hover:text-foreground">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-4">Get started</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/book" className="hover:text-foreground inline-flex items-center gap-1">Book a project <ArrowUpRight className="h-3.5 w-3.5" /></Link></li>
            <li><Link to="/orders" className="hover:text-foreground">My orders</Link></li>
            <li><Link to="/login" className="hover:text-foreground">Login</Link></li>
            <li><Link to="/admin" className="hover:text-foreground">Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Webli. All rights reserved.</p>
          <p>Crafted with care.</p>
        </div>
      </div>
    </footer>
  );
}
