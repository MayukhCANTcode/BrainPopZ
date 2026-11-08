# 🧠 BrainPopZ — AI-Powered Study Assistant

BrainPopZ transforms study notes, course syllabi, and textbook concepts into interactive flashcards and adaptive quizzes using AI.

---

## 🎨 Design System

- **Aesthetic**: Playful, modern, premium SaaS with dark theme throughout.
- **Palette**:
  - **Midnight Background**: `#11121A`
  - **Surface & Cards**: `#1B1C29`
  - **Card Hover**: `#232536`
  - **Borders**: `#282A3E`
  - **Electric Violet (Primary)**: `#A78BFA`
  - **Lime Green (Success Accent)**: `#C4F56A`
  - **Orange (Streak & Highlights)**: `#FFB86B`
- **Typography**:
  - Headings: Plus Jakarta Sans
  - Body & UI: Inter

---

## 🛠️ Tech Stack

- **React 19** + **Vite**
- **JavaScript (ES Modules)**
- **Tailwind CSS v3** (Custom configured palette and fonts)
- **Lucide React** (Consistent modern icon set)

---

## 📁 Project Architecture

```
BrainPopZ/
├── index.html                   # Plus Jakarta Sans & Inter font links, app title
├── tailwind.config.js           # BrainPopZ custom theme colors & typography
├── postcss.config.js            # PostCSS configuration
├── package.json                 # Dependencies & scripts
└── src/
    ├── index.css                # Tailwind directives & custom scrollbars
    ├── App.jsx                  # Main application state and view router
    ├── main.jsx                 # React root mount
    ├── data/
    │   └── mockData.js          # Realistic study datasets (decks, stats, streak, quizzes)
    ├── components/
    │   ├── common/
    │   │   ├── Badge.jsx        # Pill badges with theme color variants (violet, lime, orange)
    │   │   ├── Button.jsx       # Reusable button variants with smooth hover and icon support
    │   │   └── Card.jsx         # Card surfaces (#1B1C29) with subtle borders and hover lifts
    │   ├── layout/
    │   │   ├── Header.jsx       # Global header with search, notifications, streak chip, quick action
    │   │   ├── Sidebar.jsx      # Navigation sidebar with active state, streak counter, AI credits
    │   │   └── MainLayout.jsx   # Responsive layout shell with mobile drawer support
    │   ├── dashboard/
    │   │   ├── WelcomeBanner.jsx     # Engaging hero banner with daily quick actions
    │   │   ├── StatsOverview.jsx     # 4 key performance metrics cards
    │   │   ├── QuickGenerateCard.jsx # Instant AI flashcard creation card
    │   │   ├── RecentDecks.jsx       # Flashcard deck grid with mastery progress bars
    │   │   ├── UpcomingReviews.jsx   # Spaced repetition queue & weekly activity strip
    │   │   └── StudyModal.jsx        # Interactive flashcard study session modal with flip animation
    │   └── views/
    │       ├── DashboardView.jsx     # Primary dashboard screen
    │       ├── AIGeneratorView.jsx   # Dedicated AI generation workspace with format and difficulty controls
    │       ├── DecksView.jsx         # Flashcard deck manager with search and subject filtering
    │       ├── QuizzesView.jsx       # Interactive drill and practice quiz runner
    │       ├── AnalyticsView.jsx     # Retention metrics, time tracking, and discipline mastery
    │       └── SettingsView.jsx      # Personalization, daily goals, and spaced repetition settings
```

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Start the development server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Production Build & Linting
```bash
npm run build
npm run lint
```
