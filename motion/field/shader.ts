// The living blueprint, as GLSL ES 3.0. One full-screen triangle; the fragment stage redraws
// the CSS field exactly at the hero (48px grid at 3.2%, 192px crosses at .16, the top-left
// lamp) and then follows the story: eight chapter states (construct → sheet), blended in JS into
// one parameter vector (uP) so the shader stays branch-light — each feature is gated by its
// own weight, a uniform branch, so only the active pair's features cost anything.
// Also: the opening's unfold from a point (uReveal, uOrigin), a cursor lens, scroll parallax,
// 1px vermilion signal pulses along the lines, the nav curtain's brightened edge, dithering.
// No buffers, no textures, no loops. The accent is the only chromatic constant.

/** Pixels per second a pulse travels at speed 1 (the JS integrates uFlow from it). */
export const SPEED = 70

/** Per-state parameters, in uniform order (uP[0].x, uP[0].y, …); SPEED_K is JS-only. */
export const KEYS = [
  'GRID_A', // minor grid alpha (48px cells)
  'MAJ_A', // extra alpha on the 192px major lines
  'CRS_A', // registration-cross alpha
  'CRS_L', // cross arm length (CSS px)
  'VX', // vertical-line multiplier (strata keeps the horizontals)
  'ZOOM', // cells per cell: 2 = pulled back, twice as dense
  'DOTS', // 0 lines → 1 intersections only
  'WELL', // tension: three gravity wells bend the grid
  'PERSP', // converge: the sheet tilts toward a vanishing point
  'COL_A', // ledger: vertical column rules (viewport / 6)
  'MAST', // a masthead's double rule (unused by the current states; kept for the shader slot)
  'BANDS', // strata: alternating 96px band fill
  'LAMP_X', // lamp centre (viewport fraction)
  'LAMP_Y',
  'LAMP_A', // lamp strength
  'LAMP_R', // lamp reach
  'LAMP2', // the second, lower-right lamp
  'WARM', // lamp tint: cool → neutral
  'SCAN', // parse: grid brightens around bus.scanX
  'LANES', // parse: pulses confined to four rails
  'P_DENS', // grid pulse density
  'P_H', // horizontal share
  'P_V', // vertical share
  'DRIFT', // how far the lamps wander (void is still)
  'SPEED_K', // pulse speed (JS-only: integrated into uFlow)
] as const

export type Key = (typeof KEYS)[number]
type State = Record<Key, number>

export const STATE_NAMES = ['construct', 'parse', 'tension', 'void', 'converge', 'strata', 'ledger', 'sheet'] as const

const BASE: State = {
  GRID_A: 0.032,
  MAJ_A: 0,
  CRS_A: 0.16,
  CRS_L: 5,
  VX: 1,
  ZOOM: 1,
  DOTS: 0,
  WELL: 0,
  PERSP: 0,
  COL_A: 0,
  MAST: 0,
  BANDS: 0,
  LAMP_X: 0.1,
  LAMP_Y: 0,
  LAMP_A: 0.065,
  LAMP_R: 0.7,
  LAMP2: 0.022,
  WARM: 0,
  SCAN: 0,
  LANES: 0,
  P_DENS: 0.1,
  P_H: 1,
  P_V: 0.7,
  DRIFT: 1,
  SPEED_K: 1,
}

const strata: Partial<State> = { GRID_A: 0.024, VX: 0.3, CRS_A: 0.07, BANDS: 0.011, LAMP_A: 0.058, P_DENS: 0.06, P_V: 0, SPEED_K: 0.45 }

/** The eight chapter states, in page order (hero … contact). */
export const STATES: State[] = (
  [
    // construct — the CSS field exactly, majors a touch brighter, few pulses
    { MAJ_A: 0.014, P_DENS: 0.07 },
    // parse — a scan band at scanX; pulses only on four rails, left → right, faster
    { GRID_A: 0.026, MAJ_A: 0.006, CRS_A: 0.11, LAMP_A: 0.055, SCAN: 1, LANES: 1, P_DENS: 0, SPEED_K: 1.8 },
    // tension — three wells bend the grid; horizontal pulses fall into them
    { GRID_A: 0.034, MAJ_A: 0.008, CRS_A: 0.13, WELL: 1, LAMP_X: 0.5, LAMP_Y: 0.6, LAMP_A: 0.045, LAMP_R: 0.8, LAMP2: 0.012, P_DENS: 0.14, P_V: 0.35, SPEED_K: 1.1 },
    // void — only the intersections remain, one soft light at the centre, stillness
    { GRID_A: 0.026, CRS_A: 0.09, CRS_L: 1.5, DOTS: 1, LAMP_X: 0.5, LAMP_Y: 0.5, LAMP_A: 0.05, LAMP_R: 0.62, LAMP2: 0, P_DENS: 0, DRIFT: 0.15 },
    // converge — the sheet tilts toward a vanishing point; pulses run into it
    { GRID_A: 0.03, MAJ_A: 0.01, CRS_A: 0, PERSP: 1, LAMP_X: 0.5, LAMP_Y: 0.45, LAMP_A: 0.05, LAMP_R: 0.6, LAMP2: 0.012, P_DENS: 0.2, P_H: 0, P_V: 1, SPEED_K: 1.25 },
    // strata — horizontal bands, verticals faint, a few slow horizontal pulses
    strata,
    // ledger — strata ruled into columns
    { ...strata, COL_A: 0.016, BANDS: 0.008, P_DENS: 0.045 },
    // sheet — clean and quiet: a blank page
    { GRID_A: 0.024, MAJ_A: 0.006, CRS_A: 0.11, LAMP_A: 0.06, P_DENS: 0.04, SPEED_K: 0.8 },
  ] as Partial<State>[]
).map((s) => ({ ...BASE, ...s }))

/** Floats sent to the shader (uP: vec4 × 6); the rest of the vector is JS-only. */
export const UNIFORM_FLOATS = 24
export const SPEED_IX = KEYS.indexOf('SPEED_K')

/** The parameter vector at chapter `c` = i + t: state i blended linearly into state i + 1. */
export function stateParams(c: number, out = new Float32Array(KEYS.length)) {
  const last = STATES.length - 1
  const x = Math.min(last, Math.max(0, Number.isFinite(c) ? c : 0))
  const i = Math.min(last, Math.floor(x))
  const t = x - i
  const a = STATES[i]
  const b = STATES[Math.min(last, i + 1)]
  for (let j = 0; j < KEYS.length; j++) {
    const k = KEYS[j]
    out[j] = a[k] + (b[k] - a[k]) * t
  }
  return out
}

const DEFINES = KEYS.slice(0, UNIFORM_FLOATS)
  .map((k, j) => `#define ${k} uP[${j >> 2}].${'xyzw'[j & 3]}`)
  .join('\n')

export const VERT = `#version 300 es
void main(){vec2 v=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(v*2.-1.,0.,1.);}
`

export const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes, uMouse, uOrigin;
uniform float uDpr, uTime, uFlow, uLens, uScroll, uSweep, uEnergy, uReveal, uScan, uScene;
uniform vec4 uP[${UNIFORM_FLOATS / 4}];
out vec4 o;
${DEFINES}

const vec3 INK=vec3(.0510,.0627,.0863);
const vec3 HAIR=vec3(.8863,.9098,1.);
const vec3 LAMP=vec3(.7686,.8235,1.);
const vec3 PAPER=vec3(.86,.86,.86);
const vec3 ACCENT=vec3(.8784,.2706,.1686);
const float CELL=48., MAJOR=192., TAIL=140., BAND=96.;

float h1(float n){return fract(sin(n*91.345)*47453.5453);}

// coverage of a 1px line at distance d (CSS px), antialiased over one device pixel
float cov(float d){float a=.5/uDpr;return 1.-smoothstep(.5-a,.5+a,d);}
// distance to the nearest line of spacing s, lines on pixel centres (s*k+.5)
float gap(float x,float s){return abs(mod(x-.5+.5*s,s)-.5*s);}
// lines denser than ~6px on screen fade out instead of aliasing (perspective, zoom)
float keep(float s,float k){return smoothstep(4.,10.,s/k);}

// A comet riding one lane: head at full strength, quadratic tail of TAIL px behind it.
// uFlow is the distance travelled so far; fwd=1 forces the direction of increasing along.
float pulse(float along,float lane,float span,float dens,float fwd){
  float len=span+2.*TAIL, ph=uFlow/len+h1(lane*1.7), cyc=floor(ph);
  float on=step(1.-dens,h1(lane*13.1+cyc*7.7));
  float a=max(fwd,step(.5,h1(lane*3.3)))>.5?along:span-along;
  float t=(fract(ph)*len-TAIL-a)/TAIL;
  return on*step(0.,t)*step(t,1.)*(1.-t)*(1.-t);
}

float lamp(vec2 uv,vec2 c,float r){return 1.-clamp(length((uv-c)/vec2(.55,.45))/r,0.,1.);}

void main(){
  vec2 f=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;
  vec2 ctr=.5*uRes;
  vec2 q=f-uMouse;
  float lens=uLens*exp(-dot(q,q)/57600.);
  vec2 s=f-q*.16*lens;
  s=ctr+(s-ctr)*ZOOM;

  // tension: three gravity wells pull the lines toward them, breathing slowly
  if(WELL>0.){
    float r2=pow(.2*min(uRes.x,uRes.y),2.);
    vec2 a=s-uRes*vec2(.22,.6), b=s-uRes*vec2(.5,.6), c=s-uRes*vec2(.78,.6);
    s+=WELL*.34*(a*exp(-dot(a,a)/r2)*(1.+.15*sin(uTime*.35))+b*exp(-dot(b,b)/r2)*(1.+.15*sin(uTime*.35+2.1))+c*exp(-dot(c,c)/r2)*(1.+.15*sin(uTime*.35+4.2)));
  }
  // converge: the sheet tilts into a floor and a ceiling meeting at the vanishing point
  vec2 vp=uRes*vec2(.5,.45);
  if(PERSP>0.){
    // a softened |dy| folds the sheet smoothly at the horizon instead of creasing it
    float dy=s.y-vp.y, den=mix(1.,sqrt(dy*dy+.0036*uRes.y*uRes.y)/(.55*uRes.y),PERSP);
    s=vp+(s-vp)/vec2(den,den*den);
  }
  vec2 p=s;
  p.y+=uScroll*.06*(1.-PERSP);

  // p-units per CSS px across vertical (kx) and horizontal (ky) lines
  float kx=max(length(vec2(dFdx(p.x),dFdy(p.x)))*uDpr,1e-3);
  float ky=max(length(vec2(dFdx(p.y),dFdy(p.y)))*uDpr,1e-3);

  float gx=cov(gap(p.x,CELL)/kx)*keep(CELL,kx), gy=cov(gap(p.y,CELL)/ky)*keep(CELL,ky);
  float grid=mix(max(gx*VX,gy),gx*gy*3.5,DOTS);
  float mk=keep(MAJOR,max(kx,ky));
  float major=MAJ_A>0.?max(cov(gap(p.x,MAJOR)/kx)*VX,cov(gap(p.y,MAJOR)/ky))*mk:0.;
  vec2 c=abs(p-.5-MAJOR*floor((p-.5)/MAJOR+.5))/vec2(kx,ky);
  float crs=max(step(c.x,CRS_L)*cov(c.y),step(c.y,CRS_L)*cov(c.x))*mk;

  vec2 uv=f/uRes;
  float L=lamp(uv,vec2(LAMP_X,LAMP_Y)+DRIFT*vec2(.05*sin(uTime*.031),.02*sin(uTime*.023+1.3)),LAMP_R);
  float L2=LAMP2>0.?lamp(uv,vec2(.82+.06*sin(uTime*.017+2.),.9+.04*cos(uTime*.019)),.7):0.;
  vec3 col=mix(INK,mix(LAMP,PAPER,WARM),LAMP_A*L+LAMP2*L2);

  if(BANDS>0.) col=mix(col,HAIR,BANDS*mod(floor((p.y-.5)/BAND),2.));

  float sw=uSweep<0.?0.:exp(-abs(f.y-uSweep)/36.);
  float sc=uScan<0.?0.:SCAN*exp(-pow((f.x-uScan)/90.,2.));
  col=mix(col,HAIR,(grid*GRID_A+major*MAJ_A)*(1.+.8*L+1.2*lens+1.5*sw+2.4*sc));
  col=mix(col,HAIR,crs*CRS_A);

  // ledger: column rules on sixths of the viewport (optionally under a masthead's double rule)
  if(COL_A+MAST>0.){
    float cw=uRes.x/6., k=floor(f.x/cw+.5), g=clamp(.034*uRes.x,20.,56.);
    float rule=cov(abs(f.x-floor(k*cw)-.5))*step(.5,k)*step(k,5.5)*(1.-step(f.y,112.)*clamp(MAST*20.,0.,1.));
    float mast=max(cov(abs(f.y-104.5)),cov(abs(f.y-108.5)))*step(g,f.x)*step(f.x,uRes.x-g);
    col=mix(col,HAIR,rule*COL_A+mast*MAST);
  }

  float sig=0.;
  // parse: four rails at 30/42/54/66% of the height; a rail's flow thickens once its
  // requirement has landed in the scene (uScene), left to right
  if(LANES>0.){
    float k=clamp(floor((uv.y-.30)/.12+.5),0.,3.);
    float rail=cov(abs(f.y-floor((.30+.12*k)*uRes.y)-.5))*LANES;
    float landed=uScene<0.?0.:smoothstep(.30+.1375*k,.30+.1375*(k+1.),uScene);
    col=mix(col,HAIR,rail*.04*(1.+2.*sc+.5*landed));
    float d=(.4+.4*landed)*(1.+uEnergy);
    sig=rail*max(pulse(f.x,900.+k,uRes.x,d,1.),pulse(f.x,950.+k,uRes.x,d,1.));
  }
  float dens=P_DENS*(1.+1.2*uEnergy);
  if(dens>0.){
    float row=floor((p.y-.5)/CELL+.5), ci=floor((p.x-.5)/CELL+.5), h=0., v=0.;
    if(P_H>0.){
      h=WELL<1.?pulse(p.x,row,uRes.x,dens*P_H,0.):0.;
      if(WELL>0.){
        // tension: each third of a row flows into its well
        float wk=clamp(floor((p.x/uRes.x-.22)/.28+.5),0.,2.), hw=.14*uRes.x;
        h=mix(h,pulse(max(hw-abs(p.x-uRes.x*(.22+.28*wk)),0.),row+40.*wk,hw,dens*P_H*1.4,1.),WELL);
      }
    }
    if(P_V>0.){
      v=PERSP<1.?pulse(s.y,ci+500.,uRes.y,dens*P_V,0.):0.;
      // converge: every comet runs into the vanishing point
      if(PERSP>0.) v=mix(v,pulse(abs(p.y-vp.y),ci+700.,4.*uRes.y,dens*P_V,1.),PERSP);
    }
    sig=max(sig,max(gy*h,gx*v));
  }
  col=mix(col,ACCENT,sig*(.45+.35*uEnergy));

  // the opening: the field exists only inside a circle growing from the origin; its edge is a
  // 1px hairline; outside is bare ink
  if(uReveal<1.){
    float R=uReveal*length(uRes)*1.05, d=length(f-(uOrigin.x<0.?ctr:uOrigin));
    col=mix(INK,col,smoothstep(0.,1.,clamp((R-d)/max(min(R,180.),1.),0.,1.)));
    col=mix(col,HAIR,cov(abs(d-R))*.2*step(.001,uReveal));
  }

  // interleaved-gradient-noise dither, +-half a code value
  col+=(fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))))-.5)/255.;
  o=vec4(col,1.);
}
`
