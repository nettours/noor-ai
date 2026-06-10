// ═══════════════════════════════════════════════════════════════
// موسوعة تفسير الأحلام — وحدة الـ Backend
// مخزن بالذاكرة (كاش) + حفظ دائم في MongoDB + بذرة أولية + REST APIs.
// يتبع نفس نمط server.ts: تحميل عند الإقلاع، حفظ عند التغيير.
// ═══════════════════════════════════════════════════════════════
import type { Express, Request, Response } from 'express';
import {
  DREAM_SYMBOLS, DREAM_SOURCES, DREAM_CATEGORIES,
  type DreamSymbol, type DreamSource, type DreamCategory,
} from './dreams-data';

// ── أنواع خاصة بالـ runtime ──
interface DreamLog {
  id: string;
  userId: string;
  text: string;
  symbols: string[];          // معرّفات الرموز المرتبطة
  emotions: string[];         // المشاعر
  socialState: string;        // الحالة الاجتماعية
  timeOfDream: string;        // الوقت التقريبي
  isRecurring: boolean;       // متكرر؟
  classification: string;     // نوع الحلم بعد التصنيف
  createdAt: string;
}

interface Deps {
  auth: (req: any, res: Response, next: any) => void;
  adminAuth: (req: any, res: Response, next: any) => void;
  getDb: () => any;
  isDbReady: () => boolean;
}

// ═══ المخزن بالذاكرة ═══
const symbols = new Map<string, DreamSymbol>();
const sources = new Map<string, DreamSource>();
let categories: DreamCategory[] = [...DREAM_CATEGORIES];
const views = new Map<string, number>();              // symbolId -> عدد المشاهدات (شيوع)
const logs = new Map<string, DreamLog[]>();           // userId -> سجل الأحلام
const favorites = new Map<string, Set<string>>();     // userId -> معرّفات الرموز المفضّلة

let deps: Deps;

// ── تطبيع عربي للبحث (إزالة التشكيل + توحيد الألف/الهمزة/التاء المربوطة) ──
function normalizeAr(s: string): string {
  return (s || '')
    .replace(/[ً-ْٰـ]/g, '')  // تشكيل + تطويل
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase()
    .trim();
}

// ═══ الحفظ الدائم ═══
async function persistSymbol(sym: DreamSymbol) {
  if (!deps.isDbReady()) return;
  try { await deps.getDb().collection('dream_symbols').updateOne({ id: sym.id }, { $set: sym }, { upsert: true }); }
  catch (e) { console.error('persistSymbol:', e); }
}
async function persistSource(src: DreamSource) {
  if (!deps.isDbReady()) return;
  try { await deps.getDb().collection('dream_sources').updateOne({ id: src.id }, { $set: src }, { upsert: true }); }
  catch (e) { console.error('persistSource:', e); }
}
async function persistLog(log: DreamLog) {
  if (!deps.isDbReady()) return;
  try { await deps.getDb().collection('dream_user_logs').updateOne({ id: log.id }, { $set: log }, { upsert: true }); }
  catch (e) { console.error('persistLog:', e); }
}
async function persistFavorites(userId: string) {
  if (!deps.isDbReady()) return;
  try {
    const ids = Array.from(favorites.get(userId) || []);
    await deps.getDb().collection('dream_favorites').updateOne({ userId }, { $set: { userId, ids } }, { upsert: true });
  } catch (e) { console.error('persistFavorites:', e); }
}

// ═══ التهيئة: تحميل من القاعدة أو بذر القيم الأولية ═══
export async function initDreams(db: any) {
  // المصادر
  try {
    const dbSources = await db.collection('dream_sources').find({}).toArray();
    if (dbSources.length) {
      for (const s of dbSources) { const { _id, ...src } = s; sources.set(src.id, src); }
    } else {
      for (const s of DREAM_SOURCES) { sources.set(s.id, s); await persistSource(s); }
    }
  } catch (e) { console.error('initDreams sources:', e); for (const s of DREAM_SOURCES) sources.set(s.id, s); }

  // الرموز
  try {
    const dbSymbols = await db.collection('dream_symbols').find({}).toArray();
    if (dbSymbols.length) {
      for (const s of dbSymbols) { const { _id, ...sym } = s; symbols.set(sym.id, sym); }
    } else {
      for (const s of DREAM_SYMBOLS) { symbols.set(s.id, s); await persistSymbol(s); }
    }
  } catch (e) { console.error('initDreams symbols:', e); for (const s of DREAM_SYMBOLS) symbols.set(s.id, s); }

  // سجلات المستخدمين + المفضّلة
  try {
    const dbLogs = await db.collection('dream_user_logs').find({}).toArray();
    for (const l of dbLogs) { const { _id, ...log } = l; const list = logs.get(log.userId) || []; list.push(log as DreamLog); logs.set(log.userId, list); }
    const dbFav = await db.collection('dream_favorites').find({}).toArray();
    for (const f of dbFav) favorites.set(f.userId, new Set(f.ids || []));
  } catch (e) { console.error('initDreams logs/fav:', e); }

  console.log(`💤 Dreams KB: ${symbols.size} رمز، ${sources.size} مصدر، ${categories.length} تصنيف`);
}

// إن لم تتوفّر قاعدة بيانات: ابذر القيم في الذاكرة فقط حتى يعمل القسم.
export function seedDreamsInMemory() {
  if (symbols.size === 0) for (const s of DREAM_SYMBOLS) symbols.set(s.id, s);
  if (sources.size === 0) for (const s of DREAM_SOURCES) sources.set(s.id, s);
  console.log(`💤 Dreams KB (ذاكرة فقط): ${symbols.size} رمز`);
}

// ── مساعدات العرض ──
function lightSymbol(s: DreamSymbol) {
  return {
    id: s.id, name: s.name, category: s.category, icon: s.icon, color: s.color,
    tags: s.tags, summary: s.summary,
    interpretationsCount: s.interpretations.length,
    views: views.get(s.id) || 0,
  };
}
function enrichSymbol(s: DreamSymbol) {
  return {
    ...s,
    views: views.get(s.id) || 0,
    interpretations: s.interpretations.map(i => ({
      ...i,
      source: sources.get(i.sourceId) || { id: i.sourceId, name: i.sourceId, author: '—', confidence: 'اجتهادية', note: '' },
    })),
    relatedSymbols: (s.related || [])
      .map(rid => symbols.get(rid))
      .filter(Boolean)
      .map(r => ({ id: r!.id, name: r!.name, icon: r!.icon, color: r!.color, summary: r!.summary })),
    category_info: categories.find(c => c.id === s.category) || null,
  };
}

// ── تصنيف محلي بسيط لنصّ حلم (بلا ذكاء، مطابقة موثوقة) ──
function classifyDream(text: string, pickedSymbols: string[], emotions: string[]) {
  const norm = normalizeAr(text);
  const matched: DreamSymbol[] = [];
  for (const s of symbols.values()) {
    const hit =
      pickedSymbols.includes(s.id) ||
      normalizeAr(s.name).split(/\s+/).some(w => w && norm.includes(w)) ||
      (s.tags || []).some(t => norm.includes(normalizeAr(t)));
    if (hit) matched.push(s);
  }
  const emotionWords = ['خوف', 'قلق', 'حزن', 'بكاء', 'فرح', 'سعادة', 'غضب', 'رعب'];
  const hasEmotion = emotions.length > 0 || emotionWords.some(e => norm.includes(normalizeAr(e)));

  let classification: string;
  if (matched.length >= 1) classification = 'حلم مرتبط برمز';
  else if (hasEmotion) classification = 'حلم متعلق بحالة نفسية';
  else if (norm.length < 25) classification = 'حلم يحتاج إلى مزيد من التفاصيل';
  else classification = 'حلم ذو معنى رمزي';

  return {
    classification,
    matchedSymbols: matched.slice(0, 8).map(lightSymbol),
    note: 'هذا تصنيفٌ آليٌّ تقريبيّ يعتمد على مطابقة الرموز الموثّقة فقط، وليس فتوى ولا تفسيراً قطعياً.',
  };
}

// ═══════════════════════════════════════════════════════════════
// تسجيل المسارات
// ═══════════════════════════════════════════════════════════════
export function registerDreamRoutes(app: Express, d: Deps) {
  deps = d;
  const { auth, adminAuth } = d;

  // البيانات الوصفية: التصنيفات + المصادر + التنبيه
  app.get('/api/dreams/meta', (_req: Request, res: Response) => {
    res.json({
      success: true,
      categories: categories.map(c => ({ ...c, count: Array.from(symbols.values()).filter(s => s.category === c.id).length })),
      sources: Array.from(sources.values()),
      total: symbols.size,
      disclaimer: 'تفسير الرؤى اجتهادٌ ظنّي مبنيٌّ على مصادر التعبير، وليس يقيناً قطعياً. والرؤيا الصادقة جزءٌ من النبوّة، لكن تأويلها يخطئ ويصيب.',
    });
  });

  // قائمة الرموز + بحث + ترشيح
  app.get('/api/dreams/symbols', (req: Request, res: Response) => {
    const q = normalizeAr(String(req.query.q || ''));
    const category = String(req.query.category || '');
    const tag = normalizeAr(String(req.query.tag || ''));
    let list = Array.from(symbols.values());
    if (category) list = list.filter(s => s.category === category);
    if (tag) list = list.filter(s => (s.tags || []).some(t => normalizeAr(t).includes(tag)));
    if (q) {
      list = list.filter(s =>
        normalizeAr(s.name).includes(q) ||
        normalizeAr(s.summary).includes(q) ||
        (s.tags || []).some(t => normalizeAr(t).includes(q) || q.includes(normalizeAr(t)))
      );
    }
    list.sort((a, b) => (views.get(b.id) || 0) - (views.get(a.id) || 0));
    res.json({ success: true, count: list.length, symbols: list.map(lightSymbol) });
  });

  // الأكثر تداولاً
  app.get('/api/dreams/popular', (_req: Request, res: Response) => {
    const list = Array.from(symbols.values())
      .sort((a, b) => (views.get(b.id) || 0) - (views.get(a.id) || 0))
      .slice(0, 8);
    res.json({ success: true, symbols: list.map(lightSymbol) });
  });

  // تفاصيل رمز (يزيد عدّاد الشيوع)
  app.get('/api/dreams/symbols/:id', (req: Request, res: Response): any => {
    const s = symbols.get(req.params.id);
    if (!s) return res.status(404).json({ success: false, error: 'الرمز غير موجود' });
    views.set(s.id, (views.get(s.id) || 0) + 1);
    res.json({ success: true, symbol: enrichSymbol(s) });
  });

  // تصنيف حلم (محلي/موثوق، بلا ذكاء)
  app.post('/api/dreams/classify', (req: Request, res: Response) => {
    const { text, symbols: picked, emotions } = req.body || {};
    res.json({ success: true, ...classifyDream(String(text || ''), Array.isArray(picked) ? picked : [], Array.isArray(emotions) ? emotions : []) });
  });

  // ═══ سجل الأحلام الشخصي (محمي) ═══
  app.get('/api/dreams/logs', auth, (req: any, res: Response) => {
    const list = (logs.get(req.userId) || []).slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ success: true, logs: list });
  });

  app.post('/api/dreams/logs', auth, (req: any, res: Response): any => {
    const { text, symbols: syms, emotions, socialState, timeOfDream, isRecurring } = req.body || {};
    if (!text || !String(text).trim()) return res.status(400).json({ success: false, error: 'اكتب نصّ الحلم' });
    const cls = classifyDream(String(text), Array.isArray(syms) ? syms : [], Array.isArray(emotions) ? emotions : []);
    const log: DreamLog = {
      id: 'dlog_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      userId: req.userId,
      text: String(text).trim().slice(0, 4000),
      symbols: cls.matchedSymbols.map((m: any) => m.id),
      emotions: Array.isArray(emotions) ? emotions.slice(0, 10) : [],
      socialState: String(socialState || ''),
      timeOfDream: String(timeOfDream || ''),
      isRecurring: !!isRecurring,
      classification: cls.classification,
      createdAt: new Date().toISOString(),
    };
    const list = logs.get(req.userId) || [];
    list.push(log);
    logs.set(req.userId, list);
    persistLog(log);
    res.json({ success: true, log, classification: cls });
  });

  app.delete('/api/dreams/logs/:id', auth, (req: any, res: Response): any => {
    const list = logs.get(req.userId) || [];
    const idx = list.findIndex(l => l.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false });
    list.splice(idx, 1);
    logs.set(req.userId, list);
    if (deps.isDbReady()) deps.getDb().collection('dream_user_logs').deleteOne({ id: req.params.id, userId: req.userId }).catch(() => {});
    res.json({ success: true });
  });

  // ═══ المفضّلة (محمي) ═══
  app.get('/api/dreams/favorites', auth, (req: any, res: Response) => {
    const ids = Array.from(favorites.get(req.userId) || []);
    const list = ids.map(id => symbols.get(id)).filter(Boolean).map(s => lightSymbol(s!));
    res.json({ success: true, favorites: list });
  });

  app.post('/api/dreams/favorites/:symbolId', auth, (req: any, res: Response): any => {
    const sid = req.params.symbolId;
    if (!symbols.has(sid)) return res.status(404).json({ success: false, error: 'الرمز غير موجود' });
    const set = favorites.get(req.userId) || new Set<string>();
    if (set.has(sid)) set.delete(sid); else set.add(sid);
    favorites.set(req.userId, set);
    persistFavorites(req.userId);
    res.json({ success: true, favorited: set.has(sid) });
  });

  // ═══ الأدمن: إدارة الرموز والمصادر ═══
  app.post('/api/dreams/symbols', adminAuth, (req: any, res: Response): any => {
    const b = req.body || {};
    if (!b.id || !b.name) return res.status(400).json({ success: false, error: 'id و name مطلوبان' });
    const sym: DreamSymbol = {
      id: String(b.id), name: String(b.name), category: String(b.category || 'objects'),
      icon: String(b.icon || '💭'), color: String(b.color || '#A855F7'),
      tags: Array.isArray(b.tags) ? b.tags : [], summary: String(b.summary || ''),
      interpretations: Array.isArray(b.interpretations) ? b.interpretations : [],
      related: Array.isArray(b.related) ? b.related : [], notes: b.notes ? String(b.notes) : undefined,
    };
    symbols.set(sym.id, sym);
    persistSymbol(sym);
    res.json({ success: true, symbol: sym });
  });

  app.put('/api/dreams/symbols/:id', adminAuth, (req: any, res: Response): any => {
    const cur = symbols.get(req.params.id);
    if (!cur) return res.status(404).json({ success: false });
    const merged = { ...cur, ...req.body, id: cur.id } as DreamSymbol;
    symbols.set(cur.id, merged);
    persistSymbol(merged);
    res.json({ success: true, symbol: merged });
  });

  app.delete('/api/dreams/symbols/:id', adminAuth, (req: any, res: Response): any => {
    if (!symbols.has(req.params.id)) return res.status(404).json({ success: false });
    symbols.delete(req.params.id);
    if (deps.isDbReady()) deps.getDb().collection('dream_symbols').deleteOne({ id: req.params.id }).catch(() => {});
    res.json({ success: true });
  });

  app.post('/api/dreams/sources', adminAuth, (req: any, res: Response): any => {
    const b = req.body || {};
    if (!b.id || !b.name) return res.status(400).json({ success: false, error: 'id و name مطلوبان' });
    const src: DreamSource = {
      id: String(b.id), name: String(b.name), author: String(b.author || '—'),
      confidence: (b.confidence || 'اجتهادية'), note: String(b.note || ''),
    };
    sources.set(src.id, src);
    persistSource(src);
    res.json({ success: true, source: src });
  });

  console.log('💤 Dreams routes registered (/api/dreams/*)');
}
