"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const key = "cafez:favorites";

export function FavoriteButton({ cafeId, floating = false }: { cafeId: string; floating?: boolean }) {
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem(key) ?? "[]") as string[];
    setFavorite(favorites.includes(cafeId));
  }, [cafeId]);

  function toggle() {
    const favorites = new Set<string>(JSON.parse(localStorage.getItem(key) ?? "[]"));
    if (favorites.has(cafeId)) favorites.delete(cafeId); else favorites.add(cafeId);
    localStorage.setItem(key, JSON.stringify([...favorites]));
    setFavorite(favorites.has(cafeId));
  }

  return (
    <button onClick={toggle} className={cn("icon-button", floating && "favorite-float")} aria-label={favorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"} aria-pressed={favorite}>
      <Heart size={19} fill={favorite ? "#ef5b2a" : "none"} color={favorite ? "#ef5b2a" : "currentColor"} />
    </button>
  );
}
