import type { SVGProps } from "react";

export interface Game {
  id: string;
  label: string;
  hint: string;
}

export const GAMES: Game[] = [
  { id: "board", label: "Настолки", hint: "Манчкин, Монополия, Колонизаторы" },
  { id: "dnd", label: "D&D", hint: "Забеги и двадцатигранники" },
  { id: "video", label: "Видеоигры", hint: "Консоли, ПК, диван, чипсы" },
  { id: "shooter", label: "Шутеры", hint: "CS2, Valorant, Apex" },
  { id: "minecraft", label: "Minecraft", hint: "Копаем, строим, выживаем" },
  { id: "cards", label: "Карты", hint: "Дурак, UNO, Покер" },
  { id: "chess", label: "Шахматы", hint: "Классика на двоих" },
  { id: "billiards", label: "Бильярд", hint: "Пул, пирамида, кий" },
  { id: "karaoke", label: "Караоке", hint: "Петь до утра" },
  { id: "movie", label: "Киновечер", hint: "Фильмы, сериалы, попкорн" },
  { id: "walk", label: "Погулять", hint: "Просто выйти из дома" },
  { id: "bike", label: "Велосипеды", hint: "Покататься по городу" },
];

export function gameById(id: string): Game | undefined {
  return GAMES.find((g) => g.id === id);
}

export function gameLabel(id: string): string {
  return gameById(id)?.label ?? id;
}

type P = SVGProps<SVGSVGElement>;

/** Фирменные SVG-иконки игр: 2-слойные, аккуратные, с цветными акцентами. */
export function GameIcon({ id, ...props }: P & { id: string }) {
  switch (id) {
    case "board":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="8.6" cy="8.6" r="1.6" fill="#7c6cf0" />
          <circle cx="15.4" cy="8.6" r="1.6" fill="currentColor" />
          <circle cx="8.6" cy="15.4" r="1.6" fill="currentColor" />
          <circle cx="15.4" cy="15.4" r="1.6" fill="#14b8a6" />
        </svg>
      );
    case "dnd":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <path d="M12 2.2 21 8.4l-3.4 11H6.4L3 8.4 12 2.2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M12 2.2 12 12.5M12 12.5 3 8.4M12 12.5 21 8.4M12 12.5 6.4 19.4M12 12.5 17.6 19.4" stroke="currentColor" strokeWidth="1.2" opacity=".55" />
          <circle cx="12" cy="12.5" r="1.5" fill="#14b8a6" />
        </svg>
      );
    case "video":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <path d="M7.2 6.5h9.6c2.9 0 5 2.3 5.2 5.2l.2 3.4a3 3 0 0 1-5.2 2.3l-1.7-1.9H8.7L7 17.4a3 3 0 0 1-5.2-2.3l.2-3.4c.2-2.9 2.3-5.2 5.2-5.2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M8.4 9.6v3.4M6.7 11.3h3.4" stroke="#7c6cf0" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="16.4" cy="10.4" r="1.1" fill="#14b8a6" />
          <circle cx="18.2" cy="12.6" r="1.1" fill="currentColor" opacity=".7" />
        </svg>
      );
    case "shooter":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 1.8v4M12 18.2v4M1.8 12h4M18.2 12h4" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "minecraft":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <path d="M12 2.6 21 7v10l-9 4.4L3 17V7l9-4.4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M3 7l9 4.4L21 7M12 11.4v10" stroke="currentColor" strokeWidth="1.4" opacity=".6" />
          <path d="M7.5 4.9l9 4.4" stroke="#14b8a6" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "cards":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <rect x="3" y="5.4" width="11" height="15" rx="2.4" stroke="currentColor" strokeWidth="1.8" transform="rotate(-8 8.5 13)" />
          <rect x="10.5" y="4" width="11" height="15" rx="2.4" fill="var(--card)" stroke="currentColor" strokeWidth="1.8" transform="rotate(7 16 11.5)" />
          <path d="M16.2 8.6c1.5 1.6 2.6 2.6 2.6 3.8a1.9 1.9 0 0 1-3.4 1.1" stroke="#14b8a6" strokeWidth="1.7" strokeLinecap="round" transform="rotate(7 16 11.5)" />
        </svg>
      );
    case "chess":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <path d="M8 20.5h8M9 20.5c0-2.6-.6-3.6-1.7-4.9C6 14 5.4 12.7 5.4 10.9c0-2 1-3.3 2.4-3.9M16 20.5c0-2.6.6-3.6 1.7-4.9 1.3-1.6 1.9-2.9 1.9-4.7 0-2-1-3.3-2.4-3.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="5.2" r="2.6" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 7.8v4" stroke="#7c6cf0" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "billiards":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="3.4" fill="#ef444433" stroke="currentColor" strokeWidth="1.4" />
          <text x="12" y="14.2" textAnchor="middle" fontSize="4.6" fontWeight="800" fill="currentColor" fontFamily="inherit">8</text>
        </svg>
      );
    case "karaoke":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <rect x="9" y="2.8" width="6" height="11.4" rx="3" stroke="currentColor" strokeWidth="1.8" />
          <path d="M5.4 11.4a6.6 6.6 0 0 0 13.2 0M12 18v3.2M8.8 21.2h6.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M12 6.2v1.6" stroke="#14b8a6" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "movie":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <rect x="2.8" y="5" width="18.4" height="14" rx="3.4" stroke="currentColor" strokeWidth="1.8" />
          <path d="M10 9.6l5 2.4-5 2.4V9.6Z" fill="#7c6cf0" />
          <path d="M6.4 5v14M17.6 5v14" stroke="currentColor" strokeWidth="1.2" opacity=".5" />
        </svg>
      );
    case "walk":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <circle cx="13.2" cy="4.4" r="2" stroke="currentColor" strokeWidth="1.7" />
          <path d="M13 8.2l-3.4 1.6-1.8 3.4M13 8.2l2 3 .4 3.4 2 4M13 8.2l1.2 5.2-3 3.4-1.6 4.4M8 13.2l-2.4.8M11 21l1.2-3.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3.4 6.8c1.2-1.6 2.8-2.4 4.8-2.2" stroke="#14b8a6" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "bike":
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <circle cx="5.5" cy="16.5" r="3.7" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="18.5" cy="16.5" r="3.7" stroke="currentColor" strokeWidth="1.8" />
          <path d="M5.5 16.5 9 9.8h5.4M9 9.8l4 6.7h5.5M14.4 9.8l2-3h2.4M12.6 7h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="9.8" r="1.3" fill="#7c6cf0" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 8v.2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M12 11.4c0 2.4 2 2.2 2 4a2 2 0 1 1-4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
  }
}
