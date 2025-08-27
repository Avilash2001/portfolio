"use client";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

export default function MagneticButton(
  props: React.ComponentProps<typeof Button>
) {
  const ref = useRef<HTMLButtonElement | null>(null);

  function handleMouseMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
  }
  function reset() {
    const el = ref.current;
    if (el) el.style.transform = "translate(0,0)";
  }

  return (
    <Button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      {...props}
    />
  );
}
