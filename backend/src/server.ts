// G:\noor-ai\backend\src\server.ts
// النسخة النهائية - مع غرف ومستخدمين وهميين يتفاعلون بـ AI
import express, { Request, Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface User {
  id: string; name: string; email: string;
  // passwordHash: string; avatar: string; clor: string;
  bio?: string; isBot?: boolean;
  createdAt: string; lastSeen: string;
}

interface ChatMessage {
  id: string; conversationId: string;
  senderId: string; senderName: string;
  senderAvatar?: string; senderColor?: string;
  type: 'text' | 'image' | 'file' | 'voice';
  content: string;
  fileName?: string; fileSize?: number; duration?: number;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read';
}

interface ChatRoom {
  id: string; name: string; description: string;
  icon: string; color: string;
  category: 'quran' | 'fiqh' | 'general' | 'study' | 'youth' | 'family' | 'dawah';
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
const typingUsers = new Map<string, Set<string>>();
const activeCalls = new Map<string, any>();

const JWT_SECRET = process.env.JWT_SECRET || 'noor-secret-2025';
const COLORS = ['#10B981','#F59E0B','#3B82F6','#EC4899','#A855F7','#FB923C','#06B6D4','#EF4444','#84CC16','#14B8A6','#F472B6','#8B5CF6'];
const pickColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

// ═══════════════════════════════════════════════════════
// FAKE USERS (Islamic bots that interact in rooms)
// ═══════════════════════════════════════════════════════
const FAKE_USERS = [
  { name: 'أحمد المصري', email: 'ahmed.fake@noor.ai', avatar: 'أ', color: '#10B981', bio: 'طالب علم شرعي 📚' },
  { name: 'فاطمة الزهراء', email: 'fatima.fake@noor.ai', avatar: 'ف', color: '#EC4899', bio: 'حافظة قرآن 🌷' },
  { name: 'محمد العتيبي', email: 'mohamed.fake@noor.ai', avatar: 'م', color: '#A855F7', bio: 'مهتم بالفقه ⚖️' },
  { name: 'عائشة المغربية', email: 'aisha.fake@noor.ai', avatar: 'ع', color: '#FBBF24', bio: 'مدرّسة قرآن 📖' },
  { name: 'يوسف الجزائري', email: 'youssef.fake@noor.ai', avatar: 'ي', color: '#67E8F9', bio: 'إمام مسجد 🕌' },
  { name: 'خديجة التونسية', email: 'khadija.fake@noor.ai', avatar: 'خ', color: '#F87171', bio: 'باحثة شرعية 💚' },
  { name: 'عمر السوري', email: 'omar.fake@noor.ai', avatar: 'ع', color: '#34D399', bio: 'محبّ للقرآن ☪️' },
  { name: 'مريم اللبنانية', email: 'maryam.fake@noor.ai', avatar: 'م', color: '#FB923C', bio: 'متدبّرة آيات 🌙' },
];

function seedFakeUsers() {
  FAKE_USERS.forEach((fu, i) => {
    const id = 'bot_' + i;
    const user: User = {
      id, name: fu.name, email: fu.email,
      passwordHash: '', avatar: fu.avatar, color: fu.color,
      bio: fu.bio, isBot: true,
      createdAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
      lastSeen: new Date().toISOString(),
    };
    users.set(id, user);
    usersByEmail.set(fu.email, id);
    // Mark bots as online randomly (some are "online")
    if (i < 5) onlineUsers.set(id, 'bot_socket_' + i);
  });
  console.log('🤖 Seeded', FAKE_USERS.length, 'fake users (online: 5)');
}

// ═══════════════════════════════════════════════════════
// FAKE ROOMS with descriptions
// ═══════════════════════════════════════════════════════
const FAKE_ROOMS = [
  { id: 'room_quran', name: '📖 مدارسة القرآن', description: 'حلقة لتدبّر القرآن وحفظه. نراجع كل أسبوع جزءاً', icon: '📖', color: '#10B981', category: 'quran' },
  { id: 'room_fiqh', name: '⚖️ الفقه والأحكام', description: 'نناقش المسائل الفقهية بأدب وعلم', icon: '⚖️', color: '#FBBF24', category: 'fiqh' },
  { id: 'room_dawah', name: '🌟 الدعوة إلى الله', description: 'تشاركوا أساليب وأفكار الدعوة', icon: '🌟', color: '#A855F7', category: 'dawah' },
  { id: 'room_study', name: '🎓 طلاب العلم', description: 'لمن يسعى لطلب العلم الشرعي', icon: '🎓', color: '#67E8F9', category: 'study' },
  { id: 'room_youth', name: '⭐ شباب المسلمين', description: 'منصة للشباب المسلم للتواصل والتعارف', icon: '⭐', color: '#EC4899', category: 'youth' },
  { id: 'room_family', name: '👨‍👩‍👧 الأسرة المسلمة', description: 'نصائح وأخوة في تربية الأسرة', icon: '👨‍👩‍👧', color: '#F87171', category: 'family' },
  { id: 'room_welcome', name: '👋 الترحيب', description: 'غرفة الترحيب بالأعضاء الجدد', icon: '👋', color: '#34D399', category: 'general' },
  { id: 'room_hadith', name: '📜 الحديث الشريف', description: 'مدارسة الأحاديث النبوية الشريفة', icon: '📜', color: '#FB923C', category: 'study' },
];

function seedFakeRooms() {
  FAKE_ROOMS.forEach(fr => {
    const room: ChatRoom = {
      id: fr.id, name: fr.name, description: fr.description,
      icon: fr.icon, color: fr.color, category: fr.category as any,
      isPublic: true,
      createdBy: 'bot_0', createdByName: FAKE_USERS[0].name,
      members: new Set(FAKE_USERS.map((_, i) => 'bot_' + i)),
      admins: new Set(['bot_0']),
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    };
    rooms.set(fr.id, room);
  });
  console.log('🏠 Seeded', FAKE_ROOMS.length, 'fake rooms');
}

// ═══════════════════════════════════════════════════════
// FAKE MESSAGES per room (Islamic content)
// ═══════════════════════════════════════════════════════
const ROOM_MESSAGES: Record<string, Array<{ botIdx: number; text: string }>> = {
  room_quran: [
    { botIdx: 0, text: 'السلام عليكم ورحمة الله إخواني 🌙' },
    { botIdx: 1, text: 'وعليكم السلام ورحمة الله وبركاته 🤲' },
    { botIdx: 2, text: 'بارك الله فيكم، ما الجزء الذي سنراجعه هذا الأسبوع؟' },
    { botIdx: 0, text: 'الجزء الثلاثون إن شاء الله، سنبدأ من سورة عبس' },
    { botIdx: 3, text: 'سبحان الله، آيات عظيمة. ﴿ عَبَسَ وَتَوَلَّى * أَن جَاءَهُ الْأَعْمَى ﴾' },
    { botIdx: 1, text: 'تأمّلوا كيف عاتب الله نبيه ﷺ بلطف' },
    { botIdx: 4, text: 'وفيها درس عظيم: لا تحقرنّ أحداً' },
    { botIdx: 2, text: 'جزاكم الله خيراً جميعاً 💚' },
  ],
  room_fiqh: [
    { botIdx: 2, text: 'السلام عليكم، عندي سؤال في الصلاة' },
    { botIdx: 0, text: 'وعليكم السلام، تفضّل أخي' },
    { botIdx: 2, text: 'ما حكم صلاة المسبوق إذا أدرك الإمام في الركوع؟' },
    { botIdx: 4, text: 'تُحسب له ركعة عند جمهور العلماء، بشرط أن يطمئنّ راكعاً' },
    { botIdx: 5, text: 'نعم، وعليه أن يكبّر تكبيرة الإحرام قائماً ثم تكبيرة الركوع' },
    { botIdx: 2, text: 'جزاكم الله خيراً، استفدت كثيراً' },
    { botIdx: 0, text: 'ولا تنسَ أن قول الجمهور أن من أدرك الركوع أدرك الركعة' },
  ],
  room_dawah: [
    { botIdx: 4, text: 'إخواني، أفكاركم في الدعوة عبر السوشيال ميديا؟' },
    { botIdx: 1, text: 'أنصح بقصيرة وموثّقة، الناس لا يحبّون الإطالة' },
    { botIdx: 6, text: 'وأن تكون بالحكمة والموعظة الحسنة 🌟' },
    { botIdx: 4, text: 'صدقتم، والقدوة الحسنة قبل القول' },
    { botIdx: 2, text: 'أعمل على سلسلة قصيرة عن أخلاق النبي ﷺ' },
    { botIdx: 4, text: 'بارك الله فيك، فكرة رائعة!' },
  ],
  room_study: [
    { botIdx: 0, text: 'مرحباً بكم في غرفة طلاب العلم 🎓' },
    { botIdx: 6, text: 'أنا بدأت بحفظ الأربعين النووية، أي طالب علم هنا؟' },
    { botIdx: 2, text: 'أنا أدرس "العقيدة الواسطية"' },
    { botIdx: 1, text: 'وأنا أحفظ القرآن، أنهيت 15 جزءاً ولله الحمد' },
    { botIdx: 0, text: 'ما شاء الله، الله يبارك في جهودكم' },
    { botIdx: 7, text: 'نصيحة: لا تستعجلوا، الإتقان أهم من السرعة' },
  ],
  room_youth: [
    { botIdx: 6, text: 'السلام عليكم شباب 👋' },
    { botIdx: 5, text: 'وعليكم السلام، كيف الحال؟' },
    { botIdx: 6, text: 'الحمد لله، أحاول أستغلّ وقتي في رمضان القادم' },
    { botIdx: 2, text: 'فكرة جميلة، ابدأ من الآن بترك العادات السيئة' },
    { botIdx: 7, text: 'وأكثروا من قراءة القرآن قبل رمضان' },
    { botIdx: 6, text: 'جزاكم الله خيراً، نصائح قيّمة 💚' },
  ],
  room_family: [
    { botIdx: 1, text: 'كيف أعلّم أولادي حبّ القرآن؟' },
    { botIdx: 3, text: 'بالقدوة أولاً، اقرئي أمامهم يومياً' },
    { botIdx: 7, text: 'وكافئيهم على كل سورة يحفظونها 🎁' },
    { botIdx: 5, text: 'ولا تنسي الدعاء لهم بالتوفيق' },
    { botIdx: 1, text: 'بارك الله فيكم، سأبدأ من اليوم' },
  ],
  room_welcome: [
    { botIdx: 0, text: 'أهلاً بكل من ينضم إلينا 🌙' },
    { botIdx: 4, text: 'مرحباً بكم في نور AI، نسأل الله أن ينفع بنا وبكم' },
    { botIdx: 6, text: 'إن كنتم جدداً، استكشفوا الغرف الأخرى' },
    { botIdx: 1, text: 'وأهلاً بكم بين إخوانكم 💚' },
  ],
  room_hadith: [
    { botIdx: 4, text: '"إنما الأعمال بالنيات" — حديث عظيم نبدأ به' },
    { botIdx: 0, text: 'رواه البخاري ومسلم، من أعظم أحاديث الإسلام' },
    { botIdx: 2, text: 'فيه أن العبادة لا تُقبل إلا بنية خالصة' },
    { botIdx: 7, text: 'سبحان الله، حديث قصير لكن معانيه عظيمة' },
    { botIdx: 1, text: 'ومن لطائفه أن العلماء جعلوه رُبع الإسلام' },
  ],
};

// ═══════════════════════════════════════════════════════
// SEED messages with realistic timestamps (last 24 hours)
// ═══════════════════════════════════════════════════════
function seedFakeMessages() {
  let totalMessages = 0;
  for (const [roomId, msgs] of Object.entries(ROOM_MESSAGES)) {
    const baseTime = Date.now() - 86400000; // 24 hours ago
    const messagesList: ChatMessage[] = msgs.map((m, i) => {
      const botUser = users.get('bot_' + m.botIdx)!;
      return {
        id: 'msg_seed_' + roomId + '_' + i,
        conversationId: roomId,
        senderId: 'bot_' + m.botIdx,
        senderName: botUser.name,
        senderAvatar: botUser.avatar,
        senderColor: botUser.color,
        type: 'text',
        content: m.text,
        createdAt: new Date(baseTime + i * 1800000 + Math.random() * 1800000).toISOString(),
        status: 'read',
      };
    });
    roomMessages.set(roomId, messagesList);
    totalMessages += messagesList.length;
  }
  console.log('💬 Seeded', totalMessages, 'fake messages across rooms');
}

// ═══════════════════════════════════════════════════════
// PERIODIC BOT ACTIVITY (bots send new messages periodically)
// ═══════════════════════════════════════════════════════
const PERIODIC_MESSAGES = [
  { text: 'سبحان الله وبحمده، سبحان الله العظيم 🌙', botIdx: 0 },
  { text: 'اللهم صلِّ على محمد وعلى آل محمد 💚', botIdx: 1 },
  { text: '﴿ وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا ﴾', botIdx: 2 },
  { text: 'لا إله إلا الله محمد رسول الله ☪️', botIdx: 3 },
  { text: 'أستغفر الله العظيم وأتوب إليه', botIdx: 4 },
  { text: 'الحمد لله رب العالمين 🤲', botIdx: 5 },
  { text: 'بارك الله فيكم إخواني 💚', botIdx: 6 },
  { text: 'اللهم اجعل القرآن ربيع قلوبنا 🌷', botIdx: 7 },
  { text: 'ما أعظم الإسلام، الحمد لله على نعمة الإيمان', botIdx: 0 },
  { text: 'تذكير: حافظوا على أذكار الصباح والمساء 🌅', botIdx: 4 },
  { text: 'من قرأ آية الكرسي بعد كل صلاة لم يمنعه من دخول الجنة إلا الموت', botIdx: 2 },
  { text: 'ادعوا لإخواننا في كل مكان 🤲', botIdx: 7 },
];

function startBotActivity() {
  // Every 45 seconds, a random bot sends a message in a random room
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
      senderId: bot.id,
      senderName: bot.name,
      senderAvatar: bot.avatar,
      senderColor: bot.color,
      type: 'text',
      content: msg.text,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };

    const list = roomMessages.get(roomId) || [];
    list.push(message);
    if (list.length > 500) list.splice(0, list.length - 500);
    roomMessages.set(roomId, list);

    io.to('room:' + roomId).emit('room:message', message);
    console.log('🤖', bot.name, '→', room.name);
  }, 45000);

  // Random typing indicators every 20 seconds
  setInterval(() => {
    const allRoomIds = Array.from(rooms.keys());
    if (allRoomIds.length === 0) return;
    const roomId = allRoomIds[Math.floor(Math.random() * allRoomIds.length)];
    const botIdx = Math.floor(Math.random() * FAKE_USERS.length);
    const bot = users.get('bot_' + botIdx);
    if (!bot) return;

    io.to('room:' + roomId).emit('room:typing', {
      roomId, userId: bot.id, userName: bot.name, isTyping: true,
    });

    setTimeout(() => {
      io.to('room:' + roomId).emit('room:typing', {
        roomId, userId: bot.id, userName: bot.name, isTyping: false,
      });
    }, 3000);
  }, 20000);
}

// Initialize all seed data
seedFakeUsers();
seedFakeRooms();
seedFakeMessages();

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE'], credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

function auth(req: any, res: Response, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) { res.status(401).json({ success: false, error: 'No token' }); return; }
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch { res.status(401).json({ success: false, error: 'Invalid' }); }
}

app.get('/health', (_req, res) => res.json({
  status: 'ok', users: users.size, online: onlineUsers.size,
  rooms: rooms.size, time: new Date().toISOString()
}));

app.get('/', (_req, res) => res.json({ message: '🌙 Noor AI Backend ULTIMATE', status: 'running' }));

// ─── Auth ───────────────────────────────────────────
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
      avatar: name.trim()[0], color: pickColor(),
      createdAt: new Date().toISOString(), lastSeen: new Date().toISOString(),
    };
    users.set(id, user);
    usersByEmail.set(user.email, id);

    const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '30d' });
    console.log('✅ New user:', user.name);
    io.emit('user:new', { id: user.id, name: user.name, avatar: user.avatar, color: user.color, online: false });

    // Welcome message in welcome room
    setTimeout(() => {
      const welcomeRoom = rooms.get('room_welcome');
      if (welcomeRoom) {
        const welcomer = users.get('bot_0');
        if (welcomer) {
          const welcomeMsg: ChatMessage = {
            id: 'msg_welcome_' + Date.now(),
            conversationId: 'room_welcome',
            senderId: welcomer.id, senderName: welcomer.name,
            senderAvatar: welcomer.avatar, senderColor: welcomer.color,
            type: 'text',
            content: `أهلاً وسهلاً بأخينا ${user.name} في نور AI 🌙💚`,
            createdAt: new Date().toISOString(),
            status: 'sent',
          };
          const list = roomMessages.get('room_welcome') || [];
          list.push(welcomeMsg);
          roomMessages.set('room_welcome', list);
          io.to('room:room_welcome').emit('room:message', welcomeMsg);
        }
      }
    }, 3000);

    res.json({ success: true, data: { token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, color: user.color } }});
  } catch (e) { res.status(500).json({ success: false, error: 'خطأ' }); }
});

app.post('/api/auth/login', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'البيانات ناقصة' });
    const userId = usersByEmail.get(email.toLowerCase());
    const user = userId ? users.get(userId) : null;
    if (!user || user.isBot) return res.status(401).json({ success: false, error: 'بيانات خاطئة' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ success: false, error: 'بيانات خاطئة' });
    user.lastSeen = new Date().toISOString();
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, data: { token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, color: user.color } }});
  } catch { res.status(500).json({ success: false, error: 'خطأ' }); }
});

// ─── Users ──────────────────────────────────────────
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

// ═══════════════════════════════════════════════════
// ROOMS
// ═══════════════════════════════════════════════════
app.get('/api/rooms', auth, (req: any, res: Response) => {
  const list = Array.from(rooms.values())
    .filter(r => r.isPublic || r.members.has(req.userId))
    .map(r => ({
      id: r.id, name: r.name, description: r.description,
      icon: r.icon, color: r.color, category: r.category,
      isPublic: r.isPublic,
      memberCount: r.members.size,
      isMember: r.members.has(req.userId),
      isAdmin: r.admins.has(req.userId),
      isOwner: r.createdBy === req.userId,
      createdByName: r.createdByName,
      createdAt: r.createdAt,
      onlineCount: Array.from(r.members).filter(id => onlineUsers.has(id)).length,
      lastMessage: (roomMessages.get(r.id) || []).slice(-1)[0]?.content?.slice(0, 50) || '',
    }))
    .sort((a, b) => b.memberCount - a.memberCount);
  res.json({ success: true, rooms: list });
});

app.get('/api/rooms/:id', auth, (req: any, res: Response): any => {
  const room = rooms.get(req.params.id);
  if (!room) return res.status(404).json({ success: false, error: 'الغرفة غير موجودة' });
  if (!room.isPublic && !room.members.has(req.userId)) return res.status(403).json({ success: false });

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
      isMember: room.members.has(req.userId),
      isAdmin: room.admins.has(req.userId),
      isOwner: room.createdBy === req.userId,
      createdByName: room.createdByName,
      createdAt: room.createdAt,
      members: memberList,
    },
  });
});

app.post('/api/rooms', auth, (req: any, res: Response): any => {
  const { name, description, icon, color, category, isPublic } = req.body;
  if (!name?.trim() || name.trim().length < 3) return res.status(400).json({ success: false, error: 'الاسم قصير' });

  const user = users.get(req.userId);
  if (!user) return res.status(401).json({ success: false });

  const id = 'room_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  const room: ChatRoom = {
    id, name: name.trim(), description: (description || '').trim(),
    icon: icon || '💬', color: color || pickColor(),
    category: category || 'general',
    isPublic: isPublic !== false,
    createdBy: req.userId, createdByName: user.name,
    members: new Set([req.userId]),
    admins: new Set([req.userId]),
    createdAt: new Date().toISOString(),
  };
  rooms.set(id, room);
  console.log('🏠 New room:', room.name, 'by', user.name);

  io.emit('room:new', {
    id: room.id, name: room.name, description: room.description,
    icon: room.icon, color: room.color, category: room.category,
    isPublic: room.isPublic, memberCount: 1, createdByName: user.name,
  });

  res.json({ success: true, room: { id: room.id } });
});

app.post('/api/rooms/:id/join', auth, (req: any, res: Response): any => {
  const room = rooms.get(req.params.id);
  if (!room) return res.status(404).json({ success: false });
  if (!room.isPublic) return res.status(403).json({ success: false });
  room.members.add(req.userId);
  res.json({ success: true });
});

app.delete('/api/rooms/:id', auth, (req: any, res: Response): any => {
  const room = rooms.get(req.params.id);
  if (!room) return res.status(404).json({ success: false });
  if (room.createdBy !== req.userId) return res.status(403).json({ success: false });
  rooms.delete(req.params.id);
  roomMessages.delete(req.params.id);
  io.emit('room:deleted', { roomId: req.params.id });
  res.json({ success: true });
});

app.get('/api/rooms/:id/messages', auth, (req: any, res: Response): any => {
  const room = rooms.get(req.params.id);
  if (!room) return res.status(404).json({ success: false });
  res.json({ success: true, messages: roomMessages.get(req.params.id) || [] });
});

// ─── HTTP + Socket.io ───────────────────────────────
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
  });

  // ─── ROOMS ───────────────────────────────────────
  socket.on('room:join', ({ roomId }: any) => {
    const room = rooms.get(roomId);
    if (!room) return;
    socket.join('room:' + roomId);
    socket.emit('room:history', roomMessages.get(roomId) || []);
    if (room.isPublic && socket.data.userId) room.members.add(socket.data.userId);
  });

  socket.on('room:leave', ({ roomId }: any) => socket.leave('room:' + roomId));

  socket.on('room:send', ({ roomId, message }: any) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const userId = socket.data.userId;
    if (!userId) return;
    if (room.isPublic) room.members.add(userId);

    const user = users.get(userId);
    if (!user) return;

    const msg: ChatMessage = {
      id: message.id || Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      conversationId: roomId,
      senderId: userId,
      senderName: user.name,
      senderAvatar: user.avatar,
      senderColor: user.color,
      type: message.type || 'text',
      content: message.content,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };

    const list = roomMessages.get(roomId) || [];
    list.push(msg);
    if (list.length > 500) list.splice(0, list.length - 500);
    roomMessages.set(roomId, list);

    io.to('room:' + roomId).emit('room:message', msg);

    // BOT RESPONSE: 40% chance a bot responds within 3-8 seconds
    if (Math.random() < 0.4) {
      const botResponses = [
        'بارك الله فيك أخي 💚',
        'ما شاء الله، نقطة جميلة',
        'جزاك الله خيراً 🤲',
        'سبحان الله، تأمّل عميق',
        'صدقت أخي الكريم',
        'أحسنت 🌟',
        'الله يبارك فيك',
        '﴿ وَذَكِّرْ فَإِنَّ الذِّكْرَى تَنفَعُ الْمُؤْمِنِينَ ﴾',
        'أسعدنا حضورك معنا',
        'الحمد لله على مشاركتك',
      ];
      const respText = botResponses[Math.floor(Math.random() * botResponses.length)];
      const botIdx = Math.floor(Math.random() * FAKE_USERS.length);
      const bot = users.get('bot_' + botIdx);
      if (bot) {
        // Typing indicator
        setTimeout(() => {
          io.to('room:' + roomId).emit('room:typing', {
            roomId, userId: bot.id, userName: bot.name, isTyping: true,
          });
        }, 1000);

        setTimeout(() => {
          io.to('room:' + roomId).emit('room:typing', {
            roomId, userId: bot.id, userName: bot.name, isTyping: false,
          });

          const botMsg: ChatMessage = {
            id: 'msg_bot_resp_' + Date.now(),
            conversationId: roomId,
            senderId: bot.id,
            senderName: bot.name,
            senderAvatar: bot.avatar,
            senderColor: bot.color,
            type: 'text',
            content: respText,
            createdAt: new Date().toISOString(),
            status: 'sent',
          };
          const list2 = roomMessages.get(roomId) || [];
          list2.push(botMsg);
          roomMessages.set(roomId, list2);
          io.to('room:' + roomId).emit('room:message', botMsg);
        }, 3000 + Math.random() * 5000);
      }
    }
  });

  socket.on('room:typing', ({ roomId, isTyping }: any) => {
    const userId = socket.data.userId;
    const userName = socket.data.userName;
    if (!userId) return;
    socket.to('room:' + roomId).emit('room:typing', { roomId, userId, userName, isTyping });
  });

  // Calls (kept simple)
  socket.on('call:initiate', ({ calleeId, type }: any) => {
    const callerId = socket.data.userId;
    const caller = users.get(callerId); if (!caller) return;
    const calleeSocketId = onlineUsers.get(calleeId);
    if (!calleeSocketId) { socket.emit('call:failed', { reason: 'غير متصل' }); return; }
    const callId = 'call_' + Date.now();
    activeCalls.set(callId, { callId, callerId, callerName: caller.name, calleeId, type });
    io.to(calleeSocketId).emit('call:incoming', { callId, callerId, callerName: caller.name, callerAvatar: caller.avatar, callerColor: caller.color, type });
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

// Start periodic bot activity
startBotActivity();

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log('═══════════════════════════════════════');
  console.log('🌙 Noor AI ULTIMATE on port', PORT);
  console.log('🤖', FAKE_USERS.length, 'fake users active');
  console.log('🏠', FAKE_ROOMS.length, 'rooms with seeded messages');
  console.log('💬 Bot activity: every 45s + responses');
  console.log('═══════════════════════════════════════');
});
