"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useSyncExternalStore } from "react";
import { Undo2 } from "lucide-react";
import { ShakeButton } from "./shake-button";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

/**
 * Плавающий футер «Вы не сохранили изменения!».
 * ВАЖНО: рендерится через portal в document.body — иначе position:fixed
 * внутри framer-motion контейнеров цепляется к transform-контейнеру.
 */
export function DirtyBar({
  show,
  onDiscard,
  onApply,
  applyBlocked,
  blockedTitle,
  blockedDescription,
}: {
  show: boolean;
  onDiscard: () => void;
  onApply: () => void;
  applyBlocked?: boolean;
  blockedTitle?: string;
  blockedDescription?: string;
}) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 90, opacity: 0, scale: 0.92 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 90, opacity: 0, scale: 0.92 }}
          transition={{ type: "spring", stiffness: 460, damping: 30 }}
          className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.55rem)] z-50 flex justify-center px-4 md:bottom-6"
        >
          <div className="glass-pill flex items-center gap-1.5 rounded-full py-2 pl-3.5 pr-2">
            <span className="whitespace-nowrap text-[13px] font-bold italic text-foreground/90">
              Вы не сохранили изменения!
            </span>
            <button
              type="button"
              onClick={onDiscard}
              className="flex items-center gap-1 rounded-full px-2.5 py-2 text-[13px] font-bold text-foreground/70 transition hover:bg-black/5 active:scale-95 dark:hover:bg-white/10"
            >
              <Undo2 className="size-3.5" />
              Отмена
            </button>
            <ShakeButton
              size="sm"
              className={cn("rounded-full px-5", "bg-primary text-primary-foreground")}
              blocked={applyBlocked}
              blockedTitle={blockedTitle}
              blockedDescription={blockedDescription}
              onClick={onApply}
            >
              Применить
            </ShakeButton>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
