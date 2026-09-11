/** График человека: циклический (5/2, 3/3, 2/2…), свой (набор дат) или «свободен всегда». */
export type ScheduleType = "cycle" | "custom" | "free";

export interface CycleConfig {
  /** сколько дней работаю */
  workDays: number;
  /** сколько дней отдыхаю */
  restDays: number;
  /** ISO-день (YYYY-MM-DD) начала цикла — «якорь», в этот день человек работает */
  anchor: string;
}

export interface Schedule {
  type: ScheduleType;
  cycle?: CycleConfig;
  /** ISO-дни (YYYY-MM-DD), в которые человек работает (для type="custom") */
  custom?: string[];
  note?: string;
}

/** Участник коробки — «я» или импортированный друг. Все новые поля optional для обратной совместимости. */
export interface Member {
  id: string;
  name: string;
  /** id эмодзи-аватара из набора (устаревший вариант), если нет фото */
  avatar: string;
  /** id цвета из палитры colorOf() */
  color: string;
  /** список id игр из games.ts */
  games: string[];
  schedule: Schedule;
  /** «Во сколько ты уже дома?» — минуты от полуночи */
  homeAt?: number;
  tz?: string;
  /** ник в Telegram без @ */
  tg?: string;
  /** баннер карточки профиля (id градиента) */
  banner?: string;
  /** фото-аватар (data:image) */
  photo?: string;
  updatedAt: number;
}

export const AVATAR_EMOJIS = [
  "🦊", "🐺", "🐱", "🐼", "🦁", "🐯", "🐨", "🐵",
  "🐸", "🐙", "🦄", "🐲", "🦖", "🦉", "🐧", "🐝",
] as const;

export const BANNERS: Record<string, [string, string, string]> = {
  lavender: ["#7c6cf0", "#b39df3", "#e2d9fb"],
  teal: ["#0f766e", "#14b8a6", "#99f6e4"],
  night: ["#2b2d31", "#4a4d57", "#8b8fa3"],
  sunset: ["#f97316", "#fb923c", "#fed7aa"],
  candy: ["#ec4899", "#f9a8d4", "#fce7f3"],
  forest: ["#166534", "#22c55e", "#bbf7d0"],
  ocean: ["#0e7490", "#06b6d4", "#a5f3fc"],
  grape: ["#581c87", "#9333ea", "#e9d5ff"],
};

export const BANNER_IDS = Object.keys(BANNERS);

/** Палитра контуров/акцентов участников. */
export const COLORS: Record<string, { label: string; hex: string; border: string; soft: string }> = {
  lavender: { label: "Лаванда", hex: "#7c6cf0", border: "border-[#7c6cf0]", soft: "#7c6cf033" },
  teal:     { label: "Бирюза",   hex: "#14b8a6", border: "border-[#14b8a6]", soft: "#14b8a633" },
  orange:   { label: "Закат",    hex: "#f97316", border: "border-[#f97316]", soft: "#f9731633" },
  pink:     { label: "Розовый",  hex: "#ec4899", border: "border-[#ec4899]", soft: "#ec489933" },
  green:    { label: "Лайм",     hex: "#22c55e", border: "border-[#22c55e]", soft: "#22c55e33" },
  cyan:     { label: "Океан",    hex: "#06b6d4", border: "border-[#06b6d4]", soft: "#06b6d433" },
  red:      { label: "Вишня",    hex: "#ef4444", border: "border-[#ef4444]", soft: "#ef444433" },
  yellow:   { label: "Солнце",   hex: "#eab308", border: "border-[#eab308]", soft: "#eab30833" },
};

export const COLOR_IDS = Object.keys(COLORS);

export function colorOf(id: string | undefined) {
  return COLORS[id ?? "lavender"] ?? COLORS.lavender;
}
