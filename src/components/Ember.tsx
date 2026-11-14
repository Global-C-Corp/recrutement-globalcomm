'use client'

import { useEffect, useRef } from 'react'

/**
 * STAND-IN for React Bits Pro "Glyph Ember": canvas ASCII ember ported from docs/design-reference.html.
 * Fills its parent element (which must be position:relative). Replace with the Pro component once the license key is available.
 */
export function Ember() {
  const cvRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = cvRef.current
    const sec = cv?.parentElement
    if (!cv || !sec) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const CW = 11, CH = 16, RAMP = ' .:-=+*#%@'
    let cols = 0, rows = 0, heat = new Float32Array(0), W = 0, H = 0
    const pointer = { x: -1, y: -1 }
    const burst: { x: number; y: number }[] = []
    let running = true, raf = 0, visible = true
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const stops: [number, number[]][] = [[0, [0, 0, 70]], [0.35, [0, 0, 255]], [0.7, [120, 150, 255]], [1, [235, 240, 255]]]
    const COLORS = Array.from({ length: 24 }, (_, i) => {
      const t = i / 23
      let k = 0
      while (k < stops.length - 2 && t > stops[k + 1][0]) k++
      const [t0, c0] = stops[k], [t1, c1] = stops[k + 1]
      const u = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)))
      return `rgb(${lerp(c0[0], c1[0], u) | 0},${lerp(c0[1], c1[1], u) | 0},${lerp(c0[2], c1[2], u) | 0})`
    })

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const r = sec!.getBoundingClientRect()
      W = r.width; H = r.height
      cv!.width = Math.round(W * dpr); cv!.height = Math.round(H * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(W / CW); rows = Math.ceil(H / CH)
      heat = new Float32Array(cols * rows)
    }
    function feed(cx: number, cy: number, R: number, amount: number, additive: boolean) {
      for (let y = Math.max(0, (cy - R) | 0); y < Math.min(rows, cy + R); y++)
        for (let x = Math.max(0, (cx - R) | 0); x < Math.min(cols, cx + R); x++) {
          const d = Math.hypot(x - cx, y - cy)
          if (d < R) heat[y * cols + x] = Math.min(1, heat[y * cols + x] + (additive ? amount * (1 - d / R) : 1 - d / R))
        }
    }
    function stepFire() {
      for (let x = 0; x < cols; x++) {
        heat[(rows - 1) * cols + x] = 0.8 + Math.random() * 0.2
        heat[(rows - 2) * cols + x] = Math.max(heat[(rows - 2) * cols + x], 0.55 + Math.random() * 0.3)
      }
      for (let y = 0; y < rows - 2; y++)
        for (let x = 0; x < cols; x++) {
          const sx = Math.min(cols - 1, Math.max(0, x + (Math.random() < 0.35 ? (Math.random() < 0.5 ? -1 : 1) : 0)))
          const below = heat[(y + 1) * cols + sx]
          const bl = heat[(y + 1) * cols + Math.max(0, sx - 1)]
          const br = heat[(y + 1) * cols + Math.min(cols - 1, sx + 1)]
          const b2 = heat[(y + 2) * cols + sx]
          heat[y * cols + x] = Math.max(0, (below * 2 + bl + br + b2) / 5 - (0.018 + Math.random() * 0.035))
        }
      if (pointer.x >= 0) feed(pointer.x / CW, pointer.y / CH, 5, 0.5, true)
      while (burst.length) {
        const b = burst.pop()!
        feed(b.x / CW, b.y / CH, 9, 1, false)
      }
    }
    function drawFire() {
      ctx!.fillStyle = '#00001c'; ctx!.fillRect(0, 0, W, H)
      const g = ctx!.createLinearGradient(0, H, 0, H * 0.35)
      g.addColorStop(0, 'rgba(0,0,255,.6)'); g.addColorStop(1, 'rgba(0,0,255,0)')
      ctx!.fillStyle = g; ctx!.fillRect(0, 0, W, H)
      ctx!.font = `${CH - 2}px ui-monospace, Menlo, Consolas, monospace`; ctx!.textBaseline = 'alphabetic'
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          const h = heat[y * cols + x]
          if (h < 0.05) continue
          const ch = RAMP[Math.min(RAMP.length - 1, (h * RAMP.length) | 0)]
          if (ch === ' ') continue
          ctx!.fillStyle = COLORS[Math.min(23, (h * 23) | 0)]
          ctx!.globalAlpha = 0.3 + 0.7 * h
          ctx!.fillText(ch, x * CW, (y + 1) * CH - 3)
        }
      ctx!.globalAlpha = 1
    }
    const onMove = (e: PointerEvent) => {
      const r = sec.getBoundingClientRect()
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top
    }
    const onLeave = () => { pointer.x = pointer.y = -1 }
    const onClick = (e: MouseEvent) => {
      const r = sec.getBoundingClientRect()
      burst.push({ x: e.clientX - r.left, y: e.clientY - r.top })
    }
    sec.addEventListener('pointermove', onMove)
    sec.addEventListener('pointerleave', onLeave)
    sec.addEventListener('click', onClick)
    resize()
    window.addEventListener('resize', resize)
    const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting })
    io.observe(sec)
    if (reduce) { for (let i = 0; i < 40; i++) stepFire(); drawFire() }
    let last = 0
    const frame = (now: number) => {
      if (!running) return
      raf = requestAnimationFrame(frame)
      if (!visible || reduce) return
      if (now - last > 40) { last = now; stepFire(); drawFire() }
    }
    raf = requestAnimationFrame(frame)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      io.disconnect()
      sec.removeEventListener('pointermove', onMove)
      sec.removeEventListener('pointerleave', onLeave)
      sec.removeEventListener('click', onClick)
    }
  }, [])

  return <canvas ref={cvRef} aria-hidden="true" />
}
