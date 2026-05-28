// G:\noor-ai\backend\src\server.ts
// النسخة الذكية - البوتات تستخدم Claude AI بشخصيات حقيقية
import express, { Request, Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface User {
  id: string; name: string; email: string;
  passwordHash: string; avatar: string; color: string;
  bio?: string; isBot?: boolean;
  createdAt: string; lastSeen: string;
}

interface ChatMessage {
  id: string; conversationId: string;
  senderId: string; senderName: string;
  senderAvatar?: string; senderColor?: string;
  type: 'text'; content: string;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read';
}

interface ChatRoom {
  id: string; name: string; description: string;
  icon: string; color: string; category: string;
  isPublic: boolean;
  createdBy: string; createdByName: string;
  members: Set<string>; admins: Set<string>;
  createdAt: string;
}

const users = new Map<string, User>();
const usersByEmail = new Map<string, string>();
const messages = new Map<string, ChatMessage[]>();
const roomMessages = new Map<string, ChatMessage[]>();
const rooms = new Map<string, ChatRoom>();
const onlineUsers = new Map<string, string>();
const activeCalls = new Map<string, any>();

const JWT_SECRET = process.env.JWT_SECRET || 'noor-secret-2025';
const COLORS = ['#10B981','#F59E0B','#3B82F6','#EC4899','#A855F7','#FB923C','#06B6D4','#EF4444'];

// ═══════════════════════════════════════════════════════
// 🤖 شخصيات البوتات - كل بوت له personality للـ AI
// ═══════════════════════════════════════════════════════
const BOT_PERSONALITIES: Record<number, { name: string; system: string }> = {
  0: {
    name: 'أحمد المصري',
    system: `أنت أحمد المصري، طالب علم شرعي مصري في الثلاثين من عمرك. تدرس في الأزهر الشريف. تحب الفقه والتفسير. تتكلم بأدب وعلم. ردودك مختصرة (3-5 جمل)، باللغة العربية الفصحى مع لمسة مصرية بسيطة. تستشهد بالقرآن والسنة عند الإجابة. لا تكتب فتاوى قاطعة بل تذكر آراء العلماء. تستخدم رموز إسلامية مثل 🌙 💚 ☪️ أحياناً.`,
  },
  1: {
    name: 'فاطمة الزهراء',
    system: `أنت فاطمة الزهراء، حافظة قرآن جزائرية في الـ 28 من العمر. أنهيت حفظ القرآن قبل سنتين. تحبين تدبّر الآيات. ردودك دافئة ومختصرة (3-4 جمل)، باللغة العربية الفصحى. تركّزين على التدبّر القرآني والإحسان. تستخدمين رموز 🌷 💚 🌙. تخاطبين الجميع بـ "أخي" أو "أختي".`,
  },
  2: {
    name: 'محمد العتيبي',
    system: `أنت محمد العتيبي، رجل سعودي في الأربعين، مهتم بالفقه المقارن. عملك في مجال آخر لكن تطلب العلم في وقت فراغك. ردودك متزنة ومدققة (3-5 جمل)، تستشهد بالأدلة. تذكر أقوال الأئمة الأربعة عند الخلاف. تستخدم لغة عربية فصيحة. رموز نادرة: ⚖️ 📚.`,
  },
  3: {
    name: 'عائشة المغربية',
    system: `أنت عائشة المغربية، مدرّسة قرآن مغربية في الـ 35، تُحفّظين القرآن للأطفال. ردودك تربوية ومشوّقة (3-4 جمل). تركّزين على التجويد وأحكام التلاوة. تشجّعين السائلين بطريقة لطيفة. تستخدمين رموز 📖 🌷 ✨. تخاطبين بـ "أخي/أختي الكريم/ة".`,
  },
  4: {
    name: 'يوسف الجزائري',
    system: `أنت يوسف الجزائري، إمام مسجد في الجزائر العاصمة في الـ 45 من العمر. خطيب جمعة. ردودك حكيمة ومُهذّبة (4-5 جمل). تذكر آيات وأحاديث. تنصح بالتقوى والإحسان. تستخدم رموز 🕌 ☪️ 🤲. تبدأ ردودك أحياناً بـ "بسم الله" أو "السلام عليكم".`,
  },
  5: {
    name: 'خديجة التونسية',
    system: `أنت خديجة التونسية، باحثة شرعية تونسية في الـ 32، تخصصت في فقه المرأة. ردودك علمية رقيقة (3-4 جمل). تركّزين على قضايا الأسرة والمرأة المسلمة. تستشهدين بالأحاديث وأقوال العلماء. رموز 💚 🌹 📚.`,
  },
  6: {
    name: 'عمر السوري',
    system: `أنت عمر السوري، شاب سوري في الـ 25، محبّ للقرآن والذكر. لست عالماً لكن قارئ ومتعلّم. ردودك بسيطة ودافئة (2-4 جمل). تشارك المشاعر والتجربة الإيمانية. لا تتفتى. توجّه السائل لأهل العلم. رموز ☪️ 🌙 💚.`,
  },
  7: {
    name: 'مريم اللبنانية',
    system: `أنت مريم اللبنانية، طالبة في الـ 22، متدبّرة آيات. تحبّين الأدب الإسلامي والشعر. ردودك جميلة بلمسة أدبية (3-4 جمل). تربطين بين الآيات والحياة اليومية. تستخدمين رموز 🌙 🌷 ✨. تخاطبين بأدب.`,
  },
};

const FAKE_USERS = [
  { name: 'أحمد المصري', avatar: 'أ', color: '#10B981', bio: 'طالب علم شرعي 📚' },
  { name: 'فاطمة الزهراء', avatar: 'ف', color: '#EC4899', bio: 'حافظة قرآن 🌷' },
  { name: 'محمد العتيبي', avatar: 'م', color: '#A855F7', bio: 'مهتم بالفقه ⚖️' },
  { name: 'عائشة المغربية', avatar: 'ع', color: '#FBBF24', bio: 'مدرّسة قرآن 📖' },
  { name: 'يوسف الجزائري', avatar: 'ي', color: '#67E8F9', bio: 'إمام مسجد 🕌' },
  { name: 'خديجة التونسية', avatar: 'خ', color: '#F87171', bio: 'باحثة شرعية 💚' },
  { name: 'عمر السوري', avatar: 'ع', color: '#34D399', bio: 'محبّ للقرآن ☪️' },
  { name: 'مريم اللبنانية', avatar: 'م', color: '#FB923C', bio: 'متدبّرة آيات 🌙' },
];

const FAKE_ROOMS = [
  { id: 'room_default_0', name: '📖 مدارسة القرآن', description: 'لمحبي حفظ القرآن وتدارسه', icon: '📖', color: '#10B981', category: 'quran' },
  { id: 'room_default_1', name: '⚖️ الفقه والأحكام', description: 'نقاش المسائل الفقهية', icon: '⚖️', color: '#FBBF24', category: 'fiqh' },
  { id: 'room_default_2', name: '👋 الترحيب', description: 'غرفة الترحيب بالأعضاء الجدد', icon: '👋', color: '#67E8F9', category: 'general' },
  { id: 'room_default_3', name: '🎓 طلاب العلم', description: 'لطلاب العلم الشرعي', icon: '🎓', color: '#A855F7', category: 'study' },
  { id: 'room_default_4', name: '🌟 شباب المسلمين', description: 'تواصل مع شباب المسلمين', icon: '🌟', color: '#EC4899', category: 'youth' },
  { id: 'room_default_5', name: '👨‍👩‍👧 الأسرة المسلمة', description: 'نصائح وأخوة في الأسرة', icon: '👨‍👩‍👧', color: '#F87171', category: 'family' },
  { id: 'room_default_6', name: '📜 الحديث الشريف', description: 'مدارسة الأحاديث النبوية', icon: '📜', color: '#FB923C', category: 'study' },
  { id: 'room_default_7', name: '🌹 الدعوة إلى الله', description: 'تشاركوا أفكار الدعوة', icon: '🌹', color: '#34D399', category: 'general' },
];

const ROOM_SEED_MESSAGES: Record<string, Array<{ botIdx: number; text: string }>> = {
  room_default_0: [
    { botIdx: 0, text: 'السلام عليكم ورحمة الله إخواني 🌙' },
    { botIdx: 1, text: 'وعليكم السلام ورحمة الله وبركاته 🤲' },
    { botIdx: 2, text: 'بارك الله فيكم، ما الجزء الذي سنراجعه هذا الأسبوع؟' },
    { botIdx: 0, text: 'الجزء الثلاثون إن شاء الله، نبدأ من سورة عبس' },
    { botIdx: 3, text: 'سبحان الله، آيات عظيمة. ﴿ عَبَسَ وَتَوَلَّى ﴾' },
    { botIdx: 1, text: 'تأمّلوا كيف عاتب الله نبيه ﷺ بلطف' },
  ],
  room_default_1: [
    { botIdx: 2, text: 'السلام عليكم، عندي سؤال في الصلاة' },
    { botIdx: 0, text: 'وعليكم السلام، تفضّل أخي' },
    { botIdx: 2, text: 'ما حكم صلاة المسبوق إذا أدرك الإمام في الركوع؟' },
    { botIdx: 4, text: 'تُحسب له ركعة عند جمهور العلماء، بشرط أن يطمئنّ راكعاً' },
    { botIdx: 5, text: 'نعم، وعليه أن يكبّر تكبيرة الإحرام قائماً' },
  ],
  room_default_2: [
    { botIdx: 0, text: 'أهلاً بكل من ينضم إلينا 🌙' },
    { botIdx: 4, text: 'مرحباً بكم في نور AI، نسأل الله أن ينفع بنا وبكم' },
    { botIdx: 6, text: 'إن كنتم جدداً، استكشفوا الغرف الأخرى' },
    { botIdx: 1, text: 'وأهلاً بكم بين إخوانكم 💚' },
  ],
  room_default_3: [
    { botIdx: 0, text: 'مرحباً بكم في غرفة طلاب العلم 🎓' },
    { botIdx: 6, text: 'أنا بدأت بحفظ الأربعين النووية، أي طالب علم هنا؟' },
    { botIdx: 2, text: 'أنا أدرس "العقيدة الواسطية"' },
    { botIdx: 1, text: 'وأنا أحفظ القرآن، أنهيت 15 جزءاً ولله الحمد' },
  ],
  room_default_4: [
    { botIdx: 6, text: 'السلام عليكم شباب 👋' },
    { botIdx: 5, text: 'وعليكم السلام، كيف الحال؟' },
    { botIdx: 6, text: 'الحمد لله، أحاول أستغلّ وقتي في رمضان القادم' },
  ],
  room_default_5: [
    { botIdx: 1, text: 'كيف أعلّم أولادي حبّ القرآن؟' },
    { botIdx: 3, text: 'بالقدوة أولاً، اقرئي أمامهم يومياً' },
    { botIdx: 7, text: 'وكافئيهم على كل سورة يحفظونها 🎁' },
  ],
  room_default_6: [
    { botIdx: 4, text: '"إنما الأعمال بالنيات" — حديث عظيم نبدأ به' },
    { botIdx: 0, text: 'رواه البخاري ومسلم، من أعظم أحاديث الإسلام' },
    { botIdx: 2, text: 'فيه أن العبادة لا تُقبل إلا بنية خالصة' },
  ],
  room_default_7: [
    { botIdx: 4, text: 'إخواني، أفكاركم في الدعوة عبر السوشيال ميديا؟' },
    { botIdx: 1, text: 'أنصح بأن تكون قصيرة وموثّقة' },
    { botIdx: 6, text: 'وأن تكون بالحكمة والموعظة الحسنة 🌟' },
  ],
};

// ═══════════════════════════════════════════════════════
// 🧠 دالة الذكاء الاصطناعي - تستخدم Claude API
// ═══════════════════════════════════════════════════════
async function getAIResponse(
  systemPrompt: string,
  userMessage: string,
  conversationContext: Array<{ role: string; content: string }> = []
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return null as any; // سنستخدم fallback
  }

  try {
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022', // أسرع وأرخص للبوتات
        max_tokens: 300,
        system: systemPrompt,
        messages: [
          ...conversationContext.slice(-6),
          { role: 'user', content: userMessage },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      console.error('Claude error:', await claudeResponse.text());
      return null as any;
    }

    const data: any = await claudeResponse.json();
    return data.content?.[0]?.text || null;
  } catch (err) {
    console.error('AI error:', err);
    return null as any;
  }
}

// Fallback ردود (إذا فشل AI)
const FALLBACK_REPLIES = [
  'بارك الله فيك أخي 💚',
  'ما شاء الله، نقطة جميلة',
  'جزاك الله خيراً 🤲',
  'سبحان الله، تأمّل عميق',
  'صدقت أخي الكريم',
  'الله يبارك فيك',
];

// ═══════════════════════════════════════════════════════
// SEED
// ═══════════════════════════════════════════════════════
function seedFakeUsers() {
  FAKE_USERS.forEach((fu, i) => {
    const id = 'bot_' + i;
    users.set(id, {
      id, name: fu.name, email: 'bot' + i + '@noor.ai',
      passwordHash: '', avatar: fu.avatar, color: fu.color,
      bio: fu.bio, isBot: true,
      createdAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
      lastSeen: new Date().toISOString(),
    });
    if (i < 5) onlineUsers.set(id, 'bot_socket_' + i);
  });
}

function seedFakeRooms() {
  FAKE_ROOMS.forEach(fr => {
    rooms.set(fr.id, {
      id: fr.id, name: fr.name, description: fr.description,
      icon: fr.icon, color: fr.color, category: fr.category,
      isPublic: true,
      createdBy: 'bot_0', createdByName: FAKE_USERS[0].name,
      members: new Set(FAKE_USERS.map((_, i) => 'bot_' + i)),
      admins: new Set(['bot_0']),
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    });
  });
}

function seedFakeMessages() {
  for (const [roomId, msgs] of Object.entries(ROOM_SEED_MESSAGES)) {
    const baseTime = Date.now() - 86400000;
    const list: ChatMessage[] = msgs.map((m, i) => {
      const bot = users.get('bot_' + m.botIdx)!;
      return {
        id: 'msg_seed_' + roomId + '_' + i,
        conversationId: roomId,
        senderId: 'bot_' + m.botIdx,
        senderName: bot.name,
        senderAvatar: bot.avatar,
        senderColor: bot.color,
        type: 'text',
        content: m.text,
        createdAt: new Date(baseTime + i * 1800000 + Math.random() * 1800000).toISOString(),
        status: 'read',
      };
    });
    roomMessages.set(roomId, list);
  }
}

seedFakeUsers();
seedFakeRooms();
seedFakeMessages();
console.log('🤖', FAKE_USERS.length, 'AI-powered bots ready');
console.log('🏠', FAKE_ROOMS.length, 'rooms with messages');

// ═══════════════════════════════════════════════════════
// DAILY CONTENT
// ═══════════════════════════════════════════════════════
const DAILY_VERSES = [
  { text: '﴿ وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا * وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ﴾', surah: 'الطلاق', ayah: '2-3' },
  { text: '﴿ إِنَّ مَعَ الْعُسْرِ يُسْرًا ﴾', surah: 'الشرح', ayah: '6' },
  { text: '﴿ وَاللَّهُ خَيْرُ الرَّازِقِينَ ﴾', surah: 'الجمعة', ayah: '11' },
  { text: '﴿ وَبَشِّرِ الصَّابِرِينَ ﴾', surah: 'البقرة', ayah: '155' },
  { text: '﴿ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ ﴾', surah: 'البقرة', ayah: '153' },
  { text: '﴿ فَاذْكُرُونِي أَذْكُرْكُمْ ﴾', surah: 'البقرة', ayah: '152' },
];
const DAILY_HADITHS = [
  { text: 'إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى', narrator: 'البخاري ومسلم', explanation: 'أساس قبول الأعمال هو النية الخالصة لله' },
  { text: 'من حسن إسلام المرء تركه ما لا يعنيه', narrator: 'الترمذي', explanation: 'علامة الإيمان الصحيح ترك الفضول' },
  { text: 'لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه', narrator: 'البخاري ومسلم', explanation: 'الإيمان الكامل بحب الخير' },
  { text: 'الكلمة الطيبة صدقة', narrator: 'البخاري ومسلم', explanation: 'فضل الكلام الحسن' },
];
const DAILY_WISDOMS = [
  { text: 'العلم بلا عمل كالشجر بلا ثمر', author: 'الإمام الشافعي' },
  { text: 'الصبر مفتاح الفرج', author: 'حكمة عربية' },
  { text: 'إذا أردت أن تطاع فأمر بما يُستطاع', author: 'علي بن أبي طالب' },
  { text: 'من ترك شيئاً لله عوّضه الله خيراً منه', author: 'حكمة سلفية' },
];

function getTodayContent() {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return {
    verse: DAILY_VERSES[dayOfYear % DAILY_VERSES.length],
    hadith: DAILY_HADITHS[dayOfYear % DAILY_HADITHS.length],
    wisdom: DAILY_WISDOMS[dayOfYear % DAILY_WISDOMS.length],
  };
}

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE'], credentials: true }));
app.use(express.json({ limit: '50mb' }));

function auth(req: any, res: Response, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) { res.status(401).json({ success: false }); return; }
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch { res.status(401).json({ success: false }); }
}

app.get('/health', (_req, res) => res.json({
  status: 'ok', users: users.size, online: onlineUsers.size,
  rooms: rooms.size, version: 'AI-POWERED-BOTS',
  hasAIKey: !!process.env.ANTHROPIC_API_KEY,
}));

app.get('/', (_req, res) => res.json({ message: '🌙 Noor AI - Intelligent Backend', bots: FAKE_USERS.length, rooms: rooms.size }));

app.get('/api/daily', (_req, res) => res.json({ success: true, ...getTodayContent() }));

// ─── Auth ───
app.post('/api/auth/register', async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ success: false, error: 'البيانات ناقصة' });
    if (password.length < 6) return res.status(400).json({ success: false, error: 'كلمة المرور 6 أحرف على الأقل' });
    if (usersByEmail.has(email.toLowerCase())) return res.status(400).json({ success: false, error: 'البريد مستخدم بالفعل' });

    const id = 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    const passwordHash = await bcrypt.hash(password, 10);
    const user: User = {
      id, name: name.trim(), email: email.toLowerCase(), passwordHash,
      avatar: name.trim()[0], color: COLORS[Math.floor(Math.random() * COLORS.length)],
      createdAt: new Date().toISOString(), lastSeen: new Date().toISOString(),
    };
    users.set(id, user);
    usersByEmail.set(user.email, id);
    const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '30d' });
    io.emit('user:new', { id: user.id, name: user.name, avatar: user.avatar, color: user.color, online: false });

    setTimeout(() => {
      const bot = users.get('bot_0')!;
      const msg: ChatMessage = {
        id: 'msg_welcome_' + Date.now(),
        conversationId: 'room_default_2',
        senderId: bot.id, senderName: bot.name,
        senderAvatar: bot.avatar, senderColor: bot.color,
        type: 'text',
        content: `أهلاً وسهلاً بأخينا ${user.name} في نور AI 🌙💚`,
        createdAt: new Date().toISOString(), status: 'sent',
      };
      const list = roomMessages.get('room_default_2') || [];
      list.push(msg);
      roomMessages.set('room_default_2', list);
      io.to('room:room_default_2').emit('room:message', msg);
    }, 3000);

    res.json({ success: true, data: { token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, color: user.color } }});
  } catch { res.status(500).json({ success: false }); }
});

app.post('/api/auth/login', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false });
    const userId = usersByEmail.get(email.toLowerCase());
    const user = userId ? users.get(userId) : null;
    if (!user || user.isBot) return res.status(401).json({ success: false, error: 'بيانات خاطئة' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ success: false, error: 'بيانات خاطئة' });
    user.lastSeen = new Date().toISOString();
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, data: { token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, color: user.color } }});
  } catch { res.status(500).json({ success: false }); }
});

app.get('/api/users', auth, (req: any, res: Response) => {
  const list = Array.from(users.values())
    .filter(u => u.id !== req.userId)
    .map(u => ({
      id: u.id, name: u.name, avatar: u.avatar, color: u.color,
      bio: u.bio, isBot: u.isBot,
      online: onlineUsers.has(u.id), lastSeen: u.lastSeen,
    }));
  res.json({ success: true, users: list });
});

app.get('/api/chat/:conversationId', auth, (req: any, res: Response) => {
  res.json({ success: true, messages: messages.get(req.params.conversationId) || [] });
});

app.get('/api/rooms', auth, (req: any, res: Response) => {
  const list = Array.from(rooms.values()).map(r => ({
    id: r.id, name: r.name, description: r.description,
    icon: r.icon, color: r.color, category: r.category,
    isPublic: r.isPublic,
    memberCount: r.members.size,
    isMember: true,
    isAdmin: r.admins.has(req.userId),
    isOwner: r.createdBy === req.userId,
    createdByName: r.createdByName,
    createdAt: r.createdAt,
    onlineCount: Array.from(r.members).filter(id => onlineUsers.has(id)).length,
    lastMessage: (roomMessages.get(r.id) || []).slice(-1)[0]?.content?.slice(0, 60) || '',
  })).sort((a, b) => b.memberCount - a.memberCount);
  res.json({ success: true, rooms: list });
});

app.get('/api/rooms/:id', auth, (req: any, res: Response): any => {
  const room = rooms.get(req.params.id);
  if (!room) return res.status(404).json({ success: false });
  const memberList = Array.from(room.members).map(id => {
    const u = users.get(id);
    if (!u) return null;
    return {
      id: u.id, name: u.name, avatar: u.avatar, color: u.color, bio: u.bio,
      online: onlineUsers.has(u.id),
      isAdmin: room.admins.has(u.id),
      isOwner: room.createdBy === u.id,
      isBot: u.isBot,
    };
  }).filter(Boolean);
  res.json({
    success: true,
    room: {
      id: room.id, name: room.name, description: room.description,
      icon: room.icon, color: room.color, category: room.category,
      isPublic: room.isPublic,
      memberCount: room.members.size,
      isMember: true,
      isAdmin: room.admins.has(req.userId),
      isOwner: room.createdBy === req.userId,
      createdByName: room.createdByName,
      createdAt: room.createdAt,
      members: memberList,
    },
  });
});

// ⭐ إنشاء غرفة جديدة - مع بوتات وترحيب AI
app.post('/api/rooms', auth, async (req: any, res: Response): Promise<any> => {
  const { name, description, icon, color, category } = req.body;
  if (!name?.trim() || name.trim().length < 3) return res.status(400).json({ success: false, error: 'الاسم قصير' });
  const user = users.get(req.userId);
  if (!user) return res.status(401).json({ success: false });
  const id = 'room_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);

  // اختر 4 بوتات عشوائية للانضمام
  const botIndices = [0, 1, 2, 3, 4, 5, 6, 7].sort(() => Math.random() - 0.5).slice(0, 4);
  const members = new Set([req.userId, ...botIndices.map(i => 'bot_' + i)]);

  const room: ChatRoom = {
    id, name: name.trim(), description: (description || '').trim(),
    icon: icon || '💬', color: color || '#10B981',
    category: category || 'general', isPublic: true,
    createdBy: req.userId, createdByName: user.name,
    members,
    admins: new Set([req.userId]),
    createdAt: new Date().toISOString(),
  };
  rooms.set(id, room);

  // ⭐ رسالة ترحيب من بوت (تلقائياً)
  setTimeout(async () => {
    const welcomerIdx = botIndices[0];
    const welcomer = users.get('bot_' + welcomerIdx)!;
    const personality = BOT_PERSONALITIES[welcomerIdx];

    let welcomeText = `أهلاً وسهلاً بك ${user.name} في غرفة "${room.name}" 🌙\nنسأل الله أن ينفعنا بهذه الغرفة 💚`;

    if (personality && process.env.ANTHROPIC_API_KEY) {
      const aiText = await getAIResponse(
        personality.system,
        `أرحّب بـ ${user.name} الذي أنشأ غرفة جديدة بعنوان "${room.name}" وموضوعها "${room.description || 'عام'}". اكتب رسالة ترحيب قصيرة (2-3 جمل) بشخصيتك.`,
        []
      );
      if (aiText) welcomeText = aiText;
    }

    const msg: ChatMessage = {
      id: 'msg_room_welcome_' + Date.now(),
      conversationId: id,
      senderId: welcomer.id, senderName: welcomer.name,
      senderAvatar: welcomer.avatar, senderColor: welcomer.color,
      type: 'text',
      content: welcomeText,
      createdAt: new Date().toISOString(), status: 'sent',
    };
    const list = roomMessages.get(id) || [];
    list.push(msg);
    roomMessages.set(id, list);
    io.to('room:' + id).emit('room:message', msg);
  }, 2000);

  io.emit('room:new', { id, name, description, icon, color, category, isPublic: true, memberCount: members.size, createdByName: user.name });
  res.json({ success: true, room: { id } });
});

app.get('/api/rooms/:id/messages', auth, (req: any, res: Response): any => {
  res.json({ success: true, messages: roomMessages.get(req.params.id) || [] });
});

// ═══════════════════════════════════════════════════════
// AI CHAT (Noor AI Assistant)
// ═══════════════════════════════════════════════════════
const SYSTEM_PROMPT = `أنت "نور AI"، مساعد إسلامي ذكي مدعوم بـ Claude. مهمتك:

1. الإجابة عن الأسئلة الإسلامية بأدب وعلم
2. الاستشهاد بالقرآن والسنة عند الإجابة
3. تجنّب الفتاوى القاطعة وارفع المسائل المختلفة للعلماء
4. الإجابة باللغة العربية الفصحى (إلا إذا طلب المستخدم لغة أخرى)
5. ذكر المصادر عند نقل حديث (البخاري، مسلم، إلخ)
6. الاعتراف عند عدم المعرفة وتوجيه السائل لأهل العلم
7. عدم الدخول في خلافات سياسية أو طائفية
8. التشجيع على الخير والإحسان

أسلوبك: ودود، علمي، واضح. استخدم التشكيل في الآيات. ابدأ الإجابات أحياناً بـ "بسم الله" أو "وعليكم السلام" عند المناسبة.`;

app.post('/api/ai/chat', auth, async (req: any, res: Response) => {
  try {
    const { messages: clientMessages } = req.body;
    if (!Array.isArray(clientMessages) || clientMessages.length === 0) {
      return res.status(400).json({ success: false, error: 'الرسائل مطلوبة' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Fallback streaming
      const reply = 'بسم الله الرحمن الرحيم.\n\n⚠️ AI API لم يُعدّ بعد. لتفعيل الإجابات الذكية:\n\n1. سجّل في console.anthropic.com\n2. احصل على API key\n3. أضفه في Railway Variables: ANTHROPIC_API_KEY\n4. أعد نشر Backend\n\nبعدها سأستطيع الإجابة على أي سؤال إسلامي بدقة عالية مثل ChatGPT تماماً.';

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      let i = 0;
      const interval = setInterval(() => {
        if (i >= reply.length) {
          clearInterval(interval);
          res.write('data: [DONE]\n\n');
          res.end();
          return;
        }
        const chunk = reply.slice(i, i + 3);
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        i += 3;
      }, 30);
      return;
    }

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: clientMessages.map((m: any) => ({ role: m.role, content: m.content })),
        stream: true,
      }),
    });

    if (!claudeResponse.ok) {
      return res.status(500).json({ success: false, error: 'AI service error' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');

    const reader = claudeResponse.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'content_block_delta' && data.delta?.text) {
                res.write(`data: ${JSON.stringify({ text: data.delta.text })}\n\n`);
              }
            } catch {}
          }
        }
      }
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    console.error('AI chat error:', err);
    if (!res.headersSent) res.status(500).json({ success: false });
  }
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'], credentials: true },
  maxHttpBufferSize: 50 * 1024 * 1024,
});

// ═══════════════════════════════════════════════════════
// 🤖 دالة رد البوت بالذكاء الاصطناعي
// ═══════════════════════════════════════════════════════
async function botReplyAI(botIdx: number, conversationId: string, userMessage: string, isRoom: boolean) {
  try {
    const bot = users.get('bot_' + botIdx);
    const personality = BOT_PERSONALITIES[botIdx];
    if (!bot || !personality) return;

    // Build conversation context
    const msgList = isRoom ? roomMessages.get(conversationId) || [] : messages.get(conversationId) || [];
    const recentContext = msgList.slice(-6).map(m => ({
      role: (m.senderId === bot.id ? 'assistant' : 'user') as 'assistant' | 'user',
      content: m.content,
    }));

    // typing indicator
    const emitTo = isRoom ? 'room:' + conversationId : 'chat:' + conversationId;
    const typingEvent = isRoom ? 'room:typing' : 'chat:typing';
    try {
      io.to(emitTo).emit(typingEvent, {
        roomId: conversationId, userId: bot.id, userName: bot.name, isTyping: true,
      });
    } catch (e) { console.error('typing emit error:', e); }

    // Get AI response (with extra safety)
    let replyText: string | null = null;
    try {
      replyText = await getAIResponse(personality.system, userMessage, recentContext);
    } catch (aiErr) {
      console.error('getAIResponse error:', aiErr);
      replyText = null;
    }

    // Fallback
    if (!replyText) {
      replyText = FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
    }

    // Stop typing
    try {
      io.to(emitTo).emit(typingEvent, {
        roomId: conversationId, userId: bot.id, userName: bot.name, isTyping: false,
      });
    } catch (e) { console.error('stop typing error:', e); }

    // Send the reply
    const botMsg: ChatMessage = {
      id: 'msg_bot_ai_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      conversationId,
      senderId: bot.id, senderName: bot.name,
      senderAvatar: bot.avatar, senderColor: bot.color,
      type: 'text', content: replyText,
      createdAt: new Date().toISOString(), status: 'sent',
    };

    if (isRoom) {
      const list = roomMessages.get(conversationId) || [];
      list.push(botMsg);
      if (list.length > 500) list.splice(0, list.length - 500);
      roomMessages.set(conversationId, list);
      io.to('room:' + conversationId).emit('room:message', botMsg);
    } else {
      const list = messages.get(conversationId) || [];
      list.push(botMsg);
      messages.set(conversationId, list);
      io.to('chat:' + conversationId).emit('chat:message', botMsg);
    }
  } catch (err) {
    console.error('🔥 botReplyAI fatal error (caught):', err);
    // لا نرمي الخطأ - فقط نسجّله ونستمر
  }
}

// safe wrapper for setTimeout async calls
function safeBotReply(botIdx: number, conversationId: string, userMessage: string, isRoom: boolean, delay: number) {
  setTimeout(() => {
    botReplyAI(botIdx, conversationId, userMessage, isRoom).catch(err => {
      console.error('safeBotReply caught:', err);
    });
  }, delay);
}

io.on('connection', (socket) => {
  socket.on('user:online', ({ userId, userName }: any) => {
    if (!userId || !users.has(userId)) return;
    onlineUsers.set(userId, socket.id);
    socket.data.userId = userId;
    socket.data.userName = userName;
    io.emit('user:status', { userId, online: true });
  });

  // ═══ DM CHAT - بوت يردّ بالذكاء ═══
  socket.on('chat:join', ({ conversationId }: any) => {
    socket.join('chat:' + conversationId);
    socket.emit('chat:history', messages.get(conversationId) || []);
  });

  socket.on('chat:leave', ({ conversationId }: any) => socket.leave('chat:' + conversationId));

  socket.on('chat:send', async (msg: ChatMessage) => {
    const list = messages.get(msg.conversationId) || [];
    list.push(msg);
    messages.set(msg.conversationId, list);
    io.to('chat:' + msg.conversationId).emit('chat:message', msg);

    // ⭐ إذا الـ recipient بوت → ردّ بـ AI ⭐
    const parts = msg.conversationId.split('__');
    const otherUserId = parts.find(p => p !== msg.senderId);
    if (!otherUserId) return;

    const otherUser = users.get(otherUserId);
    if (otherUser && otherUser.isBot) {
      const botIdx = parseInt(otherUserId.replace('bot_', ''));
      // delay قبل الرد (مع حماية)
      safeBotReply(botIdx, msg.conversationId, msg.content, false, 2000 + Math.random() * 2000);
    }
  });

  socket.on('chat:typing', ({ conversationId, isTyping }: any) => {
    const userId = socket.data.userId;
    if (!userId) return;
    socket.to('chat:' + conversationId).emit('chat:typing', { userId, isTyping });
  });

  // ═══ ROOMS - بوت يردّ بالذكاء ═══
  socket.on('room:join', ({ roomId }: any) => {
    const room = rooms.get(roomId);
    if (!room) return;
    socket.join('room:' + roomId);
    socket.emit('room:history', roomMessages.get(roomId) || []);
    if (socket.data.userId) room.members.add(socket.data.userId);
  });

  socket.on('room:leave', ({ roomId }: any) => socket.leave('room:' + roomId));

  socket.on('room:send', async ({ roomId, message }: any, callback: any) => {
    const room = rooms.get(roomId);
    if (!room) { if (callback) callback({ success: false }); return; }
    const userId = socket.data.userId;
    if (!userId) { if (callback) callback({ success: false }); return; }
    const user = users.get(userId);
    if (!user) { if (callback) callback({ success: false }); return; }

    const msg: ChatMessage = {
      id: message.id || 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      conversationId: roomId,
      senderId: userId,
      senderName: user.name,
      senderAvatar: user.avatar,
      senderColor: user.color,
      type: 'text',
      content: message.content,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };

    const list = roomMessages.get(roomId) || [];
    list.push(msg);
    if (list.length > 500) list.splice(0, list.length - 500);
    roomMessages.set(roomId, list);
    io.to('room:' + roomId).emit('room:message', msg);
    if (callback) callback({ success: true, message: msg });

    // ⭐ 70% احتمال يردّ بوت بـ AI ⭐
    if (Math.random() < 0.7) {
      // اختر بوت من أعضاء الغرفة
      const botMembers = Array.from(room.members).filter(id => id.startsWith('bot_'));
      if (botMembers.length === 0) return;
      const botId = botMembers[Math.floor(Math.random() * botMembers.length)];
      const botIdx = parseInt(botId.replace('bot_', ''));

      safeBotReply(botIdx, roomId, msg.content, true, 2500 + Math.random() * 3000);
    }
  });

  socket.on('room:typing', ({ roomId, isTyping }: any) => {
    const userId = socket.data.userId;
    const userName = socket.data.userName;
    if (!userId) return;
    socket.to('room:' + roomId).emit('room:typing', { roomId, userId, userName, isTyping });
  });

  // Calls
  socket.on('call:initiate', ({ calleeId, type }: any) => {
    const caller = users.get(socket.data.userId);
    if (!caller) return;
    const calleeSocketId = onlineUsers.get(calleeId);
    if (!calleeSocketId) { socket.emit('call:failed', { reason: 'غير متصل' }); return; }
    const callId = 'call_' + Date.now();
    activeCalls.set(callId, { callId, callerId: caller.id, callerName: caller.name, calleeId, type });
    io.to(calleeSocketId).emit('call:incoming', { callId, callerId: caller.id, callerName: caller.name, callerAvatar: caller.avatar, callerColor: caller.color, type });
    socket.emit('call:ringing', { callId });
  });
  socket.on('call:accept', ({ callId }: any) => { const c = activeCalls.get(callId); if (c) { const s = onlineUsers.get(c.callerId); if (s) io.to(s).emit('call:accepted', { callId }); } });
  socket.on('call:reject', ({ callId }: any) => { const c = activeCalls.get(callId); if (c) { activeCalls.delete(callId); const s = onlineUsers.get(c.callerId); if (s) io.to(s).emit('call:rejected', { callId }); } });
  socket.on('call:offer', ({ callId, offer }: any) => { const c = activeCalls.get(callId); if (c) { const s = onlineUsers.get(c.calleeId); if (s) io.to(s).emit('call:offer', { callId, offer }); } });
  socket.on('call:answer', ({ callId, answer }: any) => { const c = activeCalls.get(callId); if (c) { const s = onlineUsers.get(c.callerId); if (s) io.to(s).emit('call:answer', { callId, answer }); } });
  socket.on('call:ice', ({ callId, candidate }: any) => { const c = activeCalls.get(callId); if (c) { const o = socket.data.userId === c.callerId ? c.calleeId : c.callerId; const s = onlineUsers.get(o); if (s) io.to(s).emit('call:ice', { callId, candidate }); } });
  socket.on('call:end', ({ callId }: any) => { const c = activeCalls.get(callId); if (c) { activeCalls.delete(callId); const o = socket.data.userId === c.callerId ? c.calleeId : c.callerId; const s = onlineUsers.get(o); if (s) io.to(s).emit('call:ended', { callId }); } });

  socket.on('disconnect', () => {
    const userId = socket.data.userId;
    if (userId) {
      onlineUsers.delete(userId);
      const u = users.get(userId);
      if (u) u.lastSeen = new Date().toISOString();
      io.emit('user:status', { userId, online: false });
    }
  });
});

// ═══════════════════════════════════════════════════════
// 🛡️ حماية السيرفر من أي خطأ يقتل العملية
// ═══════════════════════════════════════════════════════
process.on('uncaughtException', (err) => {
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('🚨 UNCAUGHT EXCEPTION (server stays alive):');
  console.error(err);
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('🚨 UNHANDLED REJECTION (server stays alive):');
  console.error('Reason:', reason);
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

process.on('SIGTERM', () => {
  console.log('📛 SIGTERM received - graceful shutdown');
  httpServer.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log('═══════════════════════════════════════');
  console.log('🌙 Noor AI INTELLIGENT on port', PORT);
  console.log('🤖 8 AI-powered bots with personalities');
  console.log('🧠 AI Key:', process.env.ANTHROPIC_API_KEY ? '✅ SET' : '❌ NOT SET');
  console.log('═══════════════════════════════════════');
});
