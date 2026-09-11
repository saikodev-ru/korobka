"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  ChevronDown,
  ChevronLeft,
  LogOut,
  Mail,
  Pencil,
  Send,
  Share2,
  Sparkles,
  Timer,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { AVATAR_EMOJIS, BANNERS, BANNER_IDS, COLORS, type Member } from "@/lib/types";
import { scheduleLabel } from "@/lib/schedule";
import { encodeShareCode } from "@/lib/share";
import { MemberCard } from "@/components/app/member-card";
import { AvatarCrop } from "@/components/app/avatar-crop";
import { TimePickerWheel } from "@/components/app/time-picker";
import { DirtyBar } from "@/components/app/dirty-bar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn, hhMm } from "@/lib/utils";

type EditorTile = "data" | "look" | "graph" | null;

/** Экран «Профиль»: мой (с редактором плитками) или чужой. */
export function ProfileScreen({ viewMember }: { viewMember?: Member | null }) {
  const me = useApp((s) => s.me);
  const setMe = useApp((s) => s.setMe);
  const reset = useApp((s) => s.reset);
  const setTab = useApp((s) => s.setTab);
  const markShared = useApp((s) => s.markShared);

  if (viewMember) {
    return <OtherProfile m={viewMember} onBack={() => setTab("today")} />;
  }
  return <MyProfile me={me} setMe={setMe} reset={reset} setTab={setTab} markShared={markShared} />;
}

/* ————— чужой профиль ————— */

function OtherProfile({ m, onBack }: { m: Member; onBack: () => void }) {
  const link = m.tg ? `https://t.me/${m.tg}` : null;
  return (
    <div className="mx-auto max-w-xl px-4 pb-6 pt-4">
      <button
        type="button"
        onClick={onBack}
        className="mb-3 flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold text-muted-foreground transition hover:bg-muted active:scale-95"
      >
        <ChevronLeft className="size-4" />
        Назад
      </button>

      <MemberCard
        m={m}
        actions={
          link ? (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-extrabold text-primary-foreground shadow-[0_6px_18px_rgba(124,108,240,0.35)] transition hover:brightness-110"
            >
              <Send className="size-4" />
              Написать
            </a>
          ) : (
            <span className="text-xs font-semibold text-muted-foreground">
              Telegram не указан
            </span>
          )
        }
      />

      <div className="glass-card mt-4 rounded-[1.75rem] p-5">
        <p className="bang text-base">Расписание</p>
        <ul className="mt-2 space-y-1.5 text-sm font-semibold text-muted-foreground">
          <li>График: <span className="bang text-foreground">{scheduleLabel(m.schedule)}</span></li>
          {m.homeAt != null && (
            <li>Дома примерно с <span className="bang text-foreground">{hhMm(new Date(2000, 0, 1, Math.floor(m.homeAt / 60), m.homeAt % 60))}</span></li>
          )}
          {m.tz && <li>Часовой пояс: {m.tz}</li>}
        </ul>
      </div>
    </div>
  );
}

/* ————— мой профиль ————— */

function MyProfile({
  me,
  setMe,
  reset,
  setTab,
  markShared,
}: {
  me: Member;
  setMe: (p: Partial<Member>) => void;
  reset: () => void;
  setTab: (t: "today" | "schedule" | "share" | "profile") => void;
  markShared: () => void;
}) {
  const friendsCount = useApp((s) => s.friends.length);
  const [view, setView] = useState<"show" | "edit">("show");
  const [tile, setTile] = useState<EditorTile>(null);
  const [confirmMode, setConfirmMode] = useState<"leave" | "save" | "reset" | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [draft, setDraft] = useState<Member>(me);
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(me), [draft, me]);

  const patch = (p: Partial<Member>) => setDraft((d) => ({ ...d, ...p }));
  const resetDraft = () => {
    setDraft(me);
    setTile(null);
  };

  const startEdit = () => {
    setDraft(me);
    setView("edit");
    setTile(null);
  };

  const save = () => {
    setMe({
      name: draft.name,
      avatar: draft.avatar,
      photo: draft.photo,
      color: draft.color,
      banner: draft.banner,
      games: draft.games,
      tg: draft.tg,
      homeAt: draft.homeAt,
    });
    toast.success("Профиль сохранён!", { description: "Код ГД1 обновился — поделись заново" });
    setView("show");
    setTile(null);
  };

  const requestLeave = () => {
    if (dirty) setConfirmMode("leave");
    else {
      setView("show");
      setTile(null);
    }
  };

  const confirmLeave = () => {
    resetDraft();
    setView("show");
    setConfirmMode(null);
    if (pendingTab) {
      setTab(pendingTab);
      setPendingTab(null);
    }
  };

  const [pendingTab, setPendingTab] = useState<null | "schedule">(null);

  const goSchedule = () => {
    if (dirty) {
      setPendingTab("schedule");
      setConfirmMode("leave");
    } else {
      setTab("schedule");
    }
  };

  const shareCode = () => {
    void navigator.clipboard
      ?.writeText(encodeShareCode(me))
      .then(() => toast.success("Код скопирован!"))
      .catch(() => toast.error("Не вышло скопировать"));
    markShared();
  };

  const tiles: { id: Exclude<EditorTile, null>; title: string; sub: string; icon: React.ReactNode }[] = [
    { id: "data", title: "Данные", sub: "Имя, фото, Telegram", icon: <User className="size-5" /> },
    { id: "look", title: "Внешний вид", sub: "Баннер и маскот", icon: <Sparkles className="size-5" /> },
    { id: "graph", title: "График", sub: "Смены и время дома", icon: <Timer className="size-5" /> },
  ];

  return (
    <div className="mx-auto max-w-xl px-4 pb-6 pt-4">
      <AnimatePresence mode="wait" initial={false}>
        {view === "show" ? (
          <motion.div
            key="show"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="space-y-4"
          >
            <MemberCard
              m={me}
              actions={
                <>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    onClick={startEdit}
                    className="flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-extrabold text-primary-foreground shadow-[0_6px_18px_rgba(124,108,240,0.35)]"
                  >
                    <Pencil className="size-4" />
                    Редактировать
                  </motion.button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    onClick={shareCode}
                    className="flex h-11 items-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-extrabold"
                  >
                    <Share2 className="size-4" />
                    Код
                  </motion.button>
                  {me.tg && (
                    <motion.a
                      whileTap={{ scale: 0.94 }}
                      href={`https://t.me/${me.tg}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-11 items-center gap-2 rounded-full bg-teal px-6 text-sm font-extrabold text-white"
                    >
                      <Send className="size-4" />
                      Telegram
                    </motion.a>
                  )}
                </>
              }
            />

            <div className="glass-card rounded-[1.75rem] p-5">
              <p className="bang text-base">О коробке</p>
              <ul className="mt-2 space-y-1.5 text-sm font-semibold text-muted-foreground">
                <li>
                  График: <span className="bang text-foreground">{scheduleLabel(me.schedule)}</span>
                </li>
                {me.homeAt != null && (
                  <li>
                    Дома примерно с{" "}
                    <span className="bang text-foreground">
                      {String(Math.floor(me.homeAt / 60)).padStart(2, "0")}:{String(me.homeAt % 60).padStart(2, "0")}
                    </span>
                  </li>
                )}
                <li>Друзей в коробке: <span className="bang text-foreground">{friendsCount}</span></li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setConfirmMode("reset")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 py-3.5 text-sm font-extrabold text-destructive transition hover:bg-destructive/10 active:scale-[0.98]"
            >
              <LogOut className="size-4" />
              Сбросить коробку
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="space-y-3"
          >
            <button
              type="button"
              onClick={requestLeave}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold text-muted-foreground transition hover:bg-muted active:scale-95"
            >
              <ChevronLeft className="size-4" />
              {dirty ? "Есть изменения…" : "Профиль"}
            </button>

            {/* плитки-редактор */}
            <div className="space-y-2.5">
              {tiles.map((t) => {
                const open = tile === t.id;
                return (
                  <div key={t.id} className="glass-card overflow-hidden rounded-[1.5rem]">
                    <button
                      type="button"
                      onClick={() => setTile(open ? null : t.id)}
                      className="flex w-full items-center gap-3 p-4 text-left"
                    >
                      <span
                        className={cn(
                          "grid size-11 shrink-0 place-items-center rounded-2xl transition-colors",
                          open ? "bg-primary text-white" : "bg-muted text-foreground",
                        )}
                      >
                        {t.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="bang block text-base leading-tight">{t.title}</span>
                        <span className="block text-xs font-semibold text-muted-foreground">{t.sub}</span>
                      </span>
                      <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
                        <ChevronDown className="size-5 text-muted-foreground" />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 380, damping: 34 }}
                        >
                          <div className="border-t border-border/60 px-4 py-4">
                            {t.id === "data" && (
                              <TileData draft={draft} patch={patch} onPickPhoto={() => fileRef.current?.click()} />
                            )}
                            {t.id === "look" && <TileLook draft={draft} patch={patch} />}
                            {t.id === "graph" && (
                              <TileGraph draft={draft} patch={patch} goSchedule={goSchedule} />
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Discord-guard несохранённых изменений */}
      <AlertDialog open={confirmMode !== null} onOpenChange={(o) => !o && setConfirmMode(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmMode === "reset"
                ? "Сбросить коробку?"
                : confirmMode === "save"
                  ? "Сохранить изменения?"
                  : "Вы не сохранили изменения!"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmMode === "reset"
                ? "Весь профиль и друзья удалятся с этого устройства. Их можно будет вернуть, введя коды заново."
                : confirmMode === "save"
                  ? "Новый код ГД1 нужно будет отправить друзьям заново."
                  : "Изменения профиля пропадут, если уйти без сохранения."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {confirmMode === "reset" ? (
              <>
                <AlertDialogCancel>Остаться</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-white"
                  onClick={() => {
                    reset();
                    setConfirmMode(null);
                    toast("Коробка сброшена", { description: "Привет, новенький!" });
                  }}
                >
                  Сбросить
                </AlertDialogAction>
              </>
            ) : (
              <>
                <AlertDialogCancel>Остаться</AlertDialogCancel>
                {confirmMode === "save" ? (
                  <AlertDialogAction
                    onClick={() => {
                      setConfirmMode(null);
                      save();
                    }}
                  >
                    Сохранить
                  </AlertDialogAction>
                ) : (
                  <>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={confirmLeave}
                    >
                      Не сохранять
                    </AlertDialogAction>
                    <AlertDialogAction onClick={() => setConfirmMode(null)}>
                      Вернуться
                    </AlertDialogAction>
                  </>
                )}
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DirtyBar
        show={view === "edit" && dirty}
        onDiscard={resetDraft}
        onApply={() => setConfirmMode("save")}
        applyBlocked={false}
      />
    </div>
  );
}

/* ————— плитки редактора ————— */

function TileData({
  draft,
  patch,
  onPickPhoto,
}: {
  draft: Member;
  patch: (p: Partial<Member>) => void;
  onPickPhoto: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={onPickPhoto}
          className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-3xl border-2 border-border bg-muted"
          aria-label="Сменить фото"
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
        <div className="min-w-0 flex-1 space-y-2">
          <input
            value={draft.name}
            onChange={(e) => patch({ name: e.target.value.slice(0, 24) })}
            placeholder="Имя"
            className="h-12 w-full rounded-2xl border border-input bg-card px-4 text-base font-extrabold outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25"
          />
          <div className="flex items-center gap-1.5 rounded-2xl border border-input bg-card px-3">
            <span className="text-sm font-bold text-muted-foreground">t.me/</span>
            <input
              value={draft.tg ?? ""}
              onChange={(e) => patch({ tg: e.target.value.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 32) })}
              placeholder="nickname"
              className="h-12 w-full bg-transparent font-semibold outline-none placeholder:text-muted-foreground/50"
            />
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">Маскот (если без фото)</p>
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
        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">Цвет</p>
        <div className="flex flex-wrap gap-2.5">
          {Object.entries(COLORS).map(([id, c]) => (
            <motion.button
              key={id}
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={() => patch({ color: id })}
              aria-label={c.label}
              className={cn(
                "size-9 rounded-full transition",
                draft.color === id ? "ring-2 ring-foreground/50 ring-offset-2 ring-offset-background" : "",
              )}
              style={{ background: c.hex, boxShadow: `0 4px 12px ${c.soft}` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TileLook({
  draft,
  patch,
}: {
  draft: Member;
  patch: (p: Partial<Member>) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
        Баннер карточки
      </p>
      <div className="grid grid-cols-4 gap-2">
        {BANNER_IDS.map((id) => {
          const b = BANNERS[id];
          const on = (draft.banner ?? "lavender") === id;
          return (
            <motion.button
              key={id}
              type="button"
              whileTap={{ scale: 0.93 }}
              onClick={() => patch({ banner: id })}
              className={cn(
                "h-14 rounded-2xl border-2 transition",
                on ? "border-foreground/60" : "border-transparent",
              )}
              style={{ background: `linear-gradient(120deg, ${b[0]}, ${b[1]} 55%, ${b[2]})` }}
              aria-label={`Баннер ${id}`}
            />
          );
        })}
      </div>
    </div>
  );
}

function TileGraph({
  draft,
  patch,
  goSchedule,
}: {
  draft: Member;
  patch: (p: Partial<Member>) => void;
  goSchedule: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
          <Mail className="size-3.5" /> Во сколько ты уже дома?
        </p>
        <TimePickerWheel
          value={draft.homeAt ?? 18 * 60}
          onChange={(v) => patch({ homeAt: v })}
        />
      </div>
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={goSchedule}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-extrabold transition hover:bg-muted"
      >
        <Timer className="size-4 text-primary" />
        Изменить смены — на вкладке «График»
      </motion.button>
    </div>
  );
}
