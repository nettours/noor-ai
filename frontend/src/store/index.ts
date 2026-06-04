// src/store/index.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { PrayerLocation } from '@/types';

// ─── PRAYER STORE ──────────────────────────────────────────
// Note: this is the only store consumed by the app (src/app/qibla).
// The previous Audio/User/Quran/Azkar/Notification/UI stores were dead code
// (no live consumers — pages use raw localStorage instead) and were removed.
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

      setLocation: (location) => set((state) => { state.location = location; }),
      setPrayerTimes: (times) => set((state) => {
        state.prayerTimes = times;
        state.lastFetchDate = new Date().toDateString();
      }),
      markPrayer: (prayer, completed) => set((state) => {
        state.trackerToday[prayer] = completed;
      }),
      resetTracker: () => set((state) => { state.trackerToday = {}; }),
    })),
    { name: 'noor-prayer-store', storage: createJSONStorage(() => localStorage) }
  )
);
