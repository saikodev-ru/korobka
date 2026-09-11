"use client";

import { motion } from "framer-motion";
import { Clock, Gamepad2, CalendarDays } from "lucide-react";
import type { Member } from "@/lib/types";
import { colorOf, BANNERS } from "@/lib/types";
import { scheduleLabel } from "@/lib/schedule";
import { GameIcon, gameLabel } from "@/lib/games";
import { initialsOf, cn } from "@/lib/utils";

export function MemberAvatar({
  m,
  size = 56,
  className,
}: {
  m: Member;
  size?: number;
  className?: string;
}) {
  const c = colorOf(m.color);
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full border-2 bg-muted",
        c.border,
        className,
      )}
      style={{ width: size, height: size }}
    >
      {m.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={m.photo} alt={m.name} className="h-full w-full object-cover pixelated" />
      ) : (
        <span style={{ fontSize: size * 0.5 }}>{m.avatar || "🦊"}</span>
      )}
    </span>
  );
}

/** Градиентная карточка участника (з.10). */
export function MemberCard({
  m,
  actions,
  compact,
}: {
  m: Member;
  actions?: React.ReactNode;
  compact?: boolean;
}) {
  const banner = BANNERS[m.banner ?? "lavender"] ?? BANNERS.lavender;
  const c = colorOf(m.color);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="glass-card overflow-hidden rounded-[1.75rem]"
    >
      <div
        className={cn("relative px-5 pb-4 pt-5", compact ? "h-20" : "h-28")}
        style={{
          background: `linear-gradient(120deg, ${banner[0]}, ${banner[1]} 55%, ${banner[2]})`,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.35),transparent_55%)]" />
        <div className="absolute -bottom-1 left-5 translate-y-1/2">
          <MemberAvatar m={m} size={compact ? 56 : 72} className="bg-card shadow-xl" />
        </div>
      </div>

      <div className="px-5 pb-5 pt-10">
        <p className={cn("bang leading-tight", compact ? "text-lg" : "text-2xl")}>{m.name || "Без имени"}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs font-bold text-muted-foreground">
          <span
            className={cn("rounded-full px-2.5 py-1", c.border)}
            style={{ background: c.soft, borderWidth: 1.5 }}
          >
            {c.label}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
            <CalendarDays className="size-3.5" />
            {scheduleLabel(m.schedule)}
          </span>
          {m.homeAt != null && (
            <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
              <Clock className="size-3.5" />
              дома с {String(Math.floor(m.homeAt / 60)).padStart(2, "0")}:{String(m.homeAt % 60).padStart(2, "0")}
            </span>
          )}
        </div>

        {m.games.length > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              <Gamepad2 className="size-3.5" /> Играет в
            </p>
            <div className="flex flex-wrap gap-2">
              {m.games.map((g) => (
                <span
                  key={g}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold"
                >
                  <GameIcon id={g} className="size-4 text-primary" />
                  {gameLabel(g)}
                </span>
              ))}
            </div>
          </div>
        )}

        {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
      </div>
    </motion.div>
  );
}

export { initialsOf };
