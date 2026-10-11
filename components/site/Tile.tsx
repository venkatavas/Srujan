/** A numbered tile of the board. `data-tile` lets the motion controllers (draw, enter, drift) find it. */
export function Tile({
  id,
  n,
  title,
  caption,
  className,
  children,
}: {
  id: string
  n: string
  title: string
  caption?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className={`tile tile--${id} ${className ?? ''}`} data-tile aria-labelledby={`${id}-t`}>
      <header className="tile__head">
        <h2 id={`${id}-t`} className="tile__title">
          <span className="tile__n">{n}</span>
          {title}
        </h2>
        {caption && <p className="tile__caption">{caption}</p>}
      </header>
      {children}
    </section>
  )
}

/** Serif headline with the accent rule on its left, as in the mockup. */
export function Lead({ children, body }: { children: React.ReactNode; body?: React.ReactNode }) {
  return (
    <div className="lead">
      <p className="lead__h">{children}</p>
      {body && <p className="lead__body">{body}</p>}
    </div>
  )
}
