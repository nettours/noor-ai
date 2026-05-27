// G:\noor-ai\backend\src\server.ts
// النسخة النهائية - بوتات تردّ في DM + الرسائل تظهر فوراً في الغرف
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

// ═══ BOTS ═══
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
    { botIdx: 4, text: 'وفيها درس عظيم: لا تحقرنّ أحداً' },
    { botIdx: 2, text: 'جزاكم الله خيراً جميعاً 💚' },
  ],
  room_default_1: [
    { botIdx: 2, text: 'السلام عليكم، عندي سؤال في الصلاة' },
    { botIdx: 0, text: 'وعليكم السلام، تفضّل أخي' },
    { botIdx: 2, text: 'ما حكم صلاة المسبوق إذا أدرك الإمام في الركوع؟' },
    { botIdx: 4, text: 'تُحسب له ركعة عند جمهور العلماء، بشرط أن يطمئنّ راكعاً' },
    { botIdx: 5, text: 'نعم، وعليه أن يكبّر تكبيرة الإحرام قائماً' },
    { botIdx: 2, text: 'جزاكم الله خيراً، استفدت كثيراً' },
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
    { botIdx: 0, text: 'ما شاء الله، الله يبارك في جهودكم' },
    { botIdx: 7, text: 'نصيحة: لا تستعجلوا، الإتقان أهم من السرعة' },
  ],
  room_default_4: [
    { botIdx: 6, text: 'السلام عليكم شباب 👋' },
    { botIdx: 5, text: 'وعليكم السلام، كيف الحال؟' },
    { botIdx: 6, text: 'الحمد لله، أحاول أستغلّ وقتي في رمضان القادم' },
    { botIdx: 2, text: 'فكرة جميلة، ابدأ من الآن بترك العادات السيئة' },
  ],
  room_default_5: [
    { botIdx: 1, text: 'كيف أعلّم أولادي حبّ القرآن؟' },
    { botIdx: 3, text: 'بالقدوة أولاً، اقرئي أمامهم يومياً' },
    { botIdx: 7, text: 'وكافئيهم على كل سورة يحفظونها 🎁' },
    { botIdx: 1, text: 'بارك الله فيكم، سأبدأ من اليوم' },
  ],
  room_default_6: [
    { botIdx: 4, text: '"إنما الأعمال بالنيات" — حديث عظيم نبدأ به' },
    { botIdx: 0, text: 'رواه البخاري ومسلم، من أعظم أحاديث الإسلام' },
    { botIdx: 2, text: 'فيه أن العبادة لا تُقبل إلا بنية خالصة' },
    { botIdx: 7, text: 'سبحان الله، حديث قصير لكن معانيه عظيمة' },
  ],
  room_default_7: [
    { botIdx: 4, text: 'إخواني، أفكاركم في الدعوة عبر السوشيال ميديا؟' },
    { botIdx: 1, text: 'أنصح بأن تكون قصيرة وموثّقة' },
    { botIdx: 6, text: 'وأن تكون بالحكمة والموعظة الحسنة 🌟' },
  ],
};

const PERIODIC_MESSAGES = [
  { text: 'سبحان الله وبحمده، سبحان الله العظيم 🌙', botIdx: 0 },
  { text: 'اللهم صلِّ على محمد وعلى آل محمد 💚', botIdx: 1 },
  { text: '﴿ وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا ﴾', botIdx: 2 },
  { text: 'لا إله إلا الله محمد رسول الله ☪️', botIdx: 3 },
  { text: 'أستغفر الله العظيم وأتوب إليه', botIdx: 4 },
  { text: 'الحمد لله رب العالمين 🤲', botIdx: 5 },
  { text: 'بارك الله فيكم إخواني 💚', botIdx: 6 },
  { text: 'اللهم اجعل القرآن ربيع قلوبنا 🌷', botIdx: 7 },
];

// ═══ DAILY CONTENT ═══
const DAILY_VERSES = [
  { text: '﴿ وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا * وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ﴾', surah: 'الطلاق', ayah: '2-3' },
  { text: '﴿ إِنَّ مَعَ الْعُسْرِ يُسْرًا ﴾', surah: 'الشرح', ayah: '6' },
  { text: '﴿ وَاللَّهُ خَيْرُ الرَّازِقِينَ ﴾', surah: 'الجمعة', ayah: '11' },
  { text: '﴿ وَبَشِّرِ الصَّابِرِينَ ﴾', surah: 'البقرة', ayah: '155' },
  { text: '﴿ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ ﴾', surah: 'البقرة', ayah: '153' },
  { text: '﴿ وَتَوَكَّلْ عَلَى الْحَيِّ الَّذِي لَا يَمُوتُ ﴾', surah: 'الفرقان', ayah: '58' },
  { text: '﴿ فَاذْكُرُونِي أَذْكُرْكُمْ ﴾', surah: 'البقرة', ayah: '152' },
  { text: '﴿ وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ ﴾', surah: 'الحديد', ayah: '4' },
];
const DAILY_HADITHS = [
  { text: 'إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى', narrator: 'البخاري ومسلم', explanation: 'أساس قبول الأعمال هو النية الخالصة لله' },
  { text: 'من حسن إسلام المرء تركه ما لا يعنيه', narrator: 'الترمذي', explanation: 'علامة الإيمان الصحيح ترك الفضول' },
  { text: 'لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه', narrator: 'البخاري ومسلم', explanation: 'الإيمان الكامل بحب الخير للآخرين' },
  { text: 'الكلمة الطيبة صدقة', narrator: 'البخاري ومسلم', explanation: 'فضل الكلام الحسن والابتسامة' },
  { text: 'من سلك طريقاً يلتمس فيه علماً سهل الله له به طريقاً إلى الجنة', narrator: 'مسلم', explanation: 'فضل طلب العلم الشرعي' },
  { text: 'الدنيا متاع وخير متاعها المرأة الصالحة', narrator: 'مسلم', explanation: 'منزلة الزوجة الصالحة' },
  { text: 'من قال سبحان الله العظيم وبحمده غُرست له نخلة في الجنة', narrator: 'الترمذي', explanation: 'عظم أجر الذكر' },
];
const DAILY_WISDOMS = [
  { text: 'العلم بلا عمل كالشجر بلا ثمر', author: 'الإمام الشافعي' },
  { text: 'من راقب الناس مات همّاً، وفاز باللذة الجريء', author: 'الإمام أحمد' },
  { text: 'الصبر مفتاح الفرج', author: 'حكمة عربية' },
  { text: 'إذا أردت أن تطاع فأمر بما يُستطاع', author: 'علي بن أبي طالب' },
  { text: 'من جدّ وجد، ومن زرع حصد', author: 'حكمة عربية' },
  { text: 'القناعة كنز لا يفنى', author: 'حكمة نبوية' },
  { text: 'احرص على ما ينفعك واستعن بالله ولا تعجز', author: 'النبي ﷺ' },
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

// ═══ DM BOT REPLIES (شخصيات) ═══
const DM_REPLIES_BY_BOT: Record<number, string[]> = {
  0: ['وعليكم السلام ورحمة الله 🌙', 'أهلاً بك أخي الكريم', 'بارك الله فيك على المراسلة', 'كيف يمكنني مساعدتك في الفقه؟', '﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾'],
  1: ['وعليكم السلام، أهلاً بك أختي 💚', 'مرحباً بك، أنا فاطمة', 'بارك الله فيك', 'هل تريدين مدارسة سورة معينة؟', 'إن شاء الله نلتقي في الخير دائماً 🌷'],
  2: ['وعليكم السلام، حياك الله', 'أهلاً وسهلاً', 'كيف يمكنني خدمتك في مسائل الفقه؟', 'بارك الله فيك على التواصل', 'سبحان الله، الحمد لله ⚖️'],
  3: ['وعليكم السلام، أهلاً بك أختي', 'مرحباً، أنا عائشة، مدرّسة قرآن', 'هل عندك أسئلة عن التجويد؟', 'جزاك الله خيراً 📖', 'الله يبارك فيك'],
  4: ['وعليكم السلام ورحمة الله وبركاته', 'أهلاً بك، أنا يوسف، إمام مسجد', 'كيف أفيدك في أمر دينك؟', 'بارك الله فيك على السؤال 🕌', 'اللهم وفقنا لما تحب وترضى'],
  5: ['وعليكم السلام أختي الكريمة', 'مرحباً، أنا خديجة، باحثة شرعية', 'يسعدني التواصل معك 💚', 'هل تريدين مدارسة موضوع معين؟', 'بارك الله فيك'],
  6: ['وعليكم السلام أخي', 'أهلاً بك، أنا عمر', 'كيف الحال؟', 'بارك الله فيك على التواصل ☪️', 'الحمد لله رب العالمين'],
  7: ['وعليكم السلام، أهلاً بك أختي', 'مرحباً، أنا مريم 🌙', 'يسعدني التعرّف عليك', 'بارك الله فيك على المراسلة', 'اللهم اجعلنا من المتدبرين'],
};

const GENERIC_REPLIES = [
  'سبحان الله، كلام جميل',
  'بارك الله فيك',
  'جزاك الله خيراً 🤲',
  'الحمد لله',
  'ما شاء الله',
  'اللهم بارك',
];

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
console.log('🤖', FAKE_USERS.length, 'bots ready');
console.log('🏠', FAKE_ROOMS.length, 'rooms with messages');

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
  rooms: rooms.size, version: 'FINAL-with-DM-bots',
}));

app.get('/', (_req, res) => res.json({ message: '🌙 Noor AI Backend FINAL', bots: FAKE_USERS.length, rooms: rooms.size }));

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

    // Welcome message
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

app.post('/api/rooms', auth, (req: any, res: Response): any => {
  const { name, description, icon, color, category } = req.body;
  if (!name?.trim() || name.trim().length < 3) return res.status(400).json({ success: false, error: 'الاسم قصير' });
  const user = users.get(req.userId);
  if (!user) return res.status(401).json({ success: false });
  const id = 'room_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  const room: ChatRoom = {
    id, name: name.trim(), description: (description || '').trim(),
    icon: icon || '💬', color: color || '#10B981',
    category: category || 'general', isPublic: true,
    createdBy: req.userId, createdByName: user.name,
    members: new Set([req.userId, 'bot_0', 'bot_1', 'bot_2']),
    admins: new Set([req.userId]),
    createdAt: new Date().toISOString(),
  };
  rooms.set(id, room);
  io.emit('room:new', { id, name, description, icon, color, category, isPublic: true, memberCount: 4, createdByName: user.name });
  res.json({ success: true, room: { id } });
});

app.get('/api/rooms/:id/messages', auth, (req: any, res: Response): any => {
  res.json({ success: true, messages: roomMessages.get(req.params.id) || [] });
});
const SYSTEM_PROMPT = `أنت "نور AI"، مساعد إسلامي ذكي. مهمتك:

1. الإجابة عن الأسئلة الإسلامية بأدب وعلم
2. الاستشهاد بالقرآن والسنة عند الإجابة
3. تجنّب الفتاوى القاطعة وارفع المسائل المختلفة للعلماء
4. الإجابة باللغة العربية الفصحى (إلا إذا طلب المستخدم لغة أخرى)
5. ذكر المصادر عند نقل حديث (البخاري، مسلم، إلخ)
6. الاعتراف عند عدم المعرفة وتوجيه السائل لأهل العلم
7. عدم الدخول في خلافات سياسية أو طائفية
8. التشجيع على الخير والإحسان

أسلوبك: ودود، علمي، مختصر، واضح. استخدم التشكيل في الآيات. ابدأ الإجابات أحياناً بـ "بسم الله" أو "وعليكم السلام" عند المناسبة.

تذكّر: أنت لست مفتياً، بل مساعد للتذكير والإرشاد. وفي المسائل الفقهية الدقيقة، اطلب من السائل سؤال أهل العلم.`;

app.post('/api/ai/chat', auth, async (req: any, res: Response) => {
  try {
    const { messages: clientMessages } = req.body;
    
    if (!Array.isArray(clientMessages) || clientMessages.length === 0) {
      return res.status(400).json({ success: false, error: 'الرسائل مطلوبة' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Fallback: structured responses when no API key
      const lastMsg = clientMessages[clientMessages.length - 1]?.content?.toLowerCase() || '';
      let reply = '';

      if (lastMsg.includes('سلام') || lastMsg.includes('مرحبا')) {
        reply = 'وعليكم السلام ورحمة الله وبركاته 🌙\n\nأهلاً بك في نور AI. كيف يمكنني مساعدتك اليوم؟\n\nيمكنني مساعدتك في:\n• تفسير القرآن\n• شرح الأحاديث\n• الأسئلة الفقهية\n• الأدعية والأذكار\n• قصص الأنبياء';
      } else if (lastMsg.includes('فاتحة')) {
        reply = 'سورة الفاتحة هي أعظم سورة في القرآن الكريم، وتُسمّى "أم الكتاب" و"السبع المثاني".\n\nنزلت في مكة وآياتها سبع. تبدأ بالبسملة وتتضمّن:\n\n1. حمد الله وتمجيده\n2. الإقرار بالعبودية لله وحده\n3. طلب الهداية للصراط المستقيم\n\nنقرأها في كل ركعة من الصلاة، وقال النبي ﷺ: "لا صلاة لمن لم يقرأ بفاتحة الكتاب".\n\nهل تريد تفسير آية معينة منها؟';
      } else if (lastMsg.includes('صلاة') && lastMsg.includes('سفر')) {
        reply = 'الصلاة في السفر لها أحكام خاصة:\n\n• يُسنّ قصر الصلاة الرباعية إلى ركعتين (الظهر والعصر والعشاء)\n• المغرب والفجر لا تُقصران\n• يجوز الجمع بين الظهر والعصر، والمغرب والعشاء، تقديماً أو تأخيراً\n• القصر مشروع إذا كانت المسافة 80 كم تقريباً فأكثر (مذهب الجمهور)\n\nقال تعالى: ﴿ وَإِذَا ضَرَبْتُمْ فِي الْأَرْضِ فَلَيْسَ عَلَيْكُمْ جُنَاحٌ أَن تَقْصُرُوا مِنَ الصَّلَاةِ ﴾.\n\nوالأفضل سؤال أهل العلم في تفاصيل سفرك.';
      } else if (lastMsg.includes('حفظ') && lastMsg.includes('قرآن')) {
        reply = 'حفظ القرآن من أعظم الأعمال. إليك خطوات عملية:\n\n📅 **يومياً**:\n• حدّد وقتاً ثابتاً (بعد الفجر مثلاً)\n• ابدأ بصفحة واحدة فقط\n• كرّر الآية 10-20 مرة قبل الانتقال\n\n🎯 **أسلوب مجرّب**:\n• اقرأ بترتيل مع شيخ مفضّل\n• اكتب الآيات لتثبيت الحفظ\n• ربط الآيات بمعانيها\n\n🔄 **المراجعة أهم من الحفظ**:\n• راجع المحفوظ يومياً\n• اقسم المصحف لـ 3 أقسام\n• استمع وأنت تعمل\n\n💚 **نصيحة**: لا تستعجل. الإتقان أهم من السرعة.';
      } else if (lastMsg.includes('وضوء')) {
        reply = 'الوضوء من العبادات اليومية المهمة. خطواته:\n\n1. **النية** بالقلب\n2. **التسمية**: "بسم الله"\n3. **غسل اليدين** 3 مرات\n4. **المضمضة والاستنشاق** 3 مرات\n5. **غسل الوجه** 3 مرات (من منابت الشعر إلى الذقن)\n6. **غسل اليدين** للمرفقين 3 مرات\n7. **مسح الرأس** مرة واحدة\n8. **مسح الأذنين** مرة\n9. **غسل القدمين** للكعبين 3 مرات\n\nقال النبي ﷺ: "من توضأ نحو وضوئي هذا، ثم صلى ركعتين لا يحدث فيهما نفسه، غفر له ما تقدم من ذنبه".\n\nاحرص على الترتيب والموالاة بين الأعضاء.';
      } else if (lastMsg.includes('نوم') && (lastMsg.includes('دعاء') || lastMsg.includes('ذكر'))) {
        reply = '🌙 أذكار النوم من السنن الجميلة:\n\n**1. قراءة سورة الإخلاص والمعوذتين** 3 مرات والمسح على الجسد.\n\n**2. آية الكرسي**: ﴿ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ﴾.\n\n**3. الدعاء**:\n"باسمك اللهم أموت وأحيا"\n\n**4. التسبيح**:\n"سبحان الله" 33، "الحمد لله" 33، "الله أكبر" 34\n\n**5. دعاء عظيم**:\n"اللهم أسلمتُ نفسي إليك، ووجّهتُ وجهي إليك، وفوّضتُ أمري إليك، وألجأتُ ظهري إليك، رغبة ورهبة إليك، لا ملجأ ولا منجا منك إلا إليك..."\n\nنوماً هانئاً مباركاً 💚';
      } else {
        reply = `بسم الله الرحمن الرحيم.\n\nسؤالك جميل، وأحاول الإجابة عليه بقدر علمي.\n\n⚠️ ملاحظة: AI API لم يُعدّ بعد في الـ Backend. لتفعيل الإجابات الذكية الحقيقية:\n\n1. سجّل في anthropic.com واحصل على API key\n2. أضفه في Railway: ANTHROPIC_API_KEY\n3. أعد نشر Backend\n\nبعدها سأستطيع الإجابة على أي سؤال بدقة عالية.\n\nسؤالك: "${clientMessages[clientMessages.length - 1].content}"`;
      }

      // Stream the fallback response character by character
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

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
      }, 20);
      return;
    }

    // Call Claude API with streaming
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: clientMessages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
        stream: true,
      }),
    });

    if (!claudeResponse.ok) {
      const err = await claudeResponse.text();
      console.error('Claude API error:', err);
      return res.status(500).json({ success: false, error: 'AI service error' });
    }

    // Stream the response back to client
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

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
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'AI error' });
    }
  }
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'], credentials: true },
  maxHttpBufferSize: 50 * 1024 * 1024,
});

io.on('connection', (socket) => {
  socket.on('user:online', ({ userId, userName }: any) => {
    if (!userId || !users.has(userId)) return;
    onlineUsers.set(userId, socket.id);
    socket.data.userId = userId;
    socket.data.userName = userName;
    io.emit('user:status', { userId, online: true });
  });

  // ═══════════════════════════════════════════════════
  // DM CHAT - مع رد البوت! 
  // ═══════════════════════════════════════════════════
  socket.on('chat:join', ({ conversationId }: any) => {
    socket.join('chat:' + conversationId);
    socket.emit('chat:history', messages.get(conversationId) || []);
  });

  socket.on('chat:leave', ({ conversationId }: any) => socket.leave('chat:' + conversationId));

  socket.on('chat:send', (msg: ChatMessage) => {
    const list = messages.get(msg.conversationId) || [];
    list.push(msg);
    messages.set(msg.conversationId, list);
    io.to('chat:' + msg.conversationId).emit('chat:message', msg);

    // ⭐ تحقق إذا كان الـ recipient بوت → ردّ تلقائي
    const parts = msg.conversationId.split('__');
    const otherUserId = parts.find(p => p !== msg.senderId);
    if (!otherUserId) return;

    const otherUser = users.get(otherUserId);
    if (otherUser && otherUser.isBot) {
      const botIdx = parseInt(otherUserId.replace('bot_', ''));
      const replies = DM_REPLIES_BY_BOT[botIdx] || GENERIC_REPLIES;
      const replyText = replies[Math.floor(Math.random() * replies.length)];

      // typing indicator
      setTimeout(() => {
        io.to('chat:' + msg.conversationId).emit('chat:typing', {
          userId: otherUser.id, isTyping: true,
        });
      }, 1500);

      // send reply
      setTimeout(() => {
        io.to('chat:' + msg.conversationId).emit('chat:typing', {
          userId: otherUser.id, isTyping: false,
        });

        const botReply: ChatMessage = {
          id: 'msg_bot_dm_' + Date.now(),
          conversationId: msg.conversationId,
          senderId: otherUser.id,
          senderName: otherUser.name,
          senderAvatar: otherUser.avatar,
          senderColor: otherUser.color,
          type: 'text',
          content: replyText,
          createdAt: new Date().toISOString(),
          status: 'sent',
        };
        const list2 = messages.get(msg.conversationId) || [];
        list2.push(botReply);
        messages.set(msg.conversationId, list2);
        io.to('chat:' + msg.conversationId).emit('chat:message', botReply);
      }, 3500 + Math.random() * 3500);
    }
  });

  socket.on('chat:typing', ({ conversationId, isTyping }: any) => {
    const userId = socket.data.userId;
    if (!userId) return;
    socket.to('chat:' + conversationId).emit('chat:typing', { userId, isTyping });
  });

  // ═══════════════════════════════════════════════════
  // ROOMS - مع تأكيد عودة الرسالة للمُرسل
  // ═══════════════════════════════════════════════════
  socket.on('room:join', ({ roomId }: any) => {
    const room = rooms.get(roomId);
    if (!room) return;
    socket.join('room:' + roomId);
    socket.emit('room:history', roomMessages.get(roomId) || []);
    if (socket.data.userId) room.members.add(socket.data.userId);
  });

  socket.on('room:leave', ({ roomId }: any) => socket.leave('room:' + roomId));

  socket.on('room:send', ({ roomId, message }: any, callback: any) => {
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

    // ⭐ بثّ للجميع بما فيهم المُرسل (io.to بدلاً من socket.to)
    io.to('room:' + roomId).emit('room:message', msg);

    if (callback) callback({ success: true, message: msg });

    // BOT RESPONSE
    if (Math.random() < 0.5) {
      const responses = [
        'بارك الله فيك أخي 💚',
        'ما شاء الله، نقطة جميلة',
        'جزاك الله خيراً 🤲',
        'سبحان الله، تأمّل عميق',
        'صدقت أخي الكريم',
        'أحسنت 🌟',
        'الله يبارك فيك',
        'أسعدنا حضورك معنا',
        'الحمد لله على مشاركتك',
        '﴿ وَذَكِّرْ فَإِنَّ الذِّكْرَى تَنفَعُ الْمُؤْمِنِينَ ﴾',
      ];
      const respText = responses[Math.floor(Math.random() * responses.length)];
      const botIdx = Math.floor(Math.random() * FAKE_USERS.length);
      const bot = users.get('bot_' + botIdx);
      if (bot) {
        setTimeout(() => {
          io.to('room:' + roomId).emit('room:typing', {
            roomId, userId: bot.id, userName: bot.name, isTyping: true,
          });
        }, 1500);

        setTimeout(() => {
          io.to('room:' + roomId).emit('room:typing', {
            roomId, userId: bot.id, userName: bot.name, isTyping: false,
          });
          const botMsg: ChatMessage = {
            id: 'msg_bot_resp_' + Date.now(),
            conversationId: roomId,
            senderId: bot.id, senderName: bot.name,
            senderAvatar: bot.avatar, senderColor: bot.color,
            type: 'text', content: respText,
            createdAt: new Date().toISOString(),
            status: 'sent',
          };
          const list2 = roomMessages.get(roomId) || [];
          list2.push(botMsg);
          roomMessages.set(roomId, list2);
          io.to('room:' + roomId).emit('room:message', botMsg);
        }, 3500 + Math.random() * 3500);
      }
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

// Periodic bot messages
setInterval(() => {
  const allRoomIds = Array.from(rooms.keys());
  if (allRoomIds.length === 0) return;
  const roomId = allRoomIds[Math.floor(Math.random() * allRoomIds.length)];
  const room = rooms.get(roomId);
  if (!room) return;
  const msg = PERIODIC_MESSAGES[Math.floor(Math.random() * PERIODIC_MESSAGES.length)];
  const bot = users.get('bot_' + msg.botIdx);
  if (!bot) return;
  const message: ChatMessage = {
    id: 'msg_bot_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    conversationId: roomId,
    senderId: bot.id, senderName: bot.name,
    senderAvatar: bot.avatar, senderColor: bot.color,
    type: 'text', content: msg.text,
    createdAt: new Date().toISOString(), status: 'sent',
  };
  const list = roomMessages.get(roomId) || [];
  list.push(message);
  if (list.length > 500) list.splice(0, list.length - 500);
  roomMessages.set(roomId, list);
  io.to('room:' + roomId).emit('room:message', message);
}, 60000);

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log('═══════════════════════════════════════');
  console.log('🌙 Noor AI FINAL on port', PORT);
  console.log('🤖 8 bots ready (DM + Rooms replies)');
  console.log('📖 Daily content + Stories ready');
  console.log('═══════════════════════════════════════');
});
