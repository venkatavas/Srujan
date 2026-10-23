import type { Metadata, Viewport } from 'next'
import { Newsreader } from 'next/font/google'
import { name as givenName, positioning, summary } from '@/content/live.ts'
import { SITE_URL } from '@/lib/site-url.ts'
import './styles/tailwind.css'
import './globals.css'
import './styles/nav.css'

// Newsreader for the section headings. The home page adds Outfit and Geist Mono
// (components/home/fonts.ts).
// Not preloaded: it is first needed below the hero, so the hero's own font (Outfit) arrives first.
const serif = Newsreader({ subsets: ['latin'], axes: ['opsz'], variable: '--f-serif', preload: false })

// The description and share text come from the verified name and positioning, like the hero.
const name = givenName || 'Sai Srujan Pasala'
// "Sai Srujan Pasala · Digital Health Strategist": the name and the approved positioning, so the
// browser tab, search results and share cards say who and what at once.
const title = positioning?.title ? `${name} · ${positioning.title}` : name
const description = summary

// The share preview image comes from app/opengraph-image.tsx. Its absolute URL and the canonical
// link (app/page.tsx) use the site's address (lib/site-url.ts: NEXT_PUBLIC_SITE_URL, or the Vercel domain).
export const metadata: Metadata = {
  ...(SITE_URL ? { metadataBase: new URL(SITE_URL) } : {}),
  title,
  description,
  openGraph: { type: 'website', title, description, siteName: name, locale: 'en_US' },
  twitter: { card: 'summary_large_image', title, description },
}

export const viewport: Viewport = { themeColor: '#FAF9F7' }

// Runs before first paint: decides the motion mode (reduced motion, or the saved preference), so
// the site's entrance and scroll reveals never flash. On the home page a load or refresh starts at
// the hero (the browser's restored scroll position is dropped), unless the address names a
// section (a shared link such as /#connect): then the opening is skipped (and counts as seen for
// the session, so it does not play later on a plain visit) and the page goes straight to that
// section (html[data-hashload] keeps that jump instant; Smooth.tsx settles it). With full motion the home page also opens with its preloader (data-pre, components/home/Preloader.tsx), on before anything is painted, once
// per browser session. A key, click, wheel or touch skips it at once, even before the page's
// JavaScript has loaded. The exit itself lives only here (window.__ssPreEnd): it marks the handoff
// to the hero (unless the CSS failsafe has already hidden the opening, at 3.5s), fades it over 450ms
// (preloader.css, pre-out) and remembers it for the session. Preloader.tsx only decides when.
const boot = `(function(){var d=document.documentElement,r=false;
try{r=matchMedia('(prefers-reduced-motion: reduce)').matches||localStorage.getItem('ss-motion')==='reduce'}catch(e){}
d.dataset.motion=r?'reduce':'full';
if(location.pathname==='/'){var s=false,h=!!location.hash;try{s=sessionStorage.getItem('ss-pre')==='1'}catch(e){}if(!r&&!s&&!h){d.dataset.pre='on';
var ev=['keydown','pointerdown','wheel','touchstart'],off=function(){ev.forEach(function(n){removeEventListener(n,end,true)})},
end=function(){off();if(d.dataset.pre!=='on')return;if(performance.now()<3400)d.dataset.handoff='1';d.dataset.pre='out';try{sessionStorage.setItem('ss-pre','1')}catch(e){}
setTimeout(function(){if(d.dataset.pre==='out')delete d.dataset.pre},450)};
window.__ssPreEnd=end;ev.forEach(function(n){addEventListener(n,end,{capture:true,passive:true})})}try{history.scrollRestoration='manual'}catch(e){}if(h){d.dataset.hashload='';try{sessionStorage.setItem('ss-pre','1')}catch(e){}}else scrollTo(0,0)}
})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={serif.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      {/* Browser extensions inject attributes on <body> before hydration (e.g. inmaintabuse). */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
