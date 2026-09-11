"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const ITEM_H = 44;
const VISIBLE = 5;

function Wheel({
  items,
  index,
  onIndex,
  className,
}: {
  items: string[];
  index: number;
  onIndex: (i: number) => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const programmatic = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    programmatic.current = true;
    el.scrollTop = index * ITEM_H;
    const t = setTimeout(() => (programmatic.current = false), 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = () => {
    const el = ref.current;
    if (!el || programmatic.current) return;
    const i = Math.round(el.scrollTop / ITEM_H);
    const clamped = Math.min(items.length - 1, Math.max(0, i));
    if (clamped !== index) onIndex(clamped);
  };

  return (
    <div className={cn("relative", className)} style={{ height: ITEM_H * VISIBLE }}>
      <div
        ref={ref}
        onScroll={onScroll}
        className="no-scrollbar h-full overflow-y-auto snap-y snap-mandatory overscroll-contain"
        style={{ scrollPaddingBlock: `${ITEM_H * 2}px` }}
      >
        <div style={{ height: ITEM_H * 2 }} />
        {items.map((it, i) => (
          <button
            type="button"
            key={i}
            onClick={() => {
              const el = ref.current;
              if (el) el.scrollTo({ top: i * ITEM_H, behavior: "smooth" });
              onIndex(i);
            }}
            className={cn(
              "flex h-11 snap-center items-center justify-center text-2xl font-extrabold tabular-nums transition-all",
              i === index
                ? "scale-105 text-foreground"
                : "scale-90 text-muted-foreground/45",
            )}
            style={{ height: ITEM_H }}
          >
            {it}
          </button>
        ))}
        <div style={{ height: ITEM_H * 2 }} />
      </div>
      {/* линейки-шторки как в iOS */}
      <div
        className="pointer-events-none absolute inset-x-6 h-[2px] rounded-full bg-border"
        style={{ top: ITEM_H * 2 }}
      />
      <div
        className="pointer-events-none absolute inset-x-6 h-[2px] rounded-full bg-border"
        style={{ top: ITEM_H * 3 - 2 }}
      />
    </div>
  );
}

/** Time-picker в стиле будильника iPhone: два колеса (часы / минуты). */
export function TimePickerWheel({
  value,
  onChange,
}: {
  value: number; // минуты от полуночи
  onChange: (minutes: number) => void;
}) {
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i * 5).padStart(2, "0"));
  const h = Math.floor(value / 60) % 24;
  const m = Math.round((value % 60) / 5) % 12;

  return (
    <div className="glass-card relative mx-auto flex w-full max-w-[280px] items-center justify-center gap-1 rounded-3xl px-6 py-3">
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 my-3 w-[85%] -translate-x-1/2 rounded-2xl bg-primary/10" />
      <Wheel items={hours} index={h} onIndex={(i) => onChange(i * 60 + (value % 60))} className="flex-1" />
      <span className="bang z-10 text-2xl text-foreground">:</span>
      <Wheel
        items={minutes}
        index={m}
        onIndex={(i) => onChange(Math.floor(value / 60) * 60 + i * 5)}
        className="flex-1"
      />
    </div>
  );
}
