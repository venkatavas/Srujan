// Motion tokens. write ≈ cubic-bezier(.16,1,.3,1) · space ≈ cubic-bezier(.65,0,.35,1)
// lift ≈ cubic-bezier(.76,0,.24,1): the curtain and preloader lift (a CustomEase, created by the runtime).
export const ease = {
  write: 'expo.out',
  space: 'power2.inOut',
  lift: 'lift',
} as const

export const LIFT = '.76,0,.24,1'

// Above this scroll velocity (px/s) a section completes instantly: skimmers get the finished diagram.
export const VELOCITY_SKIP = 3000
