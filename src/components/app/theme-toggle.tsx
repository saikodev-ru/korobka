"use client";

import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** Стеклянный переключатель темы с плавной анимацией. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  // против гидратационного рассинхрона
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const isDark = mounted ? resolvedTheme === "dark" : false;

  return (
    <motion.button
      type="button"
      aria-label="Переключить тему"
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92, rotate: -8 }}
      transition={{ type: "spring", stiffness: 520, damping: 20 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`glass-pill grid size-11 place-items-center rounded-full text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/60 ${className ?? ""}`}
    >
      <motion.span
        key={isDark ? "moon" : "sun"}
        initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 22 }}
        className="grid place-items-center"
      >
        {isDark ? <Moon className="size-5" /> : <Sun className="size-5" />}
      </motion.span>
    </motion.button>
  );
}
