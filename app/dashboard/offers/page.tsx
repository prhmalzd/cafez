import { Pause, Pencil, Plus } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { offers } from "@/lib/data";
import { toPersianDigits } from "@/lib/utils";

export default function OffersDashboardPage() { const items = offers.filter((offer) => offer.cafeId === "cafe-1"); return <DashboardShell><div className="dash-top"><div><h1>پیشنهادها</h1><span className="muted">پیشنهادهای زمان‌دار بسازید و نتیجه آن‌ها را ببینید.</span></div><button className="button button-primary button-small"><Plus size={16} /> پیشنهاد جدید</button></div>{items.map((offer) => <article className="approval-card" key={offer.id}><img src={offer.image} alt="" /><div><span className="offer-label" style={{ color: "white" }}>{offer.badge}</span><h3 style={{ margin: "8px 0 5px" }}>{offer.title}</h3><span className="muted">{toPersianDigits(offer.claimedToday ?? 0)} دریافت امروز · {toPersianDigits(70)}٪ نرخ استفاده</span></div><div className="table-actions"><button className="button button-outline button-small"><Pencil size={15} /> ویرایش</button><button className="icon-button"><Pause size={16} /></button></div></article>)}</DashboardShell>; }
