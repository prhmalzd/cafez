import type { AnalyticsSummary, Cafe, Offer } from "@/lib/types";
import { normalizePersian } from "@/lib/utils";

const everyDay = [
  { day: 6, label: "شنبه", opensAt: "08:00", closesAt: "23:30" },
  { day: 0, label: "یکشنبه", opensAt: "08:00", closesAt: "23:30" },
  { day: 1, label: "دوشنبه", opensAt: "08:00", closesAt: "23:30" },
  { day: 2, label: "سه‌شنبه", opensAt: "08:00", closesAt: "23:30" },
  { day: 3, label: "چهارشنبه", opensAt: "08:00", closesAt: "23:30" },
  { day: 4, label: "پنجشنبه", opensAt: "08:00", closesAt: "00:30" },
  { day: 5, label: "جمعه", opensAt: "10:00", closesAt: "00:30" },
];

const img = (id: string, _width = 1200) => {
  if (/153308|150944|151743/.test(id)) return "/images/persian-breakfast.png";
  if (/149736|149721|152475/.test(id)) return "/images/study-cafe.png";
  return "/images/cafe-hero.png";
};

export const offers: Offer[] = [
  {
    id: "offer-1", slug: "roastery-afternoon", cafeId: "cafe-1",
    title: "عصرانه‌ی دونفره", description: "دو نوشیدنی گرم و یک برش کیک روز با قیمت ویژه.",
    terms: "هر کد برای یک میز معتبر است. امکان جایگزینی آیتم‌ها وجود ندارد.", badge: "۲۵٪ تخفیف",
    startsAt: "2025-01-01T00:00:00+03:30", endsAt: "2028-12-31T23:59:00+03:30",
    validFrom: "16:00", validUntil: "20:00", dailyCap: 30, claimedToday: 11,
    image: img("photo-1495474472287-4d71bcdd2085"), status: "active",
  },
  {
    id: "offer-2", slug: "ivan-breakfast", cafeId: "cafe-2",
    title: "صبحانه با قهوه مهمان ما", description: "با سفارش هر صبحانه، یک آمریکانو رایگان دریافت کنید.",
    terms: "شنبه تا چهارشنبه، تا ساعت ۱۲ ظهر. هر نفر یک بار در روز.", badge: "قهوه رایگان",
    startsAt: "2025-01-01T00:00:00+03:30", endsAt: "2028-12-31T23:59:00+03:30",
    validFrom: "08:00", validUntil: "12:00", dailyCap: 20, claimedToday: 8,
    image: img("photo-1533089860892-a7c6f0a88666"), status: "active",
  },
  {
    id: "offer-3", slug: "kaghaz-study", cafeId: "cafe-3",
    title: "میز مطالعه", description: "سه ساعت فضای کار، اینترنت و چای دمی با یک قیمت ثابت.",
    terms: "ویژه روزهای کاری. تمدید با هماهنگی کافه امکان‌پذیر است.", badge: "بسته ۳ ساعته",
    startsAt: "2025-01-01T00:00:00+03:30", endsAt: "2028-12-31T23:59:00+03:30",
    validFrom: "09:00", validUntil: "17:00", dailyCap: 15, claimedToday: 4,
    image: img("photo-1497366811353-6870744d04b2"), status: "active",
  },
];

export const cafes: Cafe[] = [
  {
    id: "cafe-1", slug: "roastery-no-7", name: "رُستری هفت", neighborhood: "مرکز شهر", type: "قهوه تخصصی",
    shortDescription: "قهوه‌ی تازه‌برشت، فضای گرم و گفت‌وگوهای طولانی.",
    description: "رُستری هفت خانه‌ی قهوه‌های تک‌خاستگاه و شیرینی‌های روزانه است. دانه‌ها هر هفته در خود کافه برشته می‌شوند و باریستاها برای انتخاب قهوه کنارتان هستند.",
    priceRange: "متوسط", cover: img("photo-1445116572660-236099ec97a0"), logo: img("photo-1511081692775-05d0f180a065", 300),
    gallery: [img("photo-1495474472287-4d71bcdd2085"), img("photo-1512568400610-62da28bc8a13"), img("photo-1501339847302-ac426a4a7cbb")],
    address: "خیابان اصلی، کوچه‌ی سرو، پلاک ۷", phone: "۰۲۱-۳۳۴۴۵۵۶۶", instagram: "https://instagram.com", mapUrl: "https://maps.google.com",
    amenities: ["وای‌فای", "فضای باز", "بیرون‌بر", "پریز برق"], hours: everyDay, offerIds: ["offer-1"], featured: true, sponsored: true, status: "approved", createdAt: "2026-09-12T10:00:00Z",
    menu: [
      { id: "cat-coffee", name: "قهوه", items: [
        { id: "m1", name: "لاته هفت", description: "اسپرسو دبل، شیر و کرم پسته", price: 148000, available: true, featured: true, ingredients: ["اسپرسو", "شیر", "پسته"], badges: ["پیشنهاد باریستا"] },
        { id: "m2", name: "V60 اتیوپی", description: "گلی و مرکباتی با شیرینی عسل", price: 172000, available: true, ingredients: ["قهوه تک‌خاستگاه"] },
        { id: "m3", name: "آیس آمریکانو", description: "دبل اسپرسو، آب و یخ", price: 108000, available: true, badges: ["وگان"] },
      ]},
      { id: "cat-dessert", name: "شیرینی و دسر", items: [
        { id: "m4", name: "چیزکیک سن‌سباستین", description: "پخت روز با سس کارامل نمکی", price: 164000, available: true, featured: true },
        { id: "m5", name: "کوکی شکلات تلخ", description: "شکلات ۷۰٪ و گردو", price: 88000, available: false },
      ]},
    ],
  },
  {
    id: "cafe-2", slug: "ivan-cafe", name: "کافه ایوان", neighborhood: "باغ‌محله", type: "صبحانه و برانچ",
    shortDescription: "حیاطی آرام برای صبح‌های کش‌دار و صبحانه‌های ایرانی.",
    description: "ایوان از صبح زود با نان تازه، صبحانه‌های ایرانی و قهوه باز است. حیاط سبز و میزهای بزرگ آن برای دورهمی‌های خانوادگی مناسب‌اند.",
    priceRange: "متوسط", cover: img("photo-1554118811-1e0d58224f24"), logo: img("photo-1559925393-8be0ec4767c8", 300),
    gallery: [img("photo-1533089860892-a7c6f0a88666"), img("photo-1521017432531-fbd92d768814")],
    address: "باغ‌محله، روبه‌روی پارک قدیمی", phone: "۰۲۱-۳۳۴۴۵۵۷۷", instagram: "https://instagram.com", mapUrl: "https://maps.google.com",
    amenities: ["فضای باز", "پارکینگ", "دسترسی‌پذیر", "بیرون‌بر"], hours: everyDay, offerIds: ["offer-2"], featured: true, status: "approved", createdAt: "2026-10-02T10:00:00Z",
    menu: [
      { id: "cat-breakfast", name: "صبحانه", items: [
        { id: "m6", name: "صبحانه ایوان", description: "املت، پنیر محلی، گردو، سبزی، مربا و نان تازه", price: 318000, available: true, featured: true, badges: ["مناسب دو نفر"] },
        { id: "m7", name: "پنکیک فصل", description: "پنکیک، میوه فصل و عسل", price: 224000, available: true, badges: ["گیاهی"] },
      ]},
      { id: "cat-cold", name: "نوشیدنی سرد", items: [
        { id: "m8", name: "لیموناد ایوان", description: "لیمو تازه، عرق نعنا و سودا", price: 132000, available: true, badges: ["وگان"] },
      ]},
    ],
  },
  {
    id: "cafe-3", slug: "kaghaz-cafe", name: "کافه کاغذ", neighborhood: "دانشگاه", type: "کار و مطالعه",
    shortDescription: "میزهای راحت، اینترنت پایدار و سکوتی که کار را جلو می‌برد.",
    description: "کاغذ برای مطالعه، کار تیمی و قرارهای کوتاه طراحی شده است. اینترنت پایدار، پریز کنار هر میز و بخش ساکت از ویژگی‌های اصلی آن است.",
    priceRange: "اقتصادی", cover: img("photo-1497366754035-f200968a6e72"), logo: img("photo-1524758631624-e2822e304c36", 300),
    gallery: [img("photo-1497366811353-6870744d04b2"), img("photo-1497215728101-856f4ea42174")],
    address: "بلوار دانشگاه، مجتمع دانش، طبقه همکف", phone: "۰۲۱-۳۳۴۴۵۵۸۸", instagram: "https://instagram.com", mapUrl: "https://maps.google.com",
    amenities: ["وای‌فای", "پریز برق", "فضای ساکت", "بیرون‌بر"], hours: everyDay, offerIds: ["offer-3"], featured: true, status: "approved", createdAt: "2026-10-12T10:00:00Z",
    menu: [
      { id: "cat-warm", name: "گرم‌نوش", items: [
        { id: "m9", name: "چای دست‌چین", description: "قوری چای ایرانی با نبات", price: 94000, available: true, badges: ["شارژ آب جوش"] },
        { id: "m10", name: "کاپوچینو", description: "اسپرسو و شیر با بافت مخملی", price: 128000, available: true },
      ]},
      { id: "cat-snack", name: "میان‌وعده", items: [
        { id: "m11", name: "ساندویچ مرغ پستو", description: "مرغ گریل، پستو و نان چاودار", price: 246000, available: true },
      ]},
    ],
  },
  {
    id: "cafe-4", slug: "golkhaneh", name: "کافه گلخانه", neighborhood: "بلوار شمالی", type: "باغ‌کافه", shortDescription: "میان گیاهان بنشینید و از نوشیدنی‌های فصلی لذت ببرید.",
    description: "گلخانه یک باغ‌کافه‌ی روشن با نوشیدنی‌های فصلی و فضای مناسب خانواده است.", priceRange: "ویژه",
    cover: img("photo-1525610553991-2bede1a236e2"), logo: img("photo-1442512595331-e89e73853f31", 300), gallery: [img("photo-1525610553991-2bede1a236e2")],
    address: "بلوار شمالی، بعد از میدان گل‌ها", phone: "۰۲۱-۳۳۴۴۵۵۹۹", mapUrl: "https://maps.google.com", amenities: ["فضای باز", "پارکینگ", "دسترسی‌پذیر"],
    hours: everyDay, offerIds: [], status: "approved", createdAt: "2026-10-16T10:00:00Z",
    menu: [{ id: "cat-season", name: "فصلی", items: [{ id: "m12", name: "موهیتو خیار", description: "خیار، لیمو و نعنا", price: 168000, available: true, badges: ["وگان"] }] }],
  },
  {
    id: "cafe-5", slug: "nimeh-shab", name: "نیمه‌شب", neighborhood: "میدان فرهنگ", type: "شبانه", shortDescription: "قهوه، موسیقی ملایم و گفت‌وگو تا نیمه‌شب.",
    description: "نیمه‌شب برای قرارهای دوستانه و شب‌های طولانی شهر ساخته شده است.", priceRange: "متوسط",
    cover: img("photo-1501339847302-ac426a4a7cbb"), logo: img("photo-1514933651103-005eec06c04b", 300), gallery: [img("photo-1501339847302-ac426a4a7cbb")],
    address: "میدان فرهنگ، پاساژ نور", phone: "۰۲۱-۳۳۴۴۵۶۰۰", mapUrl: "https://maps.google.com", amenities: ["وای‌فای", "بیرون‌بر"],
    hours: everyDay.map((day) => ({ ...day, opensAt: "14:00", closesAt: "01:30" })), offerIds: [], status: "approved", createdAt: "2026-10-18T10:00:00Z",
    menu: [{ id: "cat-signature", name: "امضای نیمه‌شب", items: [{ id: "m13", name: "موکای نیمه‌شب", description: "اسپرسو، شکلات تلخ و پرتقال", price: 158000, available: true, featured: true }] }],
  },
  {
    id: "cafe-6", slug: "nan-o-ghahveh", name: "نان و قهوه", neighborhood: "بازار", type: "نانوایی کافه", shortDescription: "کروسان گرم و قهوه‌ای که از صبح بیدارتان می‌کند.",
    description: "نان و قهوه هر روز با نان‌های تازه و قهوه‌های کلاسیک شروع می‌شود.", priceRange: "اقتصادی",
    cover: img("photo-1509440159596-0249088772ff"), logo: img("photo-1517433670267-08bbd4be890f", 300), gallery: [img("photo-1509440159596-0249088772ff")],
    address: "بازار قدیم، سرای آفتاب", phone: "۰۲۱-۳۳۴۴۵۶۱۱", mapUrl: "https://maps.google.com", amenities: ["بیرون‌بر", "دسترسی‌پذیر"],
    hours: everyDay.map((day) => ({ ...day, opensAt: "07:00", closesAt: "18:00" })), offerIds: [], status: "approved", createdAt: "2026-10-19T10:00:00Z",
    menu: [{ id: "cat-bakery", name: "از تنور", items: [{ id: "m14", name: "کروسان بادام", description: "خمیر کره‌ای و کرم بادام", price: 118000, available: true, featured: true }] }],
  },
];

export const analytics: AnalyticsSummary = { profileViews: 1842, menuViews: 1296, directionClicks: 286, offerClaims: 174, redemptions: 121 };

export function getApprovedCafes() { return cafes.filter((cafe) => cafe.status === "approved"); }
export function getCafeBySlug(slug: string) { return getApprovedCafes().find((cafe) => cafe.slug === slug); }
export function getCafeById(id: string) { return cafes.find((cafe) => cafe.id === id); }
export function getOfferBySlug(slug: string) { return offers.find((offer) => offer.slug === slug && offer.status === "active"); }
export function getOffersForCafe(cafeId: string) { return offers.filter((offer) => offer.cafeId === cafeId && offer.status === "active"); }

export function searchCafes(query: string) {
  const normalized = normalizePersian(query);
  if (!normalized) return getApprovedCafes();
  return getApprovedCafes().filter((cafe) => {
    const haystack = [cafe.name, cafe.neighborhood, cafe.type, cafe.shortDescription, ...cafe.menu.flatMap((category) => [category.name, ...category.items.flatMap((item) => [item.name, item.description])])].join(" ");
    return normalizePersian(haystack).includes(normalized);
  });
}
