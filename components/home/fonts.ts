import { Geist_Mono, Outfit } from 'next/font/google'

// The site's type: Outfit for everything (weights carry the hierarchy), Geist Mono for ids,
// dates and the nav's labels. Applied as CSS variables on the site root.
const sans = Outfit({ subsets: ['latin'], variable: '--f-y' })
// Labels only: not preloaded, so it never delays the hero's text.
const mono = Geist_Mono({ subsets: ['latin'], variable: '--f-code', preload: false })

export const fonts = `${sans.variable} ${mono.variable}`
