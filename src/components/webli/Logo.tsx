import webliMark from "@/assets/webli-mark.png.asset.json";

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
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
      style={{ height }}
      aria-label="WEBLI"
    >
      <span className="grid shrink-0 place-items-center overflow-hidden rounded-xl bg-white" style={{ width: size, height: size }}>
        <img
          src={webliMark.url}
          alt=""
          aria-hidden="true"
          className="h-full w-full scale-125 object-contain"
        />
      </span>
      <span
        className="font-extrabold tracking-[0.12em] text-foreground"
        style={{ fontSize: Math.round(height * 0.7), lineHeight: 1 }}
      >
        WEBLI
      </span>
    </span>
  );
}
