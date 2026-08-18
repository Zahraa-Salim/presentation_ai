# REHEARSAL — Task 29

**The deck is 106 beats over 45 minutes: a press every 25 seconds on average.**

That average hides everything that matters. The analysis below says where to
look; §2 onward is the worksheet for the run itself.

> ⚠️ **Superseded.** An earlier version of this file described a 146-beat deck.
> Auto-pacing landed since — lists now cascade in on their own rather than
> costing a press each — so any timing written down before that is void.

---

## 1. What the numbers already say

### Four scenes are now a single screen held for most of a minute

Auto-pacing removed 40 presses. That was the right call for lists of single
words, but it left four scenes with **one beat and nothing to press**:

| Scene | Held | What is on screen |
|---|---|---|
| **3 · `ai-is-everywhere`** | 50s | Seven single words, all arriving at once |
| **11 · `tools-overview`** | 50s | Title, subtitle, one body line — the deck gives no more |
| **16 · `weak-prompt`** | 55s | A weak prompt plus the three things wrong with it |
| **22 · `is-chatgpt-a-friend`** | 70s | Two lines, the second a rhetorical pivot |

**Scenes 16 and 22 are the ones to watch hardest**, and they are a different
problem from 3 and 11:

- **16** — the speaker note says *«اعرض: اشرحلي Biology. واسأل: شو ناقص؟»*.
  If `ما في Context.` / `ما في Goal واضح.` / `ما في مستوى محدد.` are already on
  screen when you ask, the class has been handed the answer before the question.
- **22** — `بس… هل هيدا يعني إنه صاحبك؟` is marked `emphasis: 'strong'` because
  it is a pivot: the first line makes the case *for* AI as a friend, and the
  second turns it. Cascaded together, the turn never happens.

Both are one line each to fix (`pacing: 'stepped'`), but **judge them live
before changing anything** — that is what this run is for.

### Scene 27 was rebuilt

`AI + Cybersecurity` stacked a title, five threats, a question, two long Arabic
messages and three tells in one column — about 1000px of content into a 780px
screen, so the messages ran off the bottom. It now has its own renderer
(`src/scenes/privacy/CyberScene.tsx`): the five threats are a wrapped row of
chips beside the question rather than five full-width lines above it, and the
whole scene is two columns on a wide screen. **Same words, same order, same
beats.** Check it fits and still reads.

### Where the time actually sits

| World | Scenes | Time | Beats | s/beat |
|---|---|---|---|---|
| AI World | 5 | 5.0m | 13 | 23.1 |
| AI Lab | 5 | 8.0m | 18 | 26.7 |
| Study Lab | 11 | 13.0m | 39 | 20.0 |
| **Privacy** | 7 | 11.0m | **16** | **41.3** |
| Future City | 5 | 8.0m | 20 | 24.0 |

**Privacy is now by far the sparsest world** — eleven minutes across sixteen
presses. Most of that is legitimate: scene 26's twelve-item sorter (150s) and
scene 27's Real-or-Fake (150s) spend their time on clicking and discussion, not
on pressing. But it means **World 4 is carried almost entirely by you talking**,
and if the class is quiet there it will feel very long.

The fastest scenes are the deliberately stepped ones — 4 (8.3 s/beat), 17 (9.2)
and 33 (11.7). Those are the four scenes exempted from auto-pacing on purpose.

---

## 2. Before you start

- **`npm run present`**, then open **`http://127.0.0.1:4173/?perf=1`**. Use the
  production build, not `npm run dev` — the debug harness is DEV-only, so dev is
  not what runs on the day.
- **Turn the WiFi off before you start.** The deck needs no network, and this is
  the run that proves it.
- **`F`** for fullscreen. Do not touch the mouse afterwards.
- **`P`** to open the presenter panel. The clock starts on your first `→`, not
  before, so you can settle first.
- Have this file open on paper or a second device — **not** in another browser
  tab, since leaving the page is the one thing that will disturb the run.
- Present it out loud. Reading silently takes about a third of the time and will
  tell you nothing.

**You no longer have to watch the frame-rate meter.** The run records itself per
world; §5 says how to read it back afterwards.

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

## 5. The frame rate records itself

With `?perf=1` the corner readout is now a button. **Click it at the end of the
run** and it opens a per-world table:

```
world       avg   min   worst   calls
ai-world    59.8   58   19.4ms    41
ai-lab      58.1   52   26.1ms    63
study-lab   57.4   49   31.0ms    58
privacy     59.9   57   21.2ms    44
future      58.6   52   27.8ms    71
```

**`min` is the number that matters**, not `avg` — a world that averages 58 and
drops to 24 at one transition has a stutter the average hides. Anything under 30
is flagged with a `!`. **Copy** puts the whole table on the clipboard with the
tier, dpr and resolution; paste it into your notes.

Frames longer than a second are discarded rather than recorded: that is the tab
being in the background or the laptop idling, not a stall. The first run
reported a "198-second worst frame" and 0 fps for exactly that reason.

Run it at **1366×768** as well as full size — that is the hardware floor, and
the only resolution the numbers actually have to hold at.

---

## 6. Then walk it again with reduced motion on

Every `prefers-reduced-motion` path in the deck is test-guarded and **nobody has
ever watched it**. This costs ten minutes and needs no code.

1. In Chrome DevTools → `⋮` → More tools → **Rendering**
2. Set **Emulate CSS media feature `prefers-reduced-motion`** to `reduce`
3. Reload, so the boot-time quality probe sees it
4. **Confirm the app noticed:** the corner readout must now end in `· reduced`
   and report tier `low`. **If it still says `medium` and has no `· reduced`,
   the emulation did not take — go back to step 2.** Nothing below is worth
   doing until that line changes
5. Walk scenes **1, 4, 8, 11, 22, 27, 30, 33** — one per world plus the four
   heaviest — asking three things of each:
   - Does the scene still *communicate*, or was the meaning carried by motion?
   - Is anything stuck invisible because a transition was cut?
   - Does the 3D still read as a world, or as scattered static shapes?

Write down failures; do not fix them mid-run.

---

## 7. The recap between scenes 32 and 33

After the careers scene, pressing `→` brings up the **coda** — the deck's five
core rules, one press each, with Future City still behind them. Press on and
scene 33 closes the lesson on `خلي AI يساعدك، مش يفكّر بدالك.`

Order: **careers → the five rules → the closing message.** The recap comes
before the last word, not after it.

- `End` goes to the closing message, never to the recap in front of it
- `←` walks back out; from scene 33 it returns to the recap fully revealed
- The presenter panel names it as the next press and tracks your position in it

⚠️ **It has no time budget.** The 33 scenes total exactly 2700s, so the ~45–60
seconds you spend on the rules is unbudgeted: expect the pacing badge to read
about a minute `متأخّر` at the finale. That is inside the 90-second tolerance in
§3, but note the real number — if the rules take longer than a minute in
practice, we take that minute from a scene.

Judge it the same way as everything else: does it land, or does it interrupt the
run into the ending? It is trivial to remove.

---

## 8. After the run

Tell me the five checkpoint times, the perf table, and the answers to §4, and I
will turn them into the next task list. Timing fixes are `durationSec` edits in
`src/data/scenes.ts`; pacing fixes are one-line `pacing: 'stepped'` additions.
Both are cheap.

**Known open questions this run should settle:**

- **Scenes 16 and 22** — see §1. The strongest candidates for `pacing: 'stepped'`.
- **Scenes 3 and 11** — one screen for 50 seconds. Does 3 read as a wall of
  seven words? Does 11 simply drag?
- **World 4** — eleven minutes on sixteen presses. Does it feel unhurried or
  abandoned?
- **G2** — scene 18's `Context → Goal → Constraints → Output` arrows point
  rightward in a right-to-left deck, and the presenter panel shows `التالي ←`.
  Keep, mirror, or drop?
- Do the three long comparison headings (`ما يساعدك فيه AI`, `ما قد يستبدله AI`,
  `ما يمكن أن يكونه AI`) read at projection distance?
- **Scene 8** — the brain dissolves into machinery as `AI مش سحر.` lands. The
  single highest-stakes visual in the deck. Does the timing land?
- **Scene 27** — sit on it before revealing. Are the forged nodes genuinely
  indistinguishable first?
