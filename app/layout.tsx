import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Serif } from 'next/font/google'
import './globals.css'

// DEVELOPMENT PLACEHOLDERS. The approved direction is ABC Arizona (Sans / Serif / Flare)
// with GT Alpina as backup — licensed faces, swapped in at gate G2 via next/font/local.
const sans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--f-sans' })
const serif = IBM_Plex_Serif({ subsets: ['latin'], weight: ['300', '400'], style: ['italic'], variable: '--f-serif' })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--f-mono' })

export const metadata: Metadata = {
  title: 'Sai Srujan Pasala',
  description: 'Computer science engineer and MBA, working across technology, business, media and ventures.',
}

export const viewport: Viewport = { themeColor: '#0B0B0A' }

// Runs before first paint: decides motion mode and whether the overture plays,
// and owns the skip listener so skipping works before hydration.
const boot = `(function(){var d=document.documentElement,r=false,seen=false;
try{r=matchMedia('(prefers-reduced-motion: reduce)').matches||localStorage.getItem('tl-motion')==='reduce'}catch(e){}
d.dataset.motion=r?'reduce':'full';
try{seen=sessionStorage.getItem('tl-overture')==='1'}catch(e){}
var skip=r||seen||!!location.hash||location.search.indexOf('seek=')>-1;
d.dataset.overture=skip?'skip':'play';
if(!skip){var ev=['keydown','wheel','touchstart','pointerdown'];var s=function(){if(d.dataset.overture==='play')d.dataset.overture='skip';ev.forEach(function(e){removeEventListener(e,s,true)})};ev.forEach(function(e){addEventListener(e,s,{capture:true,passive:true})})}
})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      {/* Browser extensions inject attributes on <body> before hydration (e.g. inmaintabuse). */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
