"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Member } from "./types";
import { uid, tzName } from "./utils";

export type Tab = "today" | "schedule" | "share" | "profile";

interface AppState {
  /** прошёл ли welcome-flow */
  onboarded: boolean;
  /** это я */
  me: Member;
  /** друзья, импортированные по кодам ГД1 */
  friends: Member[];
  /** данные изменились с момента последнего «поделиться» */
  shareStale: boolean;
  /** активная вкладка */
  tab: Tab;

  setTab: (t: Tab) => void;
  setMe: (m: Partial<Member>) => void;
  finishOnboarding: () => void;
  addOrUpdateFriend: (m: Member) => "added" | "updated";
  removeFriend: (id: string) => void;
  markShared: () => void;
  reset: () => void;
}

export const emptyMember = (): Member => ({
  id: uid(),
  name: "",
  avatar: "🦊",
  color: "lavender",
  games: [],
  schedule: { type: "cycle", cycle: { workDays: 5, restDays: 2, anchor: "" } },
  tz: tzName(),
  updatedAt: Date.now(),
});

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      onboarded: false,
      me: emptyMember(),
      friends: [],
      shareStale: false,
      tab: "today",

      setTab: (t) => set({ tab: t }),

      setMe: (patch) =>
        set((s) => ({
          me: { ...s.me, ...patch, updatedAt: Date.now() },
          shareStale: true,
        })),

      finishOnboarding: () => set({ onboarded: true, shareStale: true }),

      addOrUpdateFriend: (m) => {
        const exists = get().friends.some((f) => f.id === m.id);
        set((s) => ({
          friends: exists
            ? s.friends.map((f) => (f.id === m.id ? m : f))
            : [...s.friends, m],
        }));
        return exists ? "updated" : "added";
      },

      removeFriend: (id) =>
        set((s) => ({ friends: s.friends.filter((f) => f.id !== id) })),

      markShared: () => set({ shareStale: false }),

      reset: () =>
        set({
          onboarded: false,
          me: emptyMember(),
          friends: [],
          shareStale: false,
          tab: "today",
        }),
    }),
    {
      name: "graphik-druzey-v1",
      version: 4,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        onboarded: s.onboarded,
        me: s.me,
        friends: s.friends,
        shareStale: s.shareStale,
        tab: s.tab,
      }),
    },
  ),
);
