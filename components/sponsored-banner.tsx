"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { sendAnalytics } from "@/components/analytics-beacon";
import type { Promotion } from "@/lib/types";

function pickIndex(length: number) {
  if (!length) return 0;
  let id = localStorage.getItem("cafez:anonymous-id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("cafez:anonymous-id", id); }
  const day = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Tehran" });
  return [...`${id}:${day}`].reduce((sum, character) => sum + character.charCodeAt(0), 0) % length;
}

export function SponsoredBanner({ promotions }: { promotions: Promotion[] }) {
  const [index, setIndex] = useState<number | null>(null);
  useEffect(() => setIndex(pickIndex(promotions.length)), [promotions.length]);
  const promotion = index === null ? undefined : promotions[index];
  useEffect(() => { if (promotion) sendAnalytics("promotion_impression", promotion.cafeId, undefined, promotion.id); }, [promotion]);
  if (index === null && promotions.length) return <aside className="sponsored-banner sponsored-placeholder" aria-hidden="true" />;
  if (!promotion) return null;
  return <aside className="sponsored-banner" aria-label="تبلیغ کافه"><img src={promotion.image} alt="" /><div><span className="ad-label">تبلیغ</span><small>{promotion.cafeName}</small><h2>{promotion.title}</h2><Link href={promotion.targetUrl} onClick={() => sendAnalytics("promotion_click", promotion.cafeId, undefined, promotion.id)}>مشاهده کافه <ArrowLeft size={16} /></Link></div></aside>;
}
