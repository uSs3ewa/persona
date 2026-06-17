# Persona: Frame Yourself

A React Native (Expo) app for daily state awareness and behavioral alignment.

## Quick start

```bash
npm install
cp .env.example .env   # fill in Supabase credentials
npx expo start
```

## Project structure

```
persona/
├── App.tsx                        # Entry point
├── src/
│   ├── types/index.ts             # All TypeScript types
│   ├── constants/
│   │   ├── theme.ts               # Colors, typography, spacing
│   │   └── mockData.ts            # Test data (no backend needed)
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client
│   │   └── aiService.ts           # OpenAI via Edge Function
│   ├── store/
│   │   └── useAppStore.ts         # Zustand store (persisted)
│   ├── utils/
│   │   └── stateScore.ts          # Score computation + helpers
│   ├── navigation/
│   │   ├── RootNavigator.tsx      # Root stack
│   │   ├── MainTabNavigator.tsx   # Bottom tabs
│   │   └── CheckInNavigator.tsx   # Check-in wizard stack
│   ├── screens/
│   │   ├── onboarding/            # OnboardingScreen
│   │   ├── checkin/               # SleepStep, MoodStep, EnergyStep,
│   │   │                          # ActivityStep, NutritionStep, NoteStep
│   │   ├── frame/                 # FrameRevealScreen
│   │   ├── today/                 # TodayScreen
│   │   ├── calendar/              # CalendarScreen
│   │   └── daydetail/             # DayDetailScreen
│   └── components/
│       ├── checkin/               # StepShell
│       ├── today/                 # FrameCard, WeekTimeline, InsightCard
│       └── ui/                    # PillSelector, TabBarIcon
└── supabase/
    └── schema.sql                 # Postgres schema + RLS
```

## Running without Supabase

The app loads mock data automatically on first launch (see `TodayScreen.useEffect`).
All screens work offline — Supabase sync is additive, not required.

## Supabase setup

1. Create a project at supabase.com
2. Run `supabase/schema.sql` in the SQL editor
3. Deploy the Edge Function: `supabase functions deploy generate-frame`
4. Set `OPENAI_API_KEY` in Supabase secrets
5. Add `.env` credentials

## Edge Function

The AI call runs server-side at `supabase/functions/generate-frame/index.ts`.
The full implementation is included as a comment in `src/lib/aiService.ts`.

## Design tokens

All colors, spacing, and typography live in `src/constants/theme.ts`.
Dark background (`#0E0D1A`) throughout. Accent: `#7C6AF6`.

## Key decisions

- **Offline-first**: Entries are saved to AsyncStorage before any network call
- **AI is optional**: If the Edge Function fails, a fallback frame is used
- **One AI call per day**: Frame is generated once and stored — no re-calls
- **No streaks, no scores shown**: `state_score` drives color only, never displayed
