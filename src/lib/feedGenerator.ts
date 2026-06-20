import { DailyEntry, FeedCard } from '@/types';

let counter = 0;
function id(): string {
  return `feed-${Date.now()}-${counter++}`;
}

function avg(entries: DailyEntry[], field: keyof DailyEntry): number {
  if (entries.length === 0) return 0;
  return entries.reduce((s, e) => s + ((e[field] as number) ?? 0), 0) / entries.length;
}

function dayLabel(n: number): string {
  return n === 1 ? 'day' : 'days';
}

function buildCritical(entries: DailyEntry[]): FeedCard[] {
  const cards: FeedCard[] = [];
  const recent = entries.slice(0, 7);
  if (recent.length === 0) return cards;

  const lowSleepDays = recent.filter((e) => e.sleep_hours < 6).length;
  const hardDays = recent.filter((e) => e.activity === 'hard').length;
  const avgSleep = avg(recent, 'sleep_hours');
  const avgEnergy = avg(recent, 'energy');

  if (lowSleepDays >= 3) {
    cards.push({
      id: id(), style: 'burnout', icon: '🔥', accentColor: '#E24B4A',
      title: 'Burnout risk rising',
      subtitle: `${lowSleepDays} of last ${recent.length} days under 6h sleep`,
      body: `Your average sleep has dropped to ${avgSleep.toFixed(1)}h. Cognitive performance declines faster than it feels. This pattern usually precedes a noticeable energy crash within 5-7 days.`,
      priority: 1,
    });
  }

  if (hardDays >= 4) {
    cards.push({
      id: id(), style: 'warning', icon: '⚠', accentColor: '#E24B4A',
      title: 'Overtraining pattern detected',
      subtitle: `${hardDays} hard sessions in ${recent.length} days`,
      body: 'Frequent intense activity without matching recovery depletes the same reserves as stress. Your body does not distinguish between physical and mental load.',
      priority: 1,
    });
  }

  if (avgEnergy <= 3 && recent.length >= 3) {
    cards.push({
      id: id(), style: 'recovery', icon: '😴', accentColor: '#1D9E75',
      title: 'Recovery capacity is low',
      subtitle: `7-day energy average: ${avgEnergy.toFixed(1)}/10`,
      body: 'When energy stays low for multiple days, it usually means recovery is not keeping up with demand. Consider reducing intensity and increasing sleep before it compounds.',
      priority: 1,
    });
  }

  return cards;
}

function buildPatterns(entries: DailyEntry[]): FeedCard[] {
  const cards: FeedCard[] = [];
  if (entries.length < 5) return cards;

  const recent = entries.slice(0, 14);

  const dayOfWeek: Record<number, { energy: number[]; mood: number[] }> = {};
  for (const e of recent) {
    const d = new Date(e.entry_date).getDay();
    if (!dayOfWeek[d]) dayOfWeek[d] = { energy: [], mood: [] };
    dayOfWeek[d].energy.push(e.energy);
    dayOfWeek[d].mood.push(e.mood);
  }

  let worstDay = -1;
  let worstAvg = 11;
  let bestDay = -1;
  let bestAvg = 0;

  for (const [d, data] of Object.entries(dayOfWeek)) {
    if (data.energy.length < 2) continue;
    const eAvg = data.energy.reduce((a, b) => a + b, 0) / data.energy.length;
    if (eAvg < worstAvg) { worstAvg = eAvg; worstDay = Number(d); }
    if (eAvg > bestAvg) { bestAvg = eAvg; bestDay = Number(d); }
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (worstDay >= 0 && bestDay >= 0 && worstDay !== bestDay && bestAvg - worstAvg > 2) {
    cards.push({
      id: id(), style: 'pattern', icon: '🔍', accentColor: '#7C6AF6',
      title: `${dayNames[worstDay]}s are your lowest`,
      subtitle: `Energy on ${dayNames[worstDay]}s averages ${worstAvg.toFixed(1)}/10 vs ${bestAvg.toFixed(1)}/10 on ${dayNames[bestDay]}s`,
      body: `Something about your ${dayNames[worstDay]} routine consistently reduces your energy. Consider what differs — sleep the night before, schedule, activity, or nutrition.`,
      priority: 2,
    });
  }

  const sleepMoodPairs = recent.filter((e) => e.sleep_hours > 0 && e.mood > 0);
  if (sleepMoodPairs.length >= 4) {
    const lowSleep = sleepMoodPairs.filter((e) => e.sleep_hours < 6.5);
    const goodSleep = sleepMoodPairs.filter((e) => e.sleep_hours >= 7.5);

    if (lowSleep.length >= 2 && goodSleep.length >= 2) {
      const lowMoodAvg = avg(lowSleep, 'mood');
      const goodMoodAvg = avg(goodSleep, 'mood');

      if (goodMoodAvg - lowMoodAvg >= 1) {
        cards.push({
          id: id(), style: 'sleep', icon: '😴', accentColor: '#5DCAA5',
          title: 'Sleep strongly predicts your mood',
          subtitle: `Mood: ${lowMoodAvg.toFixed(1)} on short sleep vs ${goodMoodAvg.toFixed(1)} on 7.5h+`,
          body: `On days when you sleep under 6.5h, your mood drops by ${(goodMoodAvg - lowMoodAvg).toFixed(1)} points on average. This is one of the strongest correlations in your data.`,
          priority: 2,
        });
      }
    }
  }

  if (entries.length >= 7) {
    const thisWeek = entries.slice(0, 7);
    const lastWeek = entries.slice(7, 14);
    if (lastWeek.length >= 3) {
      const thisAvg = avg(thisWeek, 'energy');
      const lastAvg = avg(lastWeek, 'energy');
      const diff = thisAvg - lastAvg;

      if (Math.abs(diff) > 1.5) {
        cards.push({
          id: id(), style: 'trend', icon: diff > 0 ? '📈' : '📉', accentColor: diff > 0 ? '#1D9E75' : '#EF9F27',
          title: diff > 0 ? 'Energy is improving' : 'Energy has declined',
          subtitle: `This week: ${thisAvg.toFixed(1)} vs last week: ${lastAvg.toFixed(1)}`,
          body: diff > 0
            ? 'Something you changed this week is working. The shift is measurable. Keep the pattern.'
            : 'Your energy dropped compared to last week. Check what changed — sleep, stress, activity, or nutrition.',
          priority: 2,
        });
      }
    }
  }

  return cards;
}

function buildObservations(entries: DailyEntry[]): FeedCard[] {
  const cards: FeedCard[] = [];
  const today = entries[0];
  if (!today) return cards;

  if (today.energy >= 8 && today.mood >= 4) {
    cards.push({
      id: id(), style: 'challenge', icon: '🎯', accentColor: '#7C6AF6',
      title: 'Challenge: deep work window',
      subtitle: 'Your capacity is high right now',
      body: 'Block 90 minutes for your most important task. No meetings, no messages. High-energy days are rare — use this one intentionally.',
      priority: 3,
    });
  }

  if (today.note && today.note.length > 5) {
    cards.push({
      id: id(), style: 'reflection', icon: '💭', accentColor: '#7C6AF6',
      title: 'On your words today',
      subtitle: `"${today.note.slice(0, 80)}${today.note.length > 80 ? '...' : ''}"`,
      body: 'Writing your state down makes patterns visible over time. What you记录 today becomes a data point for future understanding.',
      priority: 4,
    });
  }

  if (today.sleep_hours < 6) {
    cards.push({
      id: id(), style: 'coach', icon: '🎯', accentColor: '#EF9F27',
      title: 'Coach: protect today',
      subtitle: `Only ${today.sleep_hours}h of sleep`,
      body: 'Keep tasks small and sequential. Avoid context switching. One good decision at a time is enough. Sleep debt does not resolve itself — it compounds.',
      priority: 2,
    });
  }

  if (today.activity === 'hard' && today.sleep_hours < 7) {
    cards.push({
      id: id(), style: 'training', icon: '🏃', accentColor: '#E24B4A',
      title: 'Training load vs recovery',
      subtitle: 'Hard activity on limited sleep',
      body: 'Hard training demands 48-72h of recovery. When sleep is short, recovery takes longer. Your next session should be lighter unless sleep improves.',
      priority: 2,
    });
  }

  if (today.nutrition === 'poor') {
    cards.push({
      id: id(), style: 'nutrition', icon: '🍎', accentColor: '#5DCAA5',
      title: 'Nutrition is a lever',
      subtitle: 'Poor nutrition day',
      body: 'Even one clean meal improves cognitive steadiness. Protein and hydration within the first hours of waking have the strongest effect on afternoon energy.',
      priority: 3,
    });
  }

  if (today.mood <= 2) {
    cards.push({
      id: id(), style: 'mood', icon: '😊', accentColor: '#7C6AF6',
      title: 'Mood observation',
      subtitle: `Mood: ${today.mood}/5`,
      body: 'Low mood often feels like a personal failing but is usually a signal — from sleep, stress, or unmet needs. Treat it as data, not judgment.',
      priority: 3,
    });
  }

  const recent = entries.slice(0, 5);
  if (recent.length >= 3) {
    const notes = recent.filter((e) => e.note && e.note.length > 3);
    if (notes.length >= 2) {
      cards.push({
        id: id(), style: 'habit', icon: '🔄', accentColor: '#5DCAA5',
        title: 'Consistent self-reflection',
        subtitle: `${notes.length} of last ${recent.length} days with notes`,
        body: 'You are building a habit of reflection. This is one of the strongest predictors of long-term behavioral change. The pattern matters more than any single entry.',
        priority: 4,
      });
    }
  }

  return cards;
}

function buildScience(): FeedCard[] {
  return [
    { id: id(), style: 'neuroscience', icon: '🧠', accentColor: '#7C6AF6', title: 'Sleep consolidates memory', subtitle: 'Neuroscience', body: 'The brain replays and strengthens memories during deep sleep. Consistent sleep timing improves this process more than extra hours of inconsistent sleep.', priority: 5 },
    { id: id(), style: 'psychology', icon: '🧠', accentColor: '#7C6AF6', title: 'Stress feels like low motivation', subtitle: 'Psychology', body: 'Stress and low motivation both reduce cognitive flexibility. The brain conserves energy by narrowing focus — which feels like not caring, but is actually self-protection.', priority: 5 },
    { id: id(), style: 'fact', icon: '💧', accentColor: '#5DCAA5', title: 'Dehydration impairs cognition', subtitle: 'Did you know?', body: 'Even 1-2% dehydration impairs attention, working memory, and mood. Most people underestimate how much water affects their mental performance.', priority: 5 },
    { id: id(), style: 'fact', icon: '🚶', accentColor: '#EF9F27', title: 'Walking restores focus', subtitle: 'Did you know?', body: 'A 10-minute walk can restore sustained attention after a long focus session. Movement is not a break from productivity — it fuels it.', priority: 5 },
    { id: id(), style: 'neuroscience', icon: '🔄', accentColor: '#7C6AF6', title: 'Routines reduce decision fatigue', subtitle: 'Neuroscience', body: 'The brain conserves energy by automating repeated actions. Habits performed at the same time each day become effortless faster than irregular ones.', priority: 5 },
    { id: id(), style: 'psychology', icon: '📊', accentColor: '#5DCAA5', title: 'Energy predicts mood', subtitle: 'Psychology', body: 'Research shows energy levels predict mood more reliably than mood predicts energy. Protecting energy often stabilizes mood naturally.', priority: 5 },
    { id: id(), style: 'fact', icon: '🍳', accentColor: '#EF9F27', title: 'Nutrition timing matters', subtitle: 'Did you know?', body: 'Protein within the first few hours of waking improves focus and reduces afternoon energy crashes more than total daily protein intake.', priority: 5 },
    { id: id(), style: 'fact', icon: '📈', accentColor: '#7C6AF6', title: 'Consistency beats intensity', subtitle: 'Did you know?', body: 'Consistent moderate effort produces better long-term outcomes than occasional intense bursts followed by rest. The pattern matters more than the peak.', priority: 5 },
    { id: id(), style: 'fact', icon: '⏰', accentColor: '#EF9F27', title: 'Circadian rhythm is trainable', subtitle: 'Did you know?', body: 'Waking at the same time every day — even weekends — is the single most powerful lever for regulating your internal clock.', priority: 5 },
    { id: id(), style: 'fact', icon: '🪨', accentColor: '#1D9E75', title: 'Recovery has layers', subtitle: 'Did you know?', body: 'Physical recovery (sleep), mental recovery (quiet, nature), and emotional recovery (connection, play) are distinct systems — all three matter.', priority: 5 },
  ];
}

function buildCoachNotes(): FeedCard[] {
  return [
    { id: id(), style: 'coach', icon: '🧪', accentColor: '#5DCAA5', title: 'Experiment: variable isolation', subtitle: 'Coach suggestion', body: 'Try changing one variable this week — sleep time, morning walk, meal timing. Observe the effect. Repeat what works. This is how real optimization happens.', priority: 3 },
    { id: id(), style: 'coach', icon: '📉', accentColor: '#EF9F27', title: 'Track your energy curve', subtitle: 'Coach suggestion', body: 'Notice when your energy peaks and troughs. Most people have 2-3 natural high-energy windows per day. Protect them for important work.', priority: 3 },
    { id: id(), style: 'coach', icon: '🎯', accentColor: '#E24B4A', title: 'The 2-day rule', subtitle: 'Coach principle', body: 'Never miss a positive habit two days in a row. One miss is rest. Two misses is the start of a new pattern. The streak matters more than perfection.', priority: 3 },
    { id: id(), style: 'coach', icon: '🔄', accentColor: '#7C6AF6', title: 'Reframe the bad days', subtitle: 'Coach perspective', body: 'A low-energy day is not failure — it is information. The pattern of low days reveals what needs attention. The worst data point is the one you never collected.', priority: 3 },
    { id: id(), style: 'coach', icon: '🏠', accentColor: '#5DCAA5', title: 'Environment shapes behavior', subtitle: 'Coach insight', body: 'Your surroundings predict your actions more reliably than willpower. Design your space to make good choices the easy choice.', priority: 3 },
    { id: id(), style: 'challenge', icon: '🎯', accentColor: '#E24B4A', title: 'Weekly experiment', subtitle: 'Try this', body: 'Pick one variable to improve this week — sleep, water, morning walk. Track it daily and observe the effect on your energy. Small experiments, big insights.', priority: 3 },
  ];
}

function buildReflections(): FeedCard[] {
  return [
    { id: id(), style: 'reflection', icon: '💭', accentColor: '#7C6AF6', title: 'On productive days', subtitle: 'A question', body: 'You often describe productive days as calm rather than exciting. Why do you think that is? What does "productive" actually feel like to you?', priority: 4 },
    { id: id(), style: 'reflection', icon: '💭', accentColor: '#7C6AF6', title: 'On recovery', subtitle: 'A question', body: 'When you rest well, do you feel guilty about it? Many people do. But recovery is not the opposite of productivity — it is the foundation of it.', priority: 4 },
    { id: id(), style: 'reflection', icon: '💭', accentColor: '#7C6AF6', title: 'On patterns', subtitle: 'A question', body: 'If you could change one thing about your daily routine based on what you know about yourself, what would it be? The answer is usually obvious.', priority: 4 },
    { id: id(), style: 'reflection', icon: '✦', accentColor: '#5DCAA5', title: 'Small wins compound', subtitle: 'A reminder', body: 'Every check-in is a data point that makes future insights more accurate. You are building a map of yourself. The map gets better every day.', priority: 4 },
    { id: id(), style: 'reflection', icon: '✦', accentColor: '#5DCAA5', title: 'Progress is invisible', subtitle: 'A reminder', body: 'Real change usually feels like nothing is happening — until you look back at where you started. Trust the process. The data will show the shift.', priority: 4 },
  ];
}

function buildWeeklyReview(entries: DailyEntry[]): FeedCard[] {
  const cards: FeedCard[] = [];
  if (entries.length < 7) return cards;

  const week = entries.slice(0, 7);
  const avgSleep = avg(week, 'sleep_hours');
  const avgEnergy = avg(week, 'energy');
  const avgMood = avg(week, 'mood');
  const hardDays = week.filter((e) => e.activity === 'hard').length;
  const goodNutrition = week.filter((e) => e.nutrition === 'good').length;
  const lowSleep = week.filter((e) => e.sleep_hours < 6.5).length;

  const bestDay = week.reduce((best, e) => (e.state_score ?? 0) > (best.state_score ?? 0) ? e : best, week[0]);
  const worstDay = week.reduce((worst, e) => (e.state_score ?? 0) < (worst.state_score ?? 0) ? e : worst, week[0]);

  cards.push({
    id: id(), style: 'weekly', icon: '📊', accentColor: '#7C6AF6',
    title: 'Weekly review',
    subtitle: `${week.length} days tracked`,
    body: `Sleep: ${avgSleep.toFixed(1)}h avg · Energy: ${avgEnergy.toFixed(1)}/10 · Mood: ${avgMood.toFixed(1)}/5 · Hard training: ${hardDays} days · Good nutrition: ${goodNutrition} days · Short sleep: ${lowSleep} days. Best day: ${bestDay.entry_date} (${bestDay.state_score?.toFixed(1)}). Weakest: ${worstDay.entry_date} (${worstDay.state_score?.toFixed(1)}).`,
    priority: 2,
  });

  return cards;
}

function buildPredictions(entries: DailyEntry[]): FeedCard[] {
  const cards: FeedCard[] = [];
  const recent = entries.slice(0, 5);
  if (recent.length < 3) return cards;

  const today = recent[0];
  if (today.sleep_hours < 6 && recent.length >= 2) {
    const tomorrowProb = recent[1]?.energy ?? 5;
    cards.push({
      id: id(), style: 'prediction', icon: '🔮', accentColor: '#7C6AF6',
      title: 'Tomorrow prediction',
      subtitle: `Based on ${today.sleep_hours}h sleep tonight`,
      body: `If today's sleep pattern continues, tomorrow's energy will likely be ${Math.max(1, tomorrowProb - 1).toFixed(0)}-${tomorrowProb}/10. Sleep under 6h typically reduces next-day energy by 1-2 points.`,
      priority: 2,
    });
  }

  if (recent.length >= 3) {
    const trend = recent[0].energy - recent[2].energy;
    if (Math.abs(trend) >= 2) {
      cards.push({
        id: id(), style: 'prediction', icon: '🔮', accentColor: '#7C6AF6',
        title: 'Energy trajectory',
        subtitle: `${trend > 0 ? '+' : ''}${trend} points over 3 days`,
        body: trend > 0
          ? 'Your energy is on an upward trajectory. If the current pattern holds, the next 2-3 days should remain strong.'
          : 'Your energy is declining. Without intervention, the next 2-3 days may continue to drop. Focus on sleep and reduce training intensity.',
        priority: 2,
      });
    }
  }

  return cards;
}

export function generateFeedCards(entries: DailyEntry[]): FeedCard[] {
  const all: FeedCard[] = [
    ...buildCritical(entries),
    ...buildPatterns(entries),
    ...buildObservations(entries),
    ...buildWeeklyReview(entries),
    ...buildPredictions(entries),
    ...buildCoachNotes(),
    ...buildReflections(),
    ...buildScience(),
  ];

  all.sort((a, b) => (a.priority ?? 5) - (b.priority ?? 5));

  const seen = new Set<string>();
  const unique: FeedCard[] = [];
  for (const card of all) {
    const key = card.title;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(card);
    }
  }

  return unique;
}
