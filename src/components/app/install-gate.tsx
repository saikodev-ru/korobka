"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Box, Frown, Share2, SquarePlus } from "lucide-react";
import { useInstallPrompt, usePwaEnv } from "@/hooks/use-pwa";
import { Logo } from "./logo";

/**
 * Стартовый PWA-гейт:
 * - standalone → null (уже установлена)
 * - desktop → null (десктопный браузер ок)
 * - mobile + canPrompt → «Скачать коробку»
 * - mobile + iOS → инструкция «На экран Домой»
 * - mobile + прочее → экран «Блин…» (установка недоступна)
 */
export function InstallGate({ children }: { children: React.ReactNode }) {
  const env = usePwaEnv();
  const { canPrompt, promptInstall } = useInstallPrompt();
  const [later, setLater] = useState(false);

  if (env.standalone || !env.isMobile || later) return <>{children}</>;

  const finish = () => setLater(true);

  if (env.isIos) {
    return (
      <GateShell>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card w-full max-w-sm rounded-[1.75rem] p-6 text-center"
        >
          <Logo size={84} />
          <p className="bang mt-5 text-2xl">Поставь коробку на iPhone</p>
          <ol className="mt-5 space-y-3 text-left text-sm font-semibold text-muted-foreground">
            <li className="flex items-center gap-3 rounded-2xl bg-muted/70 p-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-black text-white">1</span>
              <span className="flex items-center gap-1.5">
                Жми <Share2 className="size-4 text-foreground" /> «Поделиться» внизу Safari
              </span>
            </li>
            <li className="flex items-center gap-3 rounded-2xl bg-muted/70 p-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-black text-white">2</span>
              <span className="flex items-center gap-1.5">
                Выбери <SquarePlus className="size-4 text-foreground" /> «На экран „Домой“»
              </span>
            </li>
            <li className="flex items-center gap-3 rounded-2xl bg-muted/70 p-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-black text-white">3</span>
              <span>Открой коробку с иконки — как приложение</span>
            </li>
          </ol>
          <button
            type="button"
            onClick={finish}
            className="mt-5 text-xs font-bold text-muted-underline text-muted-foreground underline-offset-4 transition hover:text-foreground"
          >
            Пока открыть в браузере
          </button>
        </motion.div>
      </GateShell>
    );
  }

  if (canPrompt) {
    return (
      <GateShell>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card w-full max-w-sm rounded-[1.75rem] p-7 text-center"
        >
          <Logo size={96} />
          <p className="bang mt-5 text-3xl">Скачать коробку</p>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            Установи приложение — и график всегда будет под рукой, даже без интернета
          </p>
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => void promptInstall()}
            className="bang mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-lg text-primary-foreground shadow-[0_10px_30px_rgba(124,108,240,0.45)]"
          >
            <Box className="size-5" />
            Установить
          </motion.button>
          <button
            type="button"
            onClick={finish}
            className="mt-3.5 text-xs font-bold text-muted-foreground underline-offset-4 transition hover:text-foreground"
          >
            Пока открыть в браузере
          </button>
        </motion.div>
      </GateShell>
    );
  }

  // «Блин…» — установка недоступна
  return (
    <GateShell>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-sm rounded-[1.75rem] p-7 text-center"
      >
        <motion.div
          animate={{ rotate: [0, -8, 8, -6, 6, 0] }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mx-auto grid size-20 place-items-center rounded-3xl bg-muted"
        >
          <Frown className="size-10 text-muted-foreground" />
        </motion.div>
        <p className="bang mt-5 text-3xl">Блин…</p>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          Похоже, этот браузер не умеет устанавливать коробку. Открой сайт в Chrome
          на Android или в Safari на iPhone — и коробка поставится как приложение.
        </p>
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={finish}
          className="bang mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-base text-primary-foreground shadow-[0_10px_30px_rgba(124,108,240,0.45)]"
        >
          Всё равно открыть <ArrowRight className="size-5" />
        </motion.button>
      </motion.div>
    </GateShell>
  );
}

function GateShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-5 py-10">
      <div className="floaty pointer-events-none absolute left-[10%] top-[12%] size-16 rounded-2xl bg-gradient-to-br from-primary/25 to-teal/25 blur-[2px]" />
      <div className="floaty pointer-events-none absolute bottom-[14%] right-[12%] size-10 rotate-12 rounded-xl bg-gradient-to-br from-teal/25 to-primary/25" style={{ animationDelay: "-2.5s" }} />
      {children}
    </div>
  );
}
