# REHEARSAL — Task 29

**The deck is 146 beats over 45 minutes: a press every 18.5 seconds on average.**

I can compute the pacing but not perform it. What follows is the analysis, then
the worksheet for the run itself.

---

## 1. What the numbers already say

### The one scene that looks rushed

| Scene | | |
|---|---|---|
| **3 · `ai-is-everywhere`** | 8 beats in 50s | **6.3s per beat** |

Seven items — الدراسة · الموبايل · الصور · الفيديو · البرمجة · البحث · الألعاب —
one press each. They are single words, so six seconds apiece may well be right:
you say the word, the class recognises it, you move on. **This is the first thing
to judge live.** If it feels like a slot machine, the fix is to reveal them as one
group rather than seven beats — a one-line change.

### The scenes that look sparse, and why most are fine

| Scene | s/beat | |
|---|---|---|
| 26 · `what-not-to-share` | 75.0 | ✅ 12-item sorter — the time goes into clicking, not pressing |
| 11 · `tools-overview` | 50.0 | ⚠️ **One beat, 50 seconds on one screen.** The genuine outlier |
| 2 · `opening-poll` | 45.0 | ✅ hands go up |
| 30 · `dependency` | 43.3 | ✅ the class answers |
| 32 · `future-jobs` | 43.3 | ✅ six careers discussed |
| 15 / 19 | 36.7 | ✅ interactive |

Only **scene 11** is a non-interactive screen held for most of a minute. The deck
gives it a title, a subtitle and one body line — nothing more to reveal. Watch
whether it drags.

### Pace by world

| World | Scenes | Time | Beats | s/beat |
|---|---|---|---|---|
| AI World | 5 | 5.0m | 24 | 12.5 |
| AI Lab | 5 | 8.0m | 24 | 20.0 |
| Study Lab | 11 | 13.0m | 42 | 18.6 |
| Privacy | 7 | 11.0m | 36 | 18.3 |
| Future City | 5 | 8.0m | 20 | 24.0 |

World 1 runs at roughly twice the beat rate of World 5. That is the right shape —
opening fast, closing slow — but it means **the first five minutes are where you
are most likely to get ahead of yourself.**

---

## 2. Before you start

- `npm run dev`, then **`F`** for fullscreen. Do not touch the mouse afterwards.
- **`P`** to open the presenter panel. The clock starts on your first `→`, not
  before, so you can settle first.
- Have this file open on paper or a second device — **not** in another browser
  tab, since leaving the page is the one thing that will disturb the run.
- Present it out loud. Reading silently takes about a third of the time and will
  tell you nothing.

---

## 3. Checkpoints

The presenter panel does the arithmetic — the badge reads `متقدّم` or `متأخّر`
with the drift. These are the five moments to write the number down anyway,
because the badge shows *now* and you want the *shape*.

| At the end of | Target | Actual | Drift |
|---|---|---|---|
| Scene 5 · `AI مش Trend.` | **5:00** | | |
| Scene 10 · `ليش AI بيغلط؟` | **13:00** | | |
| Scene 21 · `AI والتعلّم.` | **26:00** | | |
| Scene 28 · `قبل ما تضغط Send.` | **37:00** | | |
| Scene 33 · the final message | **45:00** | | |

A world that ends more than 90 seconds off is worth rebalancing. Under that,
leave it — presenters vary more than that between two runs of the same deck.

---

## 4. What to write down

Four questions. Everything else is noise.

1. **Where did I get bored?** A scene that drags is a content problem and cheap
   to fix now.
2. **Where did I want to say something but the screen had already moved on?**
   That is a missing beat.
3. **Where did I press twice because nothing seemed to happen?** That is either a
   beat doing too little or a reveal that is too quiet.
4. **Where was the Arabic hard to read?** Judge it from the back of the room, not
   from the keyboard.

---

## 5. Specific things to watch

These are the moments most likely to be wrong, and the ones where being wrong
matters most:

- **Scene 3** — the seven-item run. See §1.
- **Scene 8** — the brain dissolves into machinery as `AI مش سحر.` lands. This is
  the single highest-stakes visual in the deck. Does the timing land?
- **Scene 11** — 50 seconds on one screen.
- **Scene 18** — the Prompt Lab builds over four presses while the machine's beam
  focuses. Do the DOM and the 3D advance together?
- **Scene 26** — twelve items, clicked in whatever order the class calls them.
  Does that feel controllable, or fiddly?
- **Scene 27** — sit on it before revealing. Are the forged nodes genuinely
  indistinguishable first?
- **Scene 33** — the five world colours converge. Walk the four closing lines
  slowly. This is what the 45 minutes is for.

Also note the **frame rate readout** in the corner as you cross into each world.
The numbers recorded in `PROJECT-STATUS.md` §9 predate the deck, the interactions
and eight of the eleven environments — they are no longer meaningful.

---

## 6. After the run

Tell me the five checkpoint times and the answers to §4, and I will turn them
into the next task list. Timing fixes are `durationSec` edits in
`src/data/scenes.ts`; pacing fixes are beat-model changes. Both are cheap now and
expensive after audio.

**Known open questions this run should settle:**

- **G2** — scene 18's `Context → Goal → Constraints → Output` arrows point
  rightward in a right-to-left deck, and the presenter panel shows `التالي ←`.
  Keep, mirror, or drop?
- Do the three long comparison headings (`ما يساعدك فيه AI`, `ما قد يستبدله AI`,
  `ما يمكن أن يكونه AI`) read at projection distance?
- Does `صح`-style verdict wording ever appear where the sorter's
  `آمن للمشاركة` / `لا تشارك` should be?
