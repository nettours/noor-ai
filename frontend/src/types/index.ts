// src/types/index.ts

// ─── USER ─────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  isPremium: boolean;
  streak: number;
  points: number;
  level: UserLevel;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export type UserLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'SCHOLAR';

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  language: 'ar' | 'en' | 'fr';
  quranReciter: string;
  prayerCalculationMethod: PrayerMethod;
  notificationsEnabled: boolean;
  dailyPlanEnabled: boolean;
  hijriCalendar: boolean;
}

// ─── QURAN ─────────────────────────────────────────────────
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
  audio?: string;
  translation?: string;
  transliteration?: string;
}

export interface SurahDetail extends Surah {
  ayahs: Ayah[];
}

export interface QuranReciter {
  id: string;
  name: string;
  nameAr: string;
  style: string;
  bitrate: number;
}

export interface Bookmark {
  id: string;
  userId: string;
  surahNumber: number;
  ayahNumber: number;
  note?: string;
  createdAt: Date;
}

export interface LastRead {
  surahNumber: number;
  ayahNumber: number;
  timestamp: Date;
}

// ─── PRAYER ────────────────────────────────────────────────
export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
  Firstthird: string;
  Lastthird: string;
}

export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export type PrayerMethod =
  | 'MuslimWorldLeague'
  | 'IslamicSocietyOfNorthAmerica'
  | 'EgyptianGeneralAuthorityOfSurvey'
  | 'UmmAlQura'
  | 'Karachi'
  | 'Tehran'
  | 'Jafari';

export interface PrayerLocation {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  timezone: string;
}

export interface PrayerTracker {
  date: string;
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
}

// ─── AZKAR ─────────────────────────────────────────────────
export interface Zikr {
  id: string;
  category: AzkarCategory;
  text: string;
  transliteration: string;
  translation: string;
  repetitions: number;
  virtue?: string;
  source?: string;
  audio?: string;
}

export type AzkarCategory =
  | 'morning'
  | 'evening'
  | 'prayer'
  | 'sleep'
  | 'wakeup'
  | 'food'
  | 'travel'
  | 'quran'
  | 'misc';

// ─── AI ────────────────────────────────────────────────────
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  context?: AIContext;
  references?: IslamicReference[];
}

export interface AIContext {
  type: 'quran_tafsir' | 'hadith' | 'fiqh' | 'dua' | 'general' | 'mood';
  surahRef?: number;
  ayahRef?: number;
  mood?: UserMood;
}

export interface IslamicReference {
  type: 'quran' | 'hadith' | 'scholar';
  text: string;
  source: string;
  surahNumber?: number;
  ayahNumber?: number;
}

export type UserMood =
  | 'happy'
  | 'sad'
  | 'anxious'
  | 'grateful'
  | 'stressed'
  | 'seeking_guidance'
  | 'neutral';

export interface AIImamKhutbah {
  title: string;
  opening: string;
  body: string;
  conclusion: string;
  duas: string[];
  ayahs: Array<{ text: string; reference: string }>;
  hadiths: Array<{ text: string; source: string }>;
}

export interface DailyIslamicPlan {
  date: string;
  quranGoal: { surahs: number[]; pages: number };
  azkarGoal: { morning: boolean; evening: boolean; prayer: boolean };
  prayerGoal: PrayerTracker;
  customGoals: string[];
  motivationalQuote: string;
}

// ─── AUDIO ─────────────────────────────────────────────────
export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  surahNumber?: number;
  ayahNumber?: number;
  url: string;
  duration: number;
  thumbnail?: string;
}

export interface AudioPlayerState {
  track: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isRepeat: boolean;
  isShuffle: boolean;
  queue: AudioTrack[];
  queueIndex: number;
  sleepTimer: number | null;
  playbackRate: number;
}

// ─── NOTIFICATIONS ─────────────────────────────────────────
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
}

export type NotificationType =
  | 'prayer_time'
  | 'daily_azkar'
  | 'quran_reminder'
  | 'streak_alert'
  | 'achievement'
  | 'community'
  | 'ai_motivation';

// ─── COMMUNITY FEED ────────────────────────────────────────
export interface FeedPost {
  id: string;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'image'>;
  type: 'text' | 'quran' | 'hadith' | 'dua' | 'image';
  content: string;
  mediaUrl?: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isSaved: boolean;
  tags: string[];
  createdAt: Date;
}

// ─── API RESPONSES ─────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─── QIBLA ─────────────────────────────────────────────────
export interface QiblaData {
  direction: number; // degrees from north
  distance: number; // km to Mecca
  location: PrayerLocation;
}

// ─── ACHIEVEMENTS ──────────────────────────────────────────
export interface Achievement {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt?: Date;
  isUnlocked: boolean;
  progress?: number;
  target?: number;
}
