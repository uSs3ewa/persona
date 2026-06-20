// ─── Enums ────────────────────────────────────────────────────────────────────

export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type EnergyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type ActivityLevel = 'none' | 'light' | 'medium' | 'hard';
export type NutritionLevel = 'poor' | 'ok' | 'good';
export type InsightType = 'recovery' | 'focus' | 'energy' | 'nutrition' | 'pattern';

export type FeedCardStyle =
  | 'observation'
  | 'pattern'
  | 'trend'
  | 'recovery'
  | 'sleep'
  | 'mood'
  | 'productivity'
  | 'nutrition'
  | 'training'
  | 'focus'
  | 'stress'
  | 'burnout'
  | 'hydration'
  | 'psychology'
  | 'neuroscience'
  | 'habit'
  | 'motivation'
  | 'weekly'
  | 'monthly'
  | 'coach'
  | 'fact'
  | 'didyouknow'
  | 'experiment'
  | 'challenge'
  | 'achievement'
  | 'reflection'
  | 'prediction'
  | 'warning';

// ─── Core models ──────────────────────────────────────────────────────────────

export interface DailyEntry {
  id: string;
  user_id: string;
  entry_date: string;
  sleep_hours: number;
  sleep_bedtime?: string;
  mood: MoodLevel;
  energy: EnergyLevel;
  activity: ActivityLevel;
  nutrition: NutritionLevel;
  note?: string;
  generated_frame?: string;
  generated_frame_sub?: string;
  generated_insights?: Insight[];
  state_score?: number;
  created_at: string;
}

export interface Insight {
  title: string;
  body: string;
  type: InsightType;
}

export interface FeedCard {
  id: string;
  style: FeedCardStyle;
  title: string;
  subtitle?: string;
  body: string;
  icon: string;
  accentColor: string;
  badge?: string;
  priority?: number;
}

// ─── Draft ────────────────────────────────────────────────────────────────────

export interface CheckInDraft {
  sleep_hours: number;
  sleep_bedtime?: string;
  mood?: MoodLevel;
  energy?: EnergyLevel;
  activity?: ActivityLevel;
  nutrition?: NutritionLevel;
  note?: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  timezone: string;
  onboarded: boolean;
  created_at: string;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  CheckIn: undefined;
  FrameReveal: { entry: DailyEntry };
  DayDetail: { date: string };
};

export type MainTabParamList = {
  Today: undefined;
  Insights: undefined;
  Calendar: undefined;
};
