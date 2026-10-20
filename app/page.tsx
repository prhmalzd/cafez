import { ArrowLeft, BadgePercent, Coffee, MapPin, MousePointerClick, ScanLine, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { CafeCard } from "@/components/cafe-card";
import { HomeSearch } from "@/components/home-search";
import { OfferCard } from "@/components/offer-card";
import { PublicShell } from "@/components/public-shell";
import { getApprovedCafes, offers } from "@/lib/data";

export default function HomePage() {
  const featured = getApprovedCafes().filter((cafe) => cafe.featured).slice(0, 3);
  return (
    <PublicShell>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">کافه‌گردی از همین‌جا شروع می‌شود</span>
            <h1>کافه‌های خوب شهر، <em>یک‌جا.</em></h1>
            <p>منوی واقعی را ببین، جای تازه پیدا کن و پیشنهادهایی بگیر که واقعاً می‌توانی در کافه استفاده کنی.</p>
            <div className="hero-actions"><Link href="/cafes" className="button button-primary"><Search size={18} /> کشف کافه‌ها</Link><Link href="#offers" className="button button-outline">پیشنهادهای امروز <ArrowLeft size={17} /></Link></div>
            <div className="hero-note"><div className="avatar-stack"><span style={{ backgroundImage: "url(/images/cafe-hero.png)" }} /><span style={{ backgroundImage: "url(/images/study-cafe.png)" }} /><span style={{ backgroundImage: "url(/images/persian-breakfast.png)" }} /></div><span>انتخاب تازه برای آدم‌های کنجکاو شهر</span></div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-image-main"><img src="/images/cafe-hero.png" alt="" /></div>
            <div className="hero-float float-top"><span className="float-icon"><MapPin size={19} /></span><strong>نزدیک تو</strong><small>۶ کافه‌ی منتخب</small></div>
            <div className="hero-float float-bottom"><span className="float-icon"><BadgePercent size={19} /></span><strong>عصرانه دونفره</strong><small>۲۵٪ تخفیف در رُستری هفت</small></div>
          </div>
        </div>
      </section>
      <div className="container"><HomeSearch /></div>

      <section className="section">
        <div className="container">
          <div className="section-head"><div><span className="eyebrow">انتخاب‌های این هفته</span><h2>کافه‌های دوست‌داشتنی</h2></div><p>جاهایی با منوی به‌روز، اطلاعات کامل و تجربه‌ای که ارزش امتحان‌کردن دارد.</p></div>
          <div className="grid-3">{featured.map((cafe) => <CafeCard key={cafe.id} cafe={cafe} />)}</div>
          <div style={{ textAlign: "center", marginTop: 28 }}><Link href="/cafes" className="button button-outline">دیدن همه کافه‌ها <ArrowLeft size={17} /></Link></div>
        </div>
      </section>

      <section className="section section-soft" id="offers">
        <div className="container">
          <div className="section-head"><div><span className="eyebrow">بهانه‌ای برای بیرون رفتن</span><h2>پیشنهادهای امروز</h2></div><p>کد را رایگان بگیر، در زمان مشخص به کافه برو و همان‌جا استفاده‌اش کن. بدون پرداخت آنلاین.</p></div>
          <div className="grid-3">{offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}</div>
        </div>
      </section>

      <section className="section" id="why">
        <div className="container why-grid">
          <div className="why-art"><img src="/images/study-cafe.png" alt="فضای آرام کافه" /><div className="why-art-copy"><strong>نه فقط منو؛</strong><span>یک راه تازه برای شناختن شهر.</span></div></div>
          <div><span className="eyebrow">ساده، محلی، واقعی</span><div className="section-head" style={{ display: "block", marginBottom: 0 }}><h2>چرا کافه‌ز فرق دارد؟</h2><p>اطلاعات پراکنده را کنار گذاشته‌ایم تا تصمیم‌گیری برای تو و دیده‌شدن برای کافه‌ها ساده‌تر شود.</p></div>
            <div className="benefits">
              <div className="benefit"><span className="benefit-icon"><Coffee size={21} /></span><div><h3>منوی زنده، نه عکس قدیمی</h3><p>قیمت و موجودی را همان لحظه ببین؛ قبل از رفتن دقیقاً بدان چه چیزی منتظرت است.</p></div></div>
              <div className="benefit"><span className="benefit-icon"><Sparkles size={21} /></span><div><h3>پیشنهادهای قابل استفاده</h3><p>پیشنهاد فعال را پیدا کن و یک کد کوتاه برای استفاده حضوری بگیر.</p></div></div>
              <div className="benefit"><span className="benefit-icon"><MousePointerClick size={21} /></span><div><h3>انتخاب سریع و مطمئن</h3><p>ساعت کار، امکانات، آدرس و حال‌وهوای هر کافه در یک صفحه روشن.</p></div></div>
            </div>
          </div>
        </div>
      </section>

      <div className="container"><section className="cta"><div><h2>کافه داری؟ رایگان دیده شو.</h2><p>صفحه کافه و منوی دیجیتال را بساز؛ بدون هزینه و بدون پیچیدگی.</p></div><Link href="/dashboard/onboarding" className="button button-primary"><ScanLine size={18} /> ثبت رایگان کافه</Link></section></div>
    </PublicShell>
  );
}
