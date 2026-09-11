"use client";

import { useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Rocket,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/app/logo";
import { ShakeButton } from "@/components/app/shake-button";
import { AvatarCrop } from "@/components/app/avatar-crop";
import { TimePickerWheel } from "@/components/app/time-picker";
import { MemberCard } from "@/components/app/member-card";
import { GameIcon, GAMES } from "@/lib/games";
import { AVATAR_EMOJIS, COLORS, type Schedule } from "@/lib/types";
import { monthGrid } from "@/lib/schedule";
import { cn, ruMonthCaps, tzName } from "@/lib/utils";

const STEP_TITLES = [
  "Кто ты в коробке?",
  "Во что играешь?",
  "Какой у тебя график?",
  "Отметь свои смены",
  "Во сколько ты уже дома?",
  "Так тебя увидят друзья",
];

interface Draft {
  name: string;
  avatar: string;
  photo?: string;
  color: string;
  banner: string;
  games: string[];
  schedule: Schedule;
  homeAt: number;
}

export function WelcomeScreen({
  onDone,
}: {
  onDone: (draft: Draft) => void;
}) {
  const [phase, setPhase] = useState<"splash" | "steps">("splash");
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [draft, setDraft] = useState<Draft>({
    name: "",
    avatar: "🦊",
    color: "lavender",
    banner: "lavender",
    games: [],
    schedule: { type: "free" },
    homeAt: 18 * 60,
  });
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));

  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(Math.min(5, Math.max(0, n)));
  };

  const next = () => {
    // шаг 4 (календарь) показываем только для «Свой график»
    let n = step + 1;
    if (n === 3 && draft.schedule.type !== "custom") n = 4;
    go(n);
  };
  const prev = () => {
    let n = step - 1;
    if (n === 3 && draft.schedule.type !== "custom") n = 2;
    go(n);
  };

  const nameBlocked = step === 0 && draft.name.trim().length < 2;

  if (phase === "splash") {
    return (
      <Splash
        onStart={() => setPhase("steps")}
      />
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* sticky-шапка шага */}
      <div className="sticky top-0 z-20 px-4 pt-[max(env(safe-area-inset-top),0.75rem)]">
        <div className="glass-pill mx-auto flex max-w-xl items-center gap-3 rounded-full px-4 py-2.5">
          {step > 0 ? (
            <button
              type="button"
              onClick={prev}
              aria-label="Назад"
              className="grid size-8 shrink-0 place-items-center rounded-full transition hover:bg-black/5 active:scale-90 dark:hover:bg-white/10"
            >
              <ArrowLeft className="size-4" />
            </button>
          ) : (
            <span className="grid size-8 shrink-0 place-items-center">
              <Logo size={22} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
              Шаг {step + 1} из 6
            </p>
            <p className="bang truncate text-sm leading-tight">{STEP_TITLES[step]}</p>
          </div>
          <div className="flex shrink-0 gap-1">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === step ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* контент шага — со свайпом */}
      <div className="relative flex-1">
        <AnimatePresence mode="popLayout" custom={dir} initial={false}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ x: dir * 90, opacity: 0, scale: 0.96 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: dir * -90, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.16}
            onDragEnd={(_, info) => {
              if (info.offset.x < -70 && step < 5 && !nameBlocked) next();
              else if (info.offset.x > 70 && step > 0) prev();
            }}
            className="mx-auto w-full max-w-xl px-4 pb-40 pt-5"
          >
            {step === 0 && (
              <StepName
                draft={draft}
                patch={patch}
                onPickPhoto={() => fileRef.current?.click()}
              />
            )}
            {step === 1 && (
              <StepGames
                selected={draft.games}
                toggle={(id) =>
                  patch({
                    games: draft.games.includes(id)
                      ? draft.games.filter((g) => g !== id)
                      : [...draft.games, id],
                  })
                }
              />
            )}
            {step === 2 && <StepSchedule draft={draft} patch={patch} />}
            {step === 3 && (
              <StepCustomCalendar
                schedule={draft.schedule}
                onChange={(schedule) => patch({ schedule })}
              />
            )}
            {step === 4 && (
              <StepHomeAt homeAt={draft.homeAt} onChange={(homeAt) => patch({ homeAt })} />
            )}
            {step === 5 && <StepConfirm draft={draft} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* скрытый input для фото */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const reader = new FileReader();
          reader.onload = () => setCropSrc(String(reader.result));
          reader.readAsDataURL(f);
          e.target.value = "";
        }}
      />

      {/* кроп */}
      <AnimatePresence>
        {cropSrc && (
          <AvatarCrop
            src={cropSrc}
            onDone={(photo) => {
              patch({ photo });
              setCropSrc(null);
            }}
            onCancel={() => setCropSrc(null)}
          />
        )}
      </AnimatePresence>

      {/* плавающие кнопки навигации */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-30 flex justify-center px-4">
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="glass-pill pointer-events-auto flex w-full max-w-xl items-center justify-between gap-3 rounded-full p-2 pl-4"
        >
          <p className="text-xs font-bold text-muted-foreground">
            {step === 0 && "Как тебя звать?"}
            {step === 1 && "Можно несколько"}
            {step === 2 && "Потом можно поменять"}
            {step === 3 && "Тапай по дням смен"}
            {step === 4 && "Чтобы друзья знали"}
            {step === 5 && "Всё можно менять потом"}
          </p>
          {step < 5 ? (
            <ShakeButton
              blocked={nameBlocked}
              blockedTitle="Как тебя зовут?"
              blockedDescription="Напиши имя — минимум 2 буквы"
              onClick={next}
              className="rounded-full px-6"
            >
              Дальше <ArrowRight className="size-4" />
            </ShakeButton>
          ) : (
            <ShakeButton
              onClick={() => onDone(draft)}
              className="rounded-full bg-teal px-6 text-white"
            >
              Поехали <Rocket className="size-4" />
            </ShakeButton>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/* ————— СПЛЭШ с параллаксом ————— */

function Splash({ onStart }: { onStart: () => void }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const cubeX = useTransform(sx, (v) => v * 26);
  const cubeY = useTransform(sy, (v) => v * 20);
  const starsX = useTransform(sx, (v) => v * -14);
  const starsY = useTransform(sy, (v) => v * -10);

  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
    >
      {/* декор */}
      <motion.div style={{ x: starsX, y: starsY }} className="pointer-events-none absolute inset-0">
        <Sparkles className="floaty absolute left-[12%] top-[18%] size-6 text-primary/50" />
        <Sparkles className="floaty absolute right-[14%] top-[30%] size-8 text-teal/40" style={{ animationDelay: "-2s" }} />
        <Sparkles className="floaty absolute bottom-[24%] left-[20%] size-5 text-teal/50" style={{ animationDelay: "-4s" }} />
        <div className="floaty absolute right-[22%] top-[14%] size-14 rounded-2xl bg-gradient-to-br from-primary/25 to-teal/25 blur-[2px]" style={{ animationDelay: "-1s" }} />
        <div className="floaty absolute bottom-[16%] right-[30%] size-9 rotate-12 rounded-xl bg-gradient-to-br from-teal/25 to-primary/25" style={{ animationDelay: "-3s" }} />
        <div className="floaty absolute left-[8%] top-[55%] size-6 -rotate-12 rounded-lg bg-gradient-to-br from-primary/30 to-transparent" style={{ animationDelay: "-5s" }} />
      </motion.div>

      <motion.div style={{ x: cubeX, y: cubeY }} className="relative">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -14 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 16 }}
        >
          <Logo size={132} />
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 22 }}
        className="bang mt-8 text-5xl tracking-tight"
      >
        КОРОБКА
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="mt-3 max-w-xs text-center text-sm font-semibold text-muted-foreground"
      >
        Узнай, когда друзья <span className="bang text-foreground">свободны</span> —
        и не пропусти игровой вечер
      </motion.p>

      <motion.button
        type="button"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        onClick={onStart}
        className="bang mt-10 flex items-center gap-2.5 rounded-full bg-primary px-9 py-4 text-lg text-primary-foreground shadow-[0_10px_30px_rgba(124,108,240,0.45)]"
      >
        Открыть коробку <ArrowRight className="size-5" />
      </motion.button>
    </div>
  );
}

/* ————— ШАГ 1: имя, аватар, цвет ————— */

function StepName({
  draft,
  patch,
  onPickPhoto,
}: {
  draft: Draft;
  patch: (p: Partial<Draft>) => void;
  onPickPhoto: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={onPickPhoto}
          className={cn(
            "relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-3xl border-2 border-dashed border-border bg-card transition hover:border-primary/60",
            COLORS[draft.color]?.border && "border-2",
          )}
          style={draft.photo ? { borderStyle: "solid" } : undefined}
          aria-label="Загрузить фото"
        >
          {draft.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={draft.photo} alt="аватар" className="h-full w-full object-cover pixelated" />
          ) : (
            <span className="text-3xl">{draft.avatar}</span>
          )}
          <span className="absolute inset-x-0 bottom-0 grid place-items-center bg-black/45 py-1 text-white">
            <Camera className="size-4" />
          </span>
        </motion.button>
        <div className="min-w-0 flex-1">
          <p className="bang text-2xl">{draft.name.trim() || "…"}</p>
          <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
            Нажми на квадратик — загрузи фото. Или выбери масcot ниже.
          </p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Имя</p>
        <input
          value={draft.name}
          onChange={(e) => patch({ name: e.target.value.slice(0, 24) })}
          placeholder="Тимон, Лена, Капитан…"
          className="h-14 w-full rounded-3xl border border-input bg-card px-5 text-xl font-extrabold outline-none placeholder:font-semibold placeholder:text-muted-foreground/50 focus-visible:ring-[3px] focus-visible:ring-ring/25"
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Маскот</p>
        <div className="grid grid-cols-8 gap-1.5">
          {AVATAR_EMOJIS.map((e) => (
            <motion.button
              key={e}
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={() => patch({ avatar: e, photo: undefined })}
              className={cn(
                "grid aspect-square place-items-center rounded-2xl text-xl transition",
                draft.avatar === e && !draft.photo
                  ? "bg-primary/15 ring-2 ring-primary"
                  : "bg-card hover:bg-muted",
              )}
            >
              {e}
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Твой цвет</p>
        <div className="flex flex-wrap gap-2.5">
          {Object.entries(COLORS).map(([id, c]) => (
            <motion.button
              key={id}
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={() => patch({ color: id })}
              aria-label={c.label}
              className={cn(
                "size-9 rounded-full border-[3px] transition",
                draft.color === id ? "ring-2 ring-foreground/50 ring-offset-2 ring-offset-background" : "",
              )}
              style={{ background: c.hex, borderColor: "transparent", boxShadow: `0 4px 12px ${c.soft}` }}
            >
              {draft.color === id && <Check className="mx-auto size-4 text-white" />}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ————— ШАГ 2: игры ————— */

function StepGames({
  selected,
  toggle,
}: {
  selected: string[];
  toggle: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {GAMES.map((g) => {
        const on = selected.includes(g.id);
        return (
          <motion.button
            key={g.id}
            type="button"
            whileTap={{ scale: 0.94 }}
            whileHover={{ y: -2 }}
            onClick={() => toggle(g.id)}
            className={cn(
              "flex flex-col items-start gap-2 rounded-3xl border p-3.5 text-left transition-colors",
              on
                ? "border-primary/70 bg-primary/10 shadow-[0_6px_20px_rgba(124,108,240,0.18)]"
                : "border-border bg-card hover:bg-muted",
            )}
          >
            <span
              className={cn(
                "grid size-12 place-items-center rounded-2xl transition-colors",
                on ? "bg-primary text-white" : "bg-muted text-foreground",
              )}
            >
              <GameIcon id={g.id} className="size-7" />
            </span>
            <span className="text-sm font-extrabold italic leading-tight">{g.label}</span>
            <span className="text-[11px] font-medium leading-snug text-muted-foreground">{g.hint}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ————— ШАГ 3: график ————— */

const PRESETS: { id: string; label: string; sub: string; make: () => Schedule }[] = [
  {
    id: "52",
    label: "5/2",
    sub: "классика: пн–пт в смене",
    make: () => ({ type: "cycle", cycle: { workDays: 5, restDays: 2, anchor: nearestMonday() } }),
  },
  {
    id: "33",
    label: "3/3",
    sub: "трое через трое",
    make: () => ({ type: "cycle", cycle: { workDays: 3, restDays: 3, anchor: nearestMonday() } }),
  },
  {
    id: "22",
    label: "2/2",
    sub: "двое через двое",
    make: () => ({ type: "cycle", cycle: { workDays: 2, restDays: 2, anchor: nearestMonday() } }),
  },
  {
    id: "free",
    label: "Свободен",
    sub: "всегда могу играть",
    make: () => ({ type: "free" }),
  },
];

function nearestMonday(): string {
  const d = new Date();
  const shift = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - shift);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function StepSchedule({
  draft,
  patch,
}: {
  draft: Draft;
  patch: (p: Partial<Draft>) => void;
}) {
  const cur = draft.schedule;
  const activePreset =
    cur.type === "free"
      ? "free"
      : cur.type === "cycle"
        ? `${cur.cycle?.workDays}${cur.cycle?.restDays}`
        : "custom";
  return (
    <div className="space-y-2.5">
      {PRESETS.map((p) => {
        const on = activePreset === p.id;
        return (
          <motion.button
            key={p.id}
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => patch({ schedule: p.make() })}
            className={cn(
              "flex w-full items-center gap-4 rounded-3xl border p-4 text-left transition-colors",
              on
                ? "border-primary/70 bg-primary/10"
                : "border-border bg-card hover:bg-muted",
            )}
          >
            <span
              className={cn(
                "grid min-w-16 place-items-center rounded-2xl px-3 py-2.5 text-xl font-black italic transition-colors",
                on ? "bg-primary text-white" : "bg-muted",
              )}
            >
              {p.id === "free" ? "∞" : p.label}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-extrabold italic">{p.label === "free" ? "Свободен всегда" : p.label}</span>
              <span className="block text-xs font-medium text-muted-foreground">{p.sub}</span>
            </span>
            {on && (
              <span className="grid size-7 place-items-center rounded-full bg-primary text-white">
                <Check className="size-4" />
              </span>
            )}
          </motion.button>
        );
      })}

      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => patch({ schedule: { type: "custom", custom: [] } })}
        className={cn(
          "flex w-full items-center gap-4 rounded-3xl border p-4 text-left transition-colors",
          activePreset === "custom"
            ? "border-primary/70 bg-primary/10"
            : "border-border bg-card hover:bg-muted",
        )}
      >
        <span
          className={cn(
            "grid min-w-16 place-items-center rounded-2xl px-3 py-2.5 transition-colors",
            activePreset === "custom" ? "bg-primary text-white" : "bg-muted",
          )}
        >
          <CalendarDash />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-extrabold italic">Свой график</span>
          <span className="block text-xs font-medium text-muted-foreground">
            Отметь дни смен в календаре на следующем шаге
          </span>
        </span>
        {activePreset === "custom" && (
          <span className="grid size-7 place-items-center rounded-full bg-primary text-white">
            <Check className="size-4" />
          </span>
        )}
      </motion.button>
    </div>
  );
}

function CalendarDash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6">
      <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 9.5h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 14h3M13 14h3M8 17.5h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* ————— ШАГ 4: свой календарь ————— */

function StepCustomCalendar({
  schedule,
  onChange,
}: {
  schedule: Schedule;
  onChange: (s: Schedule) => void;
}) {
  const today = new Date();
  const [ym, setYm] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const custom = schedule.custom ?? [];
  const weeks = useMemo(() => monthGrid(ym.y, ym.m), [ym]);

  const toggle = (iso: string) => {
    const next = custom.includes(iso) ? custom.filter((d) => d !== iso) : [...custom, iso].sort();
    onChange({ type: "custom", custom: next });
  };

  const shiftMonth = (n: number) => {
    setYm(({ y, m }) => {
      const d = new Date(y, m + n, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  return (
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
        <p className="bang text-lg tracking-wide">{ruMonthCaps(ym.m)} {ym.y}</p>
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
              const on = custom.includes(cell.iso);
              const isToday = cell.iso === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
              return (
                <motion.button
                  key={cell.iso}
                  type="button"
                  whileTap={{ scale: 0.82 }}
                  onClick={() => toggle(cell.iso)}
                  className={cn(
                    "grid aspect-square place-items-center rounded-xl text-sm font-bold transition-colors",
                    !cell.inMonth && "opacity-25",
                    on
                      ? "bg-primary text-white shadow-[0_4px_14px_rgba(124,108,240,0.4)]"
                      : "bg-muted/60 hover:bg-muted",
                    isToday && !on && "ring-1 ring-teal",
                  )}
                >
                  {cell.date.getDate()}
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-xs font-semibold text-muted-foreground">
        Отмечено смен: <span className="bang text-foreground">{custom.length}</span>
      </p>
    </div>
  );
}

/* ————— ШАГ 5: время дома ————— */

function StepHomeAt({
  homeAt,
  onChange,
}: {
  homeAt: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-5">
      <p className="text-center text-sm font-semibold text-muted-foreground">
        Колёсико как в будильнике — крути, во сколько ты <span className="bang text-foreground">уже дома</span>
      </p>
      <TimePickerWheel value={homeAt} onChange={onChange} />
      <p className="text-center text-xs font-medium text-muted-foreground">
        Часовой пояс определился автоматически: {tzName()}
      </p>
    </div>
  );
}

/* ————— ШАГ 6: подтверждение ————— */

function StepConfirm({ draft }: { draft: Draft }) {
  const member = {
    id: "preview",
    name: draft.name,
    avatar: draft.avatar,
    photo: draft.photo,
    color: draft.color,
    banner: draft.banner,
    games: draft.games,
    schedule: draft.schedule,
    homeAt: draft.homeAt,
    tz: tzName(),
    updatedAt: 0,
  };
  const label =
    draft.schedule.type === "free"
      ? "Свободен всегда"
      : draft.schedule.type === "custom"
        ? `Свой график · ${draft.schedule.custom?.length ?? 0} смен`
        : `${draft.schedule.cycle?.workDays}/${draft.schedule.cycle?.restDays}`;

  return (
    <div className="space-y-4">
      <MemberCard m={member} />
      <div className="grid grid-cols-2 gap-2.5 text-center">
        <div className="glass-card rounded-3xl p-3.5">
          <p className="bang text-2xl">{draft.games.length}</p>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">игр</p>
        </div>
        <div className="glass-card rounded-3xl p-3.5">
          <p className="bang text-2xl">{label}</p>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">график</p>
        </div>
      </div>
      <div className="glass-card flex items-center gap-3 rounded-3xl p-4">
        <Sparkles className="size-5 shrink-0 text-teal" />
        <p className="text-xs font-semibold text-muted-foreground">
          Дальше открой вкладку <span className="bang text-foreground">«Поделиться»</span> — там код,
          который добавит тебя друзьям.
        </p>
      </div>
    </div>
  );
}
