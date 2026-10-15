import { describe, expect, it } from 'vitest'
import { brief } from '../../content/brief.ts'
import { valueOf } from '../../content/schema.ts'
import { audit } from '../../lib/content/audit.ts'
import { contentMap } from '../../lib/content/map.ts'

const rows = contentMap()

describe('content map (/explore, Stage 1)', () => {
  it('covers every draft and pending fact the launch gate sees', () => {
    for (const a of audit()) {
      const path = a.path
      expect(rows.some((r) => r.path === path || r.path.startsWith(`${path}.`) || r.path.startsWith(`${path}[`)), a.path).toBe(true)
    }
  })

  it('places every string in both candidate structures', () => {
    const lost = rows.filter((r) => r.s8 === '?' || r.s5 === '?').map((r) => r.path)
    expect(lost).toEqual([])
  })

  it('only marks plain strings verified when they are verbatim fragments of a verified fact', () => {
    const text = valueOf(brief.text) ?? ''
    for (const r of rows.filter((r) => r.note === 'Verbatim fragment of a verified fact')) {
      if (r.path.startsWith('brief') || r.path.startsWith('spec')) expect(text).toContain(r.text)
    }
  })

  it('surfaces copy that is not yet wrapped as a fact', () => {
    const unwrapped = rows.filter((r) => r.status === 'unwrapped').map((r) => r.path)
    expect(unwrapped).toContain('site.business.requirement')
    expect(unwrapped).toContain('site.leadership.decision')
  })

  it('lists the email and LinkedIn as verified and the booking link as pending, with no text', () => {
    expect(rows.find((x) => x.path === 'profile.email')?.status).toBe('verified')
    expect(rows.find((x) => x.path === 'profile.linkedin')?.status).toBe('verified')
    for (const p of ['profile.booking']) {
      const r = rows.find((x) => x.path === p)
      expect(r?.status).toBe('pending')
      expect(r?.text).toBe('')
    }
  })
})
