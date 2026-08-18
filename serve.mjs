// @ts-check
import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Serves the built presentation with **no dependencies at all** — only Node's
 * own modules.
 *
 * `npm run preview` is fine at a desk, but it needs `node_modules` intact and
 * Vite installed. On the day, the presentation may be running from a copied
 * folder or a USB stick on a machine with no network to reinstall from, and
 * "npm ERR! network" ten minutes before a class is not a situation worth
 * risking. This script needs `dist/` and Node, nothing else.
 *
 *   node serve.mjs            → http://127.0.0.1:4173
 *   node serve.mjs 8080       → a different port
 *
 * The app itself makes zero network calls — fonts are bundled, there are no
 * APIs and no analytics — so once this is listening, the machine can be fully
 * offline. `src/__tests__/offline.test.ts` enforces that against the source.
 */

const here = fileURLToPath(new URL('.', import.meta.url))
const root = resolve(here, 'dist')

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
}

if (!existsSync(join(root, 'index.html'))) {
  console.error(
    `\n  No build found at ${root}\n\n  Run this first:  npm run build\n`,
  )
  process.exit(1)
}

/** Keeps a crafted URL from reading outside dist/. */
function resolveWithin(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0])
  const candidate = resolve(root, '.' + normalize(decoded))
  return candidate === root || candidate.startsWith(root + '\\') ||
    candidate.startsWith(root + '/')
    ? candidate
    : null
}

function send(res, status, file) {
  res.writeHead(status, {
    'Content-Type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream',
    'Content-Length': statSync(file).size,
    // A presentation must never show a stale build because a browser cached it.
    'Cache-Control': 'no-store',
  })
  createReadStream(file).pipe(res)
}

const server = createServer((req, res) => {
  const target = resolveWithin(req.url ?? '/')
  if (!target) {
    res.writeHead(403).end('Forbidden')
    return
  }

  const index = join(root, 'index.html')

  if (existsSync(target) && statSync(target).isFile()) {
    send(res, 200, target)
    return
  }

  // Deep links are hash-based (`#/scene/12`) and never reach the server, but a
  // stray path must still land on the deck rather than on an error page.
  send(res, 200, index)
})

const port = Number(process.argv[2] ?? process.env.PORT ?? 4173)

server.on('error', (error) => {
  if (error && /** @type {NodeJS.ErrnoException} */ (error).code === 'EADDRINUSE') {
    console.error(
      `\n  Port ${port} is already in use.\n\n  Close the other server, or run:  node serve.mjs ${port + 1}\n`,
    )
    process.exit(1)
  }
  throw error
})

server.listen(port, '127.0.0.1', () => {
  console.log(`
  العرض جاهز — the presentation is being served.

    http://127.0.0.1:${port}
    http://127.0.0.1:${port}/?perf=1      with the frame-rate readout

  No network needed. Press Ctrl+C to stop.
`)
})
