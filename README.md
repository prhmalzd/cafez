# کافه‌ز (Caféz)

بازار محلی کافه‌ها، منوی دیجیتال و پیشنهادهای قابل‌اندازه‌گیری؛ ساخته‌شده با Next.js، TypeScript، Tailwind CSS و Supabase.

## اجرای محلی

```bash
npm install
npm run dev
```

در حالت پیش‌فرض پروژه با داده‌های نمایشی فارسی اجرا می‌شود. برای فعال‌کردن داده‌های واقعی:

1. فایل `.env.example` را به `.env.local` کپی کنید و کلیدهای Supabase را وارد کنید.
2. migrationهای `supabase/migrations/001_initial_schema.sql` و سپس `002_themes_orders_promotions.sql` را اجرا کنید.
3. bucket عمومی `cafe-media` را در Supabase Storage بسازید.

## مسیرهای اصلی

- `/` و `/cafes`: کشف کافه‌ها
- `/cafes/[slug]` و `/cafes/[slug]/menu`: صفحه و منوی کافه
- `/offers/[slug]`: دریافت کد پیشنهاد
- `/orders/[code]`: پیگیری خصوصی سفارش بیرون‌بر
- `/dashboard/orders`: صف زنده سفارش‌های باریستا
- `/dashboard/promotions`: درخواست جایگاه تبلیغاتی
- `/dashboard/settings`: قالب، رنگ و تنظیمات سفارش
- `/dashboard`: پنل مدیر کافه
- `/admin`: پنل نمایشی مدیریت پلتفرم

## بررسی کیفیت

```bash
npm test
npm run build
```

پرداخت آنلاین، امتیازدهی، ارسال و سفارش سر میز در این MVP عمداً وجود ندارند. سفارش بیرون‌بر پس از تأیید دستی کافه و با پرداخت حضوری فعال است.

برای Push واقعی، `NEXT_PUBLIC_VAPID_PUBLIC_KEY` و `VAPID_PRIVATE_KEY` را با یک جفت کلید P-256 استاندارد تنظیم کنید. بدون این کلیدها صفحه زنده سفارش و صف باریستا همچنان کار می‌کنند، اما اعلان مرورگر فعال نمی‌شود.
