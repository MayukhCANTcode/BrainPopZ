export const currentUser = {
  name: "Alex Rivera",
  email: "alex.rivera@university.edu",
  role: "Neuroscience & CS Major",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  studyStreak: 7,
  streakFlame: true,
  creditsRemaining: 84,
  totalCredits: 100,
  dailyGoalProgress: 38,
  dailyGoalTarget: 50,
};

export const notificationsList = [
  {
    id: "notif-1",
    title: "Spaced Repetition Due",
    message: "15 cards in 'Raft Consensus' are scheduled for review today.",
    time: "20 min ago",
    unread: true,
    type: "review"
  },
  {
    id: "notif-2",
    title: "Streak Milestone Achieved! 🔥",
    message: "You've studied 7 days in a row! 3 more days to reach Bronze Scholar.",
    time: "2 hours ago",
    unread: true,
    type: "streak"
  },
  {
    id: "notif-3",
    title: "AI Synthesis Complete",
    message: "Your deck 'Neuroscience: Synaptic Plasticity' was generated.",
    time: "Yesterday",
    unread: false,
    type: "ai"
  }
];

export const dashboardStats = [
  {
    id: "mastered",
    label: "Cards Mastered",
    value: "384",
    change: "+18%",
    trend: "up",
    caption: "vs last week",
    accentColor: "violet",
  },
  {
    id: "streak",
    label: "Active Streak",
    value: "7 Days",
    change: "Personal Best 🔥",
    trend: "neutral",
    caption: "Keep it going today",
    accentColor: "orange",
  },
  {
    id: "accuracy",
    label: "Quiz Accuracy",
    value: "94.2%",
    change: "+4.1%",
    trend: "up",
    caption: "from 12 quizzes",
    accentColor: "lime",
  },
  {
    id: "time",
    label: "Study Time",
    value: "18.5h",
    change: "+3.2h",
    trend: "up",
    caption: "this week",
    accentColor: "violet",
  },
];

export const recentDecks = [
  {
    id: "deck-1",
    title: "Neuroscience: Synaptic Plasticity & LTP",
    subject: "Biology & Medicine",
    totalCards: 38,
    masteredCards: 32,
    masteryPercentage: 84,
    lastStudied: "2 hours ago",
    badgeColor: "violet",
    tags: ["Long-term Potentiation", "NMDA Receptors", "Synapses"],
    isBookmarked: true,
    cards: [
      {
        q: "What is the primary role of Long-Term Potentiation (LTP) in synaptic plasticity?",
        a: "LTP strengthens synaptic connections following high-frequency stimulation, serving as the cellular basis for learning and long-term memory formation.",
        difficulty: "Medium"
      },
      {
        q: "Which neurotransmitter receptor is magnesium-blocked until cellular depolarization occurs?",
        a: "The NMDA receptor. Voltage-dependent ejection of the Mg2+ ion allows Ca2+ influx essential for synaptic strengthening.",
        difficulty: "Hard"
      },
      {
        q: "What role does CaMKII play after calcium influx in the postsynaptic density?",
        a: "CaMKII phosphorylates existing AMPA receptors to increase channel conductance and drives insertion of new AMPA receptors into the postsynaptic membrane.",
        difficulty: "Challenging"
      }
    ]
  },
  {
    id: "deck-2",
    title: "Distributed Systems: Raft Consensus Algorithm",
    subject: "Computer Science",
    totalCards: 44,
    masteredCards: 42,
    masteryPercentage: 95,
    lastStudied: "Yesterday",
    badgeColor: "lime",
    tags: ["Leader Election", "Log Replication", "Safety"],
    isBookmarked: false,
    cards: [
      {
        q: "How does the Leader Election phase in Raft ensure single-leader consistency?",
        a: "Nodes transition to candidate status after a randomized election timeout; a candidate must obtain a majority vote (N/2 + 1) from peers in a given term to win.",
        difficulty: "Medium"
      },
      {
        q: "What is the Raft Log Matching Property?",
        a: "If two logs contain an entry with the same index and term, then the logs are identical in all entries up through the given index.",
        difficulty: "Hard"
      },
      {
        q: "Why does Raft disallow committed entries from older terms from being directly committed by counting replicas?",
        a: "To prevent overwritten commits during leader transitions; a leader only commits entries from its current term by counting replicas.",
        difficulty: "Challenging"
      }
    ]
  },
  {
    id: "deck-3",
    title: "Organic Chemistry: Carbonyl Reactions & Enolates",
    subject: "Chemistry",
    totalCards: 52,
    masteredCards: 36,
    masteryPercentage: 69,
    lastStudied: "3 days ago",
    badgeColor: "orange",
    tags: ["Aldol Condensation", "Michael Addition", "NMR"],
    isBookmarked: true,
    cards: [
      {
        q: "What are the structural requirements for a molecule to undergo an Aldol reaction?",
        a: "The carbonyl compound must possess at least one acidic alpha-hydrogen to form the nucleophilic enol or enolate intermediate.",
        difficulty: "Medium"
      },
      {
        q: "Differentiate between thermodynamic and kinetic enolate formation.",
        a: "Kinetic enolates form rapidly at low temperatures (-78°C) using strong bulky bases (LDA) at the less hindered carbon; thermodynamic enolates form at higher temperatures with weaker bases at the more substituted double bond.",
        difficulty: "Hard"
      }
    ]
  },
  {
    id: "deck-4",
    title: "Machine Learning: Transformers & Multi-Head Attention",
    subject: "Artificial Intelligence",
    totalCards: 30,
    masteredCards: 24,
    masteryPercentage: 80,
    lastStudied: "4 days ago",
    badgeColor: "violet",
    tags: ["Self-Attention", "Positional Encoding", "BERT"],
    isBookmarked: false,
    cards: [
      {
        q: "What is the purpose of scaling by sqrt(d_k) in Scaled Dot-Product Attention?",
        a: "For large values of d_k, dot products grow large in magnitude, pushing the softmax function into regions with extremely small gradients. Dividing by sqrt(d_k) stabilizes gradient flow.",
        difficulty: "Medium"
      },
      {
        q: "Why are positional encodings required in Transformer models?",
        a: "Because self-attention is permutation-invariant and processes all tokens in parallel; positional encodings inject sequence order information into the embeddings.",
        difficulty: "Hard"
      }
    ]
  },
];

export const multiQuestionQuizzes = {
  default: [
    {
      id: 1,
      subject: "Computer Science",
      topic: "Raft Consensus",
      question: "In the Raft consensus algorithm, what condition must a Candidate satisfy to win an election?",
      options: [
        "Receive a response from the previous term's Leader",
        "Obtain votes from a majority (N/2 + 1) of nodes in the cluster",
        "Have the lowest network ping across peers",
        "Possess the shortest commit log in the group"
      ],
      correctIndex: 1,
      explanation: "A candidate wins an election if it receives votes from a majority of servers in the full cluster for the current term."
    },
    {
      id: 2,
      subject: "Neuroscience",
      topic: "Synaptic Plasticity",
      question: "Which ion influx through NMDA receptor channels triggers the enzymatic cascade required for LTP?",
      options: [
        "Chloride (Cl-)",
        "Potassium (K+)",
        "Calcium (Ca2+)",
        "Sodium (Na+) only"
      ],
      correctIndex: 2,
      explanation: "Intracellular Ca2+ influx acts as a secondary messenger that activates CaMKII and PKC, leading to AMPA receptor insertion and synaptic strengthening."
    },
    {
      id: 3,
      subject: "Chemistry",
      topic: "Enolate Chemistry",
      question: "Under what conditions is the kinetic enolate favored over the thermodynamic enolate?",
      options: [
        "High temperature, excess weak base, protic solvent",
        "Low temperature (-78°C), strong sterically hindered base (LDA), aprotic solvent",
        "Room temperature with sodium hydroxide in water",
        "Acid-catalyzed condensation at reflux"
      ],
      correctIndex: 1,
      explanation: "Kinetic enolates form via rapid deprotonation at the less hindered alpha position using a bulky base like LDA at -78°C."
    },
    {
      id: 4,
      subject: "Artificial Intelligence",
      topic: "Transformers",
      question: "Why do standard Transformer architectures divide Query-Key dot products by sqrt(d_k)?",
      options: [
        "To normalize token lengths across batches",
        "To convert logits directly into probability percentages",
        "To prevent softmax from saturating with vanishing gradients",
        "To enforce sparse attention matrix weights"
      ],
      correctIndex: 2,
      explanation: "Without scaling, dot products grow large for high dimensions, causing softmax to saturate and yield vanishing gradients during backpropagation."
    },
    {
      id: 5,
      subject: "Distributed Systems",
      topic: "Fault Tolerance",
      question: "What is the minimum number of nodes required in a Paxos or Raft cluster to tolerate 2 node failures?",
      options: [
        "3 nodes",
        "4 nodes",
        "5 nodes",
        "7 nodes"
      ],
      correctIndex: 2,
      explanation: "To tolerate f failures, a quorum system requires 2f + 1 nodes. For f = 2, 2(2) + 1 = 5 nodes are required to ensure any two majorities overlap."
    }
  ]
};

export const upcomingReviews = [
  {
    id: "rev-1",
    title: "Raft Consensus Speed Quiz",
    subject: "Computer Science",
    questions: 5,
    dueIn: "Due Today",
    difficulty: "Medium",
    type: "Timed Quiz",
  },
  {
    id: "rev-2",
    title: "Neurotransmitter Receptors Drill",
    subject: "Neuroscience",
    questions: 5,
    dueIn: "Tomorrow",
    difficulty: "Hard",
    type: "Flashcards",
  },
  {
    id: "rev-3",
    title: "Aldol & Claisen Mechanisms",
    subject: "Chemistry",
    questions: 5,
    dueIn: "In 2 days",
    difficulty: "Challenging",
    type: "Interactive",
  },
];

export const weeklyActivity = [
  { day: "Mon", count: 45, status: "completed" },
  { day: "Tue", count: 52, status: "completed" },
  { day: "Wed", count: 39, status: "completed" },
  { day: "Thu", count: 68, status: "completed" },
  { day: "Fri", count: 48, status: "completed" },
  { day: "Sat", count: 55, status: "completed" },
  { day: "Sun", count: 38, status: "in-progress" },
];
