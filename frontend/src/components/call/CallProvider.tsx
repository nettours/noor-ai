'use client';
import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import type { Socket } from 'socket.io-client';

// STUN servers (مجاني من Google) — لاتصال P2P عبر الإنترنت
const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export type CallState = 'idle' | 'outgoing' | 'incoming' | 'connecting' | 'in-call' | 'ended';

interface CallInfo {
  callId: string;
  type: 'audio' | 'video';
  remoteUserId: string;
  remoteUserName: string;
  remoteUserAvatar: string;
  remoteUserColor: string;
  isInitiator: boolean;
}

interface CallContextType {
  state: CallState;
  callInfo: CallInfo | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  callDuration: number;
  initiateCall: (remoteUser: any, type: 'audio' | 'video') => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
}

const CallContext = createContext<CallContextType | null>(null);

export const useCall = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be within CallProvider');
  return ctx;
};

export function CallProvider({ children, socket, me }: { children: ReactNode; socket: Socket | null; me: { id: string; name: string } }) {
  const [state, setState] = useState<CallState>('idle');
  const [callInfo, setCallInfo] = useState<CallInfo | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  // The real callId assigned by the backend. The initiator starts with 'pending'
  // and learns the real id from call:ringing/call:accepted — ICE/end must use it.
  const callIdRef = useRef<string>('');
  const pendingIceRef = useRef<RTCIceCandidate[]>([]);
  const durationTimerRef = useRef<any>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);

  // ─── Audio for ringtone ─────────────────────────
  useEffect(() => {
    const audio = new Audio('data:audio/mp3;base64,SUQzAwAAAAAAClRJVDIAAAAGAAAAcmluZw==');
    audio.loop = true;
    ringtoneRef.current = audio;
    return () => { audio.pause(); };
  }, []);

  // ─── Socket listeners ───────────────────────────
  useEffect(() => {
    if (!socket) return;

    socket.on('call:incoming', (data: any) => {
      console.log('📞 Incoming call:', data);
      callIdRef.current = data.callId;
      setCallInfo({
        callId: data.callId,
        type: data.type,
        remoteUserId: data.callerId,
        remoteUserName: data.callerName,
        remoteUserAvatar: data.callerAvatar,
        remoteUserColor: data.callerColor,
        isInitiator: false,
      });
      setState('incoming');
      // Try to play ringtone (browsers may block)
      ringtoneRef.current?.play().catch(() => {});
    });

    socket.on('call:ringing', ({ callId }: any) => {
      console.log('☎️ Ringing...');
      if (callId) { callIdRef.current = callId; setCallInfo(prev => prev ? { ...prev, callId } : prev); }
      setState('outgoing');
    });

    socket.on('call:accepted', async ({ callId }: any) => {
      console.log('✅ Call accepted, sending offer...');
      if (callId) { callIdRef.current = callId; setCallInfo(prev => prev ? { ...prev, callId } : prev); }
      setState('connecting');
      ringtoneRef.current?.pause();
      // Caller creates and sends offer
      try {
        const offer = await pcRef.current!.createOffer();
        await pcRef.current!.setLocalDescription(offer);
        socket.emit('call:offer', { callId, offer });
      } catch (e) { console.error('Offer error:', e); }
    });

    socket.on('call:offer', async ({ callId, offer }: any) => {
      console.log('📨 Received offer');
      try {
        await pcRef.current!.setRemoteDescription(new RTCSessionDescription(offer));
        // Apply any pending ICE
        for (const ice of pendingIceRef.current) {
          await pcRef.current!.addIceCandidate(ice);
        }
        pendingIceRef.current = [];
        const answer = await pcRef.current!.createAnswer();
        await pcRef.current!.setLocalDescription(answer);
        socket.emit('call:answer', { callId, answer });
      } catch (e) { console.error('Answer error:', e); }
    });

    socket.on('call:answer', async ({ callId, answer }: any) => {
      console.log('📨 Received answer');
      try {
        await pcRef.current!.setRemoteDescription(new RTCSessionDescription(answer));
        for (const ice of pendingIceRef.current) {
          await pcRef.current!.addIceCandidate(ice);
        }
        pendingIceRef.current = [];
      } catch (e) { console.error('SetRemote error:', e); }
    });

    socket.on('call:ice', async ({ callId, candidate }: any) => {
      try {
        const ice = new RTCIceCandidate(candidate);
        if (pcRef.current?.remoteDescription) {
          await pcRef.current.addIceCandidate(ice);
        } else {
          pendingIceRef.current.push(ice);
        }
      } catch (e) { console.error('ICE error:', e); }
    });

    socket.on('call:rejected', () => {
      console.log('❌ Call rejected');
      ringtoneRef.current?.pause();
      cleanup();
      setState('idle');
    });

    socket.on('call:ended', () => {
      console.log('🛑 Call ended by other side');
      ringtoneRef.current?.pause();
      cleanup();
      setState('idle');
    });

    socket.on('call:failed', ({ reason }: any) => {
      console.warn('⚠️ Call failed:', reason);
      ringtoneRef.current?.pause();
      cleanup();
      setState('idle');
      alert(reason || 'فشلت المكالمة');
    });

    socket.on('call:cancelled', () => {
      ringtoneRef.current?.pause();
      cleanup();
      setState('idle');
    });

    return () => {
      socket.off('call:incoming');
      socket.off('call:ringing');
      socket.off('call:accepted');
      socket.off('call:offer');
      socket.off('call:answer');
      socket.off('call:ice');
      socket.off('call:rejected');
      socket.off('call:ended');
      socket.off('call:failed');
      socket.off('call:cancelled');
    };
  }, [socket]);

  // ─── Setup peer connection ──────────────────────
  const setupPeerConnection = (stream: MediaStream, callId: string) => {
    const pc = new RTCPeerConnection(RTC_CONFIG);
    pcRef.current = pc;

    // Add tracks to peer connection
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('📺 Received remote track');
      setRemoteStream(event.streams[0]);
    };

    // Send ICE candidates — always use the real (possibly updated) callId.
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('call:ice', { callId: callIdRef.current || callId, candidate: event.candidate });
      }
    };

    // Connection state changes
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setState('in-call');
        startDurationTimer();
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        cleanup();
        setState('idle');
      }
    };

    return pc;
  };

  // ─── Get user media ────────────────────────────
  const getMedia = async (type: 'audio' | 'video'): Promise<MediaStream> => {
    const constraints: MediaStreamConstraints = {
      audio: true,
      video: type === 'video' ? { width: { ideal: 640 }, height: { ideal: 480 } } : false,
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    setLocalStream(stream);
    return stream;
  };

  // ─── Initiate call ─────────────────────────────
  const initiateCall = async (remoteUser: any, type: 'audio' | 'video') => {
    try {
      const stream = await getMedia(type);
      const callId = 'pending'; // replaced by the real id on call:ringing/accepted
      callIdRef.current = callId;
      setCallInfo({
        callId,
        type,
        remoteUserId: remoteUser.id,
        remoteUserName: remoteUser.name,
        remoteUserAvatar: remoteUser.avatar,
        remoteUserColor: remoteUser.color,
        isInitiator: true,
      });
      setupPeerConnection(stream, callId);
      socket?.emit('call:initiate', { calleeId: remoteUser.id, type });
    } catch (e: any) {
      console.error('Initiate error:', e);
      alert('تعذّر الوصول للميكروفون/الكاميرا. يرجى السماح بالأذونات.');
      cleanup();
    }
  };

  // ─── Accept incoming call ──────────────────────
  const acceptCall = async () => {
    if (!callInfo) return;
    try {
      ringtoneRef.current?.pause();
      const stream = await getMedia(callInfo.type);
      setupPeerConnection(stream, callIdRef.current || callInfo.callId);
      socket?.emit('call:accept', { callId: callIdRef.current || callInfo.callId });
      setState('connecting');
    } catch (e: any) {
      console.error('Accept error:', e);
      alert('تعذّر الوصول للميكروفون/الكاميرا');
      rejectCall();
    }
  };

  // ─── Reject call ───────────────────────────────
  const rejectCall = () => {
    if (callInfo) socket?.emit('call:reject', { callId: callIdRef.current || callInfo.callId });
    ringtoneRef.current?.pause();
    cleanup();
    setState('idle');
  };

  // ─── End call ──────────────────────────────────
  const endCall = () => {
    if (callInfo) socket?.emit('call:end', { callId: callIdRef.current || callInfo.callId });
    ringtoneRef.current?.pause();
    cleanup();
    setState('idle');
  };

  // ─── Toggle mute ───────────────────────────────
  const toggleMute = () => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  // ─── Toggle video ──────────────────────────────
  const toggleVideo = () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  // ─── Duration timer ────────────────────────────
  const startDurationTimer = () => {
    setCallDuration(0);
    clearInterval(durationTimerRef.current);
    durationTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
  };

  // ─── Cleanup ───────────────────────────────────
  const cleanup = () => {
    clearInterval(durationTimerRef.current);
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    pendingIceRef.current = [];
    callIdRef.current = '';
    setCallInfo(null);
    setIsMuted(false);
    setIsVideoOff(false);
    setCallDuration(0);
  };

  return (
    <CallContext.Provider value={{
      state, callInfo, localStream, remoteStream,
      isMuted, isVideoOff, callDuration,
      initiateCall, acceptCall, rejectCall, endCall,
      toggleMute, toggleVideo,
    }}>
      {children}
    </CallContext.Provider>
  );
}
