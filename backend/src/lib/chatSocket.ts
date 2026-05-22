// G:\noor-ai\backend\src\lib\chatSocket.ts
import { Server } from 'socket.io';

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  type: 'text' | 'image' | 'file' | 'voice';
  content: string;        // text or base64 data
  fileName?: string;
  fileSize?: number;
  duration?: number;      // for voice messages
  createdAt: string;
  status: 'sent' | 'delivered' | 'read';
}

// In-memory storage (later: replace with Prisma)
const messages: Map<string, ChatMessage[]> = new Map();
const onlineUsers: Map<string, string> = new Map(); // userId -> socketId
const typingUsers: Map<string, Set<string>> = new Map(); // convId -> userIds

export function setupChatSockets(io: Server) {
  io.on('connection', (socket) => {
    console.log('🔌 New socket:', socket.id);

    // ── User comes online ─────────────────────────────
    socket.on('user:online', ({ userId, userName }: any) => {
      onlineUsers.set(userId, socket.id);
      socket.data.userId = userId;
      socket.data.userName = userName;
      io.emit('user:status', { userId, online: true });
      console.log('✅ User online:', userName);
    });

    // ── Join a conversation room ──────────────────────
    socket.on('chat:join', ({ conversationId }: any) => {
      socket.join('chat:' + conversationId);
      // Send chat history
      const history = messages.get(conversationId) || [];
      socket.emit('chat:history', history);
    });

    // ── Leave conversation ────────────────────────────
    socket.on('chat:leave', ({ conversationId }: any) => {
      socket.leave('chat:' + conversationId);
    });

    // ── Send a message ────────────────────────────────
    socket.on('chat:send', (msg: ChatMessage) => {
      // Save in memory
      const list = messages.get(msg.conversationId) || [];
      list.push(msg);
      messages.set(msg.conversationId, list);

      // Broadcast to room (including sender for confirmation)
      io.to('chat:' + msg.conversationId).emit('chat:message', msg);

      // Update status to delivered after 500ms
      setTimeout(() => {
        msg.status = 'delivered';
        io.to('chat:' + msg.conversationId).emit('chat:status', {
          messageId: msg.id,
          status: 'delivered',
        });
      }, 500);
    });

    // ── Mark message as read ──────────────────────────
    socket.on('chat:read', ({ conversationId, messageId }: any) => {
      const list = messages.get(conversationId) || [];
      const msg = list.find(m => m.id === messageId);
      if (msg) msg.status = 'read';

      io.to('chat:' + conversationId).emit('chat:status', {
        messageId,
        status: 'read',
      });
    });

    // ── Typing indicator ──────────────────────────────
    socket.on('chat:typing', ({ conversationId, isTyping }: any) => {
      const userId = socket.data.userId;
      const userName = socket.data.userName;
      if (!userId) return;

      let typingSet = typingUsers.get(conversationId);
      if (!typingSet) { typingSet = new Set(); typingUsers.set(conversationId, typingSet); }

      if (isTyping) typingSet.add(userId);
      else typingSet.delete(userId);

      socket.to('chat:' + conversationId).emit('chat:typing', {
        userId, userName, isTyping,
      });
    });

    // ── Delete a message ──────────────────────────────
    socket.on('chat:delete', ({ conversationId, messageId }: any) => {
      const list = messages.get(conversationId) || [];
      const idx = list.findIndex(m => m.id === messageId);
      if (idx >= 0) {
        list.splice(idx, 1);
        messages.set(conversationId, list);
        io.to('chat:' + conversationId).emit('chat:deleted', { messageId });
      }
    });

    // ── Disconnect ────────────────────────────────────
    socket.on('disconnect', () => {
      const userId = socket.data.userId;
      if (userId) {
        onlineUsers.delete(userId);
        io.emit('user:status', { userId, online: false });
        console.log('❌ User offline:', socket.data.userName);
      }
    });
  });
}

export function getOnlineUsers(): string[] {
  return Array.from(onlineUsers.keys());
}
