"use client";

import { useEffect, useState } from "react";
import { sanitizeTheme, themeStyle } from "@/lib/themes";
import type { CafeTheme } from "@/lib/types";

export function CafeThemeSurface({ cafeId, initialTheme, children }: { cafeId: string; initialTheme?: CafeTheme; children: React.ReactNode }) {
  const [theme, setTheme] = useState(() => sanitizeTheme(initialTheme));
  useEffect(() => {
    const stored = localStorage.getItem(`cafez:theme:${cafeId}`);
    if (stored) { try { setTheme(sanitizeTheme(JSON.parse(stored))); } catch { localStorage.removeItem(`cafez:theme:${cafeId}`); } }
  }, [cafeId]);
  return <div className={`cafe-theme theme-${theme.preset} theme-mode-${theme.mode} theme-font-${theme.font}`} style={themeStyle(theme)}>{children}</div>;
}
