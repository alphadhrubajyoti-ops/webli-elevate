export function WebliLogo({
  className = "",
  height = 32,
}: {
  className?: string;
  height?: number;
}) {
  const size = height;
  return (
    <span
      className={`inline-flex items-center gap-2 select-none ${className}`}
      style={{ height }}
      aria-label="Webli"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="webli-g1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1976FF" />
            <stop offset="100%" stopColor="#0A48C2" />
          </linearGradient>
          <linearGradient id="webli-g2" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4F9BFF" />
            <stop offset="100%" stopColor="#1976FF" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="38" height="38" rx="10" fill="url(#webli-g1)" />
        <path
          d="M9 13.5l4.2 13 3.6-8.8 3.4 8.8 4.2-13"
          stroke="white"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <rect x="26.5" y="10.5" width="3.2" height="3.2" rx="0.8" fill="url(#webli-g2)" opacity="0.95" />
        <rect x="30.5" y="14.5" width="2.2" height="2.2" rx="0.6" fill="white" opacity="0.9" />
      </svg>
      <span
        className="font-extrabold tracking-tight text-foreground"
        style={{ fontSize: Math.round(height * 0.7), lineHeight: 1 }}
      >
        Webli
      </span>
    </span>
  );
}
