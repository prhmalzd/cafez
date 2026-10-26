import { describe, expect, it } from "vitest";
import { contrastWithWhite, defaultCafeTheme, sanitizeTheme } from "@/lib/themes";

describe("cafe themes", () => {
  it("keeps supported presets and valid colors", () => {
    expect(sanitizeTheme({ preset: "warm", primaryColor: "#20332c", accentColor: "#c85c36" })).toMatchObject({ preset: "warm", primaryColor: "#20332c", accentColor: "#c85c36" });
  });

  it("rejects malformed or unreadable primary colors", () => {
    expect(sanitizeTheme({ primaryColor: "red" }).primaryColor).toBe(defaultCafeTheme.primaryColor);
    expect(sanitizeTheme({ primaryColor: "#ffffff" }).primaryColor).toBe(defaultCafeTheme.primaryColor);
    expect(contrastWithWhite("#20332c")).toBeGreaterThan(4.5);
  });
});
