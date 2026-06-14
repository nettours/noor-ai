// ═══════════════════════════════════════════════════════════════
// مُستورِد أحاديث من «الموسوعة الحديثية» (HadeethEnc.com) — API عام
// لكل حديث: نصّ + تخريج + حكم + شرح + فوائد + معاني كلمات + مرجع.
// المخرَج: backend/src/hadith-hadeeths.generated.ts (HADEETH_HADEETHS)
// التشغيل:  npx tsx scripts/parse-hadeethenc.ts [perCategory]
// ═══════════════════════════════════════════════════════════════
import { writeFileSync } from 'fs';
import { join } from 'path';
import { HADITH_CATEGORIES } from '../src/hadith-data';

const API = 'https://hadeethenc.com/api/v1';
const PER_CAT = parseInt(process.argv[2] || '60', 10);   // سقف لكل قسم (دفعة أولى)
const LANG = 'ar';

type GradeKey = 'sahih' | 'hasan' | 'daif' | 'mawdu' | 'unknown';
function gradeKey(g: string): GradeKey {
  const s = g || '';
  if (s.includes('موضوع')) return 'mawdu';
  if (s.includes('ضعيف')) return 'daif';
  if (s.includes('حسن')) return 'hasan';
  if (s.includes('صحيح')) return 'sahih';
  return 'unknown';
}
function bookId(attr: string): string | undefined {
  const a = attr || '';
  if (a.includes('البخاري') && a.includes('مسلم')) return 'bukhari'; // متّفق عليه → ننسبه للبخاري
  if (a.includes('البخاري')) return 'bukhari';
  if (a.includes('مسلم')) return 'muslim';
  if (a.includes('أبو داود') || a.includes('أبي داود')) return 'abudawud';
  if (a.includes('الترمذي')) return 'tirmidhi';
  if (a.includes('النسائي')) return 'nasai';
  if (a.includes('ابن ماجه')) return 'ibnmajah';
  if (a.includes('مالك') || a.includes('الموطأ')) return 'malik';
  if (a.includes('أحمد')) return 'ahmed';
  if (a.includes('الدارمي')) return 'darimi';
  return undefined;
}
const j = (u: string) => fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(r => r.json());

// تجمّع وعود بحدّ تزامن
async function pool<T, R>(items: T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = []; let i = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx]); }
  });
  await Promise.all(workers);
  return out;
}

async function listIds(encId: number): Promise<string[]> {
  const ids: string[] = [];
  for (let page = 1; page <= 250 && ids.length < PER_CAT; page++) {
    const r = await j(`${API}/hadeeths/list/?language=${LANG}&category_id=${encId}&page=${page}&per_page=30`).catch(() => null);
    const data = r?.data || [];
    if (!data.length) break;
    for (const x of data) ids.push(String(x.id));
  }
  return ids.slice(0, PER_CAT);
}

async function main() {
  const all: any[] = [];
  const seen = new Set<string>();
  for (const cat of HADITH_CATEGORIES) {
    if (!cat.encId) continue;
    process.stdout.write(`⏬ ${cat.name} ... `);
    const ids = (await listIds(cat.encId)).filter(id => !seen.has(id));
    ids.forEach(id => seen.add(id));
    const got = await pool(ids, 8, async (id) => {
      try {
        const d = await j(`${API}/hadeeths/one/?language=${LANG}&id=${id}`);
        if (!d?.hadeeth) return null;
        const attribution = String(d.attribution || '').trim();
        return {
          id: 'he_' + id,
          text: String(d.hadeeth).trim(),
          attribution,
          grade: String(d.grade || '').trim(),
          gradeKey: gradeKey(String(d.grade || '')),
          explanation: d.explanation ? String(d.explanation).trim() : undefined,
          reference: d.reference ? String(d.reference).trim().slice(0, 400) : undefined,
          benefits: Array.isArray(d.hints) ? d.hints.filter(Boolean) : undefined,
          wordsMeanings: Array.isArray(d.words_meanings)
            ? d.words_meanings.map((w: any) => ({ word: String(w.word || ''), meaning: String(w.meaning || '') })).filter((w: any) => w.word)
            : undefined,
          category: cat.id,
          bookId: bookId(attribution),
          tags: String(d.title || '').split(/\s+/).filter((w: string) => w.length >= 3).slice(0, 6),
          source: 'hadeethenc',
        };
      } catch { return null; }
    });
    const ok = got.filter(Boolean);
    all.push(...ok);
    console.log(`${ok.length} حديثاً`);
  }

  const total = all.length;
  const byGrade = all.reduce((m: any, h: any) => { m[h.gradeKey] = (m[h.gradeKey] || 0) + 1; return m; }, {});
  console.log(`✅ الإجمالي: ${total} حديثاً | الأحكام:`, byGrade);

  // يُكتب JSON (لا TS) ليُحمّل وقت التشغيل بـ fs دون أن يُبطئ tsc على ملف ضخم.
  writeFileSync(join(__dirname, '..', 'src', 'hadith-hadeeths.generated.json'), JSON.stringify(all), 'utf8');
  console.log('✅ كُتب: src/hadith-hadeeths.generated.json');
}
main().catch(e => { console.error('🔥', e); process.exit(1); });
