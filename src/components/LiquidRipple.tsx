import { useEffect, useRef } from "react";

/**
 * Global "liquid" pointer effect.
 *
 * Two layers working together:
 * 1. An SVG `feDisplacementMap` filter applied to `<body>` — actually warps
 *    page contents (text, images, everything) around the pointer like water.
 *    The displacement source is a canvas drawn with radial gradients that
 *    follow the cursor / touches / scroll, then fades out smoothly.
 * 2. A second translucent canvas overlay paints a soft caustic glow so the
 *    ripple is visibly "wet" on top of the warped pixels.
 *
 * Disabled inside `[data-no-ripple]` ancestors (admin dialog, inputs).
 */
export default function LiquidRipple() {
  const dispCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const glowCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const dispCanvas = dispCanvasRef.current;
    const glowCanvas = glowCanvasRef.current;
    if (!dispCanvas || !glowCanvas) return;
    const dispCtx = dispCanvas.getContext("2d", { alpha: true });
    const glowCtx = glowCanvas.getContext("2d", { alpha: true });
    if (!dispCtx || !glowCtx) return;

    // Use a *low-res* displacement canvas — it gets stretched by the SVG
    // filter, so resolution doesn't need to be high. This is what keeps
    // the effect lag-free even on phones.
    const DISP_W = 320;
    const DISP_H = 320;
    dispCanvas.width = DISP_W;
    dispCanvas.height = DISP_H;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const setGlowSize = () => {
      glowCanvas.width = window.innerWidth * dpr;
      glowCanvas.height = window.innerHeight * dpr;
      glowCanvas.style.width = window.innerWidth + "px";
      glowCanvas.style.height = window.innerHeight + "px";
    };
    setGlowSize();

    type Ripple = {
      x: number; // viewport CSS px
      y: number;
      r: number;
      max: number;
      alpha: number;
      hue: number;
      strength: number; // 0..1 displacement strength
    };
    const ripples: Ripple[] = [];
    const MAX_RIPPLES = 14;

    let lastSpawn = 0;
    const spawn = (x: number, y: number, intensity = 1) => {
      const now = performance.now();
      if (now - lastSpawn < 26) return;
      lastSpawn = now;
      if (ripples.length >= MAX_RIPPLES) ripples.shift();
      ripples.push({
        x,
        y,
        r: 6,
        max: (110 + Math.random() * 110) * intensity,
        alpha: 0.55,
        hue: 195 + Math.random() * 50,
        strength: 0.85 * intensity,
      });
    };

    let running = true;
    let lastFrame = 0;

    const loop = (t: number) => {
      if (!running) return;
      if (t - lastFrame < 16) {
        requestAnimationFrame(loop);
        return;
      }
      lastFrame = t;

      const W = window.innerWidth;
      const H = window.innerHeight;

      // --- Displacement map (low-res, neutral grey background) ---
      // Mid-grey = no displacement. Brighter / darker pixels push contents.
      dispCtx.globalCompositeOperation = "source-over";
      dispCtx.fillStyle = "rgb(128,128,128)";
      dispCtx.fillRect(0, 0, DISP_W, DISP_H);

      // --- Glow overlay ---
      glowCtx.clearRect(0, 0, glowCanvas.width, glowCanvas.height);

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.r += (r.max - r.r) * 0.07;
        r.alpha *= 0.955;
        r.strength *= 0.962;
        if (r.alpha < 0.012 || r.r >= r.max - 0.5) {
          ripples.splice(i, 1);
          continue;
        }

        // Map viewport coords -> displacement canvas coords
        const dx = (r.x / W) * DISP_W;
        const dy = (r.y / H) * DISP_H;
        const dr = (r.r / Math.max(W, H)) * Math.max(DISP_W, DISP_H);

        // Concentric ring on displacement map: bright center, dark ring,
        // back to neutral at edge — that creates an outward "push" wave.
        const dispGrad = dispCtx.createRadialGradient(dx, dy, dr * 0.05, dx, dy, dr);
          const s = Math.min(1, r.strength);
          const hi = Math.round(128 + 110 * s); // up to ~238
          const lo = Math.round(128 - 110 * s); // down to ~18
        dispGrad.addColorStop(0, `rgba(${hi},${hi},${hi},1)`);
        dispGrad.addColorStop(0.55, `rgba(${lo},${lo},${lo},1)`);
        dispGrad.addColorStop(1, `rgba(128,128,128,0)`);
        dispCtx.fillStyle = dispGrad;
        dispCtx.beginPath();
        dispCtx.arc(dx, dy, dr, 0, Math.PI * 2);
        dispCtx.fill();

        // Glow on overlay (in device px)
        const gx = r.x * dpr;
        const gy = r.y * dpr;
        const gr = r.r * dpr;
        const glowGrad = glowCtx.createRadialGradient(gx, gy, gr * 0.15, gx, gy, gr);
        glowGrad.addColorStop(0, `hsla(${r.hue}, 95%, 70%, ${r.alpha * 0.55})`);
        glowGrad.addColorStop(0.55, `hsla(${r.hue + 25}, 95%, 60%, ${r.alpha * 0.22})`);
        glowGrad.addColorStop(1, `hsla(${r.hue + 50}, 95%, 55%, 0)`);
        glowCtx.fillStyle = glowGrad;
        glowCtx.beginPath();
        glowCtx.arc(gx, gy, gr, 0, Math.PI * 2);
        glowCtx.fill();
      }

      // Push the displacement canvas to the SVG filter's <feImage> via a
      // data URL, but only while ripples are active — saves CPU when idle.
      const filterImage = document.getElementById("liquid-disp-img") as unknown as SVGImageElement | null;
      if (filterImage) {
        if (ripples.length > 0) {
          // Use direct canvas href (works on modern browsers via toDataURL)
          // Throttle: only re-encode every ~2 frames to save CPU
          if ((t | 0) % 2 === 0) {
            try {
              filterImage.setAttribute("href", dispCanvas.toDataURL());
            } catch {
              /* ignore */
            }
          }
          document.body.style.filter = "url(#liquid-displace)";
        } else {
          document.body.style.filter = "";
        }
      }

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    const isInsideNoRipple = (target: EventTarget | null): boolean => {
      const el = target as HTMLElement | null;
      if (!el || !el.closest) return false;
      // Skip on form inputs and explicit no-ripple zones
      return !!el.closest("[data-no-ripple], input, textarea, select, [contenteditable='true']");
    };

    const onPointer = (e: PointerEvent) => {
      if (isInsideNoRipple(e.target)) return;
      spawn(e.clientX, e.clientY, e.pointerType === "touch" ? 1.2 : 0.95);
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
      if (dy < 6) return;
      spawn(window.innerWidth * (0.25 + Math.random() * 0.5), window.innerHeight * (0.4 + Math.random() * 0.2), 0.7);
    };
    const onResize = () => setGlowSize();

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      running = false;
      document.body.style.filter = "";
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <>
      {/* SVG displacement filter — invisible, applied to <body> on demand */}
      <svg
        aria-hidden
        width="0"
        height="0"
        style={{ position: "fixed", width: 0, height: 0, pointerEvents: "none" }}
      >
        <defs>
          <filter id="liquid-displace" x="0%" y="0%" width="100%" height="100%">
            <feImage id="liquid-disp-img" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="dispMap" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="dispMap"
              scale="22"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      {/* Hidden displacement source canvas (low-res, drawn each frame) */}
      <canvas ref={dispCanvasRef} aria-hidden style={{ position: "fixed", left: -9999, top: -9999, width: 1, height: 1, pointerEvents: "none" }} />
      {/* Visible glow overlay */}
      <canvas
        ref={glowCanvasRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] mix-blend-screen opacity-80"
      />
    </>
  );
}