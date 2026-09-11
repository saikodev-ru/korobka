"use client";

import { useEffect, useState } from "react";

/** Живое «сейчас» с тиком раз в intervalMs. null до монтирования (без гидратационных сюрпризов). */
export function useNow(intervalMs = 30_000): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // асинхронный старт, чтобы не звать setState синхронно в теле эффекта
    const raf = requestAnimationFrame(() => setNow(new Date()));
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(t);
    };
  }, [intervalMs]);

  return now;
}
