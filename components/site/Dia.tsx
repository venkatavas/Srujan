// Diagram primitive: HTML nodes and SVG wires share one fixed-aspect coordinate space
// (W × H units), so connectors always meet their nodes at any screen size.
// `step` orders the draw-in when the tile enters (see motion/chapters/draw.ts).

type Props = { w: number; h: number; className?: string; children: React.ReactNode; wires?: Wire[] }
export type Wire = { d: string; step: number; accent?: boolean; dashed?: boolean; dot?: boolean }

const pct = (v: number, of: number) => `${(v / of) * 100}%`

export function Dia({ w, h, className, children, wires = [] }: Props) {
  return (
    <div className={`dia ${className ?? ''}`} style={{ aspectRatio: `${w} / ${h}` }} data-dia>
      <svg className="dia__wires" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
        {wires.map((wi, i) => (
          <path
            key={i}
            d={wi.d}
            pathLength={1}
            data-step={wi.step}
            className={`wire ${wi.accent ? 'wire--accent' : ''} ${wi.dashed ? 'wire--dashed' : ''} ${wi.dot ? 'wire--dot' : ''}`}
          />
        ))}
      </svg>
      {children}
    </div>
  )
}

/** An absolutely-positioned node at (x, y) in diagram units. `anchor` picks which point sits on (x, y). */
export function At({
  x,
  y,
  w,
  h,
  step = 0,
  anchor = 'left',
  valign = 'middle',
  className,
  children,
  as: Tag = 'div',
}: {
  x: number
  y: number
  w: number
  h: number
  step?: number
  anchor?: 'left' | 'center' | 'right'
  valign?: 'top' | 'middle'
  className?: string
  children: React.ReactNode
  as?: 'div' | 'li' | 'p'
}) {
  const shift = anchor === 'center' ? '-50%' : anchor === 'right' ? '-100%' : '0'
  return (
    <Tag
      className={`at ${className ?? ''}`}
      data-step={step}
      style={{ left: pct(x, w), top: pct(y, h), transform: `translate(${shift}, ${valign === 'top' ? '0' : '-50%'})` }}
    >
      {children}
    </Tag>
  )
}

/** Horizontal S-curve from (x1, y1) to (x2, y2). */
export const curve = (x1: number, y1: number, x2: number, y2: number) => {
  const mx = (x1 + x2) / 2
  return `M${x1} ${y1}C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`
}

/** Vertical elbow from (x1, y1) down to (x2, y2) through a shared bus at y = busY. */
export const elbow = (x1: number, y1: number, x2: number, y2: number, busY: number) =>
  `M${x1} ${y1}L${x1} ${busY}L${x2} ${busY}L${x2} ${y2}`

export const dot = (x: number, y: number, r = 3) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`
