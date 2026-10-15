import type { Metadata, Viewport } from 'next'
import { Newsreader } from 'next/font/google'
import { name as givenName, summary } from '@/content/live.ts'
import { SITE_URL } from '@/lib/site-url.ts'
import './styles/tailwind.css'
import './globals.css'
import './styles/nav.css'

// Newsreader for the section headings. The home page adds Outfit and Geist Mono
// (components/home/fonts.ts); the preview-only /explore pages load their own (app/explore/layout.tsx).
// Not preloaded: it is first needed below the hero, so the hero's own font (Outfit) arrives first.
const serif = Newsreader({ subsets: ['latin'], axes: ['opsz'], variable: '--f-serif', preload: false })

// The description and share text come from the verified name and positioning, like the hero.
const name = givenName || 'Sai Srujan Pasala'
const description = summary

// The share preview image comes from app/opengraph-image.tsx. Its absolute URL and the canonical
// link (app/page.tsx) use the site's address (lib/site-url.ts: NEXT_PUBLIC_SITE_URL, or the Vercel domain).
export const metadata: Metadata = {
  ...(SITE_URL ? { metadataBase: new URL(SITE_URL) } : {}),
  title: name,
  description,
  openGraph: { type: 'website', title: name, description, siteName: name },
  twitter: { card: 'summary_large_image', title: name, description },
}

export const viewport: Viewport = { themeColor: '#FAF9F7' }

// Runs before first paint: decides the motion mode (reduced motion, or the saved preference), so
// the site's entrance and scroll reveals never flash. On the home page every load and refresh
// starts at the hero: the browser's restored scroll position and any #section in the address
// are dropped (in-page nav links still jump as usual). With full motion the home page also opens
// with its preloader (data-pre, components/home/Preloader.tsx), on before anything is painted, once
// per browser session. A key, click, wheel or touch skips it at once, even before the page's
// JavaScript has loaded. The exit itself lives only here (window.__ssPreEnd): it marks the handoff
// to the hero (unless the CSS failsafe has already hidden the opening, at 3.5s), fades it over 450ms
// (preloader.css, pre-out) and remembers it for the session. Preloader.tsx only decides when.
const boot = `(function(){var d=document.documentElement,r=false;
try{r=matchMedia('(prefers-reduced-motion: reduce)').matches||localStorage.getItem('ss-motion')==='reduce'}catch(e){}
d.dataset.motion=r?'reduce':'full';
if(location.pathname==='/'){var s=false;try{s=sessionStorage.getItem('ss-pre')==='1'}catch(e){}if(!r&&!s){d.dataset.pre='on';
var ev=['keydown','pointerdown','wheel','touchstart'],off=function(){ev.forEach(function(n){removeEventListener(n,end,true)})},
end=function(){off();if(d.dataset.pre!=='on')return;if(performance.now()<3400)d.dataset.handoff='1';d.dataset.pre='out';try{sessionStorage.setItem('ss-pre','1')}catch(e){}
setTimeout(function(){if(d.dataset.pre==='out')delete d.dataset.pre},450)};
window.__ssPreEnd=end;ev.forEach(function(n){addEventListener(n,end,{capture:true,passive:true})})}try{history.scrollRestoration='manual';if(location.hash)history.replaceState(null,'',location.pathname+location.search)}catch(e){}scrollTo(0,0)}
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
