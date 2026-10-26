self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("push", (event) => {
  let data = { title: "کافه‌ز", body: "وضعیت سفارش به‌روز شد.", url: "/dashboard/orders" };
  if (event.data) { try { data = { ...data, ...event.data.json() }; } catch {} }
  event.waitUntil(self.registration.showNotification(data.title, { body: data.body, icon: "/icons/cafez.svg", badge: "/icons/cafez.svg", tag: data.tag || "cafez-order", data: { url: data.url } }));
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    const target = event.notification.data?.url || "/";
    const existing = clients.find((client) => client.url.includes(target));
    return existing ? existing.focus() : self.clients.openWindow(target);
  }));
});
