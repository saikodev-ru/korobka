"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface PwaEnv {
  standalone: boolean;
  isIos: boolean;
  isMobile: boolean;
}

export function detectStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    window.matchMedia?.("(display-mode: fullscreen)").matches === true ||
    nav.standalone === true
  );
}

export function detectIos(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && "ontouchend" in document);
}

export function detectMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(max-width: 767px)").matches === true || detectIos();
}

interface PwaEnvResult extends PwaEnv {
  installed: boolean;
}

let cachedResult: PwaEnvResult | null = null;
function computeEnv(): PwaEnvResult {
  if (typeof window === "undefined") return { standalone: false, isIos: false, isMobile: false, installed: false };
  if (!cachedResult) {
    cachedResult = {
      standalone: detectStandalone(),
      isIos: detectIos(),
      isMobile: detectMobile(),
      installed: detectStandalone(),
    };
  }
  return cachedResult;
}
const envSubscribe = () => () => {};
const serverEnv = (): PwaEnvResult => ({ standalone: false, isIos: false, isMobile: false, installed: false });

/** Окружение PWA без гидратационных мисматчей. */
export function usePwaEnv(): PwaEnvResult {
  return useSyncExternalStore(envSubscribe, computeEnv, serverEnv);
}

export type InstallOutcome = "accepted" | "dismissed" | "unavailable";

/** Хук установки: ловит beforeinstallprompt и даёт promptInstall(). */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferred(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<InstallOutcome> => {
    if (!deferred) return "unavailable";
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    return choice.outcome;
  }, [deferred]);

  return { canPrompt: !!deferred, promptInstall };
}
