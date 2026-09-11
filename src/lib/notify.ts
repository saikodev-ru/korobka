"use client";

/** Локальные уведомления через Service Worker (без серверов). */

export async function ensureNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const res = await Notification.requestPermission();
  return res === "granted";
}

export async function pushNotification(title: string, body: string, tag?: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.showNotification(title, {
        body,
        tag,
        icon: "/icons/icon-192.png",
        badge: "/icons/badge-72.png",
      });
      return;
    }
  } catch {
    /* fallback ниже */
  }
  try {
    new Notification(title, { body, tag, icon: "/icons/icon-192.png" });
  } catch {
    /* тихо игнорируем */
  }
}
