import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { WebliLogo } from "./Logo";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/", label: "Home" },
  { to: "/#services", label: "Services" },
  { to: "/book", label: "Book" },
  { to: "/orders", label: "Orders" },
  { to: "/#contact", label: "Contact" },
];

export function FloatingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (r) => r.location.pathname });

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => setOpen(false), [path]);

  return (
    <div className="fixed inset-x-0 top-3 sm:top-5 z-50 flex justify-center px-3">
      <nav
        className={`glass w-full max-w-6xl rounded-full transition-all duration-500 ${
          scrolled ? "shadow-elev" : "shadow-card-soft"
        }`}
      >
        <div className="flex items-center justify-between gap-3 pl-4 pr-2 py-2">
          <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="Webli home">
            <WebliLogo height={28} />
          </Link>
          <ul className="hidden md:flex items-center gap-1">
            {nav.map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  className="px-3.5 py-2 text-sm font-medium text-foreground/80 hover:text-foreground rounded-full hover:bg-primary/5 transition-colors"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm" className="rounded-full">
                Login
              </Button>
            </Link>
            <Link to="/book" className="hidden sm:inline-flex">
              <Button size="sm" className="rounded-full gradient-primary text-primary-foreground shadow-elev hover:opacity-95">
                Get started
              </Button>
            </Link>
            <button
              className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-primary/5"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="md:hidden px-3 pb-3">
            <ul className="grid gap-1">
              {nav.map((n) => (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    className="block px-4 py-3 rounded-2xl text-sm font-medium hover:bg-primary/5"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
              <li className="flex gap-2 mt-1">
                <Link to="/login" className="flex-1">
                  <Button variant="outline" className="w-full rounded-full">
                    Login
                  </Button>
                </Link>
                <Link to="/book" className="flex-1">
                  <Button className="w-full rounded-full gradient-primary text-primary-foreground">
                    Get started
                  </Button>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </div>
  );
}
