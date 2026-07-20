import logoAsset from "@/assets/webli-logo.asset.json";

export function WebliLogo({ className = "", height = 32 }: { className?: string; height?: number }) {
  return (
    <img
      src={logoAsset.url}
      alt="Webli"
      style={{ height }}
      className={`w-auto select-none ${className}`}
      draggable={false}
    />
  );
}
