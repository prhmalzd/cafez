import { Coffee } from "lucide-react";
import Link from "next/link";

export function Logo({ dashboard = false }: { dashboard?: boolean }) {
  return (
    <Link href={dashboard ? "/dashboard" : "/"} className="brand" aria-label="کافه‌ز، صفحه اصلی">
      <span className="brand-mark"><Coffee size={21} strokeWidth={2.5} /></span>
      <span>کافه‌ز</span>
    </Link>
  );
}
