import { describe, expect, it } from "vitest";
import { formatToman, isOpenAt, normalizePersian, toPersianDigits } from "@/lib/utils";

describe("Persian presentation utilities", () => {
  it("normalizes Arabic and Persian character variants", () => {
    expect(normalizePersian("  كافه‌ي خوب  ")).toBe(normalizePersian("کافه‌ی خوب"));
  });

  it("formats Persian digits and toman", () => {
    expect(toPersianDigits(1405)).toBe("۱۴۰۵");
    expect(formatToman(148000)).toContain("۱۴۸٬۰۰۰");
  });
});

describe("opening hours", () => {
  const hours = [{ day: 1, label: "دوشنبه", opensAt: "18:00", closesAt: "01:30" }];
  it("supports schedules crossing midnight on their opening day", () => {
    expect(isOpenAt(hours, new Date("2026-10-19T17:00:00Z"))).toBe(true); // 20:30 Tehran, Monday
  });
  it("is closed before opening", () => {
    expect(isOpenAt(hours, new Date("2026-10-19T10:00:00Z"))).toBe(false);
  });
});
