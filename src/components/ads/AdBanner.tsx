"use client";

import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";

type BannerSize = "728x90" | "320x50";

const AD_CONFIG: Record<BannerSize, { key: string; width: number; height: number }> = {
  "728x90": { key: "c3e5a7d3c307ed6ab986141802aaa2d7", width: 728, height: 90 },
  "320x50": { key: "ca46ba199605c8ac14cfdc95a6b5e9c2", width: 320, height: 50 }
};

/**
 * Banner ad component.
 * - 728×90: desktop leaderboard (hidden on mobile)
 * - 320×50: mobile leaderboard (hidden on desktop)
 */
export function AdBanner({ size }: { size: BannerSize }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);
  const instanceId = useId();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || loadedRef.current) return;
    loadedRef.current = true;

    const { key, width, height } = AD_CONFIG[size];

    // Set atOptions on window before loading the invoke script
    const optionsScript = document.createElement("script");
    optionsScript.textContent = `atOptions = { 'key': '${key}', 'format': 'iframe', 'height': ${height}, 'width': ${width}, 'params': {} };`;
    container.appendChild(optionsScript);

    const invokeScript = document.createElement("script");
    invokeScript.src = `https://www.highrevenueformat.com/${key}/invoke.js`;
    invokeScript.async = true;
    container.appendChild(invokeScript);
  }, [size, instanceId]);

  const config = AD_CONFIG[size];

  return (
    <div
      ref={containerRef}
      className={cn(
        "mx-auto flex items-center justify-center overflow-hidden",
        size === "728x90" && "hidden md:flex",
        size === "320x50" && "flex md:hidden"
      )}
      style={{ minHeight: config.height, maxWidth: config.width }}
      aria-hidden="true"
    />
  );
}

/**
 * Responsive banner wrapper — shows 728×90 on desktop, 320×50 on mobile.
 */
export function AdBannerResponsive({ className }: { className?: string }) {
  return (
    <div className={cn("my-6", className)}>
      <AdBanner size="728x90" />
      <AdBanner size="320x50" />
    </div>
  );
}
