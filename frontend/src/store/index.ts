// src/store/index.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  User, AudioPlayerState, AudioTrack, UserPreferences,
  LastRead, PrayerLocation, Notification, AzkarCategory,
} from '@/types';

// ─── AUDIO STORE ───────────────────────────────────────────
interface AudioStore extends AudioPlayerState {
  setTrack: (track: AudioTrack) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  setQueue: (queue: AudioTrack[], index?: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setSleepTimer: (minutes: number | null) => void;
  setPlaybackRate: (rate: number) => void;
  clearPlayer: () => void;
}

export const useAudioStore = create<AudioStore>()(
  persist(
    immer((set, get) => ({
      track: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      isMuted: false,
      isRepeat: false,
      isShuffle: false,
      queue: [],
      queueIndex: 0,
      sleepTimer: null,
      playbackRate: 1,

      setTrack: (track) => set(state => { state.track = track; }),
      setPlaying: (playing) => set(state => { state.isPlaying = playing; }),
      setCurrentTime: (time) => set(state => { state.currentTime = time; }),
      setDuration: (duration) => set(state => { state.duration = duration; }),
      setVolume: (volume) => set(state => { state.volume = Math.max(0, Math.min(1, volume)); }),
      toggleMute: () => set(state => { state.isMuted = !state.isMuted; }),
      toggleRepeat: () => set(state => { state.isRepeat = !state.isRepeat; }),
      toggleShuffle: () => set(state => { state.isShuffle = !state.isShuffle; }),

      setQueue: (queue, index = 0) => set(state => {
        state.queue = queue;
        state.queueIndex = index;
        state.track = queue[index] || null;
      }),

      nextTrack: () => set(state => {
        const { queue, queueIndex, isShuffle } = get();
        if (!queue.length) return;
        const nextIndex = isShuffle
          ? Math.floor(Math.random() * queue.length)
          : (queueIndex + 1) % queue.length;
        state.queueIndex = nextIndex;
        state.track = queue[nextIndex];
        state.currentTime = 0;
      }),

      prevTrack: () => set(state => {
        const { queue, queueIndex, currentTime } = get();
        if (!queue.length) return;
        if (currentTime > 3) { state.currentTime = 0; return; }
        const prevIndex = queueIndex > 0 ? queueIndex - 1 : queue.length - 1;
        state.queueIndex = prevIndex;
        state.track = queue[prevIndex];
        state.currentTime = 0;
      }),

      setSleepTimer: (minutes) => set(state => { state.sleepTimer = minutes; }),
      setPlaybackRate: (rate) => set(state => { state.playbackRate = rate; }),
      clearPlayer: () => set(state => {
        state.track = null;
        state.isPlaying = false;
        state.currentTime = 0;
        state.queue = [];
        state.queueIndex = 0;
      }),
    })),
    {
      name: 'noor-audio-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
        isRepeat: state.isRepeat,
        playbackRate: state.playbackRate,
      }),
    }
  )
);

// ─── USER STORE ────────────────────────────────────────────
interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  addPoints: (points: number) => void;
  incrementStreak: () => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    immer((set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set(state => {
        state.user = user;
        state.isAuthenticated = !!user;
        state.isLoading = false;
      }),

      setLoading: (loading) => set(state => { state.isLoading = loading; }),

      updatePreferences: (prefs) => set(state => {
        if (state.user) {
          state.user.preferences = { ...state.user.preferences, ...prefs };
        }
      }),

      addPoints: (points) => set(state => {
        if (state.user) state.user.points += points;
      }),

      incrementStreak: () => set(state => {
        if (state.user) state.user.streak += 1;
      }),

      logout: () => set(state => {
        state.user = null;
        state.isAuthenticated = false;
      }),
    })),
    {
      name: 'noor-user-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ─── QURAN STORE ───────────────────────────────────────────
interface QuranStore {
  lastRead: LastRead | null;
  bookmarks: Array<{ surahNumber: number; ayahNumber: number; note?: string }>;
  selectedReciter: string;
  fontSize: number;
  showTranslation: boolean;
  showTransliteration: boolean;
  selectedSurah: number | null;
  setLastRead: (read: LastRead) => void;
  addBookmark: (surahNumber: number, ayahNumber: number, note?: string) => void;
  removeBookmark: (surahNumber: number, ayahNumber: number) => void;
  setReciter: (reciter: string) => void;
  setFontSize: (size: number) => void;
  toggleTranslation: () => void;
  toggleTransliteration: () => void;
  setSelectedSurah: (surah: number | null) => void;
}

export const useQuranStore = create<QuranStore>()(
  persist(
    immer((set) => ({
      lastRead: null,
      bookmarks: [],
      selectedReciter: 'ar.alafasy',
      fontSize: 24,
      showTranslation: true,
      showTransliteration: false,
      selectedSurah: null,

      setLastRead: (read) => set(state => { state.lastRead = read; }),

      addBookmark: (surahNumber, ayahNumber, note) => set(state => {
        const exists = state.bookmarks.find(
          b => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
        );
        if (!exists) state.bookmarks.push({ surahNumber, ayahNumber, note });
      }),

      removeBookmark: (surahNumber, ayahNumber) => set(state => {
        state.bookmarks = state.bookmarks.filter(
          b => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber)
        );
      }),

      setReciter: (reciter) => set(state => { state.selectedReciter = reciter; }),
      setFontSize: (size) => set(state => { state.fontSize = Math.max(16, Math.min(36, size)); }),
      toggleTranslation: () => set(state => { state.showTranslation = !state.showTranslation; }),
      toggleTransliteration: () => set(state => { state.showTransliteration = !state.showTransliteration; }),
      setSelectedSurah: (surah) => set(state => { state.selectedSurah = surah; }),
    })),
    { name: 'noor-quran-store', storage: createJSONStorage(() => localStorage) }
  )
);

// ─── PRAYER STORE ──────────────────────────────────────────
interface PrayerStore {
  location: PrayerLocation | null;
  prayerTimes: Record<string, string> | null;
  lastFetchDate: string | null;
  trackerToday: Record<string, boolean>;
  setLocation: (location: PrayerLocation) => void;
  setPrayerTimes: (times: Record<string, string>) => void;
  markPrayer: (prayer: string, completed: boolean) => void;
  resetTracker: () => void;
}

export const usePrayerStore = create<PrayerStore>()(
  persist(
    immer((set) => ({
      location: null,
      prayerTimes: null,
      lastFetchDate: null,
      trackerToday: {},

      setLocation: (location) => set(state => { state.location = location; }),
      setPrayerTimes: (times) => set(state => {
        state.prayerTimes = times;
        state.lastFetchDate = new Date().toDateString();
      }),
      markPrayer: (prayer, completed) => set(state => {
        state.trackerToday[prayer] = completed;
      }),
      resetTracker: () => set(state => { state.trackerToday = {}; }),
    })),
    { name: 'noor-prayer-store', storage: createJSONStorage(() => localStorage) }
  )
);

// ─── AZKAR STORE ───────────────────────────────────────────
interface AzkarStore {
  completedToday: Record<string, boolean>;
  azkarCounts: Record<string, number>;
  markCompleted: (id: string) => void;
  incrementCount: (id: string, target: number) => boolean;
  resetDaily: () => void;
}

export const useAzkarStore = create<AzkarStore>()(
  persist(
    immer((set, get) => ({
      completedToday: {},
      azkarCounts: {},

      markCompleted: (id) => set(state => {
        state.completedToday[id] = true;
      }),

      incrementCount: (id, target) => {
        const current = get().azkarCounts[id] || 0;
        const newCount = current + 1;
        set(state => { state.azkarCounts[id] = newCount; });
        if (newCount >= target) {
          set(state => {
            state.completedToday[id] = true;
            state.azkarCounts[id] = 0;
          });
          return true; // completed
        }
        return false;
      },

      resetDaily: () => set(state => {
        state.completedToday = {};
        state.azkarCounts = {};
      }),
    })),
    { name: 'noor-azkar-store', storage: createJSONStorage(() => localStorage) }
  )
);

// ─── NOTIFICATIONS STORE ───────────────────────────────────
interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  immer((set) => ({
    notifications: [],
    unreadCount: 0,

    addNotification: (notification) => set(state => {
      state.notifications.unshift(notification);
      if (!notification.read) state.unreadCount += 1;
    }),

    markAsRead: (id) => set(state => {
      const n = state.notifications.find(n => n.id === id);
      if (n && !n.read) { n.read = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
    }),

    markAllAsRead: () => set(state => {
      state.notifications.forEach(n => { n.read = true; });
      state.unreadCount = 0;
    }),

    removeNotification: (id) => set(state => {
      const n = state.notifications.find(n => n.id === id);
      if (n && !n.read) state.unreadCount = Math.max(0, state.unreadCount - 1);
      state.notifications = state.notifications.filter(n => n.id !== id);
    }),
  }))
);

// ─── UI STORE ──────────────────────────────────────────────
interface UIStore {
  sidebarOpen: boolean;
  moodDetected: string | null;
  searchQuery: string;
  setSidebarOpen: (open: boolean) => void;
  setMood: (mood: string | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIStore>()(
  immer((set) => ({
    sidebarOpen: false,
    moodDetected: null,
    searchQuery: '',
    setSidebarOpen: (open) => set(state => { state.sidebarOpen = open; }),
    setMood: (mood) => set(state => { state.moodDetected = mood; }),
    setSearchQuery: (query) => set(state => { state.searchQuery = query; }),
  }))
);
