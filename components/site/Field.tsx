import { Blueprint } from './Blueprint.tsx'

/**
 * The Spec Sheet — a fixed, barely-visible drafting field behind the page:
 * cool top-left light, square grid, registration crosses, grain, vignette.
 * The CSS layers are the static field; where the device allows, the Blueprint canvas draws
 * the same field live underneath and cross-fades them out. Grain and vignette stay on top.
 */
export function Field() {
  return (
    <div className="field" aria-hidden="true">
      <Blueprint />
      <div className="field__lamp" />
      <div className="field__grid" />
      <div className="field__crosses" />
      <div className="field__grain" />
      <div className="field__vignette" />
    </div>
  )
}
