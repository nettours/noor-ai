// src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse, Surah, SurahDetail, PrayerTimes, QiblaData } from '@/types';

// ─── BASE CLIENT ───────────────────────────────────────────
const createClient = (baseURL: string, options?: AxiosRequestConfig): AxiosInstance => {
  const client = axios.create({ baseURL, timeout: 15000, ...options });

  client.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('noor-token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('noor-token');
        window.location.href = '/auth/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};

const backendClient = createClient(
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api'
);
const quranClient = createClient('https://api.alquran.cloud/v1');
const prayerClient = createClient('https://api.aladhan.com/v1');

// ─── QURAN API ─────────────────────────────────────────────
export const QuranAPI = {
  async getSurahs(): Promise<Surah[]> {
    const CACHE_KEY = 'noor_surahs_v2';
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) return JSON.parse(cached);
    }
    const res = await quranClient.get<{ data: Surah[] }>('/surah');
    if (typeof window !== 'undefined') {
      localStorage.setItem(CACHE_KEY, JSON.stringify(res.data.data));
    }
    return res.data.data;
  },

  async getSurah(
    number: number,
    edition = 'quran-uthmani'
  ): Promise<SurahDetail> {
    const res = await quranClient.get(`/surah/${number}/${edition}`);
    return res.data.data;
  },

  async getSurahWithTranslation(
    number: number,
    translationEdition = 'en.asad'
  ): Promise<[SurahDetail, SurahDetail]> {
    const [arabic, translation] = await Promise.all([
      quranClient.get(`/surah/${number}/quran-uthmani`),
      quranClient.get(`/surah/${number}/${translationEdition}`),
    ]);
    return [arabic.data.data, translation.data.data];
  },

  async searchQuran(query: string): Promise<unknown> {
    const res = await quranClient.get(`/search/${encodeURIComponent(query)}/all/ar`);
    return res.data.data;
  },

  getAyahAudioUrl(globalAyahNumber: number, reciter = 'ar.alafasy'): string {
    const bitrateMap: Record<string, number> = {
      'ar.alafasy': 128,
      'ar.abdurrahmaansudais': 192,
      'ar.abdullahbasfar': 192,
      'ar.hudhaify': 128,
      'ar.minshawi': 128,
    };
    const bitrate = bitrateMap[reciter] || 128;
    return `https://cdn.islamic.network/quran/audio/${bitrate}/${reciter}/${globalAyahNumber}.mp3`;
  },

  getSurahAudioUrl(surahNumber: number, reciter = 'ar.alafasy'): string {
    const padded = String(surahNumber).padStart(3, '0');
    return `https://cdn.islamic.network/quran/audio-surah/128/${reciter}/${padded}.mp3`;
  },
};

// ─── PRAYER API ────────────────────────────────────────────
export const PrayerAPI = {
  async getTimings(
    date: string,
    latitude: number,
    longitude: number,
    method = 2
  ): Promise<PrayerTimes> {
    const res = await prayerClient.get(`/timings/${date}`, {
      params: { latitude, longitude, method },
    });
    return res.data.data.timings;
  },

  async getHijriDate(date?: string): Promise<unknown> {
    const d = date || new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    const res = await prayerClient.get(`/gToH/${d}`);
    return res.data.data;
  },

  calculateQibla(latitude: number, longitude: number): QiblaData {
    const MECCA_LAT = 21.4225;
    const MECCA_LNG = 39.8262;
    const lat1 = (latitude * Math.PI) / 180;
    const lat2 = (MECCA_LAT * Math.PI) / 180;
    const deltaLng = ((MECCA_LNG - longitude) * Math.PI) / 180;
    const y = Math.sin(deltaLng) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
    const bearing = (((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360;

    // Haversine distance
    const R = 6371;
    const dLat = ((MECCA_LAT - latitude) * Math.PI) / 180;
    const dLon = ((MECCA_LNG - longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return {
      direction: Math.round(bearing),
      distance: Math.round(distance),
      location: { latitude, longitude, city: '', country: '', timezone: '' },
    };
  },
};

// ─── AUTH API ──────────────────────────────────────────────
export const AuthAPI = {
  async register(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<ApiResponse<{ token: string; user: unknown }>> {
    const res = await backendClient.post('/auth/register', data);
    return res.data;
  },

  async login(data: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ token: string; user: unknown }>> {
    const res = await backendClient.post('/auth/login', data);
    return res.data;
  },

  async me(): Promise<ApiResponse<{ user: unknown }>> {
    const res = await backendClient.get('/auth/me');
    return res.data;
  },

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const res = await backendClient.post('/auth/refresh');
    return res.data;
  },

  async logout(): Promise<void> {
    await backendClient.post('/auth/logout');
    localStorage.removeItem('noor-token');
  },
};

// ─── AI API ────────────────────────────────────────────────
export const AIAPI = {
  async chat(messages: Array<{ role: string; content: string }>, apiKey?: string) {
    // Direct Anthropic call (client-side with user's API key)
    if (apiKey) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          system: `أنت "نور" — مساعد إسلامي ذكي ومتخصص وموثوق.

تخصصاتك:
• الفقه الإسلامي الأربعة المذاهب
• تفسير القرآن الكريم (ابن كثير، الطبري، السعدي)
• شرح الأحاديث النبوية
• العقيدة الإسلامية
• السيرة النبوية
• الفقه المعاصر
• الأدعية والأذكار

قواعدك:
1. استند دائماً للأدلة من القرآن والسنة الصحيحة
2. أجب بالعربية الفصحى السهلة
3. كن دقيقاً وموثوقاً
4. عند الخلاف الفقهي، اذكر الأقوال
5. أحل الموضوعات غير الإسلامية بلطف
6. لا تفتِ في المسائل الخلافية الكبرى دون إشارة للعلماء`,
          messages,
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return data.content[0].text as string;
    }

    // Backend AI (server-side)
    const res = await backendClient.post('/ai/chat', { messages });
    return res.data.data.response as string;
  },

  async detectMood(text: string): Promise<string> {
    const res = await backendClient.post('/ai/detect-mood', { text });
    return res.data.data.mood;
  },

  async generateKhutbah(topic: string): Promise<unknown> {
    const res = await backendClient.post('/ai/khutbah', { topic });
    return res.data.data;
  },

  async generateDailyPlan(userId: string): Promise<unknown> {
    const res = await backendClient.post('/ai/daily-plan', { userId });
    return res.data.data;
  },

  async tafsir(surahNumber: number, ayahNumber: number): Promise<string> {
    const res = await backendClient.post('/ai/tafsir', { surahNumber, ayahNumber });
    return res.data.data.tafsir;
  },
};

// ─── NOTIFICATIONS API ─────────────────────────────────────
export const NotificationsAPI = {
  async subscribe(subscription: PushSubscription): Promise<void> {
    await backendClient.post('/notifications/subscribe', { subscription });
  },

  async getNotifications(): Promise<unknown[]> {
    const res = await backendClient.get('/notifications');
    return res.data.data;
  },

  async markRead(id: string): Promise<void> {
    await backendClient.patch(`/notifications/${id}/read`);
  },
};

// ─── USER API ──────────────────────────────────────────────
export const UserAPI = {
  async updateProfile(data: Partial<unknown>): Promise<unknown> {
    const res = await backendClient.put('/users/profile', data);
    return res.data.data;
  },

  async updatePreferences(preferences: Partial<unknown>): Promise<void> {
    await backendClient.put('/users/preferences', { preferences });
  },

  async addPoints(points: number, reason: string): Promise<void> {
    await backendClient.post('/users/points', { points, reason });
  },
};

export { backendClient };
