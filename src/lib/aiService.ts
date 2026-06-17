import { CheckInDraft, DailyEntry, Insight } from '@/types';
import { isSupabaseConfigured, supabase } from './supabase';

interface AIResponse {
  frame_title: string;
  frame_sub: string;
  insights: Insight[];
}

function normalizeResponse(draft: CheckInDraft, raw: unknown): AIResponse {
  const fallback = localFallback(draft);
  const obj = raw as any;

  const frame_title =
    typeof obj?.frame_title === 'string' && obj.frame_title.trim().length > 0
      ? obj.frame_title.trim()
      : fallback.frame_title;
  const frame_sub =
    typeof obj?.frame_sub === 'string' && obj.frame_sub.trim().length > 0
      ? obj.frame_sub.trim()
      : fallback.frame_sub;

  const insights: Insight[] = Array.isArray(obj?.insights)
    ? obj.insights
        .filter(
          (x: any) =>
            x &&
            typeof x.title === 'string' &&
            typeof x.body === 'string' &&
            typeof x.type === 'string'
        )
        .map((x: any) => ({
          title: String(x.title),
          body: String(x.body),
          type: x.type as Insight['type'],
        }))
    : fallback.insights;

  return { frame_title, frame_sub, insights };
}

function localFallback(draft: CheckInDraft): AIResponse {
  const sleep = draft.sleep_hours ?? 7;
  const mood = draft.mood ?? 3;
  const energy = draft.energy ?? 5;
  const activity = draft.activity ?? 'none';
  const nutrition = draft.nutrition ?? 'ok';

  const insights: Insight[] = [];

  if (sleep < 6) {
    insights.push({
      type: 'recovery',
      title: 'Sleep is short today',
      body: 'Lower your demands a bit. Protect focus blocks and add recovery where you can.',
    });
  } else if (sleep >= 8) {
    insights.push({
      type: 'energy',
      title: 'Recovery looks strong',
      body: 'You likely have more capacity today. Use it on one high-value task you have been delaying.',
    });
  }

  if (energy <= 4) {
    insights.push({
      type: 'focus',
      title: 'Operate in low-friction mode',
      body: 'Keep tasks small and sequential. Avoid context switching and postpone heavy decisions.',
    });
  } else if (energy >= 8) {
    insights.push({
      type: 'focus',
      title: 'Deep work window',
      body: 'Block a focused session early. You have the fuel for challenging work today.',
    });
  }

  if (activity === 'hard' && sleep < 7) {
    insights.push({
      type: 'recovery',
      title: 'Training load is high',
      body: 'Hard activity with moderate sleep can stack fatigue. Consider light movement and earlier wind-down.',
    });
  }

  if (nutrition === 'poor') {
    insights.push({
      type: 'nutrition',
      title: 'Nutrition is a lever today',
      body: 'Even one clean meal improves steadiness. Prioritize protein + hydration early.',
    });
  }

  let frame_title = 'Steady State';
  let frame_sub = 'Your inputs are balanced today. Aim for progress without forcing output.';

  if (sleep < 6 || energy <= 4 || mood <= 2) {
    frame_title = 'Low Battery Mode';
    frame_sub = 'Go gentle. Protect recovery and keep the day realistic — consistency beats intensity.';
  } else if (sleep >= 7.5 && energy >= 7 && mood >= 4) {
    frame_title = 'Focus & Flow';
    frame_sub = 'Capacity is solid. Pick one meaningful target and protect your attention.';
  } else if (energy >= 8) {
    frame_title = 'High Capacity Day';
    frame_sub = 'You have extra fuel. Push high-value work, but keep it structured.';
  }

  return { frame_title, frame_sub, insights };
}

export async function generateFrame(
  draft: CheckInDraft,
  recentEntries: DailyEntry[]
): Promise<AIResponse> {
  if (!isSupabaseConfigured) {
    return normalizeResponse(draft, null);
  }
  try {
    const { data, error } = await supabase.functions.invoke('generate-frame', {
      body: { draft, recentEntries },
    });

    if (error) throw error;
    if (!data) throw new Error('No AI payload returned');
    return normalizeResponse(draft, data);
  } catch (e) {
    if (__DEV__) console.warn('AI failed:', e);
    return normalizeResponse(draft, null);
  }
}
