// Document tops of the page's sections: main's top plus the heights of the sections before
// it. One measurement shared by the nav's active state, the curtain and ?seek.

export const pageSections = () => [...document.querySelectorAll<HTMLElement>('main > section[id]')]

export function layoutTops(sections: HTMLElement[] = pageSections()) {
  const main = sections[0]?.parentElement
  let y = main ? main.getBoundingClientRect().top + window.scrollY : 0
  return sections.map((s) => {
    const top = y
    y += s.offsetHeight
    return top
  })
}

export function layoutTopOf(id: string) {
  const secs = pageSections()
  const i = secs.findIndex((s) => s.id === id)
  return i < 0 ? null : layoutTops(secs)[i]
}
