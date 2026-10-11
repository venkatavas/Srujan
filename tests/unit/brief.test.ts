import { describe, expect, it } from 'vitest'
import { brief, spec } from '../../content/brief.ts'

const text = brief.text.status === 'verified' ? brief.text.value : ''

describe('the brief', () => {
  it('is verified, not a draft', () => expect(brief.text.status).toBe('verified'))

  it('every spec value is a verbatim fragment of the brief', () => {
    for (const s of spec) expect(text).toContain(s.value)
  })

  it('its three display lines reassemble the brief exactly', () => {
    expect(brief.lines.join(' ')).toBe(text)
  })

  it('its two hero lines reassemble the brief exactly', () => {
    expect(brief.heroLines).toHaveLength(2)
    expect(brief.heroLines.join(' ')).toBe(text)
  })
})
