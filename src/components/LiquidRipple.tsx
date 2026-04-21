import { useEffect, useRef } from "react";

/**
 * Lightweight pointer-driven liquid ripple background.
 * Uses a single full-screen canvas with cheap radial blobs that "displace"
 * around the cursor / touch point. RequestAnimationFrame is throttled when
 * idle to keep mobile smooth.
 *
 * Disabled inside `[data-no-ripple]` ancestors (e.g. the admin dialog).
 */
export default function LiquidRipple() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const setSize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    setSize();

    type Ripple = { x: number; y: number; r: number; max: number; alpha: number; hue: number };
    const ripples: Ripple[] = [];
    const MAX_RIPPLES = 18;

    let lastSpawn = 0;
    const spawn = (x: number, y: number, intensity = 1) => {
      const now = performance.now();
      if (now - lastSpawn < 28) return; // throttle
      lastSpawn = now;
      if (ripples.length >= MAX_RIPPLES) ripples.shift();
      ripples.push({
        x: x * dpr,
        y: y * dpr,
        r: 4 * dpr,
        max: (90 + Math.random() * 110) * dpr * intensity,
        alpha: 0.32,
        hue: 200 + Math.random() * 60,
      });
    };

    let running = true;
    let lastFrame = 0;
    const loop = (t: number) => {
      if (!running) return;
      // Cap to ~60fps (skip frame if too soon)
      if (t - lastFrame < 14) {
        requestAnimationFrame(loop);
        return;
      }
      lastFrame = t;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.r += (r.max - r.r) * 0.06;
        r.alpha *= 0.955;
        if (r.alpha < 0.012 || r.r >= r.max - 0.5) {
          ripples.splice(i, 1);
          continue;
        }
        const grad = ctx.createRadialGradient(r.x, r.y, r.r * 0.2, r.x, r.y, r.r);
        grad.addColorStop(0, `hsla(${r.hue}, 90%, 65%, ${r.alpha * 0.8})`);
        grad.addColorStop(0.55, `hsla(${r.hue + 20}, 95%, 60%, ${r.alpha * 0.35})`);
        grad.addColorStop(1, `hsla(${r.hue + 40}, 95%, 55%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    const isInsideNoRipple = (target: EventTarget | null): boolean => {
      const el = target as HTMLElement | null;
      if (!el || !el.closest) return false;
      return !!el.closest("[data-no-ripple]");
    };

    const onPointer = (e: PointerEvent) => {
      if (isInsideNoRipple(e.target)) return;
      spawn(e.clientX, e.clientY, e.pointerType === "touch" ? 1.25 : 1);
    };
    const onTouch = (e: TouchEvent) => {
      if (isInsideNoRipple(e.target)) return;
      const t = e.touches[0] ?? e.changedTouches[0];
      if (t) spawn(t.clientX, t.clientY, 1.25);
    };
    let lastScrollY = window.scrollY;
    const onScroll = () => {
      const dy = Math.abs(window.scrollY - lastScrollY);
      lastScrollY = window.scrollY;
      if (dy < 4) return;
      // emit a soft ripple at center-ish
      spawn(window.innerWidth * (0.3 + Math.random() * 0.4), window.innerHeight * 0.5, 0.8);
    };
    const onResize = () => setSize();

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      running = false;
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] mix-blend-screen opacity-70"
    />
  );
}