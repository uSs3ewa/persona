import { DailyEntry } from '@/types';

export const MOCK_USER_ID = 'mock-user-001';

export const MOCK_ENTRIES: DailyEntry[] = [
  {
    id: '1',
    user_id: MOCK_USER_ID,
    entry_date: '2026-04-24',
    sleep_hours: 7.5,
    sleep_bedtime: '23:30',
    mood: 4,
    energy: 7,
    activity: 'medium',
    nutrition: 'ok',
    note: 'Felt productive in the morning. Avoided distractions.',
    generated_frame: 'Focus & Flow',
    generated_frame_sub:
      'Your energy and recovery are in balance. Great day for deep work and consistent progress. Protect your focus.',
    generated_insights: [
      {
        title: 'Your focus window is strong',
        body: 'You tend to be most productive between 9:00 and 13:00. Plan your deep work then.',
        type: 'focus',
      },
      {
        title: 'Energy dips on late workout days',
        body: 'Consider training earlier — your sleep quality improves.',
        type: 'energy',
      },
      {
        title: 'Hydration check',
        body: "You've logged low water intake for 2 days. Aim for 2–3L today.",
        type: 'nutrition',
      },
    ],
    state_score: 7.2,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: MOCK_USER_ID,
    entry_date: '2026-04-23',
    sleep_hours: 5.5,
    mood: 2,
    energy: 4,
    activity: 'hard',
    nutrition: 'poor',
    generated_frame: 'Low Battery Mode',
    generated_frame_sub:
      'Sleep was short and energy is limited. Keep demands minimal today — protect what you have.',
    generated_insights: [
      {
        title: 'Sleep debt is accumulating',
        body: 'This is the second night under 6 hours. Cognitive performance declines faster than it feels.',
        type: 'recovery',
      },
      {
        title: "Yesterday's hard session adds load",
        body: 'Hard activity on low sleep slows recovery. Lighter movement or rest today.',
        type: 'recovery',
      },
    ],
    state_score: 3.1,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    user_id: MOCK_USER_ID,
    entry_date: '2026-04-22',
    sleep_hours: 8,
    mood: 5,
    energy: 9,
    activity: 'light',
    nutrition: 'good',
    generated_frame: 'High Capacity Day',
    generated_frame_sub:
      'Strong sleep and high energy. This is a day to push high-value work and move on things you have been avoiding.',
    generated_insights: [
      {
        title: 'Rare high-energy window',
        body: 'Your last 7-day average is 5.8 — today sits significantly above that baseline.',
        type: 'pattern',
      },
    ],
    state_score: 9.1,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '4',
    user_id: MOCK_USER_ID,
    entry_date: '2026-04-21',
    sleep_hours: 6.5,
    mood: 3,
    energy: 5,
    activity: 'none',
    nutrition: 'ok',
    generated_frame: 'Maintenance Mode',
    generated_frame_sub:
      'Average energy and moderate sleep. A good day for routine tasks rather than high-demand projects.',
    generated_insights: [],
    state_score: 5.0,
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: '5',
    user_id: MOCK_USER_ID,
    entry_date: '2026-04-20',
    sleep_hours: 7,
    mood: 4,
    energy: 6,
    activity: 'medium',
    nutrition: 'good',
    generated_frame: 'Steady State',
    generated_frame_sub: 'Balanced inputs. No urgency to push hard or pull back.',
    generated_insights: [],
    state_score: 6.5,
    created_at: new Date(Date.now() - 345600000).toISOString(),
  },
];

export const MOCK_TODAY_ENTRY = MOCK_ENTRIES[0];
