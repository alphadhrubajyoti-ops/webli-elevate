import { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-28 py-20 sm:py-28 ${className}`}>
      <div className="mx-auto max-w-7xl px-6">
        {(eyebrow || title || subtitle) && (
          <div className="max-w-3xl mb-12 sm:mb-16 animate-fade-up">
            {eyebrow && (
              <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full gradient-primary" />
                {eyebrow}
              </div>
            )}
            {title && (
              <h2 className="mt-5 text-3xl sm:text-5xl font-semibold tracking-tight text-balance">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
