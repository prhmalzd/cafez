"use client";

import { useEffect } from "react";

type EventType = "profile_view" | "menu_view" | "contact_click" | "directions_click" | "offer_view" | "promotion_impression" | "promotion_click";

function getAnonymousId() {
  let id = localStorage.getItem("cafez:anonymous-id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("cafez:anonymous-id", id); }
  return id;
}

export function sendAnalytics(eventType: EventType, cafeId?: string, offerId?: string) {
  const payload = JSON.stringify({ eventType, cafeId, offerId, anonymousId: getAnonymousId(), source: new URLSearchParams(location.search).get("src") ?? document.referrer.slice(0, 80) });
  if (navigator.sendBeacon) navigator.sendBeacon("/api/analytics", new Blob([payload], { type: "application/json" }));
  else void fetch("/api/analytics", { method: "POST", headers: { "content-type": "application/json" }, body: payload, keepalive: true });
}

export function AnalyticsBeacon({ eventType, cafeId, offerId }: { eventType: EventType; cafeId?: string; offerId?: string }) {
  useEffect(() => { sendAnalytics(eventType, cafeId, offerId); }, [eventType, cafeId, offerId]);
  return null;
}

export function TrackedAnchor({ eventType, cafeId, href, className, children }: { eventType: EventType; cafeId: string; href: string; className?: string; children: React.ReactNode }) {
  return <a href={href} className={className} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} onClick={() => sendAnalytics(eventType, cafeId)}>{children}</a>;
}
