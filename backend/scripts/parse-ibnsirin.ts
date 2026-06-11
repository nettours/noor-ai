// ═══════════════════════════════════════════════════════════════
// مُولّد بيانات: استخراج «تفسير الأحلام الكبير لابن سيرين» (ملك عام)
// المصدر: نصّ نظيف على GitHub (مستودع Msr7799/Tafseer-Ala7lam)
// المخرَج: backend/src/dreams-ibnsirin.generated.ts
//   يحوّل الكتاب إلى رموز (أبواب) × تفاسير (مداخل «ومن رأى») منسوبة لابن سيرين.
// التشغيل:  npx tsx scripts/parse-ibnsirin.ts
// ───────────────────────────────────────────────────────────────
// ملاحظة: كل تفسير يُنسب لـ ابن سيرين (sourceId: ibn_sirin) مع التنبيه القائم
// في الواجهة أن المنسوب إليه اجتهادٌ مشهورٌ لا قطعيّ.
// ═══════════════════════════════════════════════════════════════
import { writeFileSync } from 'fs';
import { join } from 'path';

const SRC = 'https://raw.githubusercontent.com/Msr7799/Tafseer-Ala7lam/HEAD/public/Tafseer_AlAhlam_AlKabeer_BnSereen/Tafseer_AlAhlam_AlKabeer_BnSereen_djvu.txt';

// ── تنظيف النص ──
function clean(s: string): string {
  return s
    .replace(/\r/g, '')
    .replace(/ـ/g, '')                 // تطويل
    .replace(/ک/g, 'ك')                // كاف فارسية → عربية
    .replace(/ی/g, 'ي')                // ياء فارسية → عربية
    .replace(/يٰ/g, 'ي')
    .replace(/آنه/g, 'أنه').replace(/آن /g, 'أن ')
    .replace(/رويا/g, 'رؤيا')
    .replace(/القرأن/g, 'القرآن')
    .replace(/تعالي(?=\s|$|[.،)])/g, 'تعالى')   // OCR: تعالي → تعالى (آمن)
    .replace(/[A-Za-z]+/g, ' ')             // إزالة حروف لاتينية (ضجيج OCR/أرقام صفحات)
    .replace(/[0-9٠-٩]+/g, ' ')             // إزالة أرقام (أرقام صفحات)
    .replace(/[«»"”“]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function normalizeAr(s: string): string {
  return clean(s).replace(/[ً-ْ]/g, '').replace(/[إأآا]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي');
}

// ── تصنيف تقريبي حسب كلمات العنوان ──
const CAT_HINTS: { cat: string; icon: string; color: string; words: string[] }[] = [
  { cat: 'animals', icon: '🐾', color: '#F59E0B', words: ['حيوان', 'سباع', 'وحوش', 'طير', 'دواب', 'بهائم', 'هوام', 'حشرات', 'أسد', 'ذئب', 'كلب', 'حية', 'ثعبان', 'خيل', 'جمل', 'بقر', 'غنم', 'سمك', 'نحل', 'نمل'] },
  { cat: 'worship', icon: '🕌', color: '#34D399', words: ['صلاة', 'صلوة', 'أذان', 'وضوء', 'حج', 'صوم', 'زكاة', 'قرآن', 'مسجد', 'كعبة', 'جنة', 'نار', 'ملائكة', 'أنبياء', 'نبي', 'دعاء', 'تسبيح', 'طهارة', 'غسل'] },
  { cat: 'nature', icon: '🌿', color: '#10B981', words: ['شمس', 'قمر', 'نجوم', 'سماء', 'مطر', 'سحاب', 'ريح', 'ماء', 'بحر', 'نهر', 'أنهار', 'جبل', 'جبال', 'شجر', 'نبات', 'ثمار', 'فواكه', 'زرع', 'نار', 'برق', 'رعد', 'ثلج', 'أرض'] },
  { cat: 'people', icon: '👤', color: '#EC4899', words: ['رجل', 'امرأة', 'نساء', 'ميت', 'موت', 'أطفال', 'ولد', 'زواج', 'نكاح', 'سلطان', 'ملك', 'أنبياء', 'صحابة'] },
  { cat: 'body', icon: '🧍', color: '#F87171', words: ['جسد', 'رأس', 'شعر', 'عين', 'أسنان', 'يد', 'رجل', 'بطن', 'دم', 'لحم', 'وجه', 'أعضاء'] },
  { cat: 'objects', icon: '🔑', color: '#FB923C', words: ['ثياب', 'لباس', 'حلي', 'ذهب', 'فضة', 'سلاح', 'سيف', 'كتاب', 'مال', 'سفينة', 'بيت', 'دار', 'أبواب', 'آنية', 'فرش'] },
  { cat: 'actions', icon: '🏃', color: '#A855F7', words: ['طيران', 'سقوط', 'سفر', 'مشي', 'ركوب', 'سباحة', 'قتل', 'بكاء', 'ضحك', 'أكل', 'شرب'] },
];
function classify(title: string): { cat: string; icon: string; color: string } {
  const n = normalizeAr(title);
  for (const h of CAT_HINTS) if (h.words.some(w => n.includes(normalizeAr(w)))) return { cat: h.cat, icon: h.icon, color: h.color };
  return { cat: 'states', icon: '💤', color: '#A78BFA' };
}

async function main() {
  console.log('⏬ تنزيل نصّ ابن سيرين...');
  const raw = await fetch(SRC, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(r => r.text());
  console.log(`   الحجم: ${raw.length} حرف`);

  const lines = raw.split('\n');
  // عنوان الباب: سطرٌ يحوي «الباب ... :» ثم العنوان، أو «فصل في رؤيا ...»
  // عناوين الأبواب تبدأ بـ «الباب» في أوّل السطر، ثم «: [في] رؤيا <الموضوع>»
  const chapterRe = /^\s*الباب\s+[^:\n]{1,30}:\s*(.+)$/;
  const chapters: { title: string; body: string }[] = [];
  let cur: { title: string; body: string } | null = null;
  for (const line of lines) {
    const m = line.match(chapterRe);
    if (m) {
      if (cur) chapters.push(cur);
      cur = { title: clean(m[1]).slice(0, 80), body: '' };
    } else if (cur) {
      cur.body += line + '\n';
    }
  }
  if (cur) chapters.push(cur);
  console.log(`   أبواب مكتشفة: ${chapters.length}`);

  // مُقسّم التفاسير: على علامة «(ومن رأى)» / «ومن رأى» / «من رأى»
  const splitRe = /\(?\s*و?\s*من\s+رأ[ىيی]\s*\)?/g;

  const symbols: any[] = [];
  let totalInterp = 0;
  let idx = 0;
  const seen = new Set<string>();
  for (const ch of chapters) {
    // استخراج الموضوع: «[في] [تأويل] رؤيا <الموضوع>»
    const titleClean = ch.title
      .replace(/^في\s+/, '')
      .replace(/^تأويل\s+/, '')
      .replace(/^(رؤيا|رؤية)\s+/, '')
      .replace(/\s+/g, ' ').trim().slice(0, 60);
    if (titleClean.length < 2) continue;
    const key = normalizeAr(titleClean);
    if (seen.has(key)) continue;          // تفادي الأبواب المكرّرة
    seen.add(key);

    const parts = clean(ch.body).split(splitRe).map(p => p.trim()).filter(Boolean);
    const interpTexts = parts
      .map(p => p.replace(/\s+/g, ' ').trim())
      .filter(p => p.length >= 25 && p.length <= 600);

    if (interpTexts.length === 0) continue;
    const interpretations = interpTexts.slice(0, 220).map(t => ({
      text: 'من رأى ' + t.replace(/^[\s،:.-]+/, ''),
      sourceId: 'ibn_sirin',
      context: '',
      tradition: 'تراثي' as const,
    }));
    totalInterp += interpretations.length;

    const { cat, icon, color } = classify(titleClean);
    const summary = `من تأويلات رؤيا «${titleClean}» كما وردت في «تفسير الأحلام الكبير» المنسوب للإمام ابن سيرين.`;

    symbols.push({
      id: 'is_' + String(++idx).padStart(3, '0'),
      name: titleClean.slice(0, 60),
      category: cat, icon, color,
      tags: Array.from(new Set(normalizeAr(titleClean).split(' ').filter(w => w.length >= 3))).slice(0, 6),
      summary,
      interpretations,
      related: [],
    });
  }

  console.log(`   رموز ناتجة: ${symbols.length} | إجمالي التفاسير: ${totalInterp}`);

  const header = `// ⚠️ ملف مُولّد آلياً — لا تُعدّله يدوياً. أعد توليده بـ: npx tsx scripts/parse-ibnsirin.ts
// المصدر: «تفسير الأحلام الكبير» المنسوب لابن سيرين (ملك عام). كل تفسير sourceId: 'ibn_sirin'.
import type { DreamSymbol } from './dreams-data';
export const IBN_SIRIN_SYMBOLS: DreamSymbol[] = ${JSON.stringify(symbols, null, 1)};
`;
  const out = join(__dirname, '..', 'src', 'dreams-ibnsirin.generated.ts');
  writeFileSync(out, header, 'utf8');
  console.log(`✅ كُتب الملف: ${out}`);
}

main().catch(e => { console.error('🔥', e); process.exit(1); });
