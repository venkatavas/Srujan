// Motion tokens. Easing approximates the plan's cubic-béziers with GSAP built-ins:
// write (.16,1,.3,1) ≈ expo.out · settle (.22,1,.36,1) ≈ power3.out
// space (.65,0,.35,1) ≈ power2.inOut · depart (.55,0,1,.45) ≈ power2.in
export const ease = {
  write: 'expo.out',
  settle: 'power3.out',
  space: 'power2.inOut',
  depart: 'power2.in',
} as const

export const dur = { xs: 0.12, s: 0.22, m: 0.4, l: 0.7, xl: 1.1, xxl: 1.6 } as const

// Above this scroll velocity (px/s) timed beats complete instantly: skimmers get poster frames.
export const VELOCITY_SKIP = 3000

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
export const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))
