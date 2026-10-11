import type { Metadata, Viewport } from 'next'
import { Hanken_Grotesk, IBM_Plex_Mono, Newsreader } from 'next/font/google'
import './styles/tailwind.css'
import './globals.css'
import './styles/blueprint.css'
import './styles/motion.css'
import './styles/nav.css'
import './styles/hero.css'
import './styles/technology.css'
import './styles/chrome.css'
import './styles/business.css'
import './styles/leadership.css'
import './styles/ventures.css'
import './styles/experience.css'
import './styles/education.css'
import './styles/contact.css'

// Newsreader for the name and headlines, IBM Plex Mono for labels and body, Hanken Grotesk for long statements.
const serif = Newsreader({ subsets: ['latin'], axes: ['opsz'], variable: '--f-serif' })
const sans = Hanken_Grotesk({ subsets: ['latin'], variable: '--f-sans' })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--f-mono' })

export const metadata: Metadata = {
  title: 'Sai Srujan Pasala',
  description: 'Computer science engineer and MBA, working across technology, business, media and ventures.',
}

export const viewport: Viewport = { themeColor: '#0D1016' }

// Runs before first paint: opens the loading-milestone registry (lib/loading.ts), decides
// motion mode, and whether the opening plays: on every load (the site always opens on its hero,
// so a #section is dropped and scroll is not restored), except under reduced motion and in
// ?seek captures. Any input skips it, before hydration.
const boot = `(function(){var w=window,d=document.documentElement,r=false;
var L=w.__ssLoad={m:{},f:[],mark:function(k){if(L.m[k])return;L.m[k]=performance.now();for(var i=0;i<L.f.length;i++)L.f[i](k)}};
document.addEventListener('DOMContentLoaded',function(){L.mark('doc')},{once:true});
addEventListener('load',function(){L.mark('load')},{once:true});
try{r=matchMedia('(prefers-reduced-motion: reduce)').matches||localStorage.getItem('ss-motion')==='reduce'}catch(e){}
d.dataset.motion=r?'reduce':'full';
d.dataset.boot=(r||location.search.indexOf('seek=')>-1)?'skip':'play';
if(d.dataset.boot==='play'){d.dataset.pre='full';try{history.scrollRestoration='manual';if(location.hash)history.replaceState(null,'',location.pathname+location.search)}catch(e){}var ev=['keydown','wheel','touchstart','pointerdown'];var s=function(){if(d.dataset.boot==='play')d.dataset.boot='skip';ev.forEach(function(e){removeEventListener(e,s,true)})};ev.forEach(function(e){addEventListener(e,s,{capture:true,passive:true})})}
})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      {/* Browser extensions inject attributes on <body> before hydration (e.g. inmaintabuse). */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
