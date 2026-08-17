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
