const TEHRAN_OFFSET = "+03:30";

export function tehranDateParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "00";
  return { date: `${value("year")}-${value("month")}-${value("day")}`, hour: Number(value("hour")), minute: Number(value("minute")) };
}

export function resolvePickupTime(time: string | undefined, minimumPrepMinutes: number, slotIntervalMinutes = 15, now = new Date()) {
  const tehran = tehranDateParts(now);
  if (!time || time === "asap") {
    const targetMinutes = Math.ceil((tehran.hour * 60 + tehran.minute + minimumPrepMinutes) / slotIntervalMinutes) * slotIntervalMinutes;
    if (targetMinutes >= 24 * 60) return new Date(now.getTime() + minimumPrepMinutes * 60_000).toISOString();
    const clock = `${String(Math.floor(targetMinutes / 60)).padStart(2, "0")}:${String(targetMinutes % 60).padStart(2, "0")}`;
    return new Date(`${tehran.date}T${clock}:00${TEHRAN_OFFSET}`).toISOString();
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error("زمان انتخاب‌شده معتبر نیست.");
  const requested = new Date(`${tehran.date}T${time}:00${TEHRAN_OFFSET}`);
  if (requested.getTime() < now.getTime() + minimumPrepMinutes * 60_000) throw new Error(`حداقل زمان آماده‌سازی ${minimumPrepMinutes.toLocaleString("fa-IR")} دقیقه است.`);
  return requested.toISOString();
}

export function isSameTehranDay(first: string | Date, second = new Date()) {
  return tehranDateParts(new Date(first)).date === tehranDateParts(second).date;
}

export function formatPickupTime(value: string) {
  return new Intl.DateTimeFormat("fa-IR", { timeZone: "Asia/Tehran", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
