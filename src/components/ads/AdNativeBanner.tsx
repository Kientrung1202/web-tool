"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const NATIVE_SCRIPT = "https://pl31242835.profitableratecpmnetwork.com/d8cec440bad5fb72b84989b11e005123/invoke.js";
const NATIVE_CONTAINER_ID = "container-d8cec440bad5fb72b84989b11e005123";

/**
 * Native banner ad — blends into content on text-heavy pages.
 * Best for Privacy, Terms, About.
 */
export function AdNativeBanner({ className }: { className?: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || loadedRef.current) return;
    loadedRef.current = true;

    const script = document.createElement("script");
    script.src = NATIVE_SCRIPT;
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    wrapper.appendChild(script);
  }, []);

  return (
    <div ref={wrapperRef} className={cn("my-6", className)} aria-hidden="true">
      <div id={NATIVE_CONTAINER_ID} />
    </div>
  );
}
