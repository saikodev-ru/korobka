"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarCog, Check, ChevronLeft, ChevronRight, Infinity as InfinityIcon } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { isWorkingOn, monthGrid } from "@/lib/schedule";
import type { Schedule } from "@/lib/types";
import { DirtyBar } from "@/components/app/dirty-bar";
import { cn, ruMonthCaps } from "@/lib/utils";

const sameSchedule = (a: Schedule, b: Schedule) => JSON.stringify(a) === JSON.stringify(b);

/** Экран «График» — редактирование моего графика. */
export function ScheduleScreen() {
  const me = useApp((s) => s.me);
  const setMe = useApp((s) => s.setMe);

  const [draft, setDraft] = useState<Schedule>(me.schedule);
  const dirty = useMemo(() => !sameSchedule(draft, me.schedule), [draft, me.schedule]);

  const today = new Date();
  const [ym, setYm] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const weeks = useMemo(
    () => monthGrid(ym.y, ym.m, draft),
    [ym, draft],
  );

  const resetDraft = () => setDraft(me.schedule);

  const apply = () => {
    setMe({ schedule: draft });
    toast.success("График обновлён!", { description: "Не забудь поделиться новым кодом с друзьями" });
  };

  const toggleCustom = (iso: string) => {
    const custom = draft.custom ?? [];
    const next = custom.includes(iso)
      ? custom.filter((d) => d !== iso)
      : [...custom, iso].sort();
    setDraft({ type: "custom", custom: next });
  };

  const setPreset = (w: number, r: number) => {
    // якорь — ближайший понедельник
    const d = new Date();
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const anchor = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    setDraft({ type: "cycle", cycle: { workDays: w, restDays: r, anchor } });
  };

  const shiftMonth = (n: number) =>
    setYm(({ y, m }) => {
      const d = new Date(y, m + n, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const presets: { label: string; w: number; r: number }[] = [
    { label: "5/2", w: 5, r: 2 },
    { label: "3/3", w: 3, r: 3 },
    { label: "2/2", w: 2, r: 2 },
    { label: "1/1", w: 1, r: 1 },
  ];

  return (
    <div className="mx-auto max-w-xl px-4 pb-6 pt-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="glass-card rounded-[1.75rem] p-5">
          <p className="bang text-lg">Мой график</p>
          <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
            Выбери пресет или отметь смены вручную
          </p>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {presets.map((p) => {
              const on =
                draft.type === "cycle" &&
                draft.cycle?.workDays === p.w &&
                draft.cycle?.restDays === p.r;
              return (
                <motion.button
                  key={p.label}
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setPreset(p.w, p.r)}
                  className={cn(
                    "rounded-2xl border py-3 text-center transition-colors",
                    on
                      ? "border-primary/70 bg-primary/10"
                      : "border-border bg-card hover:bg-muted",
                  )}
                >
                  <span className="bang block text-xl">{p.label}</span>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    смен/отдых
                  </span>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setDraft({ type: "free" })}
              className={cn(
                "flex items-center justify-center gap-2 rounded-2xl border py-3 transition-colors",
                draft.type === "free"
                  ? "border-teal/70 bg-teal/10 text-teal"
                  : "border-border bg-card hover:bg-muted",
              )}
            >
              <InfinityIcon className="size-5" />
              <span className="text-sm font-extrabold italic">Свободен всегда</span>
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setDraft({ type: "custom", custom: draft.custom ?? [] })}
              className={cn(
                "flex items-center justify-center gap-2 rounded-2xl border py-3 transition-colors",
                draft.type === "custom"
                  ? "border-primary/70 bg-primary/10"
                  : "border-border bg-card hover:bg-muted",
              )}
            >
              <CalendarCog className="size-5" />
              <span className="text-sm font-extrabold italic">Свой график</span>
            </motion.button>
          </div>
        </div>

        {/* календарь */}
        <div className="glass-card rounded-[1.75rem] p-4">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Предыдущий месяц"
              className="grid size-9 place-items-center rounded-full transition hover:bg-muted active:scale-90"
            >
              <ChevronLeft className="size-5" />
            </button>
            <p className="bang text-lg tracking-wide">
              {ruMonthCaps(ym.m)} {ym.y}
            </p>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Следующий месяц"
              className="grid size-9 place-items-center rounded-full transition hover:bg-muted active:scale-90"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-extrabold text-muted-foreground">
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className="space-y-1">
            {weeks.map((row, i) => (
              <div key={i} className="grid grid-cols-7 gap-1">
                {row.map((cell) => {
                  const working =
                    draft.type === "custom"
                      ? (draft.custom ?? []).includes(cell.iso)
                      : cell.working;
                  const isToday =
                    cell.iso ===
                    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                  const customMode = draft.type === "custom";
                  return (
                    <motion.button
                      key={cell.iso}
                      type="button"
                      whileTap={{ scale: 0.82 }}
                      onClick={() => customMode && toggleCustom(cell.iso)}
                      className={cn(
                        "grid aspect-square place-items-center rounded-xl text-sm font-bold transition-colors",
                        !cell.inMonth && "opacity-25",
                        working
                          ? "bg-primary text-white shadow-[0_4px_14px_rgba(124,108,240,0.4)]"
                          : "bg-muted/60",
                        customMode && !working && "hover:bg-muted",
                        isToday && !working && "ring-1 ring-teal",
                      )}
                      aria-label={
                        isWorkingOn(draft, cell.date) ? "рабочий день" : "выходной"
                      }
                    >
                      {working && customMode ? <Check className="size-4" /> : cell.date.getDate()}
                    </motion.button>
                  );
                })}
              </div>
            ))}
          </div>

          <p className="mt-3 text-center text-xs font-semibold text-muted-foreground">
            {draft.type === "custom" ? (
              <>
                Тапай по дням, чтобы отметить смены ·{" "}
                <span className="bang text-foreground">{(draft.custom ?? []).length}</span> отмечено
              </>
            ) : draft.type === "free" ? (
              "Свободен всегда — можно играть в любой день"
            ) : (
              "Цикл повторяется от ближайшего понедельника"
            )}
          </p>
        </div>
      </motion.div>

      <DirtyBar show={dirty} onDiscard={resetDraft} onApply={apply} />
    </div>
  );
}
