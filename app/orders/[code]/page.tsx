import { OrderStatus } from "@/components/order-status";
import { PublicShell } from "@/components/public-shell";

export default async function OrderPage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ token?: string }> }) {
  const { code } = await params;
  const { token = "" } = await searchParams;
  return <PublicShell><main className="order-page container"><OrderStatus code={code.toUpperCase()} token={token} /></main></PublicShell>;
}
