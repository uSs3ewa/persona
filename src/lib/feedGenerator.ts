import { DailyEntry, FeedCard, FeedCardSection } from '@/types';

let counter = 0;
function id(): string {
  return `feed-${Date.now()}-${counter++}`;
}

function avg(entries: DailyEntry[], field: keyof DailyEntry): number {
  if (entries.length === 0) return 0;
  return entries.reduce((s, e) => s + ((e[field] as number) ?? 0), 0) / entries.length;
}

function pctChange(a: number, b: number): string {
  if (b === 0) return '0%';
  const pct = ((a - b) / Math.abs(b)) * 100;
  return `${pct > 0 ? '+' : ''}${pct.toFixed(0)}%`;
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
      category: 'Warning',
      hook: `You've repeated the same mistake again.`,
      expandedContent: `${lowSleepDays} of your last ${recent.length} days were under 6 hours of sleep.\n\nYour average sleep has dropped to ${avgSleep.toFixed(1)}h. Cognitive performance declines faster than it feels.\n\nThis pattern usually precedes a noticeable energy crash within 5–7 days.\n\n────────────────\n\nThe danger isn't any single bad night. It's the accumulation.\n\nSleep debt doesn't resolve itself — it compounds. And your body doesn't distinguish between physical and mental exhaustion.`,
      priority: 1,
    });
  }

  if (hardDays >= 4) {
    cards.push({
      id: id(), style: 'warning', icon: '⚠', accentColor: '#E24B4A',
      category: 'Recovery',
      hook: `Your recovery isn't keeping up.`,
      expandedContent: `${hardDays} hard sessions in ${recent.length} days.\n\nFrequent intense activity without matching recovery depletes the same reserves as stress.\n\nYour body does not distinguish between physical and mental load.\n\n────────────────\n\nConsider reducing intensity for 2–3 days. The adaptation happens during rest, not during the session.`,
      priority: 1,
    });
  }

  if (avgEnergy <= 3 && recent.length >= 3) {
    cards.push({
      id: id(), style: 'recovery', icon: '😴', accentColor: '#1D9E75',
      category: 'Sleep',
      hook: `Your sleep isn't your biggest problem.`,
      expandedContent: `Over the last ${recent.length} days your sleep has stayed almost identical.\n\nHowever your energy continued to decrease.\n\nThat suggests sleep is probably no longer the limiting factor.\n\n────────────────\n\nStress and reduced physical activity now show a much stronger relationship.\n\n7-day energy average: ${avgEnergy.toFixed(1)}/10.\n\nWhen energy stays low for multiple days, it usually means recovery is not keeping up with demand.`,
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
      category: 'Pattern',
      hook: `You're probably blaming the wrong thing.`,
      expandedContent: `Your ${dayNames[worstDay]}s consistently show the lowest energy.\n\nAverage on ${dayNames[worstDay]}s: ${worstAvg.toFixed(1)}/10\nAverage on ${dayNames[bestDay]}s: ${bestAvg.toFixed(1)}/10\n\nThat's a ${(bestAvg - worstAvg).toFixed(1)}-point gap.\n\n────────────────\n\nSomething about your ${dayNames[worstDay]} routine is draining you.\n\nIt's not the day itself. It's what differs — sleep the night before, schedule, activity, or nutrition.`,
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
          id: id(), style: 'sleep', icon: '🧠', accentColor: '#5DCAA5',
          category: 'Brain',
          hook: `Your brain keeps sending the same signal.`,
          expandedContent: `Mood on short sleep (<6.5h): ${lowMoodAvg.toFixed(1)}/5\nMood on good sleep (7.5h+): ${goodMoodAvg.toFixed(1)}/5\n\nThat's a ${(goodMoodAvg - lowMoodAvg).toFixed(1)}-point difference — one of the strongest correlations in your data.\n\n────────────────\n\nThis isn't a suggestion to "sleep more." It's a pattern worth understanding.\n\nYour emotional regulation appears to be heavily influenced by sleep debt. The relationship is consistent, not occasional.`,
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
          category: 'Trend',
          hook: 'Something changed this week.',
          expandedContent: `Average Energy\nThis week: ${thisAvg.toFixed(1)}/10\nLast week: ${lastAvg.toFixed(1)}/10\nChange: ${diff > 0 ? '↑' : '↓'} ${Math.abs(diff).toFixed(1)} points\n\n────────────────\n\n${diff > 0
            ? 'Something you changed this week is working. The shift is measurable. Keep the pattern.'
            : 'Your energy dropped compared to last week. Check what changed — sleep, stress, activity, or nutrition.'}`,
          priority: 2,
        });
      }
    }
  }

  if (entries.length >= 7) {
    const thisWeek = entries.slice(0, 7);
    const lastWeek = entries.slice(7, 14);
    if (lastWeek.length >= 3) {
      const thisMood = avg(thisWeek, 'mood');
      const lastMood = avg(lastWeek, 'mood');
      const thisSleep = avg(thisWeek, 'sleep_hours');
      const lastSleep = avg(lastWeek, 'sleep_hours');

      const moodUp = thisMood > lastMood + 0.3;
      const sleepDown = thisSleep < lastSleep - 0.3;

      if (moodUp && sleepDown) {
        cards.push({
          id: id(), style: 'observation', icon: '💡', accentColor: '#7C6AF6',
          category: 'Discovery',
          hook: 'Your wellbeing improved despite sleeping less.',
          expandedContent: `Average Mood\n↑ ${pctChange(thisMood, lastMood)} this week\n\nAverage Sleep\n↓ ${pctChange(thisSleep, lastSleep)} this week\n\n────────────────\n\nMood went up while sleep went down.\n\nSomething besides sleep is now contributing positively. This could be activity, social connection, reduced stress, or a routine change.\n\nWorth investigating what changed.`,
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
      category: 'Coach',
      hook: `You're in rare territory right now.`,
      expandedContent: `Energy: ${today.energy}/10\nMood: ${today.mood}/5\n\n────────────────\n\nHigh-energy days are rare. This one is worth using intentionally.\n\nBlock 90 minutes for your most important task. No meetings, no messages.\n\nOne deep work session on a day like this produces more than a full week of scattered effort.`,
      priority: 3,
    });
  }

  if (today.note && today.note.length > 5) {
    cards.push({
      id: id(), style: 'reflection', icon: '💭', accentColor: '#7C6AF6',
      category: 'Reflection',
      hook: 'Your words say more than you think.',
      expandedContent: `You wrote today:\n"${today.note.slice(0, 120)}${today.note.length > 120 ? '...' : ''}"\n\n────────────────\n\nWriting your state down makes patterns visible over time.\n\nWhat you record today becomes a data point for future understanding. These notes will eventually reveal recurring themes you can't see in the moment.`,
      priority: 4,
    });
  }

  if (today.sleep_hours < 6) {
    cards.push({
      id: id(), style: 'coach', icon: '⚡', accentColor: '#EF9F27',
      category: 'Coach',
      hook: 'Today requires a different strategy.',
      expandedContent: `Sleep: ${today.sleep_hours}h\n\n────────────────\n\nKeep tasks small and sequential today.\n\nAvoid context switching. One good decision at a time is enough.\n\nSleep debt doesn't resolve itself — it compounds. The goal today isn't productivity. It's preventing tomorrow from being worse.`,
      priority: 2,
    });
  }

  if (today.activity === 'hard' && today.sleep_hours < 7) {
    cards.push({
      id: id(), style: 'training', icon: '🏃', accentColor: '#E24B4A',
      category: 'Training',
      hook: 'Your recovery surprised me.',
      expandedContent: `Activity: Hard\nSleep: ${today.sleep_hours}h\n\n────────────────\n\nHard training demands 48–72 hours of recovery.\n\nWhen sleep is short, recovery takes longer. Your next session should be lighter unless sleep improves.\n\nThe impulse to push through is strong. The data says otherwise.`,
      priority: 2,
    });
  }

  if (today.nutrition === 'poor') {
    cards.push({
      id: id(), style: 'nutrition', icon: '🍎', accentColor: '#5DCAA5',
      category: 'Nutrition',
      hook: 'This food might not be helping.',
      expandedContent: `Nutrition: Poor\n\n────────────────\n\nEven one clean meal improves cognitive steadiness.\n\nProtein and hydration within the first hours of waking have the strongest effect on afternoon energy.\n\nYou don't need a perfect diet. You need one intentional meal today.`,
      priority: 3,
    });
  }

  if (today.mood <= 2) {
    cards.push({
      id: id(), style: 'mood', icon: '💭', accentColor: '#7C6AF6',
      category: 'Mood',
      hook: `You're probably blaming the wrong thing.`,
      expandedContent: `Mood: ${today.mood}/5\n\n────────────────\n\nLow mood often feels like a personal failing but is usually a signal.\n\nFrom sleep, stress, or unmet needs.\n\nTreat it as data, not judgment. The feeling is real. The explanation you're giving yourself might not be.`,
      priority: 3,
    });
  }

  const recent = entries.slice(0, 5);
  if (recent.length >= 3) {
    const notes = recent.filter((e) => e.note && e.note.length > 3);
    if (notes.length >= 2) {
      cards.push({
        id: id(), style: 'habit', icon: '🎯', accentColor: '#5DCAA5',
        category: 'Habit',
        hook: 'You accidentally built a powerful habit.',
        expandedContent: `${notes.length} of last ${recent.length} days with written notes.\n\n────────────────\n\nYou are building a habit of reflection.\n\nThis is one of the strongest predictors of long-term behavioral change. The pattern matters more than any single entry.`,
      priority: 4,
      });
    }
  }

  const hydrationEntries = recent.filter((e) => e.activity !== 'none' && e.energy < 5);
  if (hydrationEntries.length >= 2) {
    cards.push({
      id: id(), style: 'hydration', icon: '💧', accentColor: '#5DCAA5',
      category: 'Hydration',
      hook: 'One tiny habit keeps appearing.',
      expandedContent: `${hydrationEntries.length} low-energy days in the last ${recent.length} days.\n\n────────────────\n\nEven 1–2% dehydration impairs attention, working memory, and mood.\n\nMost people underestimate how much water affects their mental performance.\n\nTry drinking water immediately after waking. It's the simplest lever.`,
      priority: 4,
    });
  }

  return cards;
}

function buildScience(): FeedCard[] {
  return [
    {
      id: id(), style: 'neuroscience', icon: '🧠', accentColor: '#7C6AF6',
      category: 'Neuroscience',
      hook: 'Your brain rewires itself every night.',
      expandedContent: `During deep sleep, the brain replays and strengthens memories from the day.\n\nConsistent sleep timing improves this process more than extra hours of inconsistent sleep.\n\n────────────────\n\nThe timing of sleep matters as much as the duration.\n\nGoing to bed at the same time each night trains your brain to anticipate rest, improving both sleep quality and memory consolidation.`,
      priority: 5,
    },
    {
      id: id(), style: 'psychology', icon: '🧠', accentColor: '#7C6AF6',
      category: 'Psychology',
      hook: "Stress doesn't feel like stress.",
      expandedContent: `Stress and low motivation both reduce cognitive flexibility.\n\nThe brain conserves energy by narrowing focus — which feels like not caring, but is actually self-protection.\n\n────────────────\n\nWhen you feel "unmotivated," your brain may be responding to overload.\n\nThe narrowing of attention is a stress response, not a character flaw.`,
      priority: 5,
    },
    {
      id: id(), style: 'fact', icon: '💧', accentColor: '#5DCAA5',
      category: 'Science',
      hook: 'Your brain is mostly water.',
      expandedContent: `Even 1–2% dehydration impairs attention, working memory, and mood.\n\nMost people underestimate how much water affects their mental performance.\n\n────────────────\n\nHydration isn't just about thirst. By the time you feel thirsty, cognitive performance has already declined.\n\nKeeping water visible and accessible is the simplest performance hack.`,
      priority: 5,
    },
    {
      id: id(), style: 'fact', icon: '🚶', accentColor: '#EF9F27',
      category: 'Did you know',
      hook: 'Walking restores focus faster than rest.',
      expandedContent: `A 10-minute walk can restore sustained attention after a long focus session.\n\nMovement is not a break from productivity — it fuels it.\n\n────────────────\n\nThe brain needs varied input to maintain focus.\n\nWalking provides low-intensity sensory stimulation that resets attention without the cognitive cost of a task switch.`,
      priority: 5,
    },
    {
      id: id(), style: 'neuroscience', icon: '🔄', accentColor: '#7C6AF6',
      category: 'Neuroscience',
      hook: 'Your brain deletes decisions to save energy.',
      expandedContent: `The brain conserves energy by automating repeated actions.\n\nHabits performed at the same time each day become effortless faster than irregular ones.\n\n────────────────\n\nConsistency in timing is the key variable.\n\nThe same habit at a random time requires active decision. The same habit at the same time becomes automatic. Timing is the trigger.`,
      priority: 5,
    },
    {
      id: id(), style: 'psychology', icon: '📊', accentColor: '#5DCAA5',
      category: 'Psychology',
      hook: 'Energy predicts mood more than mood predicts energy.',
      expandedContent: `Research shows energy levels predict mood more reliably than mood predicts energy.\n\nProtecting energy often stabilizes mood naturally.\n\n────────────────\n\nWe tend to treat mood as the cause of our bad days.\n\nBut the data suggests energy is usually the upstream variable. Fix the energy, and mood often follows.`,
      priority: 5,
    },
    {
      id: id(), style: 'fact', icon: '🍳', accentColor: '#EF9F27',
      category: 'Science',
      hook: 'When you eat matters more than what.',
      expandedContent: `Protein within the first few hours of waking improves focus and reduces afternoon energy crashes.\n\nThis effect is stronger than total daily protein intake.\n\n────────────────\n\nTiming amplifies nutrition.\n\nThe same meal at 7am vs 10am can have meaningfully different effects on your energy curve. The first hours set the trajectory.`,
      priority: 5,
    },
    {
      id: id(), style: 'fact', icon: '📈', accentColor: '#7C6AF6',
      category: 'Did you know',
      hook: 'The pattern matters more than the peak.',
      expandedContent: `Consistent moderate effort produces better long-term outcomes than occasional intense bursts followed by rest.\n\n────────────────\n\nIntensity without consistency is entertainment.\n\nThe person who walks 30 minutes every day outperforms the person who runs 10 miles once a week — across almost every health metric.`,
      priority: 5,
    },
    {
      id: id(), style: 'fact', icon: '⏰', accentColor: '#EF9F27',
      category: 'Science',
      hook: 'Your body clock is trainable.',
      expandedContent: `Waking at the same time every day — even weekends — is the single most powerful lever for regulating your internal clock.\n\n────────────────\n\nWeekend sleep-ins feel good but create "social jet lag."\n\nYour body can't instantly shift a 2-hour schedule back on Monday. Consistency, even on weekends, eliminates this hidden energy drain.`,
      priority: 5,
    },
    {
      id: id(), style: 'fact', icon: '🪨', accentColor: '#1D9E75',
      category: 'Science',
      hook: 'Recovery has three layers.',
      expandedContent: `Physical recovery (sleep), mental recovery (quiet, nature), and emotional recovery (connection, play) are distinct systems.\n\nAll three matter.\n\n────────────────\n\nYou can sleep 8 hours and still be mentally exhausted.\n\nPhysical rest doesn't fix emotional depletion. You need variety in your recovery — the same way you need variety in your training.`,
      priority: 5,
    },
  ];
}

function buildCoachNotes(): FeedCard[] {
  return [
    {
      id: id(), style: 'coach', icon: '🧪', accentColor: '#5DCAA5',
      category: 'Experiment',
      hook: 'Try one experiment this week.',
      expandedContent: `Change one variable — sleep time, morning walk, meal timing.\n\nObserve the effect for 5 days. Repeat what works.\n\n────────────────\n\nThis is how real optimization happens.\n\nNot by changing everything at once. By isolating one variable, observing the result, and building from there.`,
      priority: 3,
    },
    {
      id: id(), style: 'coach', icon: '📉', accentColor: '#EF9F27',
      category: 'Coach',
      hook: 'Your energy has a hidden pattern.',
      expandedContent: `Most people have 2–3 natural high-energy windows per day.\n\nYou probably have them too — you just haven't mapped them yet.\n\n────────────────\n\nTrack when your energy peaks and troughs for one week.\n\nProtect your highest-energy window for your most important work. This single change often produces the biggest improvement in output.`,
      priority: 3,
    },
    {
      id: id(), style: 'coach', icon: '🎯', accentColor: '#E24B4A',
      category: 'Coach',
      hook: 'Never miss twice.',
      expandedContent: `Never miss a positive habit two days in a row.\n\nOne miss is rest. Two misses is the start of a new pattern.\n\n────────────────\n\nThe streak matters more than perfection.\n\nA broken streak feels catastrophic. But the data shows that one miss doesn't derail progress. Two consecutive misses is where real change begins.`,
      priority: 3,
    },
    {
      id: id(), style: 'coach', icon: '🔄', accentColor: '#7C6AF6',
      category: 'Perspective',
      hook: 'The bad days are the data.',
      expandedContent: `A low-energy day is not failure — it is information.\n\nThe pattern of low days reveals what needs attention.\n\n────────────────\n\nThe worst data point is the one you never collected.\n\nWhen you track a bad day instead of ignoring it, you give future-you the context to recognize the pattern.`,
      priority: 3,
    },
    {
      id: id(), style: 'coach', icon: '🏠', accentColor: '#5DCAA5',
      category: 'Insight',
      hook: 'Your space predicts your behavior.',
      expandedContent: `Your surroundings predict your actions more reliably than willpower.\n\nDesign your space to make good choices the easy choice.\n\n────────────────\n\nWillpower is a depletable resource.\n\nEnvironment design is permanent. The person who places water on their desk drinks more than the person who decides to drink more water.`,
      priority: 3,
    },
    {
      id: id(), style: 'challenge', icon: '🎯', accentColor: '#E24B4A',
      category: 'Challenge',
      hook: 'One variable. One week. Observe.',
      expandedContent: `Pick one variable to improve this week — sleep, water, morning walk.\n\nTrack it daily and observe the effect on your energy.\n\n────────────────\n\nSmall experiments, big insights.\n\nThe goal isn't perfection. It's learning what moves your needle. One controlled experiment teaches more than months of random changes.`,
      priority: 3,
    },
  ];
}

function buildReflections(): FeedCard[] {
  return [
    {
      id: id(), style: 'reflection', icon: '💭', accentColor: '#7C6AF6',
      category: 'Reflection',
      hook: 'Productive days feel calm, not exciting.',
      expandedContent: `You often describe productive days as calm rather than exciting.\n\n────────────────\n\nWhy do you think that is?\n\nWhat does "productive" actually feel like to you? The answer might reveal something about what you're optimizing for — and whether it's what you actually want.`,
      priority: 4,
    },
    {
      id: id(), style: 'reflection', icon: '💭', accentColor: '#7C6AF6',
      category: 'Reflection',
      hook: 'Do you feel guilty when you rest?',
      expandedContent: `When you rest well, do you feel guilty about it?\n\nMany people do.\n\n────────────────\n\nBut recovery is not the opposite of productivity — it is the foundation of it.\n\nThe guilt itself is often a better signal than the rest. It means you're recovering from something that demanded more than you gave it.`,
      priority: 4,
    },
    {
      id: id(), style: 'reflection', icon: '💭', accentColor: '#7C6AF6',
      category: 'Reflection',
      hook: 'If you could change one thing…',
      expandedContent: `If you could change one thing about your daily routine based on what you know about yourself, what would it be?\n\n────────────────\n\nThe answer is usually obvious.\n\nThe hard part isn't knowing what to change. It's acting on what you already know.`,
      priority: 4,
    },
    {
      id: id(), style: 'reflection', icon: '✦', accentColor: '#5DCAA5',
      category: 'Milestone',
      hook: 'Every check-in makes you harder to predict.',
      expandedContent: `Every check-in is a data point that makes future insights more accurate.\n\n────────────────\n\nYou are building a map of yourself.\n\nThe map gets better every day. What feels like routine is actually calibration — making the AI's observations more precise, more useful, more personal.`,
      priority: 4,
    },
    {
      id: id(), style: 'reflection', icon: '✦', accentColor: '#5DCAA5',
      category: 'Reminder',
      hook: `Progress is invisible until it isn't.`,
      expandedContent: `Real change usually feels like nothing is happening.\n\nUntil you look back at where you started.\n\n────────────────\n\nThe data will show the shift.\n\nTrust the process. The daily entries that feel meaningless are the raw material for insights you can't have yet.`,
      priority: 4,
    },
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
    category: 'Weekly Review',
    hook: 'Your week in numbers.',
    expandedContent: `Sleep: ${avgSleep.toFixed(1)}h avg\nEnergy: ${avgEnergy.toFixed(1)}/10\nMood: ${avgMood.toFixed(1)}/5\nHard training: ${hardDays} days\nGood nutrition: ${goodNutrition} days\nShort sleep: ${lowSleep} days\n\n────────────────\n\nBest day: ${bestDay.entry_date} (score ${bestDay.state_score?.toFixed(1)})\nWeakest day: ${worstDay.entry_date} (score ${worstDay.state_score?.toFixed(1)})\n\nThe gap between your best and worst day tells you how much variability exists in your system.`,
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
      category: 'Prediction',
      hook: 'Tomorrow will probably feel different.',
      expandedContent: `Based on ${today.sleep_hours}h of sleep tonight:\n\nPredicted energy: ${Math.max(1, tomorrowProb - 1).toFixed(0)}–${tomorrowProb}/10\n\n────────────────\n\nSleep under 6 hours typically reduces next-day energy by 1–2 points.\n\nThis isn't a prediction about willpower or motivation. It's physiology. Your prefrontal cortex — the part that makes decisions — is the first to suffer from sleep debt.`,
      priority: 2,
    });
  }

  if (recent.length >= 3) {
    const trend = recent[0].energy - recent[2].energy;
    if (Math.abs(trend) >= 2) {
      cards.push({
        id: id(), style: 'prediction', icon: '🔮', accentColor: '#7C6AF6',
        category: 'Prediction',
        hook: 'Your energy is heading somewhere.',
        expandedContent: `${trend > 0 ? '↑' : '↓'} ${Math.abs(trend)} points over 3 days\n\n────────────────\n\n${trend > 0
          ? 'Your energy is on an upward trajectory. If the current pattern holds, the next 2–3 days should remain strong.'
          : 'Your energy is declining. Without intervention, the next 2–3 days may continue to drop. Focus on sleep and reduce training intensity.'}`,
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
    const key = card.hook;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(card);
    }
  }

  return unique;
}

const SECTION_MAP: Record<string, FeedCardSection> = {
  'Warning': 'insights',
  'Recovery': 'recovery',
  'Sleep': 'recovery',
  'Pattern': 'insights',
  'Brain': 'mind',
  'Trend': 'trending',
  'Discovery': 'insights',
  'Coach': 'coach',
  'Reflection': 'mind',
  'Training': 'training',
  'Nutrition': 'nutrition',
  'Mood': 'mind',
  'Habit': 'insights',
  'Hydration': 'nutrition',
  'Neuroscience': 'science',
  'Psychology': 'science',
  'Science': 'science',
  'Did you know': 'science',
  'Experiment': 'coach',
  'Perspective': 'mind',
  'Insight': 'mind',
  'Challenge': 'coach',
  'Milestone': 'insights',
  'Reminder': 'mind',
  'Prediction': 'insights',
  'Weekly Review': 'trending',
};

function assignSections(cards: FeedCard[]): FeedCard[] {
  return cards.map((card) => ({
    ...card,
    section: card.section || SECTION_MAP[card.category || ''] || 'insights',
  }));
}

export interface TrendMetric {
  icon: string;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'flat';
  color: string;
}

export function generateTrendMetrics(entries: DailyEntry[]): TrendMetric[] {
  const metrics: TrendMetric[] = [];
  if (entries.length < 7) return metrics;

  const thisWeek = entries.slice(0, 7);
  const lastWeek = entries.slice(7, 14);
  if (lastWeek.length < 3) return metrics;

  const thisEnergy = avg(thisWeek, 'energy');
  const lastEnergy = avg(lastWeek, 'energy');
  const energyDiff = thisEnergy - lastEnergy;
  metrics.push({
    icon: '⚡',
    label: 'Energy',
    value: `${thisEnergy.toFixed(0)}/10`,
    change: `${energyDiff > 0 ? '+' : ''}${((energyDiff / Math.max(lastEnergy, 1)) * 100).toFixed(0)}% vs last week`,
    trend: energyDiff > 0.5 ? 'up' : energyDiff < -0.5 ? 'down' : 'flat',
    color: '#EF9F27',
  });

  const thisMood = avg(thisWeek, 'mood');
  const lastMood = avg(lastWeek, 'mood');
  const moodDiff = thisMood - lastMood;
  metrics.push({
    icon: '😊',
    label: 'Mood',
    value: `${thisMood.toFixed(1)}/5`,
    change: `${moodDiff > 0 ? '+' : ''}${((moodDiff / Math.max(lastMood, 1)) * 100).toFixed(0)}% vs last week`,
    trend: moodDiff > 0.2 ? 'up' : moodDiff < -0.2 ? 'down' : 'flat',
    color: '#7C6AF6',
  });

  const thisSleep = avg(thisWeek, 'sleep_hours');
  const lastSleep = avg(lastWeek, 'sleep_hours');
  const sleepDiff = thisSleep - lastSleep;
  metrics.push({
    icon: '🌙',
    label: 'Sleep',
    value: `${thisSleep.toFixed(1)}h`,
    change: `${sleepDiff > 0 ? '+' : ''}${((sleepDiff / Math.max(lastSleep, 1)) * 100).toFixed(0)}% vs last week`,
    trend: sleepDiff > 0.2 ? 'up' : sleepDiff < -0.2 ? 'down' : 'flat',
    color: '#5DCAA5',
  });

  const thisHard = thisWeek.filter((e) => e.activity === 'hard').length;
  const lastHard = lastWeek.filter((e) => e.activity === 'hard').length;
  metrics.push({
    icon: '🏃',
    label: 'Training',
    value: `${thisHard} hard`,
    change: `${thisHard > lastHard ? '+' : ''}${thisHard - lastHard} vs last week`,
    trend: thisHard > lastHard ? 'up' : thisHard < lastHard ? 'down' : 'flat',
    color: '#E24B4A',
  });

  return metrics;
}

export interface FeedSection {
  key: string;
  title: string;
  subtitle?: string;
  cards: FeedCard[];
  layout: 'hero' | 'horizontal' | 'horizontal-compact';
}

export function generateFeedSections(entries: DailyEntry[]): FeedSection[] {
  const allCards = assignSections(generateFeedCards(entries));
  const sections: FeedSection[] = [];

  const hero = allCards.find((c) => c.priority === 1) || allCards[0];
  if (hero) {
    sections.push({
      key: 'hero',
      title: '',
      cards: [{ ...hero, section: 'hero' }],
      layout: 'hero',
    });
  }

  const trendMetrics = generateTrendMetrics(entries);
  if (trendMetrics.length > 0) {
    sections.push({
      key: 'trending',
      title: 'Trending This Week',
      cards: [],
      layout: 'horizontal',
    });
  }

  const insightCards = allCards.filter((c) => c.section === 'insights' && c.id !== hero?.id);
  if (insightCards.length > 0) {
    sections.push({
      key: 'insights',
      title: "Today's Insights",
      cards: insightCards.slice(0, 6),
      layout: 'horizontal',
    });
  }

  const recoveryCards = allCards.filter((c) => c.section === 'recovery');
  if (recoveryCards.length > 0) {
    sections.push({
      key: 'recovery',
      title: 'Recovery',
      subtitle: 'Sleep, energy & restoration',
      cards: recoveryCards,
      layout: 'horizontal',
    });
  }

  const mindCards = allCards.filter((c) => c.section === 'mind');
  if (mindCards.length > 0) {
    sections.push({
      key: 'mind',
      title: 'Mind & Psychology',
      subtitle: 'Patterns in your thinking',
      cards: mindCards,
      layout: 'horizontal',
    });
  }

  const trainingCards = allCards.filter((c) => c.section === 'training');
  if (trainingCards.length > 0) {
    sections.push({
      key: 'training',
      title: 'Training',
      subtitle: 'Movement & activity',
      cards: trainingCards,
      layout: 'horizontal',
    });
  }

  const nutritionCards = allCards.filter((c) => c.section === 'nutrition');
  if (nutritionCards.length > 0) {
    sections.push({
      key: 'nutrition',
      title: 'Nutrition',
      subtitle: 'Fuel & hydration',
      cards: nutritionCards,
      layout: 'horizontal',
    });
  }

  const scienceCards = allCards.filter((c) => c.section === 'science');
  if (scienceCards.length > 0) {
    sections.push({
      key: 'science',
      title: 'Learn & Improve',
      subtitle: 'Science-backed insights',
      cards: scienceCards,
      layout: 'horizontal-compact',
    });
  }

  const coachCards = allCards.filter((c) => c.section === 'coach');
  if (coachCards.length > 0) {
    sections.push({
      key: 'coach',
      title: "Coach's Corner",
      subtitle: 'Experiments & challenges',
      cards: coachCards,
      layout: 'horizontal',
    });
  }

  return sections;
}
