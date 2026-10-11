import { describe, expect, it } from 'vitest'
import { CAP_MS, freezeParam } from '../../motion/opening.ts'

// The opening's debug freeze (?opening=t | ?opening=short:t) drives deterministic captures.
describe('opening freeze parameter', () => {
  it('reads a time, with an optional mode', () => {
    expect(freezeParam('?opening=1.5')).toEqual({ mode: undefined, t: 1.5 })
    expect(freezeParam('?opening=0')).toEqual({ mode: undefined, t: 0 })
    expect(freezeParam('?gl=force&opening=short:0.4')).toEqual({ mode: 'short', t: 0.4 })
    expect(freezeParam('?opening=full:3')).toEqual({ mode: 'full', t: 3 })
  })

  it('ignores absent or malformed values', () => {
    expect(freezeParam('')).toBeNull()
    expect(freezeParam('?seek=top')).toBeNull()
    expect(freezeParam('?opening=')).toBeNull()
    expect(freezeParam('?opening=soon')).toBeNull()
    expect(freezeParam('?opening=-1')).toBeNull()
    expect(freezeParam('?opening=short:')).toBeNull()
  })

  it('caps the wait well inside the 9s CSS failsafe', () => {
    // The full sequence hands over 2.6s after it starts: a start at the cap still beats 9s.
    expect(CAP_MS + 2600).toBeLessThan(9000)
  })
})
