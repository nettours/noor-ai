# 🌙 Noor AI — أكبر تطبيق إسلامي ذكي في العالم العربي

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://postgresql.org)

## 📋 نظرة عامة

Noor AI هو تطبيق إسلامي شامل مبني بأحدث التقنيات، يعمل كـ PWA (تطبيق + موقع في آنٍ واحد).

---

## 🏗️ المعمارية

```
noor-ai/
├── frontend/              # Next.js 15 + TypeScript
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   │   ├── home/      # الصفحة الرئيسية
│   │   │   ├── quran/     # القرآن الكريم
│   │   │   ├── quran/[surahId]/ # تفاصيل السورة
│   │   │   ├── ai/        # المساعد الإسلامي AI
│   │   │   ├── prayer/    # أوقات الصلاة
│   │   │   ├── qibla/     # بوصلة القبلة
│   │   │   ├── azkar/     # الأذكار
│   │   │   ├── feed/      # المجتمع الإسلامي
│   │   │   ├── profile/   # الملف الشخصي
│   │   │   └── admin/     # لوحة التحكم
│   │   ├── components/    # مكونات قابلة للإعادة
│   │   ├── services/      # API calls + Audio engine
│   │   ├── store/         # Zustand state management
│   │   ├── types/         # TypeScript types
│   │   └── styles/        # Global CSS
│   └── public/
│       ├── sw.js          # Service Worker
│       └── manifest.json  # PWA Manifest
│
├── backend/               # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/   # Business logic
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth, Error handling
│   │   ├── services/      # Email, Notifications
│   │   └── lib/           # Prisma, Redis, JWT
│   └── prisma/
│       └── schema.prisma  # Database schema
│
├── docker/                # Docker configs
├── docker-compose.yml     # Production setup
└── .env.example           # Environment template
```

---

## ✨ الميزات الرئيسية

| الميزة | الوصف |
|--------|-------|
| 📖 القرآن الكريم | 114 سورة + تلاوة صوتية + ترجمة + تفسير AI |
| 🤖 مساعد AI | مساعد إسلامي مبني على Claude AI |
| 🕌 أوقات الصلاة | دقيقة بالـ GPS + إشعارات أذان |
| 🧭 القبلة | بوصلة حية بالمستشعرات |
| 📿 الأذكار | صباح، مساء، صلاة، متنوعة |
| 🌍 المجتمع | Feed إسلامي تفاعلي |
| 🎯 تحديات | نقاط، مستويات، إنجازات |
| 📲 PWA | يعمل كتطبيق حقيقي offline |

---

## 🚀 التشغيل المحلي

### المتطلبات
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Docker & Docker Compose (للإنتاج)

### 1. استنسخ المشروع
```bash
git clone https://github.com/your-org/noor-ai.git
cd noor-ai
```

### 2. إعداد البيئة
```bash
cp .env.example .env
# عدّل .env بقيمك الحقيقية
```

### 3. تشغيل قاعدة البيانات
```bash
docker run -d \
  --name noor-postgres \
  -e POSTGRES_DB=noorai \
  -e POSTGRES_USER=noor \
  -e POSTGRES_PASSWORD=yourpassword \
  -p 5432:5432 \
  postgres:16-alpine

docker run -d \
  --name noor-redis \
  -p 6379:6379 \
  redis:7-alpine
```

### 4. تشغيل الـ Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 5. تشغيل الـ Frontend
```bash
cd frontend
npm install
npm run dev
```

التطبيق يعمل على: `http://localhost:3000`

---

## 🐳 النشر بـ Docker

### الإنتاج الكامل
```bash
# نسخ وتعديل البيئة
cp .env.example .env
nano .env

# بناء وتشغيل
docker-compose up -d --build

# تنفيذ migrations
docker-compose exec backend npx prisma migrate deploy

# مراقبة السجلات
docker-compose logs -f
```

### SSL مع Let's Encrypt
```bash
docker run --rm \
  -v $(pwd)/docker/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/docker/certbot/www:/var/www/certbot \
  certbot/certbot certonly \
  --webroot -w /var/www/certbot \
  -d noorai.app -d www.noorai.app \
  --email admin@noorai.app \
  --agree-tos
```

---

## 🔧 متغيرات البيئة المهمة

| المتغير | الوصف | مطلوب |
|---------|-------|-------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `REDIS_URL` | Redis connection string | ✅ |
| `JWT_SECRET` | مفتاح JWT (64+ حرف) | ✅ |
| `ANTHROPIC_API_KEY` | مفتاح Anthropic للـ AI | ✅ |
| `CLOUDINARY_URL` | لتخزين الملفات | ✅ |
| `VAPID_PUBLIC_KEY` | للإشعارات Push | ✅ |
| `GOOGLE_CLIENT_ID` | لتسجيل الدخول بـ Google | اختياري |

---

## 📊 لوحة التحكم

متاحة على `/admin` للمستخدمين من نوع `ADMIN`:
- إدارة المستخدمين والأدوار
- تحليلات الاستخدام
- إدارة المحتوى
- مراقبة الـ AI
- إرسال الإشعارات

---

## 🔔 توليد VAPID Keys للإشعارات

```bash
npx web-push generate-vapid-keys
```

أضف المفاتيح في `.env`:
```env
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
```

---

## 🧪 الاختبار

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm run lint
npm run type-check
```

---

## 📱 تحويل لـ APK (Android)

```bash
# باستخدام Bubblewrap (Google)
npm install -g @bubblewrap/cli
bubblewrap init --manifest=https://noorai.app/manifest.json
bubblewrap build
```

---

## 🌟 خارطة الطريق

- [ ] v1.1: تعليم التجويد بالـ AI
- [ ] v1.2: تطبيق Podcast إسلامي
- [ ] v1.3: ميزة الختمة الجماعية
- [ ] v1.4: تطبيق Android/iOS native
- [ ] v2.0: منصة تعليمية كاملة

---

## 📜 الترخيص

MIT License — يمكن الاستخدام التجاري والشخصي

---

**بسم الله الرحمن الرحيم** 🌙

_صُنع هذا التطبيق لخدمة المسلمين في كل مكان_
