// Shared state from the story to the background shader. A window-backed singleton so the
// Blueprint chunk and the motion runtime chunk always see the same object.
//  sweep    — viewport y (CSS px) of the nav curtain's moving edge, or -1 when none
//  energy   — 0..1, raises the density and brightness of signal pulses (scroll speed, curtain)
//  reveal   — 0..1, the opening: the grid unfolds from (ox, oy) out to the whole screen
//  ox, oy   — viewport CSS px of the opening's origin point
//  chapter  — i + t: the field blends from chapter state i to i + 1 (see motion/field/shader.ts)
//  scene    — 0..1 progress of the pinned scene in view, or -1
//  scanX    — viewport CSS px of Technology's scan hairline, or -1

type Bus = {
  sweep: number
  energy: number
  reveal: number
  ox: number
  oy: number
  chapter: number
  scene: number
  scanX: number
}
declare global {
  interface Window {
    __ssField?: Bus
  }
}

const initial = (): Bus => ({ sweep: -1, energy: 0, reveal: 1, ox: -1, oy: -1, chapter: 0, scene: -1, scanX: -1 })

export const fieldBus: Bus = typeof window === 'undefined' ? initial() : (window.__ssField ??= initial())
