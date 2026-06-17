import { ActivityLevel, CheckInDraft, DailyEntry, NutritionLevel } from '@/types';

const activityNorm: Record<ActivityLevel, number> = {
  none: 0.2,
  light: 0.5,
  medium: 0.8,
  hard: 0.6,
};

const nutritionNorm: Record<NutritionLevel, number> = {
  poor: 0,
  ok: 0.5,
  good: 1.0,
};

export function computeStateScore(entry: Partial<DailyEntry> | CheckInDraft): number {
  const sleepNorm = Math.min((entry.sleep_hours ?? 0) / 9, 1);
  const energyNorm = (entry.energy ?? 5) / 10;
  const moodNorm = ((entry.mood ?? 3) - 1) / 4;
  const actNorm = activityNorm[entry.activity ?? 'none'];
  const nutNorm = nutritionNorm[entry.nutrition ?? 'ok'];

  const score =
    sleepNorm * 0.35 +
    energyNorm * 0.3 +
    moodNorm * 0.2 +
    actNorm * 0.1 +
    nutNorm * 0.05;

  return Math.round(score * 100) / 10; // 0–10
}

export function scoreToColor(score: number): string {
  if (score >= 7) return '#7C6AF6';
  if (score >= 5) return '#4A4870';
  if (score >= 2) return '#2B293F';
  return '#1E1D2A';
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}
