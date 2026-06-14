// ═══════════════════════════════════════════════════════════════
// أكاديمية علم الحديث — وحدة الـ Backend
// مخزن بالذاكرة (كاش) + حفظ MongoDB + بذرة + REST APIs (/api/hadith/*).
// الأحكام/الكتب/المصطلحات/التصنيفات ثابتة من ملف البيانات.
// الأحاديث تُبذَر من ملف مُولّد (مستورَد من الموسوعة الحديثية HadeethEnc) ومن Mongo.
// ═══════════════════════════════════════════════════════════════
import type { Express, Request, Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  HADITH_GRADES, HADITH_BOOKS, HADITH_TERMS, HADITH_CATEGORIES,
  type Hadith,
} from './hadith-data';

// الأحاديث المُولّدة تُحمَّل من JSON وقت التشغيل (لا عبر import) حتى لا يُبطئ
// ملفُها الضخم (≈12MB) عمليةَ tsc في البناء. نجرّب عدّة مسارات محتملة.
let SEED_HADEETHS: Hadith[] = [];
{
  const candidates = [
    join(__dirname, 'hadith-hadeeths.generated.json'),
    join(__dirname, '..', 'src', 'hadith-hadeeths.generated.json'),
    join(process.cwd(), 'src', 'hadith-hadeeths.generated.json'),
  ];
  for (const p of candidates) {
    try { SEED_HADEETHS = JSON.parse(readFileSync(p, 'utf8')); break; } catch { /* جرّب التالي */ }
  }
}

interface Deps {
  auth: (req: any, res: Response, next: any) => void;
  adminAuth: (req: any, res: Response, next: any) => void;
  getDb: () => any;
  isDbReady: () => boolean;
}

const hadiths = new Map<string, Hadith>();
const views = new Map<string, number>();
const collections = new Map<string, Set<string>>();   // userId -> hadith ids
let deps: Deps;

function normalizeAr(s: string): string {
  return (s || '')
    .replace(/[ً-ْٰـ]/g, '')
    .replace(/[إأآا]/g, 'ا').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/ة/g, 'ه')
    .toLowerCase().trim();
}

async function persistHadith(h: Hadith) {
  if (!deps.isDbReady()) return;
  try { await deps.getDb().collection('hadiths').updateOne({ id: h.id }, { $set: h }, { upsert: true }); }
  catch (e) { console.error('persistHadith:', e); }
}
async function persistCollection(userId: string) {
  if (!deps.isDbReady()) return;
  try {
    const ids = Array.from(collections.get(userId) || []);
    await deps.getDb().collection('hadith_collections').updateOne({ userId }, { $set: { userId, ids } }, { upsert: true });
  } catch (e) { console.error('persistCollection:', e); }
}

export async function initHadith(db: any) {
  try {
    const dbH = await db.collection('hadiths').find({}).toArray();
    for (const h of dbH) { const { _id, ...x } = h; hadiths.set(x.id, x as Hadith); }
    // بذر الأحاديث الناقصة دفعةً واحدة (insertMany) بدل آلاف العمليات المتتابعة
    const missing = SEED_HADEETHS.filter(h => !hadiths.has(h.id));
    for (const h of missing) hadiths.set(h.id, h);
    if (missing.length) {
      try { await db.collection('hadiths').insertMany(missing, { ordered: false }); console.log(`📜 Hadith: بُذِر ${missing.length} حديثاً`); }
      catch (e) { console.error('seed hadiths insertMany:', e); }
    }
    const dbC = await db.collection('hadith_collections').find({}).toArray();
    for (const c of dbC) collections.set(c.userId, new Set(c.ids || []));
  } catch (e) { console.error('initHadith:', e); for (const h of SEED_HADEETHS) hadiths.set(h.id, h); }
  console.log(`📜 Hadith KB: ${hadiths.size} حديثاً، ${HADITH_TERMS.length} مصطلحاً، ${HADITH_BOOKS.length} كتاباً`);
}
export function seedHadithInMemory() {
  if (hadiths.size === 0) for (const h of SEED_HADEETHS) hadiths.set(h.id, h);
  console.log(`📜 Hadith KB (ذاكرة فقط): ${hadiths.size} حديثاً`);
}

function lightHadith(h: Hadith) {
  return {
    id: h.id, text: h.text.length > 220 ? h.text.slice(0, 220) + '…' : h.text,
    attribution: h.attribution, grade: h.grade, gradeKey: h.gradeKey,
    category: h.category, bookId: h.bookId, source: h.source,
  };
}
function gradeMeta(key: string) { return HADITH_GRADES.find(g => g.key === key) || HADITH_GRADES.find(g => g.key === 'unknown'); }

export function registerHadithRoutes(app: Express, d: Deps) {
  deps = d;
  const { auth, adminAuth } = d;

  app.get('/api/hadith/meta', (_req: Request, res: Response) => {
    const byCat: Record<string, number> = {};
    const byGrade: Record<string, number> = {};
    for (const h of hadiths.values()) {
      if (h.category) byCat[h.category] = (byCat[h.category] || 0) + 1;
      byGrade[h.gradeKey] = (byGrade[h.gradeKey] || 0) + 1;
    }
    res.json({
      success: true,
      total: hadiths.size,
      grades: HADITH_GRADES.map(g => ({ ...g, count: byGrade[g.key] || 0 })),
      books: HADITH_BOOKS,
      categories: HADITH_CATEGORIES.map(c => ({ ...c, count: byCat[c.id] || 0 })),
      termsCount: HADITH_TERMS.length,
      disclaimer: 'هذا القسم للتعريف والدراسة لا للإفتاء؛ والأحكام على الأحاديث منقولة عن مصادرها الموثّقة. واستنباط الأحكام الشرعية مرجعه أهل العلم.',
    });
  });

  // ── معجم المصطلح ──
  app.get('/api/hadith/terms', (req: Request, res: Response) => {
    const group = String(req.query.group || '');
    let list = HADITH_TERMS;
    if (group) list = list.filter(t => t.group === group);
    res.json({ success: true, groups: Array.from(new Set(HADITH_TERMS.map(t => t.group))), terms: list });
  });
  app.get('/api/hadith/terms/:id', (req: Request, res: Response): any => {
    const t = HADITH_TERMS.find(x => x.id === req.params.id);
    if (!t) return res.status(404).json({ success: false });
    const related = (t.related || []).map(rid => HADITH_TERMS.find(x => x.id === rid)).filter(Boolean)
      .map(r => ({ id: r!.id, term: r!.term, definition: r!.definition }));
    res.json({ success: true, term: { ...t, relatedTerms: related } });
  });

  // ── الكتب ──
  app.get('/api/hadith/books', (_req: Request, res: Response) => res.json({ success: true, books: HADITH_BOOKS }));
  app.get('/api/hadith/books/:id', (req: Request, res: Response): any => {
    const b = HADITH_BOOKS.find(x => x.id === req.params.id);
    if (!b) return res.status(404).json({ success: false });
    const sample = Array.from(hadiths.values()).filter(h => h.bookId === b.id).slice(0, 20).map(lightHadith);
    res.json({ success: true, book: b, sample });
  });

  // ── الأحاديث: بحث + ترشيح ──
  app.get('/api/hadith/hadiths', (req: Request, res: Response) => {
    const q = normalizeAr(String(req.query.q || ''));
    const category = String(req.query.category || '');
    const grade = String(req.query.grade || '');
    const book = String(req.query.book || '');
    let list = Array.from(hadiths.values());
    if (category) list = list.filter(h => h.category === category);
    if (grade) list = list.filter(h => h.gradeKey === grade);
    if (book) list = list.filter(h => h.bookId === book);
    if (q) list = list.filter(h => normalizeAr(h.text).includes(q) || normalizeAr(h.attribution).includes(q) || (h.tags || []).some(t => normalizeAr(t).includes(q)));
    const total = list.length;
    const page = Math.max(1, parseInt(String(req.query.page || '1')) || 1);
    const per = Math.min(50, Math.max(5, parseInt(String(req.query.per || '20')) || 20));
    res.json({ success: true, total, page, per, hadiths: list.slice((page - 1) * per, page * per).map(lightHadith) });
  });

  app.get('/api/hadith/hadiths/:id', (req: Request, res: Response): any => {
    const h = hadiths.get(req.params.id);
    if (!h) return res.status(404).json({ success: false, error: 'الحديث غير موجود' });
    views.set(h.id, (views.get(h.id) || 0) + 1);
    res.json({ success: true, hadith: { ...h, gradeInfo: gradeMeta(h.gradeKey), book: HADITH_BOOKS.find(b => b.id === h.bookId) || null } });
  });

  // ── حديث/مصطلح اليوم + عشوائي ──
  app.get('/api/hadith/daily', (_req: Request, res: Response) => {
    const arr = Array.from(hadiths.values());
    const day = Math.floor(Date.now() / 86400000);
    const h = arr.length ? arr[day % arr.length] : null;
    const term = HADITH_TERMS[day % HADITH_TERMS.length];
    res.json({ success: true, hadith: h ? { ...h, gradeInfo: gradeMeta(h.gradeKey) } : null, term });
  });
  app.get('/api/hadith/random', (_req: Request, res: Response): any => {
    const arr = Array.from(hadiths.values());
    if (!arr.length) return res.json({ success: true, hadith: null });
    const h = arr[Math.floor(Math.random() * arr.length)];
    res.json({ success: true, hadith: { ...h, gradeInfo: gradeMeta(h.gradeKey) } });
  });

  // ── مجموعات المستخدم (محفوظات) ──
  app.get('/api/hadith/collection', auth, (req: any, res: Response) => {
    const ids = Array.from(collections.get(req.userId) || []);
    res.json({ success: true, hadiths: ids.map(id => hadiths.get(id)).filter(Boolean).map(h => lightHadith(h!)) });
  });
  app.post('/api/hadith/collection/:id', auth, (req: any, res: Response): any => {
    if (!hadiths.has(req.params.id)) return res.status(404).json({ success: false });
    const set = collections.get(req.userId) || new Set<string>();
    set.has(req.params.id) ? set.delete(req.params.id) : set.add(req.params.id);
    collections.set(req.userId, set);
    persistCollection(req.userId);
    res.json({ success: true, saved: set.has(req.params.id) });
  });

  // ── الأدمن ──
  app.post('/api/hadith/hadiths', adminAuth, (req: any, res: Response): any => {
    const b = req.body || {};
    if (!b.id || !b.text) return res.status(400).json({ success: false, error: 'id و text مطلوبان' });
    const h: Hadith = {
      id: String(b.id), text: String(b.text), attribution: String(b.attribution || ''),
      grade: String(b.grade || ''), gradeKey: b.gradeKey || 'unknown',
      explanation: b.explanation, reference: b.reference, benefits: b.benefits, wordsMeanings: b.wordsMeanings,
      category: b.category, bookId: b.bookId, tags: Array.isArray(b.tags) ? b.tags : [], source: b.source || 'curated',
    };
    hadiths.set(h.id, h); persistHadith(h);
    res.json({ success: true, hadith: h });
  });
  app.delete('/api/hadith/hadiths/:id', adminAuth, (req: any, res: Response): any => {
    if (!hadiths.has(req.params.id)) return res.status(404).json({ success: false });
    hadiths.delete(req.params.id);
    if (deps.isDbReady()) deps.getDb().collection('hadiths').deleteOne({ id: req.params.id }).catch(() => {});
    res.json({ success: true });
  });

  console.log('📜 Hadith routes registered (/api/hadith/*)');
}
