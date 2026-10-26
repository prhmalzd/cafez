import type { CSSProperties } from "react";
import type { CafeTheme } from "@/lib/types";

export const defaultCafeTheme: CafeTheme = {
  preset: "classic",
  primaryColor: "#20332c",
  accentColor: "#ef5b2a",
  mode: "light",
  font: "default",
  tier: "standard",
};

const HEX = /^#[0-9a-f]{6}$/i;

function channel(value: number) {
  const normalized = value / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function contrastWithWhite(color: string) {
  if (!HEX.test(color)) return 0;
  const value = color.slice(1);
  const luminance = 0.2126 * channel(parseInt(value.slice(0, 2), 16)) + 0.7152 * channel(parseInt(value.slice(2, 4), 16)) + 0.0722 * channel(parseInt(value.slice(4, 6), 16));
  return 1.05 / (luminance + 0.05);
}

export function sanitizeTheme(input?: Partial<CafeTheme> | null): CafeTheme {
  const primaryColor = input?.primaryColor && HEX.test(input.primaryColor) && contrastWithWhite(input.primaryColor) >= 4.5 ? input.primaryColor : defaultCafeTheme.primaryColor;
  const accentColor = input?.accentColor && HEX.test(input.accentColor) && contrastWithWhite(input.accentColor) >= 3 ? input.accentColor : defaultCafeTheme.accentColor;
  return {
    preset: input?.preset === "warm" || input?.preset === "minimal" ? input.preset : "classic",
    primaryColor,
    accentColor,
    mode: input?.mode === "dark" ? "dark" : "light",
    font: input?.font === "rounded" ? "rounded" : "default",
    tier: input?.tier === "advanced" ? "advanced" : "standard",
  };
}

export function themeStyle(themeInput?: Partial<CafeTheme>): CSSProperties {
  const theme = sanitizeTheme(themeInput);
  return {
    "--cafe-primary": theme.primaryColor,
    "--cafe-accent": theme.accentColor,
  } as CSSProperties;
}
