import { ImageResponse } from 'next/og'
import { name, positioning, summary } from '@/content/live.ts'
import { page } from '@/content/page.ts'
import { valueOf } from '@/content/schema.ts'

// The preview shown when the site's link is shared (LinkedIn, WhatsApp, X): the hero, set in type.
// It is generated from the same content as the page, so it can never disagree with it.
export const alt = summary
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** One font file, or an error for any non-2xx response. */
async function ttf(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Font request failed: ${res.status}`)
  return res.arrayBuffer()
}
const isTtf = (b: ArrayBuffer) => {
  const h = new Uint8Array(b.slice(0, 4))
  return h.length === 4 && ((h[0] === 0 && h[1] === 1 && h[2] === 0 && h[3] === 0) || String.fromCharCode(...h) === 'true')
}

/** Outfit (the site's typeface) as TTF from Google Fonts; without it the image falls back to the
 *  default sans, so a network failure never breaks the build. */
async function outfit(): Promise<{ name: string; data: ArrayBuffer; weight: 400 | 700 }[]> {
  try {
    const res = await fetch('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700')
    if (!res.ok) return []
    const urls = [...(await res.text()).matchAll(/src: url\((https:[^)]+\.ttf)\)/g)].map((m) => m[1])
    if (urls.length < 2) return []
    const [regular, bold] = await Promise.all(urls.slice(0, 2).map(ttf))
    // Only real TrueType data (it starts 00 01 00 00, or "true"): an error page that slipped through
    // would otherwise fail later, inside the image renderer, where this catch cannot reach it.
    if (!isTtf(regular) || !isTtf(bold)) return []
    return [
      { name: 'Outfit', data: regular, weight: 400 },
      { name: 'Outfit', data: bold, weight: 700 },
    ]
  } catch {
    return []
  }
}

/** A soft light: the colour fading to a clear version of itself (never through grey). */
const glow = (at: string, rgb: string, a: number, reach: number) =>
  `radial-gradient(circle at ${at}, rgba(${rgb},${a}), rgba(${rgb},0) ${reach}%)`

export default async function Image() {
  const words = (positioning?.title ?? '').split(' ')
  const focus = (valueOf(page.hero.focus) ?? []).join('   ·   ')
  const ink = '#1b1a2e'
  const indigo = '#4d4ad0'
  const fonts = await outfit()
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: fonts.length ? 'Outfit' : 'sans-serif',
        background: '#faf9f7',
        backgroundImage: [
          glow('0% 40%', '196,192,250', 0.75, 40),
          glow('12% 95%', '255,214,196', 0.6, 34),
          glow('100% 40%', '205,224,250', 0.85, 38),
          glow('88% 100%', '252,220,232', 0.85, 36),
        ].join(', '),
      }}
    >
      <div style={{ display: 'flex', fontSize: 22, fontWeight: 400, letterSpacing: 7, color: '#625f7e', textTransform: 'uppercase' }}>
        {focus}
      </div>
      <div style={{ display: 'flex', marginTop: 40, fontSize: 96, fontWeight: 700, letterSpacing: -3, color: ink }}>{name}</div>
      <div style={{ display: 'flex', fontSize: 80, fontWeight: 400, letterSpacing: -2, color: ink }}>
        {words.slice(0, -1).join(' ')}
        <span style={{ marginLeft: 22, color: indigo }}>{words.at(-1)}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: 44 }}>
        <div style={{ width: 170, height: 2, backgroundImage: 'linear-gradient(90deg, rgba(77,74,208,0), rgba(77,74,208,0.5))' }} />
        <div style={{ width: 24, height: 24, margin: '0 16px', borderRadius: 12, background: indigo }} />
        <div style={{ width: 170, height: 2, backgroundImage: 'linear-gradient(90deg, rgba(77,74,208,0.5), rgba(77,74,208,0))' }} />
      </div>
      <div style={{ display: 'flex', marginTop: 40, fontSize: 36, fontWeight: 400, color: '#625f7e' }}>{positioning?.line}</div>
    </div>,
    { ...size, fonts },
  )
}
