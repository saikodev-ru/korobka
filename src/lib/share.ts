import type { Member } from "./types";
import { uid } from "./utils";

const PREFIX = "ГД1.";

function b64urlEncode(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export interface SharePayload {
  v: 1;
  id: string;
  name: string;
  avatar?: string;
  color: string;
  games: string[];
  schedule: Member["schedule"];
  homeAt?: number;
  tz?: string;
  tg?: string;
  banner?: string;
  photo?: string;
  ts: number;
}

/** Сжать участника до payload для кода. */
export function toPayload(m: Member): SharePayload {
  return {
    v: 1,
    id: m.id,
    name: m.name,
    avatar: m.avatar,
    color: m.color,
    games: m.games,
    schedule: m.schedule,
    homeAt: m.homeAt,
    tz: m.tz,
    tg: m.tg,
    banner: m.banner,
    photo: m.photo,
    ts: Date.now(),
  };
}

/** Код формата ГД1.<base64url(json)> */
export function encodeShareCode(m: Member): string {
  return PREFIX + b64urlEncode(JSON.stringify(toPayload(m)));
}

export function looksLikeShareCode(s: string): boolean {
  return s.trim().startsWith(PREFIX);
}

/** Разобрать код. Бросает Error с человеческим текстом. */
export function decodeShareCode(raw: string): Member {
  const code = raw.trim().replace(/\s+/g, "");
  if (!code.startsWith(PREFIX)) {
    throw new Error("Это не код ГД1 — скопируй код целиком, вместе с «ГД1.»");
  }
  const body = code.slice(PREFIX.length);
  let data: SharePayload;
  try {
    data = JSON.parse(b64urlDecode(body)) as SharePayload;
  } catch {
    throw new Error("Код повреждён — проверь, что скопирован полностью");
  }
  if (!data || data.v !== 1 || !data.id || !data.name) {
    throw new Error("В коде не хватает данных — попроси друга прислать заново");
  }
  return {
    id: data.id,
    name: data.name,
    avatar: data.avatar ?? "🦊",
    color: data.color ?? "lavender",
    games: Array.isArray(data.games) ? data.games : [],
    schedule: data.schedule ?? { type: "free" },
    homeAt: data.homeAt,
    tz: data.tz,
    tg: data.tg,
    banner: data.banner,
    photo: data.photo,
    updatedAt: data.ts ?? Date.now(),
  };
}

/** Ссылка «Написать» в Telegram. */
export function tgLink(tg: string | undefined): string | null {
  const t = (tg ?? "").replace(/^@/, "").trim();
  return t ? `https://t.me/${t}` : null;
}

/** Текст для системного «Поделиться». */
export function shareText(code: string): string {
  return `Вот моя коробка! Добавь меня по коду:\n${code}`;
}

export { uid };
