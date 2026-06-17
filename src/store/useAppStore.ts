import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MOCK_ENTRIES } from '@/constants/mockData';
import { CheckInDraft, DailyEntry, UserProfile } from '@/types';
import { computeStateScore, todayISO } from '@/utils/stateScore';

interface AppState {
  // Auth
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;

  // Persist hydration
  hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;

  // Entries
  entries: DailyEntry[];
  addEntry: (entry: DailyEntry) => void;
  updateEntry: (id: string, updates: Partial<DailyEntry>) => void;
  getEntryByDate: (date: string) => DailyEntry | undefined;
  getTodayEntry: () => DailyEntry | undefined;

  // Check-in draft
  checkInDraft: CheckInDraft;
  setCheckInDraft: (draft: Partial<CheckInDraft>) => void;
  resetCheckInDraft: () => void;

  // Edit mode
  editingEntryId: string | null;
  startEditingEntry: (entry: DailyEntry) => void;
  stopEditingEntry: () => void;

  // UI state
  hasCompletedOnboarding: boolean;
  setOnboarded: () => void;

  // Mock: load test data
  loadMockData: () => void;
}

const DEFAULT_DRAFT: CheckInDraft = {
  sleep_hours: 7,
  sleep_bedtime: undefined,
  mood: undefined,
  energy: undefined,
  activity: undefined,
  nutrition: undefined,
  note: undefined,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Auth ──────────────────────────────────────────────────────────────
      user: null,
      setUser: (user) => set({ user }),

      // ── Persist hydration ─────────────────────────────────────────────────
      hasHydrated: false,
      setHasHydrated: (val) => set({ hasHydrated: val }),

      // ── Entries ───────────────────────────────────────────────────────────
      entries: [],

      addEntry: (entry) => {
        const withScore: DailyEntry = {
          ...entry,
          state_score: computeStateScore(entry),
        };
        set((s) => ({
          entries: [withScore, ...s.entries.filter((e) => e.entry_date !== withScore.entry_date)],
        }));
      },

      updateEntry: (id, updates) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),

      getEntryByDate: (date) => get().entries.find((e) => e.entry_date === date),

      getTodayEntry: () => get().entries.find((e) => e.entry_date === todayISO()),

      // ── Check-in draft ────────────────────────────────────────────────────
      checkInDraft: DEFAULT_DRAFT,

      setCheckInDraft: (draft) =>
        set((s) => ({ checkInDraft: { ...s.checkInDraft, ...draft } })),

      resetCheckInDraft: () => set({ checkInDraft: DEFAULT_DRAFT }),

      // ── Edit mode ─────────────────────────────────────────────────────────
      editingEntryId: null,
      startEditingEntry: (entry) => {
        set({
          editingEntryId: entry.id,
          checkInDraft: {
            sleep_hours: entry.sleep_hours ?? 7,
            sleep_bedtime: entry.sleep_bedtime,
            mood: entry.mood,
            energy: entry.energy,
            activity: entry.activity,
            nutrition: entry.nutrition,
            note: entry.note,
          },
        });
      },
      stopEditingEntry: () => set({ editingEntryId: null }),

      // ── Onboarding ────────────────────────────────────────────────────────
      hasCompletedOnboarding: false,
      setOnboarded: () => set({ hasCompletedOnboarding: true }),

      // ── Mock data ─────────────────────────────────────────────────────────
      loadMockData: () => set({ entries: MOCK_ENTRIES }),
    }),
    {
      name: 'persona-store',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (s) => ({
        entries: s.entries,
        hasCompletedOnboarding: s.hasCompletedOnboarding,
        user: s.user,
      }),
    }
  )
);
