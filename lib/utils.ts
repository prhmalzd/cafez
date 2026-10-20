import type { BusinessHours, Cafe } from "@/lib/types";

const faDigits = "۰۱۲۳۴۵۶۷۸۹";

export function toPersianDigits(value: string | number) {
  return String(value).replace(/\d/g, (digit) => faDigits[Number(digit)]);
}

export function normalizePersian(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("fa-IR")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/\s+/g, " ");
}

export function formatToman(value: number) {
  return `${new Intl.NumberFormat("fa-IR").format(value)} تومان`;
}

export function formatPersianDate(value: string | Date) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    timeZone: "Asia/Tehran",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function formatPersianDateTime(value: string | Date) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    timeZone: "Asia/Tehran",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function minutesOf(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

export function isOpenAt(hours: BusinessHours[], date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tehran",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const weekday = parts.find((part) => part.type === "weekday")?.value;
  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const day = dayMap[weekday ?? "Sun"];
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const now = hour * 60 + minute;
  const today = hours.find((entry) => entry.day === day);
  if (!today || today.closed || !today.opensAt || !today.closesAt) return false;
  const open = minutesOf(today.opensAt);
  const close = minutesOf(today.closesAt);
  return close > open ? now >= open && now < close : now >= open || now < close;
}

export function getOpenLabel(cafe: Cafe, date = new Date()) {
  if (isOpenAt(cafe.hours, date)) return "همین حالا باز است";
  return "در حال حاضر بسته است";
}

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}
