import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * The presentation must run with zero network access.
 *
 * A classroom projector laptop may have no connection at all, and a font that
 * silently falls back to a system face — or a request that hangs for thirty
 * seconds — is not something you discover gracefully in front of thirty
 * students. Verified against the source rather than `dist/`, so it holds
 * whether or not a build has been run.
 */

const srcDir = fileURLToPath(new URL('..', import.meta.url))

const walk = (from: string): string[] =>
  readdirSync(from, { withFileTypes: true }).flatMap((entry) => {
    const path = `${from}/${entry.name}`
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : walk(path)
    return /\.(ts|tsx|css)$/.test(entry.name) ? [path] : []
  })

const sources = walk(srcDir).map((path) => ({
  path,
  name: path.split(/[\\/]/).pop()!,
  text: readFileSync(path, 'utf8'),
}))

describe('nothing reaches the network at runtime', () => {
  it('finds the source to check', () => {
    expect(sources.length).toBeGreaterThan(40)
  })

  it.each([
    ['fetch', /\bfetch\s*\(/],
    ['XMLHttpRequest', /\bXMLHttpRequest\b/],
    ['WebSocket', /\bnew WebSocket\b/],
    ['EventSource', /\bnew EventSource\b/],
    ['sendBeacon', /\bsendBeacon\b/],
    ['importScripts', /\bimportScripts\s*\(/],
  ])('makes no %s call', (_label, pattern) => {
    const offenders = sources
      .filter((file) => pattern.test(file.text))
      .map((file) => file.name)
    expect(offenders).toEqual([])
  })
})

describe('every asset is bundled', () => {
  const fontsDir = fileURLToPath(new URL('../assets/fonts', import.meta.url))

  it('ships the Arabic and Latin faces in the repo', () => {
    const fonts = readdirSync(fontsDir).filter((f) => f.endsWith('.woff2'))
    expect(fonts.length).toBeGreaterThanOrEqual(5)
    expect(fonts.some((f) => f.includes('arabic'))).toBe(true)
    expect(fonts.some((f) => f.includes('inter'))).toBe(true)

    // A zero-byte file would build fine and render nothing.
    for (const font of fonts) {
      expect(statSync(`${fontsDir}/${font}`).size, font).toBeGreaterThan(10_000)
    }
  })

  /* The upstream @fontsource packages are devDependencies; the woff2 files are
     copied into the repo so the build never depends on module resolution. The
     package name may appear in a comment recording where they came from — what
     must not appear is a `url()` that resolves through node_modules or a CDN. */
  it('loads fonts from the repo, never from a package or a CDN', () => {
    for (const file of sources.filter((f) => f.name.endsWith('.css'))) {
      const urls = file.text.match(/url\(\s*['"]?[^)'"]+/g) ?? []
      for (const url of urls) {
        expect(url, file.name).not.toMatch(/https?:/i)
        expect(url, file.name).not.toMatch(/@fontsource|node_modules/)
      }
    }
  })

  it('imports no stylesheet from outside the project', () => {
    for (const file of sources.filter((f) => f.name.endsWith('.css'))) {
      const imports = file.text.match(/@import[^;]+;/g) ?? []
      for (const line of imports) {
        expect(line, file.name).not.toMatch(/https?:|\/\//)
      }
    }
  })
})

/**
 * `serve.mjs` exists so the deck can be presented from `dist/` plus Node and
 * nothing else — no `node_modules`, no `npm install`, no network. The moment it
 * imports a package that promise is gone, and the failure surfaces on a school
 * laptop ten minutes before a class rather than here.
 */
describe('the standalone server stays standalone', () => {
  const server = readFileSync(
    fileURLToPath(new URL('../../serve.mjs', import.meta.url)),
    'utf8',
  )

  const imports = [...server.matchAll(/from\s+'([^']+)'/g)].map((m) => m[1])

  it('imports something, so this is not passing vacuously', () => {
    expect(imports.length).toBeGreaterThan(0)
  })

  it.each(
    [...new Set(imports)].map((specifier) => [specifier] as const),
  )('imports %s, which is a Node builtin', (specifier) => {
    expect(specifier.startsWith('node:')).toBe(true)
  })

  it('binds to loopback rather than every interface', () => {
    // A classroom network is not somewhere to expose a server by accident.
    expect(server).toContain("'127.0.0.1'")
  })

  it('refuses to serve a build that is not there', () => {
    // Silently serving nothing would look like a broken app, not a missing build.
    expect(server).toContain('npm run build')
  })
})

/**
 * The kit script assembles what goes on the USB stick. It runs on this machine
 * rather than the target one, so a dependency here would not fail on the day —
 * but it would mean the kit could only ever be built from a full checkout with
 * node_modules intact, which is the fragility the kit exists to escape.
 */
describe('the kit is assembled without dependencies too', () => {
  const script = readFileSync(
    fileURLToPath(new URL('../../scripts/make-kit.mjs', import.meta.url)),
    'utf8',
  )

  const imports = [...script.matchAll(/from\s+'([^']+)'/g)].map((m) => m[1])

  it('imports something, so this is not passing vacuously', () => {
    expect(imports.length).toBeGreaterThan(0)
  })

  it.each([...new Set(imports)].map((s) => [s]))(
    'imports %s, which is a Node builtin',
    (specifier) => {
      expect(specifier.startsWith('node:')).toBe(true)
    },
  )

  it('refuses to assemble a kit around a build that is not there', () => {
    // Shipping an empty dist/ to a classroom would look like a broken app.
    expect(script).toContain('npm run build')
  })

  it('ships the server beside the build, not just the build', () => {
    expect(script).toContain('serve.mjs')
  })

  it('tells the reader not to double-click index.html', () => {
    // The single most likely way for this to fail in someone else's hands.
    expect(script).toContain('Do NOT double-click index.html')
  })
})

describe('no third-party endpoint is referenced', () => {
  /* Namespace URIs and repository metadata are inert strings. What must not
     appear is somewhere this app would actually talk to. */
  const ALLOWED = /^https?:\/\/(www\.)?(w3\.org|localhost)/

  it('names no external host in application code', () => {
    const hits = sources.flatMap((file) =>
      (file.text.match(/https?:\/\/[^\s'"`)]+/g) ?? [])
        .filter((url) => !ALLOWED.test(url))
        // Links inside comments are documentation, not traffic.
        .filter((url) => {
          const line =
            file.text.split('\n').find((l) => l.includes(url))?.trimStart() ?? ''
          return !line.startsWith('*') && !line.startsWith('//') && !line.startsWith('/*')
        })
        .map((url) => `${file.name}: ${url}`),
    )
    expect(hits).toEqual([])
  })
})
