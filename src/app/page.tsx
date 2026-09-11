"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarRange,
  Home,
  Moon,
  Share2,
  UserRound,
  UserRoundPlus,
} from "lucide-react";
import { toast } from "sonner";
import { useApp, type Tab } from "@/lib/store";
import { isWorkingOn } from "@/lib/schedule";
import { colorOf, type Member } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useNow } from "@/hooks/use-now";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Logo } from "@/components/app/logo";
import { InstallGate } from "@/components/app/install-gate";
import { SwRegister } from "@/components/app/sw-register";
import { WelcomeScreen } from "@/components/screens/welcome-screen";
import { TodayScreen, checkFreedNotifications } from "@/components/screens/today-screen";
import { ScheduleScreen } from "@/components/screens/schedule-screen";
import { ShareScreen } from "@/components/screens/share-screen";
import { ProfileScreen } from "@/components/screens/profile-screen";
import { MemberAvatar } from "@/components/app/member-card";

const emptySubscribe = () => () => {};

export default function Page() {
  // защита от гидратационного мисматча: рендерим приложение только на клиенте
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  if (!mounted) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background">
        <Logo size={64} />
      </div>
    );
  }

  return (
    <InstallGate>
      <AppShell />
      <SwRegister />
    </InstallGate>
  );
}

function AppShell() {
  const onboarded = useApp((s) => s.onboarded);
  const tab = useApp((s) => s.tab);
  const setTab = useApp((s) => s.setTab);
  const me = useApp((s) => s.me);
  const friends = useApp((s) => s.friends);
  const shareStale = useApp((s) => s.shareStale);
  const finishOnboarding = useApp((s) => s.finishOnboarding);
  const setMe = useApp((s) => s.setMe);

  // просмотр чужого профиля
  const [viewFriendId, setViewFriendId] = useState<string | null>(null);
  const viewFriend = friends.find((f) => f.id === viewFriendId) ?? null;

  // live-счётчик «могут играть»
  const now = useNow(30_000);
  useEffect(() => {
    if (!now) return;
    checkFreedNotifications(now);
  }, [now]);

  const playable = useMemo(() => {
    if (!now || !onboarded) return [];
    const list: Member[] = [];
    if (!isWorkingOn(me.schedule, now)) list.push(me);
    for (const f of friends) if (!isWorkingOn(f.schedule, now)) list.push(f);
    return list;
  }, [now, onboarded, me, friends]);

  // подсказка «поделись кодом» — раз в сессию
  const shareTipShown = useRef(false);
  useEffect(() => {
    if (onboarded && shareStale && !shareTipShown.current) {
      shareTipShown.current = true;
      const t = setTimeout(() => {
        toast("Обнови коробку у друзей", {
          description: "Твои данные менялись — отправь им новый код ГД1",
          action: { label: "Поделиться", onClick: () => setTab("share") },
        });
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [onboarded, shareStale, setTab]);

  const goTab = (t: Tab) => {
    setViewFriendId(null);
    setTab(t);
  };

  if (!onboarded) {
    return (
      <WelcomeScreen
        onDone={(d) => {
          setMe({
            name: d.name,
            avatar: d.avatar,
            photo: d.photo,
            color: d.color,
            banner: d.banner,
            games: d.games,
            schedule: d.schedule,
            homeAt: d.homeAt,
          });
          finishOnboarding();
        }}
      />
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      {/* мобильный хедер */}
      <MobileHeader
        playable={playable}
        shareStale={shareStale}
        onPlayableTap={() => goTab("today")}
        onShareTap={() => goTab("share")}
        onTitleLongPress={() => goTab("profile")}
      />

      <div className="flex flex-1">
        {/* десктопный сайдбар в духе Discord */}
        <DesktopSidebar tab={tab} onTab={goTab} />

        {/* контент */}
        <main className="min-w-0 flex-1 pb-28 md:pb-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={viewFriend ? `friend-${viewFriend.id}` : tab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            >
              {viewFriend ? (
                <ProfileScreen viewMember={viewFriend} />
              ) : (
                <>
                  {tab === "today" && (
                    <TodayScreen onSelectFriend={(id) => setViewFriendId(id)} />
                  )}
                  {tab === "schedule" && <ScheduleScreen />}
                  {tab === "share" && <ShareScreen />}
                  {tab === "profile" && <ProfileScreen viewMember={null} />}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* мобильный навбар */}
      <MobileNavbar tab={tab} onTab={goTab} shareStale={shareStale} />
    </div>
  );
}

/* ————— мобильный хедер: три стеклянные пилюли ————— */

function MobileHeader({
  playable,
  shareStale,
  onPlayableTap,
  onShareTap,
  onTitleLongPress,
}: {
  playable: Member[];
  shareStale: boolean;
  onPlayableTap: () => void;
  onShareTap: () => void;
  onTitleLongPress: () => void;
}) {
  const pressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longFired = useRef(false);

  const startPress = () => {
    longFired.current = false;
    pressRef.current = setTimeout(() => {
      longFired.current = true;
      try {
        navigator.vibrate?.(12);
      } catch {
        /* no-op */
      }
      onTitleLongPress();
    }, 430);
  };
  const cancelPress = () => {
    if (pressRef.current) clearTimeout(pressRef.current);
    pressRef.current = null;
  };

  return (
    <header className="sticky top-0 z-30 md:hidden">
      <div className="flex items-center gap-2 px-3 pb-2 pt-[max(env(safe-area-inset-top),0.6rem)]">
        {/* пилюля «могут играть» */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.93 }}
          transition={{ type: "spring", stiffness: 520, damping: 20 }}
          onClick={onPlayableTap}
          aria-label={`Свободны сегодня: ${playable.length}`}
          className="glass-pill flex h-11 items-center gap-2 rounded-full py-1 pl-2 pr-3.5"
        >
          <span className="flex items-center">
            {playable.length === 0 ? (
              <span className="grid size-7 place-items-center rounded-full border-2 border-border bg-muted text-muted-foreground">
                <Moon className="size-3.5" />
              </span>
            ) : (
              playable.slice(0, 3).map((m, i) => (
                <span
                  key={m.id}
                  className={cn(
                    "relative grid size-7 place-items-center overflow-hidden rounded-full border-2 bg-muted",
                    colorOf(m.color).border,
                    i > 0 && "-ml-2",
                  )}
                >
                  {m.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photo} alt="" className="h-full w-full object-cover pixelated" />
                  ) : (
                    <span className="text-[11px]">{m.avatar}</span>
                  )}
                </span>
              ))
            )}
            {playable.length > 3 && (
              <span className="-ml-2 grid h-7 place-items-center rounded-full border-2 border-border bg-muted px-1.5 text-[10px] font-black text-muted-foreground">
                +{playable.length - 3}
              </span>
            )}
          </span>
          <span className="bang text-sm leading-none">{playable.length}</span>
        </motion.button>

        {/* пилюля «поделиться» */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.93 }}
          transition={{ type: "spring", stiffness: 520, damping: 20 }}
          onClick={onShareTap}
          aria-label="Поделиться кодом"
          className="glass-pill relative grid size-11 place-items-center rounded-full"
        >
          <UserRoundPlus className="size-5" />
          {shareStale && (
            <span className="red-dot absolute right-1.5 top-1.5 size-2.5 rounded-full bg-destructive" />
          )}
        </motion.button>

        {/* пилюля «тайтл + лого» — long-press открывает профиль */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 520, damping: 20 }}
          onClick={() => {
            if (!longFired.current) onTitleLongPress();
          }}
          onPointerDown={startPress}
          onPointerUp={cancelPress}
          onPointerLeave={cancelPress}
          onPointerCancel={cancelPress}
          onContextMenu={(e) => e.preventDefault()}
          aria-label="Коробка — зажми, чтобы открыть профиль"
          className="glass-pill press-none ml-auto flex h-11 select-none items-center gap-2 rounded-full px-4 [-webkit-touch-callout:none]"
        >
          <span className="bang text-sm tracking-wide">КОРОБКА</span>
          <Logo size={22} spin={false} />
        </motion.button>

        <ThemeToggle />
      </div>
    </header>
  );
}

/* ————— десктопный сайдбар ————— */

function DesktopSidebar({
  tab,
  onTab,
}: {
  tab: Tab;
  onTab: (t: Tab) => void;
}) {
  const me = useApp((s) => s.me);
  const shareStale = useApp((s) => s.shareStale);

  const items: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: "today", icon: <Home className="size-6" />, label: "Сегодня" },
    { id: "schedule", icon: <CalendarRange className="size-6" />, label: "График" },
    {
      id: "share",
      icon: (
        <span className="relative">
          <Share2 className="size-6" />
          {shareStale && (
            <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-destructive" />
          )}
        </span>
      ),
      label: "Поделиться",
    },
    { id: "profile", icon: <UserRound className="size-6" />, label: "Профиль" },
  ];

  return (
    <aside className="sticky top-0 hidden h-dvh w-[84px] shrink-0 flex-col items-center gap-2 border-r border-border/60 bg-card/40 py-4 backdrop-blur md:flex">
      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => onTab("today")}
        aria-label="Коробка"
        className="mb-2"
      >
        <Logo size={44} />
      </motion.button>

      <nav className="flex flex-1 flex-col gap-1.5" aria-label="Разделы">
        {items.map((it) => {
          const on = tab === it.id;
          return (
            <motion.button
              key={it.id}
              type="button"
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 520, damping: 20 }}
              onClick={() => onTab(it.id)}
              aria-label={it.label}
              aria-current={on ? "page" : undefined}
              className={cn(
                "relative grid size-13 place-items-center rounded-2xl transition-colors",
                on ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {it.icon}
              {on && (
                <motion.span
                  layoutId="sb-active"
                  className="absolute -left-2.5 h-6 w-1.5 rounded-full bg-primary"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      <ThemeToggle />
      <motion.button
        type="button"
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => onTab("profile")}
        aria-label="Мой профиль"
        className="mt-1"
      >
        <MemberAvatar m={me} size={40} />
      </motion.button>
    </aside>
  );
}

/* ————— мобильный навбар (iOS-26 стекло) ————— */

function MobileNavbar({
  tab,
  onTab,
  shareStale,
}: {
  tab: Tab;
  onTab: (t: Tab) => void;
  shareStale: boolean;
}) {
  const items: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: "today", icon: <Home className="size-[22px]" />, label: "Сегодня" },
    { id: "schedule", icon: <CalendarRange className="size-[22px]" />, label: "График" },
    {
      id: "share",
      icon: <Share2 className="size-[22px]" />,
      label: "Поделиться",
    },
    { id: "profile", icon: <UserRound className="size-[22px]" />, label: "Профиль" },
  ];

  return (
    <motion.nav
      initial={{ y: 90 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="fixed inset-x-0 bottom-0 z-40 md:hidden"
      aria-label="Навигация"
    >
      <div className="px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-1">
        <div className="glass-pill mx-auto flex max-w-md items-stretch justify-between rounded-[1.7rem] p-1.5">
          {items.map((it) => {
            const on = tab === it.id;
            return (
              <motion.button
                key={it.id}
                type="button"
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 520, damping: 20 }}
                onClick={() => onTab(it.id)}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "relative flex min-w-16 flex-1 flex-col items-center gap-0.5 rounded-[1.3rem] px-1 py-2 outline-none",
                  on ? "text-primary" : "text-muted-foreground",
                )}
              >
                {on && (
                  <motion.span
                    layoutId="nb-active"
                    className="absolute inset-0 rounded-[1.3rem] bg-primary/12"
                    transition={{ type: "spring", stiffness: 480, damping: 34 }}
                  />
                )}
                <span className="relative">
                  {it.icon}
                  {it.id === "share" && shareStale && (
                    <span className="absolute -right-1.5 -top-1 size-2.5 rounded-full border-2 border-white bg-destructive dark:border-[#2b2d31]" />
                  )}
                </span>
                <span className="relative text-[10px] font-extrabold leading-none">{it.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
