/**
 * BrainPopZ Gamification & Study Activity Service
 * Manages Duolingo-inspired streaks, streak freezes, XP, levels, and local daily tracking.
 */

const STORAGE_KEY = 'brainpopz_gamification';
const EVENT_NAME = 'brainpopz_gamification_updated';

// Format date as local YYYY-MM-DD
export function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d);
}

// Initial state for brand-new authenticated users (Zero fake data)
export function getInitialGamificationState() {
  return {
    xp: 0,
    streak: 0,
    lastActiveDate: null,
    freezes: 2,
    freezesUsed: 0,
    dailyGoalTarget: 20,
    cardsReviewedToday: 0,
    totalCardsMastered: 0,
    totalQuizzesTaken: 0,
    totalCorrectAnswers: 0,
    dailyActivity: {},
    unlockedAchievements: [],
  };
}

export function getGamificationState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialGamificationState();
    return { ...getInitialGamificationState(), ...JSON.parse(raw) };
  } catch {
    return getInitialGamificationState();
  }
}

export function saveGamificationState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: state }));
  } catch (err) {
    console.warn('Failed to save gamification state', err);
  }
}

// Level computation (Duolingo style tiers)
export function getLevelInfo(totalXp = 0) {
  const levels = [
    { level: 1, title: 'Novice Scholar', minXp: 0, maxXp: 100 },
    { level: 2, title: 'Active Learner', minXp: 100, maxXp: 250 },
    { level: 3, title: 'Memory Apprentice', minXp: 250, maxXp: 500 },
    { level: 4, title: 'Synapse Builder', minXp: 500, maxXp: 900 },
    { level: 5, title: 'Cognitive Master', minXp: 900, maxXp: 1500 },
    { level: 6, title: 'Neuro Prodigy', minXp: 1500, maxXp: 2500 },
    { level: 7, title: 'Grandmaster of Recall', minXp: 2500, maxXp: 5000 },
  ];

  for (let i = 0; i < levels.length; i++) {
    const lvl = levels[i];
    if (totalXp >= lvl.minXp && totalXp < lvl.maxXp) {
      const range = lvl.maxXp - lvl.minXp;
      const progressInLvl = totalXp - lvl.minXp;
      const percentage = Math.min(100, Math.round((progressInLvl / range) * 100));
      return {
        level: lvl.level,
        title: lvl.title,
        currentXp: totalXp,
        minXp: lvl.minXp,
        maxXp: lvl.maxXp,
        xpRemaining: lvl.maxXp - totalXp,
        percentage,
      };
    }
  }

  // Top level fallback
  return {
    level: 8,
    title: 'Legendary Mind',
    currentXp: totalXp,
    minXp: 5000,
    maxXp: 10000,
    xpRemaining: Math.max(0, 10000 - totalXp),
    percentage: 100,
  };
}

// Available Badges & Achievements
export const ACHIEVEMENTS_LIST = [
  {
    id: 'first_spark',
    name: 'First Spark',
    description: 'Complete your first study session or quiz drill',
    icon: '⚡',
    reqXp: 20,
  },
  {
    id: 'streak_3',
    name: 'Hat Trick',
    description: 'Maintain a 3-day active study streak',
    icon: '🔥',
    reqStreak: 3,
  },
  {
    id: 'streak_7',
    name: 'Unstoppable Flame',
    description: 'Maintain a 7-day study streak',
    icon: '🏆',
    reqStreak: 7,
  },
  {
    id: 'quiz_ace',
    name: 'Sharpshooter',
    description: 'Score 100% on any practice quiz drill',
    icon: '🎯',
    special: 'perfect_quiz',
  },
  {
    id: 'century_club',
    name: 'Century Scholar',
    description: 'Review 100 total flashcards across sessions',
    icon: '📚',
    reqCards: 100,
  },
  {
    id: 'freeze_shield',
    name: 'Ice Guardian',
    description: 'Equipped with streak freeze protections',
    icon: '❄️',
    special: 'has_freeze',
  },
];

/**
 * Records a real completed study session (Flashcards or Quiz)
 * Awards XP, updates streak & freeze logic, updates daily calendar.
 */
export function recordCompletedActivity({
  type, // 'flashcards' | 'quiz'
  cardsReviewed = 0,
  correctAnswers = 0,
  questionsCount = 0,
  isPerfectQuiz = false,
}) {
  const state = getGamificationState();
  const today = getLocalDateString();
  const yesterday = getYesterdayString();

  // 1. Calculate XP
  let earnedXp = 0;
  if (type === 'flashcards') {
    earnedXp = 20 + Math.min(30, cardsReviewed * 2);
  } else if (type === 'quiz') {
    earnedXp = 25 + correctAnswers * 5;
    if (isPerfectQuiz && questionsCount >= 3) {
      earnedXp += 20; // Perfect score bonus!
    }
  }

  // 2. Streak & Freeze Calculation
  let newStreak = state.streak;
  let usedFreeze = false;

  if (!state.lastActiveDate) {
    newStreak = 1;
  } else if (state.lastActiveDate === today) {
    // Already active today; streak stays current
  } else if (state.lastActiveDate === yesterday) {
    newStreak = state.streak + 1;
  } else {
    // Missed at least one day: Check if a freeze can protect the streak!
    const daysMissed = Math.floor(
      (new Date(today) - new Date(state.lastActiveDate)) / (1000 * 60 * 60 * 24)
    );

    if (daysMissed === 2 && state.freezes > 0) {
      // Protected by 1 freeze!
      usedFreeze = true;
      state.freezes -= 1;
      state.freezesUsed += 1;
      newStreak = state.streak + 1;
    } else {
      // Streak broken, restarts today
      newStreak = 1;
    }
  }

  // 3. Update Daily Activity
  const currentDaily = state.dailyActivity[today] || { cards: 0, quizzes: 0, xp: 0 };
  const updatedDaily = {
    cards: currentDaily.cards + cardsReviewed,
    quizzes: currentDaily.quizzes + (type === 'quiz' ? 1 : 0),
    xp: currentDaily.xp + earnedXp,
  };

  const newTotalXp = state.xp + earnedXp;
  const newCardsMastered = state.totalCardsMastered + (type === 'flashcards' ? Math.ceil(cardsReviewed * 0.7) : 0);
  const newQuizzesTaken = state.totalQuizzesTaken + (type === 'quiz' ? 1 : 0);
  const newCorrectAnswers = state.totalCorrectAnswers + correctAnswers;

  // 4. Check for New Achievements
  const unlocked = [...state.unlockedAchievements];
  ACHIEVEMENTS_LIST.forEach((ach) => {
    if (unlocked.includes(ach.id)) return;
    let earned = false;
    if (ach.reqXp && newTotalXp >= ach.reqXp) earned = true;
    if (ach.reqStreak && newStreak >= ach.reqStreak) earned = true;
    if (ach.reqCards && newCardsMastered >= ach.reqCards) earned = true;
    if (ach.special === 'perfect_quiz' && isPerfectQuiz) earned = true;
    if (ach.special === 'has_freeze' && state.freezes > 0) earned = true;

    if (earned) unlocked.push(ach.id);
  });

  const updatedState = {
    ...state,
    xp: newTotalXp,
    streak: newStreak,
    lastActiveDate: today,
    cardsReviewedToday: updatedDaily.cards,
    totalCardsMastered: newCardsMastered,
    totalQuizzesTaken: newQuizzesTaken,
    totalCorrectAnswers: newCorrectAnswers,
    dailyActivity: {
      ...state.dailyActivity,
      [today]: updatedDaily,
    },
    unlockedAchievements: unlocked,
  };

  saveGamificationState(updatedState);

  return {
    earnedXp,
    newStreak,
    usedFreeze,
    totalXp: newTotalXp,
    levelInfo: getLevelInfo(newTotalXp),
  };
}

/**
 * Builds a clean 7-day week activity array (Mon -> Sun or past 7 days)
 * with actual review counts, XP earned, and highlight on today.
 */
export function getWeeklyActivityView(dailyActivity = {}) {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayStr = getLocalDateString();

  // Past 7 days up to today
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);
    const dayName = dayNames[d.getDay()];
    const record = dailyActivity[dateStr] || { cards: 0, quizzes: 0, xp: 0 };

    days.push({
      date: dateStr,
      dayName,
      dayNumber: d.getDate(),
      isToday: dateStr === todayStr,
      cards: record.cards,
      quizzes: record.quizzes,
      xp: record.xp,
      isGoalMet: record.cards >= 10 || record.quizzes >= 1,
    });
  }

  return days;
}

