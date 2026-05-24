// G:\noor-ai\backend\src\server.ts
// نسخة كاملة مع غرف الدردشة (Chat Rooms)
import express, { Request, Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface User {
  id: string; name: string; email: string;
  passwordHash: string; avatar: string; color: string;
  createdAt: string; lastSeen: string;
}

interface ChatMessage {
  id: string; conversationId: string; senderId: string; senderName: string;
  senderAvatar?: string; senderColor?: string;
  type: 'text' | 'image' | 'file' | 'voice';
  content: string;
  fileName?: string; fileSize?: number; duration?: number;
  createdAt: string; status: 'sent' | 'delivered' | 'read';
}

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  icon: string;          // emoji
  color: string;
  category: 'quran' | 'fiqh' | 'general' | 'study' | 'youth' | 'family';
  isPublic: boolean;
  password?: string;     // for private rooms
  createdBy: string;
  createdByName: string;
  members: Set<string>;  // user IDs
  admins: Set<string>;
  createdAt: string;
}

const users = new Map<string, User>();
const usersByEmail = new Map<string, string>();
const messages = new Map<string, ChatMessage[]>();      // convId -> messages (DM)
const roomMessages = new Map<string, ChatMessage[]>();  // roomId -> messages
const rooms = new Map<string, ChatRoom>();              // roomId -> room
const onlineUsers = new Map<string, string>();
const typingUsers = new Map<string, Set<string>>();
const activeCalls = new Map<string, any>();

const JWT_SECRET = process.env.JWT_SECRET || 'noor-secret-2025';
const COLORS = ['#10B981','#F59E0B','#3B82F6','#EC4899','#A855F7','#FB923C','#06B6D4','#EF4444','#84CC16','#14B8A6','#F472B6','#8B5CF6'];
const pickColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

// ─── Seed default rooms ──────────────────────────────
function seedDefaultRooms() {
  const defaults: Partial<ChatRoom>[] = [
    { name: 'مدارسة القرآن', description: 'لمحبي حفظ القرآن وتدارسه', icon: '📖', color: '#10B981', category: 'quran' },
    { name: 'الفقه والأحكام', description: 'نقاش المسائل الفقهية', icon: '⚖️', color: '#FBBF24', category: 'fiqh' },
    { name: 'الترحيب', description: 'غرفة الترحيب بالأعضاء الجدد', icon: '👋', color: '#67E8F9', category: 'general' },
    { name: 'طلاب العلم', description: 'لطلاب العلم الشرعي', icon: '🎓', color: '#A855F7', category: 'study' },
    { name: 'شباب المسلمين', description: 'تواصل مع شباب المسلمين', icon: '🌟', color: '#EC4899', category: 'youth' },
    { name: 'الأسرة المسلمة', description: 'نصائح وأخوة في الأسرة', icon: '👨‍👩‍👧', color: '#F87171', category: 'family' },
  ];

  defaults.forEach((d, i) => {
    const id = 'room_default_' + i;
    const room: ChatRoom = {
      id, name: d.name!, description: d.description!,
      icon: d.icon!, color: d.color!, category: d.category as any,
      isPublic: true, createdBy: 'system', createdByName: 'نور AI',
      members: new Set(), admins: new Set(),
      createdAt: new Date().toISOString(),
    };
    rooms.set(id, room);
  });
  console.log('📦 Seeded', defaults.length, 'default rooms');
}
seedDefaultRooms();

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

// ─── Health ─────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    users: users.size,
    online: onlineUsers.size,
    rooms: rooms.size,
    time: new Date().toISOString()
  });
});

app.get('/', (_req, res) => res.json({ message: '🌙 Noor AI Backend v2', status: 'running' }));

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
    res.json({ success: true, data: { token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, color: user.color } }});
  } catch (e) { res.status(500).json({ success: false, error: 'خطأ' }); }
});

app.post('/api/auth/login', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'البيانات ناقصة' });
    const userId = usersByEmail.get(email.toLowerCase());
    const user = userId ? users.get(userId) : null;
    if (!user) return res.status(401).json({ success: false, error: 'بيانات خاطئة' });
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
      online: onlineUsers.has(u.id), lastSeen: u.lastSeen,
    }));
  res.json({ success: true, users: list });
});

// ─── DM Chat ────────────────────────────────────────
app.get('/api/chat/:conversationId', auth, (req: any, res: Response) => {
  res.json({ success: true, messages: messages.get(req.params.conversationId) || [] });
});

// ═══════════════════════════════════════════════════
// CHAT ROOMS API
// ═══════════════════════════════════════════════════

// List all rooms
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
    }));
  res.json({ success: true, rooms: list });
});

// Get single room
app.get('/api/rooms/:id', auth, (req: any, res: Response): any => {
  const room = rooms.get(req.params.id);
  if (!room) return res.status(404).json({ success: false, error: 'الغرفة غير موجودة' });
  if (!room.isPublic && !room.members.has(req.userId)) {
    return res.status(403).json({ success: false, error: 'غير مصرّح لك' });
  }

  const memberList = Array.from(room.members).map(id => {
    const u = users.get(id);
    if (!u) return null;
    return {
      id: u.id, name: u.name, avatar: u.avatar, color: u.color,
      online: onlineUsers.has(u.id),
      isAdmin: room.admins.has(u.id),
      isOwner: room.createdBy === u.id,
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

// Create new room
app.post('/api/rooms', auth, (req: any, res: Response): any => {
  const { name, description, icon, color, category, isPublic } = req.body;
  if (!name?.trim()) return res.status(400).json({ success: false, error: 'اسم الغرفة مطلوب' });
  if (name.trim().length < 3) return res.status(400).json({ success: false, error: 'الاسم قصير جداً' });

  const user = users.get(req.userId);
  if (!user) return res.status(401).json({ success: false });

  const id = 'room_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  const room: ChatRoom = {
    id,
    name: name.trim(),
    description: (description || '').trim(),
    icon: icon || '💬',
    color: color || pickColor(),
    category: category || 'general',
    isPublic: isPublic !== false,
    createdBy: req.userId,
    createdByName: user.name,
    members: new Set([req.userId]),
    admins: new Set([req.userId]),
    createdAt: new Date().toISOString(),
  };
  rooms.set(id, room);

  console.log('🏠 New room:', room.name, 'by', user.name);

  // Broadcast new room to everyone
  io.emit('room:new', {
    id: room.id, name: room.name, description: room.description,
    icon: room.icon, color: room.color, category: room.category,
    isPublic: room.isPublic, memberCount: 1, createdByName: user.name,
  });

  res.json({ success: true, room: { id: room.id } });
});

// Join room
app.post('/api/rooms/:id/join', auth, (req: any, res: Response): any => {
  const room = rooms.get(req.params.id);
  if (!room) return res.status(404).json({ success: false });
  if (!room.isPublic) return res.status(403).json({ success: false, error: 'غرفة خاصة' });

  room.members.add(req.userId);
  const user = users.get(req.userId);
  if (user) {
    io.to('room:' + room.id).emit('room:member-joined', {
      roomId: room.id,
      member: { id: user.id, name: user.name, avatar: user.avatar, color: user.color, online: true },
    });
  }
  res.json({ success: true });
});

// Leave room
app.post('/api/rooms/:id/leave', auth, (req: any, res: Response): any => {
  const room = rooms.get(req.params.id);
  if (!room) return res.status(404).json({ success: false });
  if (room.createdBy === req.userId) {
    return res.status(400).json({ success: false, error: 'لا يمكن للمنشئ مغادرة الغرفة' });
  }
  room.members.delete(req.userId);
  room.admins.delete(req.userId);
  io.to('room:' + room.id).emit('room:member-left', { roomId: room.id, userId: req.userId });
  res.json({ success: true });
});

// Delete room (owner only)
app.delete('/api/rooms/:id', auth, (req: any, res: Response): any => {
  const room = rooms.get(req.params.id);
  if (!room) return res.status(404).json({ success: false });
  if (room.createdBy !== req.userId) return res.status(403).json({ success: false, error: 'فقط المنشئ يمكنه الحذف' });
  rooms.delete(req.params.id);
  roomMessages.delete(req.params.id);
  io.emit('room:deleted', { roomId: req.params.id });
  res.json({ success: true });
});

// Get room messages
app.get('/api/rooms/:id/messages', auth, (req: any, res: Response): any => {
  const room = rooms.get(req.params.id);
  if (!room) return res.status(404).json({ success: false });
  if (!room.isPublic && !room.members.has(req.userId)) {
    return res.status(403).json({ success: false });
  }
  res.json({ success: true, messages: roomMessages.get(req.params.id) || [] });
});

// ─── HTTP + Socket.io ───────────────────────────────
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'], credentials: true },
  maxHttpBufferSize: 50 * 1024 * 1024,
});

io.on('connection', (socket) => {
  console.log('🔌 Socket:', socket.id);

  socket.on('user:online', ({ userId, userName }: any) => {
    if (!userId || !users.has(userId)) return;
    onlineUsers.set(userId, socket.id);
    socket.data.userId = userId;
    socket.data.userName = userName;
    io.emit('user:status', { userId, online: true });
    console.log('🟢', userName);
  });

  // ─── DM Chat ────────────────────────────────────
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

    const otherUserId = msg.conversationId.split('__').find(id => id !== msg.senderId);
    if (otherUserId) {
      const otherSocketId = onlineUsers.get(otherUserId);
      if (otherSocketId) io.to(otherSocketId).emit('chat:notify', { conversationId: msg.conversationId, message: msg });
    }
    setTimeout(() => {
      msg.status = 'delivered';
      io.to('chat:' + msg.conversationId).emit('chat:status', { messageId: msg.id, status: 'delivered' });
    }, 500);
  });

  socket.on('chat:read', ({ conversationId, messageId }: any) => {
    const list = messages.get(conversationId) || [];
    const msg = list.find(m => m.id === messageId);
    if (msg) msg.status = 'read';
    io.to('chat:' + conversationId).emit('chat:status', { messageId, status: 'read' });
  });

  socket.on('chat:typing', ({ conversationId, isTyping }: any) => {
    const userId = socket.data.userId;
    if (!userId) return;
    let s = typingUsers.get(conversationId);
    if (!s) { s = new Set(); typingUsers.set(conversationId, s); }
    if (isTyping) s.add(userId); else s.delete(userId);
    socket.to('chat:' + conversationId).emit('chat:typing', { userId, isTyping });
  });

  // ═══════════════════════════════════════════════
  // ROOM EVENTS
  // ═══════════════════════════════════════════════

  socket.on('room:join', ({ roomId }: any) => {
    const room = rooms.get(roomId);
    if (!room) return;
    socket.join('room:' + roomId);
    socket.emit('room:history', roomMessages.get(roomId) || []);

    // Auto-add to members if public
    if (room.isPublic && socket.data.userId) {
      room.members.add(socket.data.userId);
    }

    // Notify others
    const user = users.get(socket.data.userId);
    if (user) {
      socket.to('room:' + roomId).emit('room:user-online', {
        roomId,
        user: { id: user.id, name: user.name, avatar: user.avatar, color: user.color },
      });
    }
    console.log('👥', socket.data.userName, 'joined room', room.name);
  });

  socket.on('room:leave', ({ roomId }: any) => {
    socket.leave('room:' + roomId);
    if (socket.data.userId) {
      socket.to('room:' + roomId).emit('room:user-offline', {
        roomId, userId: socket.data.userId,
      });
    }
  });

  socket.on('room:send', ({ roomId, message }: any) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const userId = socket.data.userId;
    if (!userId) return;

    // Public room: auto-add to members
    if (room.isPublic) room.members.add(userId);

    // Private room: must be member
    if (!room.isPublic && !room.members.has(userId)) return;

    const user = users.get(userId);
    if (!user) return;

    const msg: ChatMessage = {
      ...message,
      id: message.id || Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      conversationId: roomId,
      senderId: userId,
      senderName: user.name,
      senderAvatar: user.avatar,
      senderColor: user.color,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };

    const list = roomMessages.get(roomId) || [];
    list.push(msg);
    // Keep only last 500 messages per room
    if (list.length > 500) list.splice(0, list.length - 500);
    roomMessages.set(roomId, list);

    io.to('room:' + roomId).emit('room:message', msg);
  });

  socket.on('room:typing', ({ roomId, isTyping }: any) => {
    const userId = socket.data.userId;
    const userName = socket.data.userName;
    if (!userId) return;
    socket.to('room:' + roomId).emit('room:typing', {
      roomId, userId, userName, isTyping,
    });
  });

  // ─── WebRTC Calls ────────────────────────────────
  socket.on('call:initiate', ({ calleeId, type }: any) => {
    const callerId = socket.data.userId;
    const callerName = socket.data.userName;
    const caller = users.get(callerId);
    if (!caller) return;
    const calleeSocketId = onlineUsers.get(calleeId);
    if (!calleeSocketId) { socket.emit('call:failed', { reason: 'المستخدم غير متصل' }); return; }

    const callId = 'call_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    activeCalls.set(callId, { callId, callerId, callerName, calleeId, type, createdAt: Date.now() });

    io.to(calleeSocketId).emit('call:incoming', {
      callId, callerId, callerName,
      callerAvatar: caller.avatar, callerColor: caller.color, type,
    });
    socket.emit('call:ringing', { callId });

    setTimeout(() => {
      if (activeCalls.has(callId)) {
        activeCalls.delete(callId);
        socket.emit('call:ended', { reason: 'لم يرد' });
        if (calleeSocketId) io.to(calleeSocketId).emit('call:cancelled', { callId });
      }
    }, 45000);
  });

  socket.on('call:accept', ({ callId }: any) => {
    const call = activeCalls.get(callId); if (!call) return;
    const callerSocketId = onlineUsers.get(call.callerId);
    if (callerSocketId) io.to(callerSocketId).emit('call:accepted', { callId });
  });

  socket.on('call:reject', ({ callId }: any) => {
    const call = activeCalls.get(callId); if (!call) return;
    activeCalls.delete(callId);
    const callerSocketId = onlineUsers.get(call.callerId);
    if (callerSocketId) io.to(callerSocketId).emit('call:rejected', { callId });
  });

  socket.on('call:offer', ({ callId, offer }: any) => {
    const call = activeCalls.get(callId); if (!call) return;
    const calleeSocketId = onlineUsers.get(call.calleeId);
    if (calleeSocketId) io.to(calleeSocketId).emit('call:offer', { callId, offer });
  });

  socket.on('call:answer', ({ callId, answer }: any) => {
    const call = activeCalls.get(callId); if (!call) return;
    const callerSocketId = onlineUsers.get(call.callerId);
    if (callerSocketId) io.to(callerSocketId).emit('call:answer', { callId, answer });
  });

  socket.on('call:ice', ({ callId, candidate }: any) => {
    const call = activeCalls.get(callId); if (!call) return;
    const myId = socket.data.userId;
    const otherId = myId === call.callerId ? call.calleeId : call.callerId;
    const otherSocketId = onlineUsers.get(otherId);
    if (otherSocketId) io.to(otherSocketId).emit('call:ice', { callId, candidate });
  });

  socket.on('call:end', ({ callId }: any) => {
    const call = activeCalls.get(callId); if (!call) return;
    activeCalls.delete(callId);
    const otherId = socket.data.userId === call.callerId ? call.calleeId : call.callerId;
    const otherSocketId = onlineUsers.get(otherId);
    if (otherSocketId) io.to(otherSocketId).emit('call:ended', { callId });
  });

  socket.on('disconnect', () => {
    const userId = socket.data.userId;
    if (userId) {
      onlineUsers.delete(userId);
      const u = users.get(userId);
      if (u) u.lastSeen = new Date().toISOString();
      io.emit('user:status', { userId, online: false });
      for (const [callId, call] of activeCalls.entries()) {
        if (call.callerId === userId || call.calleeId === userId) {
          activeCalls.delete(callId);
          const otherId = call.callerId === userId ? call.calleeId : call.callerId;
          const otherSocketId = onlineUsers.get(otherId);
          if (otherSocketId) io.to(otherSocketId).emit('call:ended', { reason: 'انقطع' });
        }
      }
    }
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log('═══════════════════════════════════════');
  console.log('🌙 Noor AI Backend v2 running on port', PORT);
  console.log('💬 Socket.io ready');
  console.log('👥 Users API ready');
  console.log('🏠 Rooms API ready');
  console.log('📞 WebRTC Calls ready');
  console.log('═══════════════════════════════════════');
});
