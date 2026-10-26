export function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const raw = atob((value + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}

export async function subscribeToPush(payload: { purpose: "staff"; cafeId: string } | { purpose: "customer"; orderId: string; accessToken: string }) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) throw new Error("این مرورگر از اعلان پشتیبانی نمی‌کند.");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("اجازه اعلان داده نشد.");
  const registration = await navigator.serviceWorker.ready;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) throw new Error("کلید اعلان روی سرور تنظیم نشده است.");
  const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) });
  const response = await fetch("/api/push-subscriptions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...payload, subscription: subscription.toJSON() }) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "فعال‌سازی اعلان انجام نشد.");
  return result;
}
