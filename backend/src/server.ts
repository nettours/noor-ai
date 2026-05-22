// G:\noor-ai\backend\src\server.ts
// النسخة الكاملة — تستبدل ما قبلها
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
  type: 'text' | 'image' | 'file' | 'voice' | 'call';
  content: string;
  fileName?: string; fileSize?: number; duration?: number;
  callType?: 'audio' | 'video';
  callStatus?: 'ended' | 'missed' | 'rejected';
  createdAt: string;
  status: 'sent' | 'delivered' | 'read';
}

const users = new Map<string, User>();
const usersByEmail = new Map<string, string>();
const messages = new Map<string, ChatMessage[]>();
const onlineUsers = new Map<string, string>();
const typingUsers = new Map<string, Set<string>>();

// Active calls: callId -> { caller, callee, type, createdAt }
const activeCalls = new Map<string, {
  callId: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  callerColor: string;
  calleeId: string;
  type: 'audio' | 'video';
  createdAt: number;
}>();

const JWT_SECRET = process.env.JWT_SECRET || 'noor-secret-2025';
const COLORS = ['#10B981','#F59E0B','#3B82F6','#EC4899','#A855F7','#FB923C','#06B6D4','#EF4444','#84CC16','#14B8A6','#F472B6','#8B5CF6'];
const pickColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

function auth(req: any, res: Response, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, error: 'No token' });
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch { res.status(401).json({ success: false, error: 'Invalid' }); }
}

app.get('/health', (req, res) => res.json({ status: 'ok', users: users.size, online: onlineUsers.size }));

app.post('/api/auth/register', async (req: Request, res: Response) => {
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

app.post('/api/auth/login', async (req: Request, res: Response) => {
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

app.get('/api/users', auth, (req: any, res: Response) => {
  const list = Array.from(users.values())
    .filter(u => u.id !== req.userId)
    .map(u => ({
      id: u.id, name: u.name, avatar: u.avatar, color: u.color,
      online: onlineUsers.has(u.id), lastSeen: u.lastSeen,
    }));
  res.json({ success: true, users: list });
});

app.get('/api/chat/:conversationId', auth, (req: any, res: Response) => {
  res.json({ success: true, messages: messages.get(req.params.conversationId) || [] });
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
    console.log('🟢', userName, '(' + onlineUsers.size + ' online)');
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

  // ═══════════════════════════════════════════════════════
  // WebRTC SIGNALING — Voice & Video Calls
  // ═══════════════════════════════════════════════════════

  // 1) المتصل يبدأ مكالمة
  socket.on('call:initiate', ({ calleeId, type }: any) => {
    const callerId = socket.data.userId;
    const callerName = socket.data.userName;
    const caller = users.get(callerId);
    if (!caller) return;

    const calleeSocketId = onlineUsers.get(calleeId);
    if (!calleeSocketId) {
      socket.emit('call:failed', { reason: 'المستخدم غير متصل' });
      return;
    }

    const callId = 'call_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    activeCalls.set(callId, {
      callId, callerId, callerName,
      callerAvatar: caller.avatar, callerColor: caller.color,
      calleeId, type, createdAt: Date.now(),
    });

    // إرسال إشعار للمستلم
    io.to(calleeSocketId).emit('call:incoming', {
      callId, callerId, callerName,
      callerAvatar: caller.avatar, callerColor: caller.color,
      type,
    });

    // تأكيد للمتصل
    socket.emit('call:ringing', { callId });
    console.log('📞 Call initiated:', callerName, '→', calleeId, '(' + type + ')');

    // إنهاء تلقائي بعد 45 ثانية إذا لم يرد
    setTimeout(() => {
      if (activeCalls.has(callId)) {
        const call = activeCalls.get(callId);
        activeCalls.delete(callId);
        io.to(socket.id).emit('call:ended', { reason: 'لم يرد' });
        if (calleeSocketId) io.to(calleeSocketId).emit('call:cancelled', { callId });
      }
    }, 45000);
  });

  // 2) المستلم يقبل المكالمة
  socket.on('call:accept', ({ callId }: any) => {
    const call = activeCalls.get(callId);
    if (!call) return;
    const callerSocketId = onlineUsers.get(call.callerId);
    if (callerSocketId) io.to(callerSocketId).emit('call:accepted', { callId });
    console.log('✅ Call accepted:', callId);
  });

  // 3) المستلم يرفض المكالمة
  socket.on('call:reject', ({ callId }: any) => {
    const call = activeCalls.get(callId);
    if (!call) return;
    activeCalls.delete(callId);
    const callerSocketId = onlineUsers.get(call.callerId);
    if (callerSocketId) io.to(callerSocketId).emit('call:rejected', { callId });
    console.log('❌ Call rejected:', callId);
  });

  // 4) WebRTC SDP offer (من المتصل بعد قبول المستلم)
  socket.on('call:offer', ({ callId, offer }: any) => {
    const call = activeCalls.get(callId);
    if (!call) return;
    const calleeSocketId = onlineUsers.get(call.calleeId);
    if (calleeSocketId) io.to(calleeSocketId).emit('call:offer', { callId, offer });
  });

  // 5) WebRTC SDP answer (من المستلم رداً على offer)
  socket.on('call:answer', ({ callId, answer }: any) => {
    const call = activeCalls.get(callId);
    if (!call) return;
    const callerSocketId = onlineUsers.get(call.callerId);
    if (callerSocketId) io.to(callerSocketId).emit('call:answer', { callId, answer });
  });

  // 6) ICE candidate (تبادل بين الطرفين)
  socket.on('call:ice', ({ callId, candidate }: any) => {
    const call = activeCalls.get(callId);
    if (!call) return;
    const myId = socket.data.userId;
    const otherId = myId === call.callerId ? call.calleeId : call.callerId;
    const otherSocketId = onlineUsers.get(otherId);
    if (otherSocketId) io.to(otherSocketId).emit('call:ice', { callId, candidate });
  });

  // 7) إنهاء المكالمة
  socket.on('call:end', ({ callId }: any) => {
    const call = activeCalls.get(callId);
    if (!call) return;
    activeCalls.delete(callId);
    const otherId = socket.data.userId === call.callerId ? call.calleeId : call.callerId;
    const otherSocketId = onlineUsers.get(otherId);
    if (otherSocketId) io.to(otherSocketId).emit('call:ended', { callId });
    console.log('🛑 Call ended:', callId);
  });

  socket.on('disconnect', () => {
    const userId = socket.data.userId;
    if (userId) {
      onlineUsers.delete(userId);
      const u = users.get(userId);
      if (u) u.lastSeen = new Date().toISOString();
      io.emit('user:status', { userId, online: false });

      // إنهاء أي مكالمة نشطة لهذا المستخدم
      for (const [callId, call] of activeCalls.entries()) {
        if (call.callerId === userId || call.calleeId === userId) {
          activeCalls.delete(callId);
          const otherId = call.callerId === userId ? call.calleeId : call.callerId;
          const otherSocketId = onlineUsers.get(otherId);
          if (otherSocketId) io.to(otherSocketId).emit('call:ended', { reason: 'انقطع الاتصال' });
        }
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log('═══════════════════════════════════════');
  console.log('🌙 Noor AI Backend running on port', PORT);
  console.log('💬 Socket.io ready');
  console.log('👥 Users API ready');
  console.log('📞 WebRTC Calls ready');
  console.log('═══════════════════════════════════════');
});
