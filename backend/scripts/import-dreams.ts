// ═══════════════════════════════════════════════════════════════
// سكربت استيراد/تحديث قاعدة موسوعة الأحلام إلى MongoDB
// التشغيل:  npm run import:dreams
// يقرأ DATABASE_URL أو MONGODB_URI، ثم يرفع (upsert) كل الرموز والمصادر
// من backend/src/dreams-data.ts — بلا حذف ما هو موجود (آمن للتحديث).
// ═══════════════════════════════════════════════════════════════
import { MongoClient } from 'mongodb';
import { DREAM_SYMBOLS, DREAM_SOURCES } from '../src/dreams-data';

async function main() {
  const uri = process.env.DATABASE_URL || process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ لا يوجد DATABASE_URL / MONGODB_URI في البيئة.');
    process.exit(1);
  }
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  const db = client.db('noor');

  let s = 0, k = 0;
  for (const src of DREAM_SOURCES) {
    await db.collection('dream_sources').updateOne({ id: src.id }, { $set: src }, { upsert: true });
    s++;
  }
  for (const sym of DREAM_SYMBOLS) {
    await db.collection('dream_symbols').updateOne({ id: sym.id }, { $set: sym }, { upsert: true });
    k++;
  }

  // فهارس للبحث السريع
  await db.collection('dream_symbols').createIndex({ id: 1 }, { unique: true });
  await db.collection('dream_symbols').createIndex({ category: 1 });
  await db.collection('dream_symbols').createIndex({ tags: 1 });
  await db.collection('dream_sources').createIndex({ id: 1 }, { unique: true });
  await db.collection('dream_user_logs').createIndex({ userId: 1 });
  await db.collection('dream_favorites').createIndex({ userId: 1 }, { unique: true });

  console.log(`✅ تمّ الاستيراد: ${k} رمزاً، ${s} مصدراً، وأُنشئت الفهارس.`);
  await client.close();
  process.exit(0);
}

main().catch(err => { console.error('🔥 فشل الاستيراد:', err); process.exit(1); });
