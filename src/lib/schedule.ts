import type { Schedule } from "./types";
import { addDays, isoDay } from "./utils";

/** Человек работает в конкретный день? */
export function isWorkingOn(schedule: Schedule | undefined, date: Date): boolean {
  if (!schedule) return false;
  if (schedule.type === "free") return false; // свободен всегда
  if (schedule.type === "custom") {
    return (schedule.custom ?? []).includes(isoDay(date));
  }
  if (schedule.type === "cycle" && schedule.cycle) {
    const { workDays, restDays, anchor } = schedule.cycle;
    const len = workDays + restDays;
    if (len <= 0) return false;
    // якорь — локальная полночь дня начала цикла
    const [y, m, d] = anchor.split("-").map(Number);
    const anchorDate = new Date(y, (m ?? 1) - 1, d ?? 1);
    const dayDiff = Math.floor(
      (new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() -
        anchorDate.getTime()) /
        86400000,
    );
    const pos = ((dayDiff % len) + len) % len;
    return pos < workDays;
  }
  return false;
}

/** Освободился ли человек сегодня к указанному времени (минуты от полуночи)? */
export function freesTodayAt(schedule: Schedule | undefined, date: Date): number | null {
  if (!isWorkingOn(schedule, date)) return null;
  return null; // точное время смены неизвестно — используется homeAt друга
}

/** Метка-подпись графика для карточек. */
export function scheduleLabel(s: Schedule | undefined): string {
  if (!s) return "не задан";
  if (s.type === "free") return "свободен всегда";
  if (s.type === "custom") return "свой график";
  if (s.type === "cycle" && s.cycle) {
    return `${s.cycle.workDays}/${s.cycle.restDays}`;
  }
  return "не задан";
}

export interface MonthCell {
  date: Date;
  iso: string;
  inMonth: boolean;
  working: boolean;
}

/** Сетка месяца, начиная с понедельника. */
export function monthGrid(year: number, month: number, schedule?: Schedule): MonthCell[][] {
  const first = new Date(year, month, 1);
  const shift = (first.getDay() + 6) % 7; // Пн-первый
  const start = addDays(first, -shift);
  const weeks: MonthCell[][] = [];
  const cur = new Date(start);
  for (let w = 0; w < 6; w++) {
    const row: MonthCell[] = [];
    for (let d = 0; d < 7; d++) {
      const iso = isoDay(cur);
      row.push({
        date: new Date(cur),
        iso,
        inMonth: cur.getMonth() === month,
        working: schedule ? isWorkingOn(schedule, cur) : false,
      });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(row);
    // остановиться, если месяц кончился и следующий не начался
    if (cur.getMonth() !== month && w >= 4) break;
  }
  return weeks;
}

/** Следующая дата отдыха для цикла/свободного. null — нет данных. */
export function nextDayOff(schedule: Schedule | undefined, from = new Date()): Date | null {
  if (!schedule) return null;
  if (schedule.type === "free") return null;
  for (let i = 0; i < 400; i++) {
    const d = addDays(from, i);
    if (!isWorkingOn(schedule, d)) return d;
  }
  return null;
}

/** Следующая рабочая дата. */
export function nextWorkDay(schedule: Schedule | undefined, from = new Date()): Date | null {
  if (!schedule) return null;
  if (schedule.type === "free") return null;
  for (let i = 0; i < 400; i++) {
    const d = addDays(from, i);
    if (isWorkingOn(schedule, d)) return d;
  }
  return null;
}
