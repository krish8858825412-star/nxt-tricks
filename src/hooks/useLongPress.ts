import { useCallback, useRef } from "react";

type Options = {
  ms?: number;
  onTrigger: () => void;
  onProgress?: (pct: number) => void;
};

export function useLongPress({ ms = 10000, onTrigger, onProgress }: Options) {
  const timer = useRef<number | null>(null);
  const raf = useRef<number | null>(null);
  const startedAt = useRef<number>(0);
  const fired = useRef(false);

  const stop = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    if (raf.current) cancelAnimationFrame(raf.current);
    timer.current = null;
    raf.current = null;
    onProgress?.(0);
  }, [onProgress]);

  const tick = useCallback(() => {
    const elapsed = performance.now() - startedAt.current;
    const pct = Math.min(1, elapsed / ms);
    onProgress?.(pct);
    if (pct < 1) raf.current = requestAnimationFrame(tick);
  }, [ms, onProgress]);

  const start = useCallback(
    (e?: React.SyntheticEvent) => {
      // don't prevent default — we still want short clicks to navigate
      fired.current = false;
      startedAt.current = performance.now();
      raf.current = requestAnimationFrame(tick);
      timer.current = window.setTimeout(() => {
        fired.current = true;
        onTrigger();
        stop();
      }, ms);
    },
    [ms, onTrigger, stop, tick],
  );

  const cancel = useCallback(() => {
    stop();
  }, [stop]);

  // For anchor/button: if long-press fired, swallow the click so it doesn't navigate.
  const onClickCapture = useCallback(
    (e: React.MouseEvent) => {
      if (fired.current) {
        e.preventDefault();
        e.stopPropagation();
        fired.current = false;
      }
    },
    [],
  );

  return {
    handlers: {
      onMouseDown: start,
      onMouseUp: cancel,
      onMouseLeave: cancel,
      onTouchStart: start,
      onTouchEnd: cancel,
      onTouchCancel: cancel,
      onClickCapture,
    },
  };
}
