"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BellRing, CalendarDays, Home, Moon, PartyPopper, Timer } from "lucide-react";
import { useApp } from "@/lib/store";
import { isWorkingOn, nextDayOff, scheduleLabel } from "@/lib/schedule";
import { GameIcon, gameLabel } from "@/lib/games";
import type { Member } from "@/lib/types";
import { colorOf } from "@/lib/types";
import { MemberAvatar } from "@/components/app/member-card";
import { hhMm, cn, isoDay } from "@/lib/utils";
import { pushNotification } from "@/lib/notify";
import { useNow } from "@/hooks/use-now";

/** Экран «Сегодня». */
export function TodayScreen({ onSelectFriend }: { onSelectFriend?: (id: string) => void }) {
  const me = useApp((s) => s.me);
  const friends = useApp((s) => s.friends);

  const now = useNow(30_000);
  const all = useMemo(() => [me, ...friends], [me, friends]);

  const freeToday = useMemo(
    () => (now ? all.filter((m) => !isWorkingOn(m.schedule, now)) : []),
    [all, now],
  );

  // общие игры свободных сегодня
  const commonGames = useMemo(() => {
    const src = freeToday.length ? freeToday : all;
    if (!src.length) return [];
    return src[0].games.filter((g) => src.every((m) => m.games.includes(g)));
  }, [freeToday, all]);

  if (!now) {
    return <div className="mx-auto max-w-xl space-y-4 px-4 py-6" />;
  }

  return (
    <div className="mx-auto max-w-xl space-y-4 px-4 pb-6 pt-4">
      {/* мой статус */}
      <MyStatus me={me} now={now} />

      {/* панель «Сегодня ты можешь поиграть в…» */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-[1.75rem] p-5"
        aria-label="Сегодня ты можешь поиграть в"
      >
        <p className="bang text-lg leading-snug">
          {freeToday.length > 0 ? (
            <>
              Сегодня свободны:{" "}
              <span className="text-teal">{freeToday.map((f) => f.name.split(" ")[0]).join(", ")}</span>
            </>
          ) : (
            <>Сегодня все в сменах… но коробка не закрывается</>
          )}
        </p>

        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
            <PartyPopper className="size-3.5" /> Сегодня ты можешь поиграть в…
          </p>
          {commonGames.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {commonGames.map((g) => (
                <motion.span
                  key={g}
                  whileHover={{ y: -2, scale: 1.04 }}
                  className="flex items-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 px-3.5 py-2 text-sm font-extrabold italic"
                >
                  <GameIcon id={g} className="size-5 text-primary" />
                  {gameLabel(g)}
                </motion.span>
              ))}
            </div>
          ) : (
            <p className="text-sm font-semibold text-muted-foreground">
              Отметь игры в профиле — тут появятся общие
            </p>
          )}
        </div>
      </motion.section>

      {/* панель «кто дома» */}
      <HomePanel members={all} now={now} onSelectFriend={onSelectFriend} />
    </div>
  );
}

/** Моя карточка статуса + таймер до отдыха. */
function MyStatus({ me, now }: { me: Member; now: Date }) {
  const working = isWorkingOn(me.schedule, now);
  const off = nextDayOff(me.schedule, now);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-[1.75rem] p-5"
    >
      <div className="flex items-center gap-3">
        <MemberAvatar m={me} size={52} />
        <div className="min-w-0 flex-1">
          <p className="bang truncate text-lg leading-tight">{me.name || "…"}</p>
          <p className="text-xs font-semibold text-muted-foreground">
            {scheduleLabel(me.schedule)} · дома с{" "}
            {me.homeAt != null
              ? `${String(Math.floor(me.homeAt / 60)).padStart(2, "0")}:${String(me.homeAt % 60).padStart(2, "0")}`
              : "--:--"}
          </p>
        </div>
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold italic",
            working ? "bg-primary/15 text-primary" : "bg-teal/15 text-teal",
          )}
        >
          {working ? <Timer className="size-3.5" /> : <Moon className="size-3.5" />}
          {working ? "В смене" : "Свободен"}
        </span>
      </div>

      {working && off && (
        <p className="mt-3 flex items-center gap-1.5 rounded-2xl bg-muted/70 px-3.5 py-2.5 text-xs font-bold text-muted-foreground">
          <CalendarDays className="size-4 text-primary" />
          Следующий выходной:{" "}
          <span className="bang text-foreground">
            {off.getDate()} {off.toLocaleDateString("ru-RU", { month: "long" })}
          </span>
        </p>
      )}
    </motion.section>
  );
}

/** «Кто дома»: все участники + таймер «освободится в HH:MM» по homeAt. */
function HomePanel({
  members,
  now,
  onSelectFriend,
}: {
  members: Member[];
  now: Date;
  onSelectFriend?: (id: string) => void;
}) {
  const me = useApp((s) => s.me);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 }}
      className="glass-card rounded-[1.75rem] p-5"
      aria-label="Кто дома"
    >
      <p className="mb-3 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
        <Home className="size-3.5" /> Кто дома
      </p>

      <ul className="space-y-2">
        {members.map((m) => {
          const working = isWorkingOn(m.schedule, now);
          const homeDate = hhMmOf(m.homeAt, now);
          const home = homeDate ? hhMm(homeDate) : null;
          const freed = !working && home && now >= (homeDate as Date);
          const c = colorOf(m.color);
          return (
            <li key={m.id}>
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => m.id !== me.id && onSelectFriend?.(m.id)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-card/60 p-2.5 text-left transition hover:bg-card"
              >
                <MemberAvatar m={m} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold italic leading-tight">
                    {m.id === me.id ? `${m.name} (ты)` : m.name}
                  </p>
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    {working
                      ? m.homeAt != null
                        ? `освободится в ${home}`
                        : "в смене"
                      : freed
                        ? `дома с ${home}`
                        : "свободен сегодня"}
                  </p>
                </div>
                <span
                  className={cn("size-2.5 rounded-full", working ? "" : "bg-teal")}
                  style={working ? { background: c.hex } : undefined}
                  aria-hidden="true"
                />
              </motion.button>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        <BellRing className="size-3.5" />
        Вечером коробка пинганёт, когда кто-то освободится
      </p>
    </motion.section>
  );
}

function hhMmOf(homeAt: number | undefined, now: Date): Date | null {
  if (homeAt == null) return null;
  const d = new Date(now);
  d.setHours(Math.floor(homeAt / 60), homeAt % 60, 0, 0);
  return d;
}

/** Локальный пуш «друг освободился» — вызывается из page.tsx раз в минуту. */
export function checkFreedNotifications(now: Date) {
  const state = useApp.getState();
  if (!state.onboarded) return;
  const key = `korobka-freed-${isoDay(now)}`;
  for (const f of state.friends) {
    const working = isWorkingOn(f.schedule, now);
    if (!working && f.homeAt != null) {
      const home = hhMmOf(f.homeAt, now);
      if (home && now >= home) {
        const tag = `freed-${f.id}-${isoDay(now)}`;
        if (typeof localStorage !== "undefined" && !localStorage.getItem(`${key}-${f.id}`)) {
          localStorage.setItem(`${key}-${f.id}`, "1");
          void pushNotification(
            `${f.name} освободился!`,
            `Судя по графику, он уже дома (${hhMm(home)}). Пора звать играть!`,
            tag,
          );
        }
      }
    }
  }
}
