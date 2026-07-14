# Fermithon Leaderboard

A Vue 3 leaderboard for running a **Fermithon** (a Fermi-estimation contest). Teams
submit an interval `[low, high]` for each question; you cast a live scoreboard of
stars ⭐ (answer inside the interval) and skulls 💀 (outside), while the actual
answers and computed scores stay hidden on a private game-master screen.

## Quick start

```bash
npm install
npm run dev        # open the printed http://localhost:5173 URL
```

Build for a static deploy (or to run it offline later):

```bash
npm run build      # outputs to dist/
npm run preview    # serve the built app
```

## How it works

There are **two tabs**, kept in sync automatically (via `localStorage`), so you
can screen-share one and keep the other private:

| Tab | Open it via | What it shows | Cast it? |
| --- | --- | --- | --- |
| **Leaderboard** (to-stream) | the main page | Timer + the question × team sheet with star/skull icons. **Read-only.** | ✅ Share this tab |
| **Game Master tab** | the **Game Master tab** button (opens a new tab) | Timer controls, the interval-entry grid, the answer key, and live scores/ranking | 🚫 Keep private |

The game master does **everything** in the private tab — enter each team's
intervals, enter the answers, watch the ranking — and the public leaderboard
tab updates itself. In Chrome you can screen-share a single tab ("Chrome Tab"),
so the answers and scores never appear on stream.

### Setup (Setup panel in the Game Master tab)

- **# of questions**, **# of teams**, and **submissions per team (total)** — the last is an
  *aggregate* budget across all questions, so each team decides which questions to spend
  re-submissions on
- **Team names** (editable)

### Running a round (all from the Game Master tab)

1. **Enter answers first** — fill the **Answer key**. The timer and interval entry stay **locked**
   until every answer is in (the game master knows the true values up front).
2. **Timer** — once unlocked, set `mm:ss`, then Start / Pause / Reset. The clock mirrors onto the stream board.
3. **Enter submissions** — in the **Enter intervals** grid, click any cell (a question × team).
   The popup asks only for **low** and **high** — type them and press Enter (or Save). Click the
   cell again to add another attempt. Each team draws from one **aggregate budget** of submissions
   across all questions. The **last** attempt per cell is the one that counts toward the score;
   earlier ones still show as icons.
4. Each cell shows one icon **per submission**: ⭐ if the answer is inside that interval,
   💀 if outside (so repeated wrong guesses show multiple skulls).
5. **Fix mistakes** — open **Submission history** to edit any submission's team, question, low or
   high (or delete it). Attempt counts, budgets and scores re-compute automatically.
6. Every Game Master section rolls open/closed with its **circle-chevron** button to declutter.

## Scoring

```
score = ( 10 + Σ_good ⌊max / min⌋ ) · 2^( N − #good )      where N = number of questions
```

- A **good interval** = a question where the team's **final** submission contains the actual answer.
- **Lower score wins.** Each good interval halves the score (via the exponent) but adds
  `⌊max/min⌋`, so tight, correct intervals are best.
- The exponent base is the **total number of questions** — not a separate setting.

## Project structure

```
src/
  main.js                 app entry + Font Awesome icon registration
  App.vue                 hash router: main leaderboard vs. #/scores console
  scoring.js              the scoring formula (pure, unit-tested)
  store/useStore.js       shared reactive state, persistence, cross-window sync
  components/
    MainView.vue          to-stream leaderboard tab (read-only; share this)
    TimerBar.vue          countdown timer (controls hidden on the cast)
    SettingsBar.vue       questions / teams / submissions / team names
    LeaderSheet.vue       the question × team grid (editable prop toggles entry)
    CellEditor.vue        modal to add a team's low/high submissions
    CellIcons.vue         renders the star / skull icons per submission
    ScoresView.vue        private Game Master tab (intervals + answers + ranking)
```

## Notes

- All data lives in your browser's `localStorage` (key `fermithon-state-v1`) — nothing
  is sent anywhere, and it survives refreshes. **Reset all data** in Settings clears it.
- Fermi quantities are assumed positive; the `⌊max/min⌋` term is guarded against a
  non-positive lower bound.
