# کافه‌ز (Caféz)

بازار محلی کافه‌ها، منوی دیجیتال و پیشنهادهای قابل‌اندازه‌گیری؛ ساخته‌شده با Next.js، TypeScript، Tailwind CSS و Supabase.

## اجرای محلی

```bash
npm install
npm run dev
```

در حالت پیش‌فرض پروژه با داده‌های نمایشی فارسی اجرا می‌شود. برای فعال‌کردن داده‌های واقعی:

1. فایل `.env.example` را به `.env.local` کپی کنید و کلیدهای Supabase را وارد کنید.
2. migration داخل `supabase/migrations/001_initial_schema.sql` را اجرا کنید.
3. bucket عمومی `cafe-media` را در Supabase Storage بسازید.

## مسیرهای اصلی

- `/` و `/cafes`: کشف کافه‌ها
- `/cafes/[slug]` و `/cafes/[slug]/menu`: صفحه و منوی کافه
- `/offers/[slug]`: دریافت کد پیشنهاد
- `/dashboard`: پنل نمایشی مدیر کافه
- `/admin`: پنل نمایشی مدیریت پلتفرم

## بررسی کیفیت

```bash
npm test
npm run build
```

پرداخت، سفارش، امتیازدهی و ارسال در این MVP عمداً وجود ندارند.
