"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  function submit(event: FormEvent) {
    event.preventDefault();
    router.push(`/cafes${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
  }
  return (
    <div className="search-panel">
      <form className="search-form" onSubmit={submit} role="search">
        <div className="search-wrap"><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} className="search-input" placeholder="نام کافه، محله یا مثلاً چیزکیک…" aria-label="جست‌وجوی کافه و آیتم منو" /></div>
        <button className="button button-primary" type="submit">پیدا کن</button>
      </form>
      <div className="quick-filters" aria-label="فیلترهای سریع"><button onClick={() => router.push("/cafes?open=true")} className="chip chip-active">● باز در همین لحظه</button><button onClick={() => router.push("/cafes?offer=true")} className="chip">پیشنهاد ویژه</button><button onClick={() => router.push("/cafes?amenity=وای‌فای")} className="chip">مناسب کار</button><button onClick={() => router.push("/cafes?amenity=فضای باز")} className="chip">فضای باز</button></div>
    </div>
  );
}
