import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "کافه‌ز — پنل سفارش کافه",
    short_name: "کافه‌ز",
    description: "کشف کافه‌ها، منوی دیجیتال و مدیریت پیش‌سفارش بیرون‌بر",
    start_url: "/dashboard/orders",
    display: "standalone",
    background_color: "#f7f2e9",
    theme_color: "#20332c",
    dir: "rtl",
    lang: "fa",
    icons: [{ src: "/icons/cafez.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" }],
  };
}
