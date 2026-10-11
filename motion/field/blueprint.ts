// Runs the living blueprint on a canvas: one WebGL2 program, one triangle, a rAF loop that
// throttles itself (hidden tab, touch, idle, slow device) and hands back a destroy function.
// Each frame it reads the field bus — the chapter (eased into a parameter vector), the
// opening's reveal, Technology's scan and scene. It keeps drawing through the opening, which
// animates the reveal. Returns null when WebGL2 is unavailable or the shader fails, so the
// CSS field stays.

import { markLoaded } from '../../lib/loading.ts'
import { fieldBus } from '../field-bus.ts'
import { FRAG, KEYS, SPEED, SPEED_IX, UNIFORM_FLOATS, VERT, stateParams } from './shader.ts'

type Opts = { force: boolean; frozen: boolean }
type Gpu = { prog: WebGLProgram; vao: WebGLVertexArrayObject; u: Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null> }

const UNIFORMS = [
  'uRes',
  'uDpr',
  'uTime',
  'uFlow',
  'uMouse',
  'uLens',
  'uScroll',
  'uSweep',
  'uEnergy',
  'uReveal',
  'uOrigin',
  'uScan',
  'uScene',
  'uP',
] as const
const IDLE_MS = 8000
const LENS_MS = 1500
const SAMPLES = 120

// A canvas keeps its (lost) context across a destroy/start pair — React Strict Mode and Fast
// Refresh reuse the element — so remember how to bring it back.
const revive = new WeakMap<HTMLCanvasElement, { ext: WEBGL_lose_context; lost: boolean; want: boolean }>()

function build(gl: WebGL2RenderingContext): Gpu | null {
  const shader = (type: number, src: string) => {
    const s = gl.createShader(type)
    if (!s) return null
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (gl.getShaderParameter(s, gl.COMPILE_STATUS)) return s
    if (process.env.NODE_ENV !== 'production') console.warn('[blueprint]', gl.getShaderInfoLog(s))
    gl.deleteShader(s)
    return null
  }
  const vs = shader(gl.VERTEX_SHADER, VERT)
  const fs = shader(gl.FRAGMENT_SHADER, FRAG)
  const prog = vs && fs ? gl.createProgram() : null
  const vao = gl.createVertexArray()
  if (!vs || !fs || !prog || !vao) return null
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    if (process.env.NODE_ENV !== 'production') console.warn('[blueprint]', gl.getProgramInfoLog(prog))
    return null
  }
  const u = Object.fromEntries(UNIFORMS.map((n) => [n, gl.getUniformLocation(prog, n)])) as Gpu['u']
  gl.useProgram(prog)
  gl.bindVertexArray(vao)
  return { prog, vao, u }
}

export function start(canvas: HTMLCanvasElement, { force, frozen }: Opts): (() => void) | null {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    powerPreference: 'low-power',
    failIfMajorPerformanceCaveat: !force,
  })
  if (!gl) return null

  const prior = revive.get(canvas)
  const reviving = gl.isContextLost()
  if (reviving && !prior) return null
  let gpu = reviving ? null : build(gl)
  if (!reviving && !gpu) return null
  const ext = reviving ? prior!.ext : gl.getExtension('WEBGL_lose_context')

  const html = document.documentElement
  const coarseMq = matchMedia('(pointer: coarse)')
  let coarse = coarseMq.matches

  let raf = 0
  let running = false
  let lost = reviving
  let shown = false
  let cssW = 0
  let cssH = 0
  let dpr = 1
  let last = 0
  let time = frozen ? 8 : 0
  let flow = 0
  let frame = 0
  let energy = 0
  let lens = 0
  const mouse = { x: innerWidth / 2, y: innerHeight / 2, tx: innerWidth / 2, ty: innerHeight / 2 }
  let lastMove = -Infinity
  let lastInput = performance.now()
  // 0: 60fps, 1: 30fps (median frame > 20ms), 2: still frames only (still > 34ms at 30fps)
  let level = 0
  let deltas: number[] = []
  let warm = 0
  // The chapter's parameter vector: eased toward its target so jumps morph rather than cut.
  const params = new Float32Array(KEYS.length)
  const target = new Float32Array(KEYS.length)
  let primed = false
  // The inputs a still frame depends on; it is redrawn only when one of them changes.
  const key: number[] = []
  let busKey: number[] = []

  const size = (always = false) => {
    const w = canvas.clientWidth || innerWidth
    const h = canvas.clientHeight || innerHeight
    const d = Math.min(devicePixelRatio || 1, 1.5)
    if (!always && w === cssW && Math.abs(h - cssH) <= 120 && d === dpr) return false
    cssW = w
    cssH = h
    dpr = d
    canvas.width = Math.max(1, Math.round(w * d))
    canvas.height = Math.max(1, Math.round(h * d))
    return true
  }

  /** Move the parameter vector toward the bus's chapter; `ease` < 0 snaps. */
  const follow = (ease: number) => {
    stateParams(fieldBus.chapter, target)
    if (!primed || ease < 0) {
      params.set(target)
      primed = true
      return
    }
    for (let j = 0; j < params.length; j++) params[j] += (target[j] - params[j]) * ease
  }

  const draw = () => {
    if (!gpu || lost) return
    if (!primed) follow(-1)
    const { u } = gpu
    const b = fieldBus
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(u.uRes, canvas.width / dpr, canvas.height / dpr)
    gl.uniform1f(u.uDpr, dpr)
    gl.uniform1f(u.uTime, time)
    gl.uniform1f(u.uFlow, frozen ? time * SPEED * params[SPEED_IX] : flow)
    gl.uniform2f(u.uMouse, mouse.x, mouse.y)
    gl.uniform1f(u.uLens, frozen ? 0 : lens)
    gl.uniform1f(u.uScroll, scrollY)
    gl.uniform1f(u.uSweep, b.sweep)
    gl.uniform1f(u.uEnergy, frozen ? b.energy : energy)
    gl.uniform1f(u.uReveal, Math.min(1, Math.max(0, b.reveal)))
    gl.uniform2f(u.uOrigin, b.ox, b.oy)
    gl.uniform1f(u.uScan, b.scanX)
    gl.uniform1f(u.uScene, b.scene)
    gl.uniform4fv(u.uP, params, 0, UNIFORM_FLOATS)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    if (!shown) {
      shown = true
      html.dataset.gl = 'on'
      markLoaded('field')
    }
  }

  const still = () => frozen || level === 2
  // The opening's main-thread work is not a slow GPU: don't sample frame times through it.
  const booting = () => html.dataset.boot === 'play'

  const tick = (now: number) => {
    raf = 0
    if (!running) return
    const b = fieldBus
    if (still()) {
      // Deterministic: a pure function of size, scroll and the bus — redraw only when they change.
      const next = [cssW, cssH, dpr, scrollY, b.sweep, b.energy, b.chapter, b.reveal, b.ox, b.oy, b.scanX, b.scene, lens]
      if (next.some((v, i) => v !== key[i])) {
        key.splice(0, key.length, ...next)
        follow(-1)
        draw()
      }
      raf = requestAnimationFrame(tick)
      return
    }

    // The story moving (chapter, reveal, scan) counts as activity, like input.
    const bk = [b.chapter, b.reveal, b.scanX, b.scene]
    if (bk.some((v, i) => v !== busKey[i]) || b.reveal < 1) lastInput = now
    busKey = bk

    const dt = last ? Math.min((now - last) / 1000, 0.1) : 0
    const idle = now - lastInput > IDLE_MS && b.sweep < 0 && energy < 0.01
    const stride = level >= 1 || coarse || idle ? 2 : 1
    frame++
    if (stride === 2 && frame & 1 && shown) {
      raf = requestAnimationFrame(tick)
      return
    }
    if (last && now - last < 250 && !booting() && warm-- <= 0) {
      deltas.push((now - last) / stride)
      if (deltas.length >= SAMPLES) {
        const med = deltas.sort((a, b) => a - b)[SAMPLES >> 1]
        deltas = []
        if (level === 0 && med > 20) level = 1
        else if (level === 1 && med * 2 > 34) level = 2
      }
    }
    last = now

    const k = (r: number) => 1 - Math.pow(1 - r, dt * 60)
    time += dt
    energy = Math.max(b.energy, energy * Math.pow(0.95, dt * 60))
    follow(k(0.09))
    flow += dt * SPEED * params[SPEED_IX] * (1 + 0.5 * energy)
    mouse.x += (mouse.tx - mouse.x) * k(0.08)
    mouse.y += (mouse.ty - mouse.y) * k(0.08)
    const lensTo = !coarse && now - lastMove < LENS_MS ? 1 : 0
    lens += (lensTo - lens) * k(0.06)
    if (lens < 0.002 && lensTo === 0) lens = 0

    if (level === 2) {
      // From here on, still frames only: redrawn when scroll or the bus change.
      lens = 0
      key.length = 0
    }
    draw()
    raf = requestAnimationFrame(tick)
  }

  const resume = () => {
    if (running || lost || document.hidden) return
    running = true
    last = 0
    deltas = []
    warm = 20
    lastInput = performance.now()
    raf = requestAnimationFrame(tick)
  }
  function pause() {
    running = false
    if (raf) cancelAnimationFrame(raf)
    raf = 0
  }

  const onResize = () => {
    // Resizing clears the buffer: repaint now rather than show a blank frame.
    if (size()) draw()
  }
  const onPointer = (e: PointerEvent) => {
    lastInput = performance.now()
    if (e.pointerType === 'touch') return
    mouse.tx = e.clientX
    mouse.ty = e.clientY
    lastMove = lastInput
  }
  const onOut = (e: PointerEvent) => {
    if (!e.relatedTarget) lastMove = -Infinity
  }
  const onScroll = () => {
    lastInput = performance.now()
  }
  const onVisibility = () => (document.hidden ? pause() : resume())
  const onCoarse = () => {
    coarse = coarseMq.matches
  }
  const onLost = (e: Event) => {
    e.preventDefault()
    lost = true
    gpu = null
    delete html.dataset.gl
    shown = false
    pause()
  }
  const onRestored = () => {
    lost = false
    key.length = 0
    gpu = build(gl)
    if (!gpu) return
    size(true)
    resume()
    if (!running) draw()
  }

  addEventListener('resize', onResize)
  addEventListener('scroll', onScroll, { passive: true })
  if (!frozen) {
    addEventListener('pointermove', onPointer, { passive: true })
    addEventListener('pointerdown', onPointer, { passive: true })
    addEventListener('pointerout', onOut, { passive: true })
  }
  document.addEventListener('visibilitychange', onVisibility)
  coarseMq.addEventListener('change', onCoarse)
  canvas.addEventListener('webglcontextlost', onLost)
  canvas.addEventListener('webglcontextrestored', onRestored)

  if (reviving) {
    // Restore the context a previous destroy() released; onRestored rebuilds and resumes.
    const r = prior!
    if (r.lost) r.ext.restoreContext()
    else r.want = true
  } else {
    size(true)
    resume()
  }

  return () => {
    pause()
    removeEventListener('resize', onResize)
    removeEventListener('scroll', onScroll)
    removeEventListener('pointermove', onPointer)
    removeEventListener('pointerdown', onPointer)
    removeEventListener('pointerout', onOut)
    document.removeEventListener('visibilitychange', onVisibility)
    coarseMq.removeEventListener('change', onCoarse)
    canvas.removeEventListener('webglcontextlost', onLost)
    canvas.removeEventListener('webglcontextrestored', onRestored)
    delete html.dataset.gl
    if (!ext || gl.isContextLost()) return
    // Release the GPU now, but keep the context restorable in case this canvas is started again.
    const r = { ext, lost: false, want: false }
    revive.set(canvas, r)
    canvas.addEventListener(
      'webglcontextlost',
      (e) => {
        e.preventDefault()
        r.lost = true
        // restoring is only allowed once this event's dispatch has finished
        if (r.want) setTimeout(() => ext.restoreContext())
      },
      { once: true },
    )
    ext.loseContext()
  }
}
