// ═══════════════════════════════════════════════════════════════
// مُولّد بيانات: استخراج كتب تعبير الرؤيا الكلاسيكية (ملك عام)
// من نصوص نظيفة على GitHub (مستودع عام Msr7799/Tafseer-Ala7lam)
// المخرَج: backend/src/dreams-classical.generated.ts (CLASSICAL_SYMBOLS)
// التشغيل:  npx tsx scripts/parse-books.ts
// ───────────────────────────────────────────────────────────────
// كل تفسير يُنسب لمصدره (ابن سيرين / ابن قتيبة) مع التنبيه القائم في
// الواجهة أن المنسوب اجتهادٌ مشهورٌ لا قطعيّ، وأن النصّ منقولٌ قد يقع فيه خطأ نسخ.
// ═══════════════════════════════════════════════════════════════
import { writeFileSync } from 'fs';
import { join } from 'path';

const RAW = 'https://raw.githubusercontent.com/Msr7799/Tafseer-Ala7lam/HEAD';

interface BookCfg {
  sourceId: string;
  idPrefix: string;
  url: string;
  headerRe: RegExp;          // يلتقط عنوان الباب (المجموعة 1 = الموضوع)
  titleStrip: RegExp[];      // أنماط تُزال من بداية العنوان
}

const BOOKS: BookCfg[] = [
  {
    sourceId: 'ibn_sirin', idPrefix: 'is',
    url: `${RAW}/public/Tafseer_AlAhlam_AlKabeer_BnSereen/Tafseer_AlAhlam_AlKabeer_BnSereen_djvu.txt`,
    headerRe: /^\s*الباب\s+[^:\n]{1,30}:\s*(.+)$/,
    titleStrip: [/^في\s+/, /^تأويل\s+/, /^(رؤيا|رؤية)\s+/],
  },
  {
    sourceId: 'ibn_qutaybah', idPrefix: 'iq',
    url: `${RAW}/public/Tabeer_Al_Roya/Tabeer_Al_Roya_Le_Ibn_Qutaybah_Al_Dinari_djvu.txt`,
    headerRe: /^\s*باب\s+([^:\n]{2,40})/,
    titleStrip: [/^تأويل\s+/, /^(معرفة|تعبير)\s+/, /^(رؤيا|رؤية)\s+/],
  },
];

function clean(s: string): string {
  return s
    .replace(/\r/g, '')
    .replace(/ـ/g, '')
    .replace(/ک/g, 'ك').replace(/ی/g, 'ي').replace(/ژ/g, 'ز').replace(/چ/g, 'ج').replace(/پ/g, 'ب').replace(/گ/g, 'ك')
    .replace(/يٰ/g, 'ي')
    .replace(/آنه/g, 'أنه').replace(/آن /g, 'أن ')
    .replace(/رويا/g, 'رؤيا').replace(/القرأن/g, 'القرآن').replace(/معرقة/g, 'معرفة')
    .replace(/تعالي(?=\s|$|[.،)])/g, 'تعالى')
    .replace(/[A-Za-z]+/g, ' ')
    .replace(/[0-9٠-٩۰-۹]+/g, ' ')
    .replace(/[«»"”“]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
}
function normalizeAr(s: string): string {
  return clean(s).replace(/[ً-ْ]/g, '').replace(/[إأآا]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي');
}

const CAT_HINTS: { cat: string; icon: string; color: string; words: string[] }[] = [
  { cat: 'animals', icon: '🐾', color: '#F59E0B', words: ['حيوان', 'سباع', 'وحوش', 'وحش', 'طير', 'طيور', 'دواب', 'بهائم', 'هوام', 'حشرات', 'أسد', 'ذئب', 'كلب', 'حية', 'حيات', 'ثعبان', 'خيل', 'جمل', 'ابل', 'بقر', 'غنم', 'ضأن', 'معز', 'سمك', 'نحل', 'نمل', 'عقارب', 'فيل', 'بغال', 'حمير'] },
  { cat: 'worship', icon: '🕌', color: '#34D399', words: ['صلاة', 'صلوة', 'أذان', 'وضوء', 'حج', 'صوم', 'زكاة', 'صدقة', 'قرآن', 'سور', 'مسجد', 'كعبة', 'جنة', 'جهنم', 'ملائكة', 'أنبياء', 'نبي', 'دعاء', 'تسبيح', 'طهارة', 'غسل', 'إسلام', 'جهاد', 'قيامة', 'حساب', 'صحابة'] },
  { cat: 'nature', icon: '🌿', color: '#10B981', words: ['شمس', 'قمر', 'نجوم', 'سماء', 'مطر', 'سحاب', 'ريح', 'رياح', 'ماء', 'مياه', 'بحر', 'نهر', 'أنهار', 'آبار', 'جبل', 'جبال', 'شجر', 'نبات', 'ثمار', 'فواكه', 'حبوب', 'زرع', 'برق', 'رعد', 'ثلج', 'أرض', 'هواء'] },
  { cat: 'people', icon: '👤', color: '#EC4899', words: ['رجل', 'امرأة', 'نساء', 'ميت', 'موت', 'موات', 'مقابر', 'أطفال', 'ولد', 'زواج', 'نكاح', 'سلطان', 'سلاطين', 'ملوك', 'ملك', 'ناس', 'شيخ', 'شاب', 'فتاة', 'عجوز'] },
  { cat: 'body', icon: '🧍', color: '#F87171', words: ['جسد', 'رأس', 'شعر', 'عين', 'أسنان', 'يد', 'بطن', 'دم', 'لحم', 'وجه', 'أعضاء', 'اختلاف الإنسان', 'أمراض', 'أوجاع', 'عاهات'] },
  { cat: 'objects', icon: '🔑', color: '#FB923C', words: ['ثياب', 'كساوي', 'لباس', 'حلي', 'ذهب', 'فضة', 'جواهر', 'سلاح', 'أسلحة', 'سيف', 'كتاب', 'مال', 'سفينة', 'بيت', 'دار', 'أبواب', 'آنية', 'فرش', 'أطعمة', 'حلوى', 'صناع', 'حرف', 'أدوات', 'صيد'] },
  { cat: 'actions', icon: '🏃', color: '#A855F7', words: ['طيران', 'سقوط', 'سفر', 'مشي', 'ركوب', 'سباحة', 'قتل', 'حرب', 'بكاء', 'ضحك', 'أكل', 'شرب', 'معالجات'] },
];
function classify(title: string): { cat: string; icon: string; color: string } {
  const n = normalizeAr(title);
  for (const h of CAT_HINTS) if (h.words.some(w => n.includes(normalizeAr(w)))) return { cat: h.cat, icon: h.icon, color: h.color };
  return { cat: 'states', icon: '💤', color: '#A78BFA' };
}

const splitRe = /\(?\s*و?\s*من\s+رأ[ىيی]\s*\)?/g;

async function parseBook(cfg: BookCfg) {
  const raw = await fetch(cfg.url, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(r => r.text());
  const lines = raw.split('\n');
  const chapters: { title: string; body: string }[] = [];
  let cur: { title: string; body: string } | null = null;
  for (const line of lines) {
    const m = line.match(cfg.headerRe);
    if (m) {
      if (cur) chapters.push(cur);
      cur = { title: clean(m[1]).slice(0, 80), body: '' };
    } else if (cur) cur.body += line + '\n';
  }
  if (cur) chapters.push(cur);

  const out: any[] = [];
  const seen = new Set<string>();
  let idx = 0;
  for (const ch of chapters) {
    let title = ch.title;
    for (const re of cfg.titleStrip) title = title.replace(re, '');
    title = title.replace(/\s+/g, ' ').trim().slice(0, 60);
    if (title.length < 2) continue;
    const key = normalizeAr(title);
    if (seen.has(key)) continue;
    seen.add(key);

    const interpTexts = clean(ch.body).split(splitRe)
      .map(p => p.replace(/\s+/g, ' ').trim())
      .filter(p => p.length >= 25 && p.length <= 600);
    if (interpTexts.length === 0) continue;

    const interpretations = interpTexts.slice(0, 220).map(t => ({
      text: 'من رأى ' + t.replace(/^[\s،:.-]+/, ''),
      sourceId: cfg.sourceId, context: '', tradition: 'تراثي' as const,
    }));
    const { cat, icon, color } = classify(title);
    const srcName = cfg.sourceId === 'ibn_sirin' ? 'الإمام ابن سيرين' : 'الإمام ابن قتيبة الدينوري';
    out.push({
      id: cfg.idPrefix + '_' + String(++idx).padStart(3, '0'),
      name: title.slice(0, 60), category: cat, icon, color,
      tags: Array.from(new Set(normalizeAr(title).split(' ').filter(w => w.length >= 3))).slice(0, 6),
      summary: `من تأويلات رؤيا «${title}» كما وردت في كتاب ${srcName} (ملك عام).`,
      interpretations, related: [],
    });
  }
  return out;
}

async function main() {
  const all: any[] = [];
  for (const b of BOOKS) {
    console.log(`⏬ ${b.sourceId}...`);
    const syms = await parseBook(b);
    const interps = syms.reduce((a, s) => a + s.interpretations.length, 0);
    console.log(`   ${syms.length} رمزاً، ${interps} تفسيراً`);
    all.push(...syms);
  }
  const totalI = all.reduce((a, s) => a + s.interpretations.length, 0);
  console.log(`✅ الإجمالي: ${all.length} رمزاً، ${totalI} تفسيراً`);
  const header = `// ⚠️ ملف مُولّد آلياً — لا تُعدّله يدوياً. أعد توليده بـ: npx tsx scripts/parse-books.ts
// المصدر: كتب تعبير الرؤيا الكلاسيكية (ملك عام). كل تفسير منسوب لمصدره عبر sourceId.
import type { DreamSymbol } from './dreams-data';
export const CLASSICAL_SYMBOLS: DreamSymbol[] = ${JSON.stringify(all, null, 1)};
`;
  writeFileSync(join(__dirname, '..', 'src', 'dreams-classical.generated.ts'), header, 'utf8');
  console.log('✅ كُتب: src/dreams-classical.generated.ts');
}
main().catch(e => { console.error('🔥', e); process.exit(1); });
