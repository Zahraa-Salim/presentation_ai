// @ts-check
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Assembles the folder that gets copied onto a USB stick.
 *
 * The presentation has to run on a laptop that is not this one, with no network
 * and possibly no project checkout — so the kit is deliberately three things and
 * nothing else: the built deck, a dependency-free server, and a page telling you
 * what to type. Anything that needs `npm install` on the day is a thing that can
 * fail on the day.
 *
 * Uses only Node builtins, for the same reason `serve.mjs` does.
 *
 *   npm run kit
 */

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const dist = join(root, 'dist')
const kit = join(root, 'presentation-kit')

if (!existsSync(join(dist, 'index.html'))) {
  console.error(`\n  No build found at ${dist}\n\n  Run this first:  npm run build\n`)
  process.exit(1)
}

const README = `العرض التفاعلي — AI: كيف نستخدمه بذكاء؟
Interactive AI lesson — Grade 11

===========================================================
كيف تشغّله  ·  HOW TO RUN IT
===========================================================

1.  انسخ هذا المجلد كاملاً إلى اللابتوب.
    Copy this whole folder onto the laptop.

2.  افتح Terminal أو PowerShell داخل المجلد، واكتب:
    Open a terminal in this folder and type:

        node serve.mjs

3.  افتح المتصفّح على:
    Open the browser at:

        http://127.0.0.1:4173

4.  اضغط  F  لملء الشاشة، ثم  P  للوحة المقدّم.
    Press  F  for fullscreen, then  P  for the presenter panel.

===========================================================
مهم  ·  IMPORTANT
===========================================================

*   لا تفتح index.html بالضغط المزدوج — لن يعمل.
    Do NOT double-click index.html. It will not work: browsers
    block this kind of page unless it is served.

*   لا حاجة للإنترنت إطلاقاً. أطفئ الـ Wi-Fi إن أردت.
    No internet is needed at any point. Turn the Wi-Fi off.

*   يحتاج اللابتوب إلى Node مثبّتاً.  تأكّد بكتابة:
    The laptop needs Node installed. Check with:

        node --version

===========================================================
لوحة المفاتيح  ·  KEYBOARD
===========================================================

    →  Space          التالي            next
    ←                 السابق            back
    ↓  ↑              تخطّي مشهد        skip a scene
    Home  End         البداية / النهاية  first / last
    F                 ملء الشاشة        fullscreen
    P                 لوحة المقدّم       presenter panel
    Esc               إغلاق اللوحة      close the panel
    1 – 6             اختيار إجابة       pick a choice

===========================================================
إذا حصلت مشكلة  ·  IF SOMETHING GOES WRONG
===========================================================

"node is not recognized"
    Node غير مثبّت على هذا الجهاز. ثبّته ثم أعد المحاولة.
    Node is not installed on this machine.

"Port 4173 is already in use"
    استعمل رقماً آخر:  node serve.mjs 8080
    Use another port, then open http://127.0.0.1:8080

الشاشة سوداء أو الرسوم بطيئة
    A black screen or slow graphics:
        http://127.0.0.1:4173/?quality=low

لقياس عدد الإطارات أثناء التجربة
    To see the frame-rate meter while rehearsing:
        http://127.0.0.1:4173/?perf=1

للقفز إلى مشهد معيّن
    To jump straight to a scene:
        http://127.0.0.1:4173/#/scene/12

===========================================================

33 مشهداً · 45 دقيقة · يعمل بدون إنترنت
33 scenes · 45 minutes · runs completely offline
`

rmSync(kit, { recursive: true, force: true })
mkdirSync(kit, { recursive: true })

cpSync(dist, join(kit, 'dist'), { recursive: true })
cpSync(join(root, 'serve.mjs'), join(kit, 'serve.mjs'))
// Arabic filename first, because the person opening the stick reads Arabic.
writeFileSync(join(kit, 'اقرأني — READ ME.txt'), README, 'utf8')

/** Total bytes, so the kit's size is reported rather than guessed at. */
function measure(dir) {
  return readdirSync(dir, { withFileTypes: true }).reduce((sum, entry) => {
    const path = join(dir, entry.name)
    return sum + (entry.isDirectory() ? measure(path) : statSync(path).size)
  }, 0)
}

const bytes = measure(kit)

console.log(`
  Kit ready — copy this folder to the USB stick:

    ${kit}

    dist/                  the built presentation
    serve.mjs              the server, no dependencies
    اقرأني — READ ME.txt   what to type on the day

  ${(bytes / 1024 / 1024).toFixed(1)} MB total. Needs Node on the target machine, nothing else.
`)
