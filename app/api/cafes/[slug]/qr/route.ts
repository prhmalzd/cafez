import QRCode from "qrcode";
import { getCafeBySlug } from "@/lib/data";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const cafe = getCafeBySlug((await params).slug);
  if (!cafe) return new Response("Not found", { status: 404 });
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const svg = await QRCode.toString(`${base}/cafes/${cafe.slug}?src=qr`, { type: "svg", width: 900, margin: 3, color: { dark: "#20332c", light: "#fffdf9" } });
  return new Response(svg, { headers: { "content-type": "image/svg+xml; charset=utf-8", "content-disposition": `attachment; filename="${cafe.slug}-qr.svg"`, "cache-control": "public, max-age=3600" } });
}
